from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
import logging
import re
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from perseo_db.models import (
    AuditEvent,
    ImportBatch,
    MetricDefinition,
    ReportMetric,
    ReportRevision,
    ReportingPeriod,
    Supplier,
    SupplierReport,
)

logger = logging.getLogger(__name__)
SHA256_PATTERN = re.compile(r"^[0-9a-fA-F]{64}$")


class DuplicateImportError(ValueError):
    pass


@dataclass(frozen=True)
class MonthlyReportInput:
    supplier_code: str
    supplier_name: str
    period_start: date
    metrics: Mapping[str, Decimal | int | float | str]
    methodology_version: str
    result_label: str | None = None


@dataclass(frozen=True)
class _ValidatedReport:
    supplier_code: str
    supplier_name: str
    period_start: date
    metrics: Mapping[str, Decimal]
    methodology_version: str
    result_label: str | None


def _validate_reports(reports: Sequence[MonthlyReportInput]) -> tuple[_ValidatedReport, ...]:
    if not reports:
        raise ValueError("An import must contain at least one supplier report.")

    validated: list[_ValidatedReport] = []
    seen_periods: set[tuple[str, date]] = set()
    for row in reports:
        supplier_code = row.supplier_code.strip()
        supplier_name = row.supplier_name.strip()
        methodology_version = row.methodology_version.strip()
        if not supplier_code or len(supplier_code) > 100:
            raise ValueError("Supplier code must contain 1 to 100 characters.")
        if not supplier_name or len(supplier_name) > 250:
            raise ValueError("Supplier name must contain 1 to 250 characters.")
        if row.period_start.day != 1:
            raise ValueError("period_start must be the first day of its month.")
        if not methodology_version or len(methodology_version) > 80:
            raise ValueError("methodology_version must contain 1 to 80 characters.")

        report_key = (supplier_code, row.period_start)
        if report_key in seen_periods:
            raise ValueError("An import cannot contain duplicate supplier/month reports.")
        seen_periods.add(report_key)

        if not row.metrics:
            raise ValueError(f"Report for supplier {supplier_code} has no metrics.")
        metrics: dict[str, Decimal] = {}
        for raw_code, raw_value in row.metrics.items():
            code = raw_code.strip()
            if not code or len(code) > 60:
                raise ValueError("Metric code must contain 1 to 60 characters.")
            if code in metrics:
                raise ValueError(f"Duplicate metric code in report: {code}.")
            try:
                value = Decimal(str(raw_value))
            except (InvalidOperation, ValueError) as exc:
                raise ValueError(f"Metric {code} must be a decimal number.") from exc
            if not value.is_finite() or value < 0 or value > 100:
                raise ValueError(f"Metric {code} must be between 0 and 100.")
            metrics[code] = value

        result_label = row.result_label.strip() if row.result_label else None
        if result_label is not None and len(result_label) > 40:
            raise ValueError("result_label cannot exceed 40 characters.")
        validated.append(
            _ValidatedReport(
                supplier_code=supplier_code,
                supplier_name=supplier_name,
                period_start=row.period_start,
                metrics=metrics,
                methodology_version=methodology_version,
                result_label=result_label,
            )
        )
    return tuple(validated)


def _audit(
    actor: str,
    event_type: str,
    entity_type: str,
    entity_id: uuid.UUID | None,
    details: dict[str, object],
) -> AuditEvent:
    return AuditEvent(
        actor=actor,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
    )


def import_monthly_reports(
    session_factory: sessionmaker[Session],
    *,
    source_sha256: str,
    source_system: str,
    requested_by: str,
    reports: Sequence[MonthlyReportInput],
) -> uuid.UUID:
    """Import normalized monthly reports, preserving immutable report revisions."""
    if not SHA256_PATTERN.fullmatch(source_sha256):
        raise ValueError("source_sha256 must be a 64-character hexadecimal SHA-256.")
    source_system = source_system.strip()
    requested_by = requested_by.strip()
    if not source_system or len(source_system) > 60:
        raise ValueError("source_system must contain 1 to 60 characters.")
    if not requested_by or len(requested_by) > 120:
        raise ValueError("requested_by must contain 1 to 120 characters.")

    validated_reports = _validate_reports(reports)
    batch_id = uuid.uuid4()
    normalized_hash = source_sha256.lower()

    with session_factory.begin() as session:
        existing_batch = session.scalar(
            select(ImportBatch).where(ImportBatch.source_sha256 == normalized_hash)
        )
        if existing_batch is not None:
            raise DuplicateImportError(
                f"Source file was already registered with status {existing_batch.status}."
            )
        batch = ImportBatch(
            id=batch_id,
            source_sha256=normalized_hash,
            source_system=source_system,
            requested_by=requested_by,
            status="processing",
        )
        session.add(batch)
        session.add(
            _audit(
                requested_by,
                "import.started",
                "import_batch",
                batch_id,
                {"report_count": len(validated_reports), "source_system": source_system},
            )
        )

    try:
        with session_factory.begin() as session:
            batch = session.get(ImportBatch, batch_id)
            if batch is None:
                raise RuntimeError("Import batch disappeared before processing.")

            definitions = {
                definition.code: definition.id
                for definition in session.scalars(
                    select(MetricDefinition).where(MetricDefinition.is_active.is_(True))
                )
            }
            used_codes = {
                code for report in validated_reports for code in report.metrics
            }
            unknown_codes = used_codes - definitions.keys()
            if unknown_codes:
                raise ValueError(
                    "Unknown metric codes: " + ", ".join(sorted(unknown_codes))
                )

            for row in validated_reports:
                supplier = session.scalar(
                    select(Supplier)
                    .where(Supplier.supplier_code == row.supplier_code)
                    .with_for_update()
                )
                if supplier is None:
                    supplier = Supplier(
                        supplier_code=row.supplier_code,
                        legal_name=row.supplier_name,
                        is_active=True,
                    )
                    session.add(supplier)
                    session.flush()
                    session.add(
                        _audit(
                            requested_by,
                            "supplier.created",
                            "supplier",
                            supplier.id,
                            {"supplier_code": supplier.supplier_code},
                        )
                    )
                elif supplier.legal_name != row.supplier_name:
                    supplier.legal_name = row.supplier_name
                    session.add(
                        _audit(
                            requested_by,
                            "supplier.name_updated",
                            "supplier",
                            supplier.id,
                            {"supplier_code": supplier.supplier_code},
                        )
                    )

                period = session.scalar(
                    select(ReportingPeriod)
                    .where(ReportingPeriod.period_start == row.period_start)
                    .with_for_update()
                )
                if period is None:
                    period = ReportingPeriod(period_start=row.period_start)
                    session.add(period)
                    session.flush()

                report = session.scalar(
                    select(SupplierReport)
                    .where(
                        SupplierReport.supplier_id == supplier.id,
                        SupplierReport.period_id == period.id,
                    )
                    .with_for_update()
                )
                if report is None:
                    report = SupplierReport(supplier_id=supplier.id, period_id=period.id)
                    session.add(report)
                    session.flush()

                previous_revision = session.scalar(
                    select(func.max(ReportRevision.revision_no)).where(
                        ReportRevision.supplier_report_id == report.id
                    )
                )
                revision = ReportRevision(
                    supplier_report_id=report.id,
                    source_batch_id=batch.id,
                    revision_no=(previous_revision or 0) + 1,
                    methodology_version=row.methodology_version,
                    result_label=row.result_label,
                )
                session.add(revision)
                session.flush()
                for code, value in row.metrics.items():
                    session.add(
                        ReportMetric(
                            revision_id=revision.id,
                            metric_definition_id=definitions[code],
                            value=value,
                        )
                    )
                session.add(
                    _audit(
                        requested_by,
                        "report.revision_created",
                        "report_revision",
                        revision.id,
                        {
                            "revision_no": revision.revision_no,
                            "metric_codes": sorted(row.metrics),
                            "period_start": row.period_start.isoformat(),
                            "supplier_code": row.supplier_code,
                        },
                    )
                )

            batch.status = "completed"
            batch.row_count = len(validated_reports)
            batch.completed_at = datetime.now(timezone.utc)
            session.add(
                _audit(
                    requested_by,
                    "import.completed",
                    "import_batch",
                    batch.id,
                    {"report_count": len(validated_reports)},
                )
            )
    except Exception as exc:
        with session_factory.begin() as session:
            batch = session.get(ImportBatch, batch_id)
            if batch is not None:
                batch.status = "failed"
                batch.error_code = type(exc).__name__[:100]
                batch.completed_at = datetime.now(timezone.utc)
                session.add(
                    _audit(
                        requested_by,
                        "import.failed",
                        "import_batch",
                        batch.id,
                        {"error_code": batch.error_code},
                    )
                )
        logger.exception("Monthly report import failed; batch_id=%s", batch_id)
        raise

    return batch_id

