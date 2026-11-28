import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { perseoApi } from "../../services/perseoApi";
import type { PerseoSupplier } from "../../types/perseoApi";

interface SuppliersPageProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const PAGE_SIZE = 25;

function formatReportingPeriod(value: string | null) {
  if (!value) return "Sin reportes";
  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function SuppliersPage({ searchTerm, onSearchChange }: SuppliersPageProps) {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<PerseoSupplier[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setLoadError("");

    perseoApi.listSuppliers({
      search: searchTerm,
      isActive: status ? status === "Activo" : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }, controller.signal)
      .then((result) => {
        if (!active) return;
        setSuppliers(result.items);
        setTotal(result.total);
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        setLoadError(error instanceof Error ? error.message : "No fue posible consultar los proveedores.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [searchTerm, status, page, reloadKey]);

  const clearFilters = () => {
    setStatus("");
    setPage(0);
    onSearchChange("");
  };

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <main className="supplier-page" id="proveedores">
      <section className="supplier-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" />DIRECTORIO</p>
          <h1>Proveedores</h1>
          <p className="welcome-copy">Consulta proveedores y reportes mensuales importados desde Power BI.</p>
        </div>
        <span className="data-tag supplier-count">{new Intl.NumberFormat("es-CO").format(total)} REGISTROS · PBIX</span>
      </section>

      <section className="supplier-toolbar" aria-label="Búsqueda y filtros de proveedores">
        <label className="supplier-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setPage(0);
              onSearchChange(event.target.value);
            }}
            placeholder="Buscar por nombre o NIT"
            aria-label="Buscar proveedores"
          />
        </label>
        <select value={status} onChange={(event) => {
          setStatus(event.target.value);
          setPage(0);
        }} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <button className="clear-filter" type="button" onClick={clearFilters}>
          <Icon name="close" size={15} />
          Limpiar
        </button>
      </section>

      {loading && <p className="api-refresh-status" role="status">Consultando proveedores reales…</p>}
      {loadError && (
        <div className="api-state api-state-error" role="alert">
          <p>No se pudo conectar con la base de datos: {loadError}</p>
          <button className="button-primary" type="button" onClick={() => setReloadKey((value) => value + 1)}>
            Reintentar
          </button>
        </div>
      )}

      <section className="supplier-table-panel" aria-label="Listado real de proveedores">
        <div className="supplier-table-wrap">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>PROVEEDOR</th>
                <th>NIT / IDENTIFICACIÓN</th>
                <th>REPORTES</th>
                <th>ÚLTIMO PERÍODO</th>
                <th>ESTADO</th>
                <th><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <button className="supplier-name-button" type="button" onClick={() => navigate(`/proveedores/${encodeURIComponent(supplier.code)}`)}>
                      <span className="supplier-avatar" aria-hidden="true">{supplier.name.slice(0, 1)}</span>
                      <span>
                        <strong>{supplier.name}</strong>
                        <small>Código {supplier.code}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <strong className="supplier-code">{supplier.code}</strong>
                  </td>
                  <td>{new Intl.NumberFormat("es-CO").format(supplier.report_count)}</td>
                  <td>{formatReportingPeriod(supplier.latest_period)}</td>
                  <td>
                    <span className={`supplier-status ${supplier.is_active ? "" : "status-inactivo"}`}>
                      <span />{supplier.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <button className="row-action" type="button" aria-label={`Ver detalle de ${supplier.name}`} onClick={() => navigate(`/proveedores/${encodeURIComponent(supplier.code)}`)}>
                      <Icon name="arrow-up-right" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && !loadError && suppliers.length === 0 && (
                <tr><td colSpan={6} className="supplier-empty">No hay proveedores que coincidan con los filtros seleccionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="supplier-footer">
          <span><span className="footer-demo-dot" />Mostrando {rangeStart}–{rangeEnd} de {new Intl.NumberFormat("es-CO").format(total)} proveedores · PBIX</span>
          <div className="supplier-pagination">
            <button type="button" className="clear-filter" disabled={page === 0 || loading} onClick={() => setPage((value) => value - 1)}>
              Anterior
            </button>
            <span>{pageCount === 0 ? 0 : page + 1} / {pageCount}</span>
            <button type="button" className="clear-filter" disabled={page + 1 >= pageCount || loading} onClick={() => setPage((value) => value + 1)}>
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
