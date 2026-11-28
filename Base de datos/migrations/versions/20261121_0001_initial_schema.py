"""Create Perseo supplier reporting schema.

Revision ID: 20261121_0001
Revises:
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = "20261121_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "suppliers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_code", sa.String(length=100), nullable=False),
        sa.Column("legal_name", sa.String(length=250), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("length(trim(supplier_code)) > 0", name="ck_supplier_code_nonempty"),
        sa.CheckConstraint("length(trim(legal_name)) > 0", name="ck_supplier_name_nonempty"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("supplier_code", name="uq_suppliers_supplier_code"),
    )
    op.create_table(
        "supplier_contacts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contact_name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("length(trim(contact_name)) > 0", name="ck_contact_name_nonempty"),
        sa.CheckConstraint("length(trim(email)) > 2", name="ck_contact_email_nonempty"),
        sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("supplier_id", "email", name="uq_supplier_contact_email"),
    )
    op.create_index(
        "ix_supplier_contacts_supplier_active", "supplier_contacts", ["supplier_id", "is_active"]
    )
    op.create_index(
        "uq_supplier_contacts_primary",
        "supplier_contacts",
        ["supplier_id"],
        unique=True,
        postgresql_where=sa.text("is_primary IS TRUE"),
    )
    op.create_table(
        "reporting_periods",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("period_start", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("period_start", name="uq_reporting_periods_period_start"),
    )
    op.create_table(
        "metric_definitions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(length=60), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("unit", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("length(trim(code)) > 0", name="ck_metric_code_nonempty"),
        sa.CheckConstraint("length(trim(label)) > 0", name="ck_metric_label_nonempty"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_metric_definitions_code"),
    )
    op.create_table(
        "import_batches",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_sha256", sa.String(length=64), nullable=False),
        sa.Column("source_system", sa.String(length=60), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("row_count", sa.Integer(), nullable=False),
        sa.Column("error_code", sa.String(length=100), nullable=True),
        sa.Column("requested_by", sa.String(length=120), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('processing', 'completed', 'failed')", name="ck_import_batch_status"
        ),
        sa.CheckConstraint("row_count >= 0", name="ck_import_batch_row_count_nonnegative"),
        sa.CheckConstraint("length(source_sha256) = 64", name="ck_import_batch_sha256_length"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_sha256", name="uq_import_batch_source_sha256"),
    )
    op.create_index(
        "ix_import_batches_status_created", "import_batches", ["status", "created_at"]
    )
    op.create_table(
        "supplier_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("period_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["period_id"], ["reporting_periods.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("supplier_id", "period_id", name="uq_supplier_report_period"),
    )
    op.create_index(
        "ix_supplier_reports_period_supplier", "supplier_reports", ["period_id", "supplier_id"]
    )
    op.create_table(
        "report_revisions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_report_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_batch_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("revision_no", sa.Integer(), nullable=False),
        sa.Column("methodology_version", sa.String(length=80), nullable=False),
        sa.Column("result_label", sa.String(length=40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("revision_no > 0", name="ck_report_revision_number_positive"),
        sa.ForeignKeyConstraint(["source_batch_id"], ["import_batches.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["supplier_report_id"], ["supplier_reports.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "supplier_report_id", "revision_no", name="uq_report_revision_number"
        ),
    )
    op.create_index(
        "ix_report_revisions_source_batch", "report_revisions", ["source_batch_id"]
    )
    op.create_table(
        "report_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("revision_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("metric_definition_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("value", sa.Numeric(precision=6, scale=3), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("value >= 0 AND value <= 100", name="ck_report_metric_percent_range"),
        sa.ForeignKeyConstraint(
            ["metric_definition_id"], ["metric_definitions.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(["revision_id"], ["report_revisions.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("revision_id", "metric_definition_id", name="uq_revision_metric"),
    )
    op.create_index(
        "ix_report_metrics_metric_revision", "report_metrics", ["metric_definition_id", "revision_id"]
    )
    op.create_table(
        "report_deliveries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("revision_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("supplier_contact_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("recipient_email", sa.String(length=320), nullable=False),
        sa.Column("idempotency_key", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("attempt_no", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("provider_message_id", sa.String(length=200), nullable=True),
        sa.Column("error_code", sa.String(length=100), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('pending', 'sent', 'failed')", name="ck_report_delivery_status"
        ),
        sa.CheckConstraint("attempt_no > 0", name="ck_report_delivery_attempt_positive"),
        sa.CheckConstraint(
            "(status = 'sent' AND sent_at IS NOT NULL) "
            "OR (status IN ('pending', 'failed') AND sent_at IS NULL)",
            name="ck_report_delivery_sent_at",
        ),
        sa.ForeignKeyConstraint(
            ["revision_id"], ["report_revisions.id"], ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["supplier_contact_id"], ["supplier_contacts.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key", name="uq_report_delivery_idempotency"),
        sa.UniqueConstraint(
            "revision_id", "recipient_email", "attempt_no", name="uq_report_delivery_attempt"
        ),
    )
    op.create_index(
        "ix_report_deliveries_status_created", "report_deliveries", ["status", "created_at"]
    )
    op.create_table(
        "audit_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor", sa.String(length=120), nullable=False),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("entity_type", sa.String(length=80), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("length(trim(actor)) > 0", name="ck_audit_actor_nonempty"),
        sa.CheckConstraint("length(trim(event_type)) > 0", name="ck_audit_event_type_nonempty"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_audit_events_entity_created",
        "audit_events",
        ["entity_type", "entity_id", "created_at"],
    )

    op.bulk_insert(
        sa.table(
            "metric_definitions",
            sa.column("id", postgresql.UUID(as_uuid=True)),
            sa.column("code", sa.String()),
            sa.column("label", sa.String()),
            sa.column("description", sa.String()),
            sa.column("unit", sa.String()),
            sa.column("is_active", sa.Boolean()),
        ),
        [
            {
                "id": uuid.UUID("d4f7bd4c-59d9-4ad0-9470-1c9a54873001"),
                "code": "overall_compliance",
                "label": "Cumplimiento general",
                "description": "Valor porcentual agregado entregado por la fuente oficial.",
                "unit": "percent",
                "is_active": True,
            },
            {
                "id": uuid.UUID("d4f7bd4c-59d9-4ad0-9470-1c9a54873002"),
                "code": "on_time",
                "label": "On Time",
                "description": "Valor porcentual de puntualidad entregado por la fuente oficial.",
                "unit": "percent",
                "is_active": True,
            },
            {
                "id": uuid.UUID("d4f7bd4c-59d9-4ad0-9470-1c9a54873003"),
                "code": "in_full",
                "label": "In Full",
                "description": "Valor porcentual de cantidad completa entregado por la fuente oficial.",
                "unit": "percent",
                "is_active": True,
            },
            {
                "id": uuid.UUID("d4f7bd4c-59d9-4ad0-9470-1c9a54873004"),
                "code": "inventory_level",
                "label": "Nivel de inventario",
                "description": "Nivel agregado de inventario calculado por la fuente del PBIX.",
                "unit": "percent",
                "is_active": True,
            },
            {
                "id": uuid.UUID("d4f7bd4c-59d9-4ad0-9470-1c9a54873005"),
                "code": "inhouse_compliance",
                "label": "Cumplimiento in-house",
                "description": "Calificación mensual in-house entregada por la fuente del PBIX.",
                "unit": "percent",
                "is_active": True,
            },
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_audit_events_entity_created", table_name="audit_events")
    op.drop_table("audit_events")
    op.drop_index("ix_report_deliveries_status_created", table_name="report_deliveries")
    op.drop_table("report_deliveries")
    op.drop_index("ix_report_metrics_metric_revision", table_name="report_metrics")
    op.drop_table("report_metrics")
    op.drop_index("ix_report_revisions_source_batch", table_name="report_revisions")
    op.drop_table("report_revisions")
    op.drop_index("ix_supplier_reports_period_supplier", table_name="supplier_reports")
    op.drop_table("supplier_reports")
    op.drop_index("ix_import_batches_status_created", table_name="import_batches")
    op.drop_table("import_batches")
    op.drop_table("metric_definitions")
    op.drop_table("reporting_periods")
    op.drop_index("ix_supplier_contacts_supplier_active", table_name="supplier_contacts")
    op.drop_index("uq_supplier_contacts_primary", table_name="supplier_contacts")
    op.drop_table("supplier_contacts")
    op.drop_table("suppliers")

