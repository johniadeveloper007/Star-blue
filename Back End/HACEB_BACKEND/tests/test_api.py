from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker

from perseo_db.api import create_app
from perseo_db.importer import MonthlyReportInput, import_monthly_reports
from perseo_db.models import Base, MetricDefinition


def _report(
    supplier_code: str,
    supplier_name: str,
    overall_compliance: int,
    on_time: int,
    in_full: int,
) -> MonthlyReportInput:
    return MonthlyReportInput(
        supplier_code=supplier_code,
        supplier_name=supplier_name,
        period_start=date(2025, 10, 1),
        metrics={
            "overall_compliance": Decimal(overall_compliance),
            "on_time": Decimal(on_time),
            "in_full": Decimal(in_full),
        },
        methodology_version="powerbi-export-v1",
        result_label="CUMPLE",
    )


def test_api_serves_powerbi_summary_directory_and_latest_revision(tmp_path):
    database_url = URL.create(
        "sqlite",
        database=str(tmp_path / "perseo-api.db"),
    ).render_as_string(hide_password=False)
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
    )
    with session_factory.begin() as session:
        session.add_all(
            [
                MetricDefinition(code="overall_compliance", label="Cumplimiento general"),
                MetricDefinition(code="on_time", label="A tiempo"),
                MetricDefinition(code="in_full", label="Completo"),
            ]
        )

    try:
        import_monthly_reports(
            session_factory,
            source_sha256="a" * 64,
            source_system="powerbi",
            requested_by="test",
            reports=[
                _report("SUP-001", "Proveedor Norte", 40, 50, 30),
                _report("SUP-002", "Proveedor Sur", 60, 70, 50),
            ],
        )
        import_monthly_reports(
            session_factory,
            source_sha256="b" * 64,
            source_system="powerbi",
            requested_by="test",
            reports=[_report("SUP-001", "Proveedor Norte", 80, 90, 70)],
        )

        with TestClient(create_app(database_url)) as client:
            summary = client.get("/api/v1/dashboard/summary")
            assert summary.status_code == 200
            assert summary.json()["supplier_count"] == 2
            assert summary.json()["report_count"] == 2
            assert summary.json()["latest_metrics"]["overall_compliance"] == 70.0

            page = client.get("/api/v1/suppliers", params={"search": "Norte", "limit": 1})
            assert page.status_code == 200
            assert page.json()["total"] == 1
            assert page.json()["items"][0]["code"] == "SUP-001"

            reports = client.get("/api/v1/suppliers/SUP-001/reports")
            assert reports.status_code == 200
            report = reports.json()[0]
            assert report["revision_no"] == 2
            assert {
                metric["code"]: metric["value"] for metric in report["metrics"]
            }["overall_compliance"] == 80.0

            missing = client.get("/api/v1/suppliers/DOES-NOT-EXIST")
            assert missing.status_code == 404
    finally:
        engine.dispose()
