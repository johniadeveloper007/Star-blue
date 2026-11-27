import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { communicationService } from "../../services/communicationService";
import type { CommunicationStatus, TrackedCommunication } from "../../types/communication";

const statusInfo: Record<CommunicationStatus, { label: string; className: string }> = {
  draft: { label: "Borrador", className: "draft" },
  prepared: { label: "Preparado", className: "prepared" },
  pending_integration: { label: "Pendiente integración", className: "pending" },
  sent: { label: "Enviado · DEMO", className: "sent" },
  failed: { label: "Fallido · DEMO", className: "failed" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function localDateKey(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function StatusBadge({ status }: { status: CommunicationStatus }) {
  const info = statusInfo[status];
  return (
    <span className={`tracking-status tracking-status-${info.className}`}>
      <span aria-hidden="true" />{info.label}
    </span>
  );
}

export function TrackingPage() {
  const { communicationId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState<TrackedCommunication[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detail, setDetail] = useState<TrackedCommunication>();
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    communicationService.listCommunications()
      .then((items) => {
        if (active) {
          setRecords(items);
          setLoadError("");
        }
      })
      .catch(() => {
        if (active) setLoadError("No fue posible leer el historial DEMO de este navegador.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!communicationId) {
      setDetail(undefined);
      return () => { active = false; };
    }
    communicationService.getCommunication(communicationId)
      .then((item) => {
        if (active) setDetail(item);
      })
      .catch(() => {
        if (active) setLoadError("No fue posible consultar el detalle DEMO.");
      });
    return () => { active = false; };
  }, [communicationId, records]);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return records
      .filter((record) => {
        const searchable = `${record.id} ${record.supplierName} ${record.supplierNit || ""} ${record.subject}`
          .toLocaleLowerCase("es");
        const createdDay = localDateKey(record.createdAt);
        return (
          (!term || searchable.includes(term)) &&
          (!status || record.status === status) &&
          (!mode || record.mode === mode) &&
          (!dateFrom || createdDay >= dateFrom) &&
          (!dateTo || createdDay <= dateTo)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, search, status, mode, dateFrom, dateTo]);

  const counts = useMemo(() => ({
    total: records.length,
    draft: records.filter((record) => record.status === "draft").length,
    prepared: records.filter((record) => record.status === "prepared").length,
    pending: records.filter((record) => record.status === "pending_integration").length,
    sent: records.filter((record) => record.status === "sent").length,
    failed: records.filter((record) => record.status === "failed").length,
  }), [records]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setMode("");
    setDateFrom("");
    setDateTo("");
  };

  if (communicationId) {
    if (!detail) {
      return (
        <main className="supplier-page tracking-page">
          <div className="tracking-back">
            <button type="button" onClick={() => navigate("/seguimiento")}><Icon name="arrow-down" size={15} />Volver al historial</button>
          </div>
          <section className="tracking-empty">
            <h1>Comunicación no encontrada</h1>
            <p>Este identificador no existe en el historial DEMO disponible.</p>
            <button className="button-primary" type="button" onClick={() => navigate("/seguimiento")}>Ir al seguimiento</button>
          </section>
        </main>
      );
    }
    return (
      <main className="supplier-page tracking-page">
        <div className="tracking-back">
          <button type="button" onClick={() => navigate("/seguimiento")}><Icon name="arrow-down" size={15} />Volver al historial</button>
          <span>DETALLE · {detail.id}</span>
        </div>
        <section className="tracking-detail-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-mark" />DETALLE DE COMUNICACIÓN</p>
            <h1>{detail.subject || "Comunicación sin asunto"}</h1>
            <p>{detail.supplierName} <span>·</span> {formatDate(detail.createdAt)}</p>
          </div>
          <div className="tracking-detail-badges">
            <StatusBadge status={detail.status} />
            {detail.demo && <span className="data-tag">DEMO</span>}
          </div>
        </section>

        <div className="tracking-detail-grid">
          <section className="tracking-panel tracking-message-panel">
            <div className="panel-heading">
              <div><p className="section-overline">CONTENIDO</p><h2>Comunicación registrada</h2></div>
              <span className="tracking-mode-tag">{detail.mode === "email" ? "Correo electrónico" : "Mensaje"}</span>
            </div>
            <dl className="tracking-details-list">
              <div><dt>Identificador</dt><dd>{detail.id}</dd></div>
              <div><dt>Proveedor</dt><dd>{detail.supplierName}</dd></div>
              <div><dt>NIT</dt><dd>{detail.supplierNit || "No disponible"}</dd></div>
              <div><dt>Destinatario</dt><dd>{detail.recipient || "No disponible"}</dd></div>
              <div><dt>Asunto</dt><dd>{detail.subject || "No aplica"}</dd></div>
              <div><dt>Plantilla de origen</dt><dd>{detail.templateName || "No asociada"}</dd></div>
              <div><dt>Fecha de creación</dt><dd>{formatDate(detail.createdAt)}</dd></div>
            </dl>
            <div className="tracking-content-body">
              <span>CUERPO DE LA COMUNICACIÓN</span>
              <p>{detail.content}</p>
            </div>
            <div className="tracking-demo-warning"><Icon name="sparkles" size={15} />Registro de demostración. Ningún mensaje real fue enviado.</div>
          </section>

          <aside className="tracking-panel tracking-timeline-panel">
            <div className="panel-heading">
              <div><p className="section-overline">ACTIVIDAD</p><h2>Línea de tiempo DEMO</h2></div>
            </div>
            <ol className="tracking-timeline">
              {[...detail.timeline].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((event) => (
                <li key={event.id}>
                  <span className="timeline-marker"><span /></span>
                  <div className="timeline-event">
                    <strong>{event.title}</strong>
                    <small>{formatDate(event.createdAt)}</small>
                    <p>{event.description}</p>
                    <span className="timeline-demo">DEMO</span>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="supplier-page tracking-page">
      <section className="supplier-heading tracking-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" />CENTRO DE SEGUIMIENTO</p>
          <h1>Historial de comunicaciones</h1>
          <p className="welcome-copy">Consulta preparaciones y registros DEMO relacionados con proveedores.</p>
        </div>
        <span className="data-tag">HISTORIAL DEMO</span>
      </section>

      <section className="tracking-stats" aria-label="Indicadores del historial">
        {[
          { key: "total", label: "Total registradas", icon: "activity" as const, value: counts.total },
          { key: "draft", label: "Borradores", icon: "file" as const, value: counts.draft },
          { key: "prepared", label: "Preparadas", icon: "check" as const, value: counts.prepared },
          { key: "pending", label: "Pendientes integración", icon: "clock" as const, value: counts.pending },
          { key: "sent", label: "Enviadas · DEMO", icon: "send" as const, value: counts.sent },
          { key: "failed", label: "Fallidas · DEMO", icon: "close" as const, value: counts.failed },
        ].map((item, index) => (
          <article className={`tracking-stat tracking-stat-${item.key}`} key={item.key} style={{ animationDelay: `${index * 45}ms` }}>
            <span className="tracking-stat-icon"><Icon name={item.icon} size={17} /></span>
            <div><strong>{item.value}</strong><small>{item.label}</small></div>
          </article>
        ))}
      </section>

      {loadError && <p className="field-error" role="alert">{loadError}</p>}

      <section className="tracking-filters" aria-label="Búsqueda y filtros de comunicaciones">
        <label className="supplier-search tracking-search">
          <Icon name="search" size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar proveedor, NIT, asunto o ID" aria-label="Buscar en el historial" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="prepared">Preparado</option>
          <option value="pending_integration">Pendiente de integración</option>
          <option value="sent">Enviado DEMO</option>
          <option value="failed">Fallido DEMO</option>
        </select>
        <select value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          <option value="email">Correo electrónico</option>
          <option value="message">Mensaje</option>
        </select>
        <label className="tracking-date-filter"><span>Desde</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="Fecha desde" /></label>
        <label className="tracking-date-filter"><span>Hasta</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="Fecha hasta" /></label>
        <button className="clear-filter" type="button" onClick={clearFilters}><Icon name="close" size={15} />Limpiar</button>
      </section>

      <section className="tracking-table-panel">
        <div className="tracking-table-summary"><span><strong>{visibleRecords.length}</strong> registros</span><span>Preparaciones guardadas localmente · DEMO</span></div>
        {visibleRecords.length ? (
          <>
            <div className="tracking-table-wrap">
              <table className="tracking-table">
                <thead><tr>
                  <th>IDENTIFICADOR</th><th>PROVEEDOR</th><th>ASUNTO</th><th>TIPO</th><th>CREACIÓN</th><th>ESTADO</th><th><span className="sr-only">Detalle</span></th>
                </tr></thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <tr key={record.id}>
                      <td><span className="tracking-id">{record.id}</span><small>{record.demo ? "DEMO" : ""}</small></td>
                      <td><strong>{record.supplierName}</strong><small>{record.supplierNit || "NIT no disponible"}</small></td>
                      <td className="tracking-subject">{record.subject || "Sin asunto"}</td>
                      <td><span className="tracking-mode-tag">{record.mode === "email" ? "Correo" : "Mensaje"}</span></td>
                      <td className="tracking-date">{formatDate(record.createdAt)}</td>
                      <td><StatusBadge status={record.status} /></td>
                      <td><button className="row-action" type="button" aria-label={`Ver detalle de ${record.id}`} onClick={() => navigate(`/seguimiento/${record.id}`)}><Icon name="arrow-up-right" size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tracking-mobile-cards">
              {visibleRecords.map((record) => (
                <article className="tracking-mobile-card" key={record.id}>
                  <div className="tracking-mobile-card-top"><span className="tracking-id">{record.id}</span><StatusBadge status={record.status} /></div>
                  <strong>{record.supplierName}</strong>
                  <small>{record.supplierNit || "NIT no disponible"}</small>
                  <p>{record.subject || "Sin asunto"}</p>
                  <div><span>{record.mode === "email" ? "Correo" : "Mensaje"}</span><span>{formatDate(record.createdAt)}</span></div>
                  <button type="button" onClick={() => navigate(`/seguimiento/${record.id}`)}>Ver detalle <Icon name="arrow-up-right" size={14} /></button>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="tracking-empty">
            <span><Icon name="search" size={21} /></span>
            <h2>Sin coincidencias</h2>
            <p>No hay comunicaciones DEMO para los filtros seleccionados.</p>
            <button type="button" className="button-primary" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        )}
      </section>
      <p className="tracking-footnote"><span className="footer-demo-dot" />Los estados enviados y fallidos son simulaciones DEMO. No hay actividad de correo real.</p>
    </main>
  );
}
