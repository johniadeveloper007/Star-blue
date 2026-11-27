import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { reportDemoService } from "../../services/reportDemoService";
import type { ReportWorkflowRecord } from "../../types/reportWorkflow";
import "./reports.css";

type HistoryFilter =
  | ""
  | "draft"
  | "approved_demo"
  | "rejected_demo"
  | "sent_demo"
  | "failed_demo";

function statusInfo(record: ReportWorkflowRecord) {
  if (record.reviewStatus === "rejected_demo") {
    return { label: "Rechazado · DEMO", className: "rejected" };
  }
  if (record.deliveryStatus === "sent_demo") {
    return { label: "Envío simulado · DEMO", className: "sent" };
  }
  if (record.deliveryStatus === "failed_demo") {
    return { label: "Fallo simulado · DEMO", className: "failed" };
  }
  if (record.reviewStatus === "approved_demo") {
    return { label: "Aprobado · DEMO", className: "approved" };
  }
  return { label: "Borrador · DEMO", className: "draft" };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function matchesFilter(record: ReportWorkflowRecord, filter: HistoryFilter) {
  if (!filter) return true;
  if (filter === "sent_demo") return record.deliveryStatus === "sent_demo";
  if (filter === "failed_demo") return record.deliveryStatus === "failed_demo";
  return record.reviewStatus === filter;
}

export function ReportHistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ReportWorkflowRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HistoryFilter>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadHistory = async () => {
    setLoading(true);
    setLoadError("");
    try {
      setRecords(await reportDemoService.listWorkflows());
    } catch (error) {
      setLoadError(error instanceof Error
        ? error.message
        : "No fue posible leer el historial DEMO local.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return [...records]
      .filter((record) => {
        const searchable = `${record.id} ${record.reportId} ${record.supplierName} ${record.periodLabel}`
          .toLocaleLowerCase("es");
        return (!term || searchable.includes(term)) && matchesFilter(record, statusFilter);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [records, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  if (loading) {
    return (
      <main className="supplier-page report-page">
        <p className="report-loading" role="status" aria-live="polite">Cargando historial DEMO local…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="supplier-page report-page">
        <section className="report-empty report-error" role="alert">
          <h1>No se pudo leer el historial DEMO</h1>
          <p>{loadError}</p>
          <button className="button-primary" type="button" onClick={() => void loadHistory()}>
            <Icon name="refresh" size={16} />Reintentar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="supplier-page report-page">
      <section className="supplier-heading report-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" />CENTRO DE REPORTES</p>
          <h1>Historial de reportes DEMO</h1>
          <p className="welcome-copy">Consulta borradores, decisiones y resultados simulados guardados en este navegador.</p>
        </div>
        <button className="button-primary" type="button" onClick={() => navigate("/reportes")}>
          <Icon name="file" size={16} />Crear revisión DEMO
        </button>
      </section>

      <div className="report-demo-notice" role="note">
        <Icon name="sparkles" size={17} />
        <p>Este historial es local y demostrativo. Sus estados no acreditan aprobaciones ni envíos reales.</p>
      </div>

      <section className="report-history-panel" aria-label="Registros del flujo de reportes">
        <div className="report-history-filters">
          <label className="report-search">
            <Icon name="search" size={17} />
            <span className="sr-only">Buscar en el historial</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar proveedor, período o identificador"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as HistoryFilter)}>
              <option value="">Todos los estados</option>
              <option value="draft">Borrador DEMO</option>
              <option value="approved_demo">Aprobado DEMO</option>
              <option value="rejected_demo">Rechazado DEMO</option>
              <option value="sent_demo">Envío simulado DEMO</option>
              <option value="failed_demo">Fallo simulado DEMO</option>
            </select>
          </label>
        </div>
        <div className="report-history-summary" aria-live="polite">
          <span><strong>{visibleRecords.length}</strong> {visibleRecords.length === 1 ? "registro" : "registros"}</span>
          <span>Persistencia local de demostración · DEMO</span>
        </div>

        {visibleRecords.length > 0 ? (
          <>
            <div className="report-history-table-wrap">
              <table className="report-history-table">
                <thead>
                  <tr>
                    <th>PROVEEDOR</th>
                    <th>PERÍODO</th>
                    <th>ACTUALIZACIÓN</th>
                    <th>ESTADO</th>
                    <th><span className="sr-only">Actividad</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => {
                    const status = statusInfo(record);
                    return (
                      <tr key={record.id}>
                        <td><strong>{record.supplierName}</strong><small>{record.reportId}</small></td>
                        <td>{record.periodLabel}</td>
                        <td>{formatDate(record.updatedAt)}</td>
                        <td><span className={`report-status-badge is-${status.className}`}>{status.label}</span></td>
                        <td>
                          <details className="report-history-detail">
                            <summary aria-label={`Ver actividad de ${record.supplierName}, ${record.periodLabel}`}>Actividad</summary>
                            <ol>
                              {record.events.map((event) => (
                                <li key={event.id}>
                                  <strong>{event.description}</strong>
                                  <time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time>
                                </li>
                              ))}
                            </ol>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="report-history-cards">
              {visibleRecords.map((record) => {
                const status = statusInfo(record);
                return (
                  <article className="report-history-card" key={record.id}>
                    <div className="report-history-card-top">
                      <strong>{record.supplierName}</strong>
                      <span className={`report-status-badge is-${status.className}`}>{status.label}</span>
                    </div>
                    <span>{record.periodLabel}</span>
                    <small>{record.reportId}</small>
                    <span>Actualizado {formatDate(record.updatedAt)}</span>
                    <details className="report-history-detail">
                      <summary>Ver actividad ({record.events.length})</summary>
                      <ol>
                        {record.events.map((event) => (
                          <li key={event.id}>
                            <strong>{event.description}</strong>
                            <time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </article>
                );
              })}
            </div>
          </>
        ) : records.length === 0 ? (
          <div className="report-empty">
            <span className="report-empty-icon"><Icon name="file" size={21} /></span>
            <h2>Aún no hay reportes en el historial</h2>
            <p>Guarda un borrador DEMO desde la revisión individual para comenzar el recorrido.</p>
            <button className="button-primary" type="button" onClick={() => navigate("/reportes")}>Ir a reportes mensuales</button>
          </div>
        ) : (
          <div className="report-empty">
            <span className="report-empty-icon"><Icon name="search" size={21} /></span>
            <h2>Sin coincidencias</h2>
            <p>No hay reportes DEMO que coincidan con el texto o estado seleccionados.</p>
            <button className="button-primary" type="button" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        )}
      </section>
    </main>
  );
}
