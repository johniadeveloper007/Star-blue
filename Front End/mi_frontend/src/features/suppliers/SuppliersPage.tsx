import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { supplierService } from "../../services/supplierService";
import type { Supplier } from "../../types/supplier";

interface SuppliersPageProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SuppliersPage({ searchTerm, onSearchChange }: SuppliersPageProps) {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [supplierType, setSupplierType] = useState("");

  useEffect(() => {
    let active = true;
    supplierService.list({ search: searchTerm, status, category, supplierType })
      .then((results) => {
        if (active) setSuppliers(results);
      });
    return () => { active = false; };
  }, [searchTerm, status, category, supplierType]);

  const clearFilters = () => {
    setStatus("");
    setCategory("");
    setSupplierType("");
    onSearchChange("");
  };

  return (
    <main className="supplier-page" id="proveedores">
      <section className="supplier-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" />DIRECTORIO</p>
          <h1>Proveedores</h1>
          <p className="welcome-copy">Consulta y explora los contactos disponibles en demostración.</p>
        </div>
        <span className="data-tag supplier-count">{suppliers.length} RESULTADOS · DEMO</span>
      </section>

      <section className="supplier-toolbar" aria-label="Búsqueda y filtros de proveedores">
        <label className="supplier-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre, NIT, código o correo"
            aria-label="Buscar proveedores"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="En revisión">En revisión</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {[...new Set([
            "Electrodomésticos",
            "Componentes",
            "Servicios técnicos",
            "Distribución",
            "Manufactura",
          ])].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={supplierType} onChange={(event) => setSupplierType(event.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          <option value="Nacional">Nacional</option>
          <option value="Internacional">Internacional</option>
        </select>
        <button className="clear-filter" type="button" onClick={clearFilters}>
          <Icon name="close" size={15} />
          Limpiar
        </button>
      </section>

      <section className="supplier-table-panel" aria-label="Listado de proveedores de demostración">
        <div className="supplier-table-wrap">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>PROVEEDOR</th>
                <th>IDENTIFICACIÓN</th>
                <th>CONTACTO</th>
                <th>CATEGORÍA</th>
                <th>ESTADO</th>
                <th><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <button className="supplier-name-button" type="button" onClick={() => navigate(`/proveedores/${supplier.id}`)}>
                      <span className="supplier-avatar" aria-hidden="true">{supplier.name.slice(0, 1)}</span>
                      <span>
                        <strong>{supplier.name}</strong>
                        <small>{supplier.email}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <strong className="supplier-code">{supplier.code || "Sin código"}</strong>
                    <small className="table-secondary">{supplier.nit || "NIT no disponible"}</small>
                  </td>
                  <td>
                    <strong>{supplier.contactName}</strong>
                    <small className="table-secondary">{supplier.phone || "Teléfono no disponible"}</small>
                  </td>
                  <td><span className="category-chip">{supplier.category}</span></td>
                  <td><span className={`supplier-status status-${supplier.status.toLowerCase().replace(" ", "-")}`}><span />{supplier.status}</span></td>
                  <td>
                    <button className="row-action" type="button" aria-label={`Ver detalle de ${supplier.name}`} onClick={() => navigate(`/proveedores/${supplier.id}`)}>
                      <Icon name="arrow-up-right" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={6} className="supplier-empty">No hay proveedores DEMO que coincidan con los criterios seleccionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="supplier-footer"><span><span className="footer-demo-dot" />Datos ficticios de demostración</span><span>DEMO</span></div>
      </section>
    </main>
  );
}
