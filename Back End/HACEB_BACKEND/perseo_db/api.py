from collections.abc import Generator
from contextlib import asynccontextmanager
from datetime import date, datetime
import os
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.orm import Session

from perseo_db.database import build_engine, build_session_factory
from perseo_db.models import (
    ImportBatch,
    MetricDefinition,
    ReportMetric,
    ReportRevision,
    ReportingPeriod,
    Supplier,
    SupplierReport,
)
from perseo_db.settings import get_settings


class LatestImportResponse(BaseModel):
    source_system: str
    status: str
    row_count: int
    completed_at: datetime | None


class DashboardSummaryResponse(BaseModel):
    supplier_count: int
    active_supplier_count: int
    report_count: int
    period_count: int
    latest_period: date | None
    latest_metrics: dict[str, float]
    latest_import: LatestImportResponse | None


class SupplierResponse(BaseModel):
    id: str
    code: str
    name: str
    is_active: bool
    report_count: int
    latest_period: date | None


class SupplierListResponse(BaseModel):
    items: list[SupplierResponse]
    total: int
    limit: int
    offset: int


class ReportMetricResponse(BaseModel):
    code: str
    label: str
    value: float


class SupplierReportResponse(BaseModel):
    period_start: date
    revision_no: int
    methodology_version: str
    result_label: str | None
    metrics: list[ReportMetricResponse]


@asynccontextmanager
async def _lifespan(app: FastAPI):
    database_url = app.state.database_url or get_settings().database_url
    engine = build_engine(database_url)
    app.state.session_factory = build_session_factory(engine)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        yield
    finally:
        engine.dispose()


def _session_for_request(request: Request) -> Generator[Session, None, None]:
    with request.app.state.session_factory() as session:
        yield session


def _latest_revision_subquery():
    return (
        select(
            ReportRevision.supplier_report_id.label("supplier_report_id"),
            func.max(ReportRevision.revision_no).label("revision_no"),
        )
        .group_by(ReportRevision.supplier_report_id)
        .subquery()
    )


def _supplier_statement():
    report_count = (
        select(func.count(SupplierReport.id))
        .where(SupplierReport.supplier_id == Supplier.id)
        .scalar_subquery()
    )
    latest_period = (
        select(func.max(ReportingPeriod.period_start))
        .join(SupplierReport, SupplierReport.period_id == ReportingPeriod.id)
        .where(SupplierReport.supplier_id == Supplier.id)
        .scalar_subquery()
    )
    return select(
        Supplier.id,
        Supplier.supplier_code,
        Supplier.legal_name,
        Supplier.is_active,
        report_count.label("report_count"),
        latest_period.label("latest_period"),
    )


def _supplier_response(row) -> SupplierResponse:
    return SupplierResponse(
        id=str(row.id),
        code=row.supplier_code,
        name=row.legal_name,
        is_active=row.is_active,
        report_count=row.report_count,
        latest_period=row.latest_period,
    )


def create_app(database_url: str | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.database_url = database_url
        async with _lifespan(app):
            yield

    app = FastAPI(
        title="Perseo read-only API",
        version="1.0.0",
        description="Read-only API for imported supplier and monthly report data.",
        lifespan=lifespan,
    )
    allowed_origins = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_methods=["GET"],
        allow_headers=["Accept"],
    )

    session_dependency = Annotated[Session, Depends(_session_for_request)]

    @app.get("/api/v1/health", tags=["health"])
    def health(session: session_dependency) -> dict[str, str]:
        session.execute(text("SELECT 1"))
        return {"status": "ok"}

    @app.get(
        "/api/v1/dashboard/summary",
        response_model=DashboardSummaryResponse,
        tags=["dashboard"],
    )
    def dashboard_summary(session: session_dependency) -> DashboardSummaryResponse:
        supplier_count = session.scalar(select(func.count(Supplier.id))) or 0
        active_supplier_count = session.scalar(
            select(func.count(Supplier.id)).where(Supplier.is_active.is_(True))
        ) or 0
        report_count = session.scalar(select(func.count(SupplierReport.id))) or 0
        period_count = session.scalar(select(func.count(ReportingPeriod.id))) or 0
        latest_period = session.scalar(select(func.max(ReportingPeriod.period_start)))
        latest_metrics: dict[str, float] = {}

        if latest_period is not None:
            latest_revision = _latest_revision_subquery()
            metric_rows = session.execute(
                select(MetricDefinition.code, func.avg(ReportMetric.value))
                .select_from(ReportMetric)
                .join(MetricDefinition, MetricDefinition.id == ReportMetric.metric_definition_id)
                .join(ReportRevision, ReportRevision.id == ReportMetric.revision_id)
                .join(
                    latest_revision,
                    and_(
                        latest_revision.c.supplier_report_id
                        == ReportRevision.supplier_report_id,
                        latest_revision.c.revision_no == ReportRevision.revision_no,
                    ),
                )
                .join(
                    SupplierReport,
                    SupplierReport.id == ReportRevision.supplier_report_id,
                )
                .join(
                    ReportingPeriod,
                    ReportingPeriod.id == SupplierReport.period_id,
                )
                .where(ReportingPeriod.period_start == latest_period)
                .group_by(MetricDefinition.code)
            ).all()
            latest_metrics = {
                code: float(value)
                for code, value in metric_rows
                if value is not None
            }

        latest_import = session.scalar(
            select(ImportBatch)
            .where(ImportBatch.status == "completed")
            .order_by(ImportBatch.completed_at.desc())
            .limit(1)
        )
        return DashboardSummaryResponse(
            supplier_count=supplier_count,
            active_supplier_count=active_supplier_count,
            report_count=report_count,
            period_count=period_count,
            latest_period=latest_period,
            latest_metrics=latest_metrics,
            latest_import=(
                LatestImportResponse(
                    source_system=latest_import.source_system,
                    status=latest_import.status,
                    row_count=latest_import.row_count,
                    completed_at=latest_import.completed_at,
                )
                if latest_import is not None
                else None
            ),
        )

    @app.get(
        "/api/v1/suppliers",
        response_model=SupplierListResponse,
        tags=["suppliers"],
    )
    def list_suppliers(
        session: session_dependency,
        search: Annotated[str, Query(max_length=100)] = "",
        is_active: bool | None = None,
        limit: Annotated[int, Query(ge=1, le=100)] = 25,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> SupplierListResponse:
        filters = []
        normalized_search = search.strip()
        if normalized_search:
            escaped_search = normalized_search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            pattern = f"%{escaped_search}%"
            filters.append(
                or_(
                    Supplier.supplier_code.ilike(pattern, escape="\\"),
                    Supplier.legal_name.ilike(pattern, escape="\\"),
                )
            )
        if is_active is not None:
            filters.append(Supplier.is_active.is_(is_active))

        total = session.scalar(
            select(func.count(Supplier.id)).where(*filters)
        ) or 0
        rows = session.execute(
            _supplier_statement()
            .where(*filters)
            .order_by(Supplier.legal_name, Supplier.supplier_code)
            .limit(limit)
            .offset(offset)
        ).all()
        return SupplierListResponse(
            items=[_supplier_response(row) for row in rows],
            total=total,
            limit=limit,
            offset=offset,
        )

    @app.get(
        "/api/v1/suppliers/{supplier_code}",
        response_model=SupplierResponse,
        tags=["suppliers"],
    )
    def get_supplier(
        supplier_code: str,
        session: session_dependency,
    ) -> SupplierResponse:
        row = session.execute(
            _supplier_statement().where(Supplier.supplier_code == supplier_code)
        ).first()
        if row is None:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado.")
        return _supplier_response(row)

    @app.get(
        "/api/v1/suppliers/{supplier_code}/reports",
        response_model=list[SupplierReportResponse],
        tags=["reports"],
    )
    def list_supplier_reports(
        supplier_code: str,
        session: session_dependency,
    ) -> list[SupplierReportResponse]:
        supplier_exists = session.scalar(
            select(Supplier.id).where(Supplier.supplier_code == supplier_code)
        )
        if supplier_exists is None:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

        latest_revision = _latest_revision_subquery()
        rows = session.execute(
            select(
                ReportingPeriod.period_start,
                ReportRevision.revision_no,
                ReportRevision.methodology_version,
                ReportRevision.result_label,
                MetricDefinition.code,
                MetricDefinition.label,
                ReportMetric.value,
            )
            .select_from(SupplierReport)
            .join(Supplier, Supplier.id == SupplierReport.supplier_id)
            .join(ReportingPeriod, ReportingPeriod.id == SupplierReport.period_id)
            .join(
                ReportRevision,
                ReportRevision.supplier_report_id == SupplierReport.id,
            )
            .join(
                latest_revision,
                and_(
                    latest_revision.c.supplier_report_id
                    == ReportRevision.supplier_report_id,
                    latest_revision.c.revision_no == ReportRevision.revision_no,
                ),
            )
            .join(ReportMetric, ReportMetric.revision_id == ReportRevision.id)
            .join(
                MetricDefinition,
                MetricDefinition.id == ReportMetric.metric_definition_id,
            )
            .where(Supplier.supplier_code == supplier_code)
            .order_by(ReportingPeriod.period_start.desc(), MetricDefinition.label)
        ).all()

        reports: dict[date, SupplierReportResponse] = {}
        for row in rows:
            report = reports.get(row.period_start)
            if report is None:
                report = SupplierReportResponse(
                    period_start=row.period_start,
                    revision_no=row.revision_no,
                    methodology_version=row.methodology_version,
                    result_label=row.result_label,
                    metrics=[],
                )
                reports[row.period_start] = report
            report.metrics.append(
                ReportMetricResponse(
                    code=row.code,
                    label=row.label,
                    value=float(row.value),
                )
            )
        return list(reports.values())

    return app


app = create_app()
