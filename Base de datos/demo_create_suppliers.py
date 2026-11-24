import argparse
import csv
import re
import sys
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "Back End" / "HACEB_BACKEND"))

from perseo_db.models import Base, Supplier, SupplierContact


EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
DEMO_SUPPLIERS = (
    ("SUP-PRUEBA-001", "Proveedor de Prueba Alfa"),
    ("SUP-PRUEBA-002", "Proveedor de Prueba Beta"),
    ("SUP-PRUEBA-003", "Proveedor de Prueba Gamma"),
    ("SUP-PRUEBA-004", "Proveedor de Prueba Delta"),
    ("SUP-PRUEBA-005", "Proveedor de Prueba Epsilon"),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a local supplier contact demo.")
    parser.add_argument("emails", nargs="+", help="Test recipient email addresses")
    parser.add_argument("--count", type=int, default=5)
    parser.add_argument(
        "--database",
        type=Path,
        default=Path(__file__).parent / "demo" / "suppliers.db",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.count < 1 or args.count > len(DEMO_SUPPLIERS):
        raise ValueError(f"--count must be between 1 and {len(DEMO_SUPPLIERS)}.")
    if len(args.emails) != args.count:
        raise ValueError("The number of emails must match --count.")

    emails = [email.strip() for email in args.emails]
    invalid = [email for email in emails if not EMAIL_PATTERN.fullmatch(email)]
    if invalid:
        raise ValueError("All entries must be valid email addresses.")

    args.database.parent.mkdir(parents=True, exist_ok=True)
    engine = create_engine(f"sqlite:///{args.database}")
    Base.metadata.create_all(engine)

    csv_path = args.database.with_suffix(".csv")
    with Session(engine) as session:
        for (supplier_code, supplier_name), email in zip(
            DEMO_SUPPLIERS[: args.count], emails
        ):
            supplier = session.scalar(
                select(Supplier).where(Supplier.supplier_code == supplier_code)
            )
            if supplier is None:
                supplier = Supplier(
                    supplier_code=supplier_code,
                    legal_name=supplier_name,
                    is_active=True,
                )
                session.add(supplier)
                session.flush()

            contact = session.scalar(
                select(SupplierContact).where(
                    SupplierContact.supplier_id == supplier.id,
                    SupplierContact.is_primary.is_(True),
                )
            )
            if contact is None:
                contact = SupplierContact(
                    supplier_id=supplier.id,
                    contact_name=f"Contacto {supplier_code}",
                    email=email,
                    is_primary=True,
                    is_active=True,
                )
                session.add(contact)
            else:
                contact.email = email
                contact.is_active = True

        session.commit()

        with csv_path.open("w", newline="", encoding="utf-8-sig") as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(["supplier_code", "supplier_name", "contact_name", "email"])
            result = session.execute(
                select(Supplier, SupplierContact)
                .join(SupplierContact, SupplierContact.supplier_id == Supplier.id)
                .where(Supplier.supplier_code.in_(
                    code for code, _ in DEMO_SUPPLIERS[: args.count]
                ))
                .order_by(Supplier.supplier_code)
            )
            for supplier, contact in result:
                writer.writerow(
                    [supplier.supplier_code, supplier.legal_name, contact.contact_name, contact.email]
                )

    print(f"Demo database: {args.database}")
    print(f"Demo CSV: {csv_path}")
    print(f"Created or updated {args.count} synthetic suppliers.")


if __name__ == "__main__":
    main()
