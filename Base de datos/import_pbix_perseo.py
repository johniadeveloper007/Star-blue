import argparse
from datetime import timedelta
from decimal import Decimal
from hashlib import sha256
from pathlib import Path
import sys

import pandas as pd
from pbixray import PBIXRay
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "Back End" / "HACEB_BACKEND"))

from perseo_db.importer import MonthlyReportInput, import_monthly_reports
from perseo_db.models import Base, MetricDefinition


PBIX_NAME = "Indicado_Nivel_Servicio_Proveedores_ Locales_Nuevo.pbix"
DEFAULT_PBIX = Path(__file__).parent / PBIX_NAME
DEFAULT_DATABASE = Path(__file__).parent / "powerbi_perseo.db"
METHODOLOGY_VERSION = "pbix-dax-v1"

METRICS = (
    (
        "d4f7bd4c-59d9-4ad0-9470-1c9a54873001",
        "overall_compliance",
        "Cumplimiento general",
        "Valor porcentual agregado calculado desde OTIF y nivel de inventario.",
    ),
    (
        "d4f7bd4c-59d9-4ad0-9470-1c9a54873002",
        "on_time",
        "On Time",
        "Valor porcentual de entregas puntuales calculado desde el PBIX.",
    ),
    (
        "d4f7bd4c-59d9-4ad0-9470-1c9a54873003",
        "in_full",
        "In Full",
        "Valor porcentual de cantidad completa calculado desde el PBIX.",
    ),
    (
        "d4f7bd4c-59d9-4ad0-9470-1c9a54873004",
        "inventory_level",
        "Nivel de inventario",
        "Nivel agregado de inventario calculado por la fuente del PBIX.",
    ),
    (
        "d4f7bd4c-59d9-4ad0-9470-1c9a54873005",
        "inhouse_compliance",
        "Cumplimiento in-house",
        "Calificacion mensual in-house entregada por la fuente del PBIX.",
    ),
)


def month_start(value):
    if pd.isna(value):
        return None
    return pd.Timestamp(value).normalize().to_period("M").to_timestamp().date()


def percentage(value):
    number = float(value)
    if pd.isna(number):
        return None
    if -1.0 <= number <= 1.0:
        number *= 100.0
    return round(max(0.0, min(100.0, number)), 3)


def parse_args():
    parser = argparse.ArgumentParser(description="Importa el PBIX a la base Perseo local.")
    parser.add_argument("--pbix", type=Path, default=DEFAULT_PBIX)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    return parser.parse_args()


def main():
    args = parse_args()
    if not args.pbix.is_file():
        raise FileNotFoundError(f"No existe el PBIX: {args.pbix}")

    args.database.parent.mkdir(parents=True, exist_ok=True)
    if args.database.exists():
        args.database.unlink()

    model = PBIXRay(str(args.pbix))
    try:
        dimension = model.get_table("Dim_Proveedor_Model_Abast")
        orders = model.get_table("Fact_Query_Ordenes_Compra")
        purchases = model.get_table("Fact_Compras")
        inventory = model.get_table("Fact_Nivel_Inv_Materiales_Rep_Portal")
        inhouse = model.get_table("Fact_NS_Prov_Inhouse")
    finally:
        model.close()

    supplier_names = {}
    for code, name in dimension[
        ["Id Proveedor", "Nombre Proveedor"]
    ].itertuples(index=False, name=None):
        code = str(code).strip()
        name = str(name).strip()
        if code and code != "nan":
            supplier_names[code] = name

    supplier_names.update(
        {
            str(row[0]).strip(): str(row[1]).strip()
            for row in orders[[ "Id Proveedor", "Nombre Proveedor"]].dropna().itertuples(index=False, name=None)
            if str(row[0]).strip() and str(row[0]).strip() != "nan"
        }
    )
    supplier_names.update(
        {
            str(row[0]).strip(): str(row[1]).strip()
            for row in inhouse[[ "Nit Proveedor", "Nombre proveedor"]].dropna().itertuples(index=False, name=None)
            if str(row[0]).strip() and str(row[0]).strip() != "nan"
        }
    )

    purchases = purchases.copy()
    purchases["Fecha Ingreso"] = pd.to_datetime(purchases["Fecha Ingreso"], errors="coerce")
    orders = orders.copy()
    orders["Fecha Requerida"] = pd.to_datetime(orders["Fecha Requerida"], errors="coerce")
    purchases = purchases.merge(
        orders[
            ["Orden_Linea", "Fecha Requerida", "Cantidad Requerida"]
        ],
        on="Orden_Linea",
        how="left",
    )

    purchases["Periodo"] = purchases["Fecha Requerida"].apply(month_start)
    purchases["Entregada a Tiempo"] = purchases.apply(
        lambda row: (
            float(row["Cantidad Entregada"])
            if pd.notna(row["Fecha Ingreso"])
            and pd.notna(row["Fecha Requerida"])
            and row["Fecha Ingreso"].to_pydatetime() <= row["Fecha Requerida"].to_pydatetime() + timedelta(days=3)
            else 0.0
        ),
        axis=1,
    )
    purchases["Entregada Fuera"] = purchases.apply(
        lambda row: (
            float(row["Cantidad Entregada"])
            if pd.notna(row["Fecha Ingreso"])
            and pd.notna(row["Fecha Requerida"])
            and row["Fecha Ingreso"].to_pydatetime() > row["Fecha Requerida"].to_pydatetime() + timedelta(days=3)
            else 0.0
        ),
        axis=1,
    )

    line_metrics = purchases.groupby(
        ["Id Proveedor", "Periodo", "Orden_Linea"],
        dropna=True,
        as_index=False,
    ).agg(
        Cantidad_Requerida=("Cantidad Requerida", "first"),
        Entregada_Tiempo=("Entregada a Tiempo", "sum"),
        Entregada_Fuera=("Entregada Fuera", "sum"),
    )

    line_metrics["On_Time"] = (
        (line_metrics["Entregada_Tiempo"] > 0)
        & (line_metrics["Entregada_Fuera"] <= 0)
    ).astype(float)
    line_metrics["In_Full"] = (
        line_metrics["Entregada_Tiempo"]
        / line_metrics["Cantidad_Requerida"].clip(lower=0.000001)
    ).clip(0, 1)
    line_metrics["OTIF"] = (line_metrics["On_Time"] + line_metrics["In_Full"]) / 2
    otif = line_metrics.groupby(
        ["Id Proveedor", "Periodo"], as_index=False
    ).agg(
        on_time=("On_Time", lambda values: values.mean()),
        in_full=("In_Full", lambda values: values.mean()),
        overall_compliance=("OTIF", lambda values: values.mean()),
    )

    inventory = inventory.copy()
    inventory["Fecha"] = pd.to_datetime(inventory["Fecha"], errors="coerce")
    inventory["Periodo"] = inventory["Fecha"].apply(month_start)
    inventory["Inventory_Ratio"] = inventory["% Nivel Inventario"].apply(
        lambda value: float(value) * 100 if pd.notna(value) and 0 <= float(value) <= 1 else value
    )
    inventory_metrics = inventory.dropna(subset=["Id Proveedor", "Periodo"]).groupby(
        ["Id Proveedor", "Periodo"], as_index=False
    ).agg(inventory_level=("Inventory_Ratio", "mean"))

    inhouse = inhouse.copy()
    inhouse["Periodo"] = pd.to_datetime(
        inhouse["Fecha (Periodo)"], errors="coerce"
    ).apply(month_start)
    inhouse["inhouse_compliance"] = pd.to_numeric(
        inhouse["Calificación "], errors="coerce"
    ).apply(percentage)
    inhouse_metrics = inhouse.dropna(subset=["Nit Proveedor", "Periodo"]).groupby(
        ["Nit Proveedor", "Periodo"], as_index=False
    ).agg(inhouse_compliance=("inhouse_compliance", "mean"))

    otif["Key"] = list(zip(otif["Id Proveedor"].astype(str), otif["Periodo"]))
    inventory_metrics["Key"] = list(
        zip(inventory_metrics["Id Proveedor"].astype(str), inventory_metrics["Periodo"])
    )
    inhouse_metrics["Key"] = list(
        zip(inhouse_metrics["Nit Proveedor"].astype(str), inhouse_metrics["Periodo"])
    )

    otif_by_key = otif.set_index("Key").to_dict("index")
    inventory_by_key = inventory_metrics.set_index("Key").to_dict("index")
    inhouse_by_key = inhouse_metrics.set_index("Key").to_dict("index")
    keys = sorted(set(otif_by_key).union(inventory_by_key).union(inhouse_by_key))

    reports = []
    for key in keys:
        supplier_code, period = key
        if not supplier_code or supplier_code == "nan" or period is None:
            continue
        metrics = {}
        otif_row = otif_by_key.get(key)
        inventory_row = inventory_by_key.get(key)
        inhouse_row = inhouse_by_key.get(key)

        if otif_row is not None:
            metrics["on_time"] = Decimal(str(round(float(otif_row["on_time"]) * 100, 3)))
            metrics["in_full"] = Decimal(str(round(float(otif_row["in_full"]) * 100, 3)))
            otif_value = float(otif_row["overall_compliance"])
        else:
            otif_value = None

        if inventory_row is not None:
            inventory_value = percentage(inventory_row["inventory_level"])
            metrics["inventory_level"] = Decimal(str(inventory_value))
        else:
            inventory_value = None

        if inhouse_row is not None:
            metrics["inhouse_compliance"] = Decimal(
                str(round(float(inhouse_row["inhouse_compliance"]), 3))
            )

        if otif_value is not None and inventory_value is not None:
            overall = ((otif_value * 100) * 0.5) + (float(inventory_value) * 0.5)
        elif otif_value is not None:
            overall = otif_value * 100
        elif inventory_value is not None:
            overall = float(inventory_value)
        else:
            overall = None

        if overall is not None:
            metrics["overall_compliance"] = Decimal(str(round(overall, 3)))
        if not metrics:
            continue

        supplier_name = supplier_names.get(supplier_code, f"Proveedor {supplier_code}")
        result_label = "Cumple" if overall is not None and overall >= 94.5 else "No Cumple"
        reports.append(
            MonthlyReportInput(
                supplier_code=supplier_code,
                supplier_name=supplier_name,
                period_start=period,
                metrics=metrics,
                methodology_version=METHODOLOGY_VERSION,
                result_label=result_label,
            )
        )

    engine = create_engine(f"sqlite:///{args.database}")
    Base.metadata.create_all(engine)

    from sqlalchemy.orm import sessionmaker

    factory = sessionmaker(bind=engine)
    with Session(engine) as session:
        for metric_id, code, label, description in METRICS:
            existing = session.scalar(
                select(MetricDefinition).where(MetricDefinition.code == code)
            )
            if existing is None:
                session.add(
                    MetricDefinition(
                        code=code,
                        label=label,
                        description=description,
                        unit="percent",
                        is_active=True,
                    )
                )
        session.commit()

    source_sha256 = sha256(args.pbix.read_bytes()).hexdigest()
    batch_id = import_monthly_reports(
        factory,
        source_sha256=source_sha256,
        source_system="powerbi",
        requested_by="pbix-import",
        reports=reports,
    )

    print(f"PBIX: {args.pbix}")
    print(f"Database: {args.database}")
    print(f"Suppliers: {len(supplier_names)}")
    print(f"Monthly reports: {len(reports)}")
    print(f"Import batch: {batch_id}")


if __name__ == "__main__":
    main()
