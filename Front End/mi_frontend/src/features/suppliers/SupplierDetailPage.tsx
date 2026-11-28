import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequestError, perseoApi } from "../../services/perseoApi";
import type { PerseoSupplier, SupplierMonthlyReport } from "../../types/perseoApi";

function formatReportingPeriod(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatMetric(value: number) {
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} %`;
}

export function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<PerseoSupplier | null>(null);
  const [reports, setReports] = useState<SupplierMonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setLoadError("");
    setNotFound(false);

    Promise.all([
      perseoApi.getSupplier(supplierId || "", controller.signal),
      perseoApi.getSupplierReports(supplierId || "", controller.signal),
    ])
      .then(([supplierResult, reportResults]) => {
        if (!active) return;
        setSupplier(supplierResult);
        setReports(reportResults);
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        if (error instanceof ApiRequestError && error.status === 404) {
          setNotFound(true);
          return;
        }
        setLoadError(error instanceof Error ? error.message : "No fue posible consultar el proveedor.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [supplierId, reloadKey]);

  if (loading) {
    return (
      <main className="supplier-page">
        <p className="api-state" role="status">Cargando proveedor y reportes reales…</p>
      </main>
    );
  }

  if (loadError || notFound || !supplier) {
    return (
      <main className="supplier-page">
        <section className="detail-empty" role={loadError ? "alert" : "status"}>
          <h1>{notFound ? "Proveedor no encontrado" : "No se pudo cargar el proveedor"}</h1>
          <p>
            {loadError
              ? `La consulta a la base de datos falló: ${loadError}`
              : notFound
                ? "El código no corresponde a un proveedor de la base de Power BI."
                : "La API no devolvió información del proveedor."}
          </p>
          {loadError && (
            <button className="button-primary" type="button" onClick={() => setReloadKey((value) => value + 1)}>
              Reintentar
            </button>
          )}
          <button className="report-button-secondary" type="button" onClick={() => navigate("/proveedores")}>
            Volver al directorio
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="supplier-page">
      <div className="detail-breadcrumb">
        <button type="button" onClick={() => navigate("/proveedores")}>Proveedores</button>
        <span>/</span>
        <span>{supplier.name}</span>
      </div>
      <section className="detail-header">
        <div className="detail-title">
          <span className="detail-avatar" aria-hidden="true">{supplier.name.slice(0, 1)}</span>
          <div>
            <p className="eyebrow"><span className="eyebrow-mark" />DATOS DE POWER BI</p>
            <h1>{supplier.name}</h1>
            <p>{supplier.code} <span>·</span> {supplier.report_count} reportes mensuales</p>
          </div>
        </div>
        <span className="data-tag">SOLO LECTURA · PBIX</span>
      </section>

      <div className="detail-grid">
        <section className="detail-panel">
          <div className="panel-heading">
            <div><p className="section-overline">IDENTIFICACIÓN</p><h2>Datos disponibles</h2></div>
            <span className={`supplier-status ${supplier.is_active ? "" : "status-inactivo"}`}>
              <span />{supplier.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <dl className="detail-list">
            <div><dt>Nombre del proveedor</dt><dd>{supplier.name}</dd></div>
            <div><dt>NIT / código</dt><dd>{supplier.code}</dd></div>
            <div><dt>Reportes mensuales</dt><dd>{new Intl.NumberFormat("es-CO").format(supplier.report_count)}</dd></div>
            <div><dt>Último período</dt><dd>{supplier.latest_period ? formatReportingPeriod(supplier.latest_period) : "Sin reportes"}</dd></div>
          </dl>
          <p className="api-source-note">
            Esta base no contiene correos ni teléfonos de contacto; por eso las comunicaciones reales siguen deshabilitadas.
          </p>
        </section>

        <aside className="detail-side">
          <section className="detail-panel">
            <div className="panel-heading">
              <div><p className="section-overline">HISTORIAL IMPORTADO</p><h2>Indicadores por período</h2></div>
            </div>
            {reports.length === 0 ? (
              <p className="api-state">No hay reportes mensuales asociados a este proveedor.</p>
            ) : (
              <div className="real-report-list">
                {reports.map((report) => (
                  <article className="real-report-card" key={report.period_start}>
                    <div className="real-report-heading">
                      <strong>{formatReportingPeriod(report.period_start)}</strong>
                      {report.result_label && <span>{report.result_label}</span>}
                    </div>
                    <dl>
                      {report.metrics.map((metric) => (
                        <div key={metric.code}>
                          <dt>{metric.label}</dt>
                          <dd>{formatMetric(metric.value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
