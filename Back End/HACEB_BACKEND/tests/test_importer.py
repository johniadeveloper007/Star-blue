from datetime import date
from decimal import Decimal
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from perseo_db.importer import (
    DuplicateImportError,
    MonthlyReportInput,
    import_monthly_reports,
)
from perseo_db.models import (
    AuditEvent,
    Base,
    ImportBatch,
    MetricDefinition,
    ReportMetric,
    ReportRevision,
    Supplier,
)


@pytest.fixture
def session_factory() -> sessionmaker[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory.begin() as session:
        session.add_all(
            [
                MetricDefinition(code="overall_compliance", label="Cumplimiento general"),
                MetricDefinition(code="on_time", label="On Time"),
                MetricDefinition(code="in_full", label="In Full"),
            ]
        )
    yield factory
    engine.dispose()


def valid_report() -> MonthlyReportInput:
    return MonthlyReportInput(
        supplier_code="SUP-001",
        supplier_name="Proveedor de prueba",
        period_start=date(2026, 10, 1),
        metrics={
            "overall_compliance": Decimal("47"),
            "on_time": Decimal("57"),
            "in_full": Decimal("37"),
        },
        methodology_version="powerbi-export-v1",
        result_label="INCUMPLE",
    )


def test_import_creates_report_revision_metrics_and_audit(session_factory):
    batch_id = import_monthly_reports(
        session_factory,
        source_sha256="a" * 64,
        source_system="powerbi",
        requested_by="perseo",
        reports=[valid_report()],
    )

    with session_factory() as session:
        batch = session.get(ImportBatch, batch_id)
        assert batch is not None
        assert batch.status == "completed"
        assert batch.row_count == 1
        assert len(session.scalars(select(Supplier)).all()) == 1
        assert len(session.scalars(select(ReportRevision)).all()) == 1
        assert len(session.scalars(select(ReportMetric)).all()) == 3
        assert len(session.scalars(select(AuditEvent)).all()) >= 3


def test_reimport_of_same_source_is_rejected(session_factory):
    kwargs = {
        "source_sha256": "b" * 64,
        "source_system": "powerbi",
        "requested_by": "perseo",
        "reports": [valid_report()],
    }
    import_monthly_reports(session_factory, **kwargs)

    with pytest.raises(DuplicateImportError):
        import_monthly_reports(session_factory, **kwargs)


def test_corrected_source_creates_a_new_immutable_revision(session_factory):
    original = valid_report()
    import_monthly_reports(
        session_factory,
        source_sha256="e" * 64,
        source_system="powerbi",
        requested_by="perseo",
        reports=[original],
    )
    corrected = MonthlyReportInput(
        supplier_code=original.supplier_code,
        supplier_name=original.supplier_name,
        period_start=original.period_start,
        metrics={
            "overall_compliance": Decimal("48"),
            "on_time": Decimal("58"),
            "in_full": Decimal("38"),
        },
        methodology_version="powerbi-export-v1",
        result_label="INCUMPLE",
    )
    import_monthly_reports(
        session_factory,
        source_sha256="f" * 64,
        source_system="powerbi",
        requested_by="perseo",
        reports=[corrected],
    )

    with session_factory() as session:
        revisions = session.scalars(
            select(ReportRevision).order_by(ReportRevision.revision_no)
        ).all()
        assert [revision.revision_no for revision in revisions] == [1, 2]
        assert len(session.scalars(select(ReportMetric)).all()) == 6


def test_unknown_metric_marks_batch_failed_without_partial_report(session_factory):
    report = MonthlyReportInput(
        supplier_code="SUP-002",
        supplier_name="Otro proveedor",
        period_start=date(2026, 10, 1),
        metrics={"unregistered_metric": Decimal("50")},
        methodology_version="powerbi-export-v1",
    )

    with pytest.raises(ValueError, match="Unknown metric codes"):
        import_monthly_reports(
            session_factory,
            source_sha256="c" * 64,
            source_system="powerbi",
            requested_by="perseo",
            reports=[report],
        )

    with session_factory() as session:
        batch = session.scalar(select(ImportBatch).where(ImportBatch.source_sha256 == "c" * 64))
        assert batch is not None
        assert batch.status == "failed"
        assert session.scalars(select(Supplier)).all() == []
        assert session.scalars(select(ReportRevision)).all() == []


def test_invalid_percentage_is_rejected_before_creating_a_batch(session_factory):
    report = MonthlyReportInput(
        supplier_code="SUP-003",
        supplier_name="Proveedor inválido",
        period_start=date(2026, 10, 1),
        metrics={"on_time": Decimal("100.01")},
        methodology_version="powerbi-export-v1",
    )

    with pytest.raises(ValueError, match="between 0 and 100"):
        import_monthly_reports(
            session_factory,
            source_sha256="d" * 64,
            source_system="powerbi",
            requested_by="perseo",
            reports=[report],
        )

    with session_factory() as session:
        assert session.scalars(select(ImportBatch)).all() == []

