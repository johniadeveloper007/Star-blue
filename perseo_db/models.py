from datetime import date, datetime
from decimal import Decimal
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Supplier(Base):
    __tablename__ = "suppliers"
    __table_args__ = (
        CheckConstraint("length(trim(supplier_code)) > 0", name="ck_supplier_code_nonempty"),
        CheckConstraint("length(trim(legal_name)) > 0", name="ck_supplier_name_nonempty"),
        UniqueConstraint("supplier_code", name="uq_suppliers_supplier_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_code: Mapped[str] = mapped_column(String(100), nullable=False)
    legal_name: Mapped[str] = mapped_column(String(250), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class SupplierContact(Base):
    __tablename__ = "supplier_contacts"
    __table_args__ = (
        UniqueConstraint("supplier_id", "email", name="uq_supplier_contact_email"),
        CheckConstraint("length(trim(contact_name)) > 0", name="ck_contact_name_nonempty"),
        CheckConstraint("length(trim(email)) > 2", name="ck_contact_email_nonempty"),
        Index("ix_supplier_contacts_supplier_active", "supplier_id", "is_active"),
        Index(
            "uq_supplier_contacts_primary",
            "supplier_id",
            unique=True,
            postgresql_where=text("is_primary IS TRUE"),
            sqlite_where=text("is_primary = 1"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("suppliers.id", ondelete="RESTRICT"), nullable=False
    )
    contact_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ReportingPeriod(Base):
    __tablename__ = "reporting_periods"
    __table_args__ = (
        UniqueConstraint("period_start", name="uq_reporting_periods_period_start"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class MetricDefinition(Base):
    __tablename__ = "metric_definitions"
    __table_args__ = (
        CheckConstraint("length(trim(code)) > 0", name="ck_metric_code_nonempty"),
        CheckConstraint("length(trim(label)) > 0", name="ck_metric_label_nonempty"),
        UniqueConstraint("code", name="uq_metric_definitions_code"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(60), nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500))
    unit: Mapped[str] = mapped_column(String(30), nullable=False, default="percent")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ImportBatch(Base):
    __tablename__ = "import_batches"
    __table_args__ = (
        UniqueConstraint("source_sha256", name="uq_import_batch_source_sha256"),
        CheckConstraint(
            "status IN ('processing', 'completed', 'failed')", name="ck_import_batch_status"
        ),
        CheckConstraint("row_count >= 0", name="ck_import_batch_row_count_nonnegative"),
        CheckConstraint("length(source_sha256) = 64", name="ck_import_batch_sha256_length"),
        Index("ix_import_batches_status_created", "status", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    source_system: Mapped[str] = mapped_column(String(60), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="processing")
    row_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_code: Mapped[str | None] = mapped_column(String(100))
    requested_by: Mapped[str] = mapped_column(String(120), nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class SupplierReport(Base):
    __tablename__ = "supplier_reports"
    __table_args__ = (
        UniqueConstraint("supplier_id", "period_id", name="uq_supplier_report_period"),
        Index("ix_supplier_reports_period_supplier", "period_id", "supplier_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("suppliers.id", ondelete="RESTRICT"), nullable=False
    )
    period_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("reporting_periods.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ReportRevision(Base):
    __tablename__ = "report_revisions"
    __table_args__ = (
        UniqueConstraint("supplier_report_id", "revision_no", name="uq_report_revision_number"),
        CheckConstraint("revision_no > 0", name="ck_report_revision_number_positive"),
        Index("ix_report_revisions_source_batch", "source_batch_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_report_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("supplier_reports.id", ondelete="RESTRICT"), nullable=False
    )
    source_batch_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("import_batches.id", ondelete="RESTRICT"), nullable=False
    )
    revision_no: Mapped[int] = mapped_column(Integer, nullable=False)
    methodology_version: Mapped[str] = mapped_column(String(80), nullable=False)
    result_label: Mapped[str | None] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ReportMetric(Base):
    __tablename__ = "report_metrics"
    __table_args__ = (
        UniqueConstraint("revision_id", "metric_definition_id", name="uq_revision_metric"),
        CheckConstraint("value >= 0 AND value <= 100", name="ck_report_metric_percent_range"),
        Index("ix_report_metrics_metric_revision", "metric_definition_id", "revision_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    revision_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("report_revisions.id", ondelete="RESTRICT"), nullable=False
    )
    metric_definition_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("metric_definitions.id", ondelete="RESTRICT"),
        nullable=False,
    )
    value: Mapped[Decimal] = mapped_column(Numeric(6, 3), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ReportDelivery(Base):
    __tablename__ = "report_deliveries"
    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_report_delivery_idempotency"),
        UniqueConstraint(
            "revision_id", "recipient_email", "attempt_no", name="uq_report_delivery_attempt"
        ),
        CheckConstraint(
            "status IN ('pending', 'sent', 'failed')", name="ck_report_delivery_status"
        ),
        CheckConstraint("attempt_no > 0", name="ck_report_delivery_attempt_positive"),
        CheckConstraint(
            "(status = 'sent' AND sent_at IS NOT NULL) "
            "OR (status IN ('pending', 'failed') AND sent_at IS NULL)",
            name="ck_report_delivery_sent_at",
        ),
        Index("ix_report_deliveries_status_created", "status", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    revision_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("report_revisions.id", ondelete="RESTRICT"), nullable=False
    )
    supplier_contact_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("supplier_contacts.id", ondelete="SET NULL")
    )
    recipient_email: Mapped[str] = mapped_column(String(320), nullable=False)
    idempotency_key: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), nullable=False, default=uuid.uuid4
    )
    attempt_no: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    provider_message_id: Mapped[str | None] = mapped_column(String(200))
    error_code: Mapped[str | None] = mapped_column(String(100))
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class AuditEvent(Base):
    __tablename__ = "audit_events"
    __table_args__ = (
        CheckConstraint("length(trim(actor)) > 0", name="ck_audit_actor_nonempty"),
        CheckConstraint("length(trim(event_type)) > 0", name="ck_audit_event_type_nonempty"),
        Index("ix_audit_events_entity_created", "entity_type", "entity_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor: Mapped[str] = mapped_column(String(120), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True))
    details: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

