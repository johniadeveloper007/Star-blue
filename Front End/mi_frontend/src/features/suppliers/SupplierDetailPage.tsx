import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { supplierService } from "../../services/supplierService";
import type { Supplier } from "../../types/supplier";

export function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<Supplier>();

  useEffect(() => {
    let active = true;
    supplierService.getById(supplierId || "").then((result) => {
      if (active) setSupplier(result);
    });
    return () => { active = false; };
  }, [supplierId]);

  if (!supplier) {
    return (
      <main className="supplier-page">
        <section className="detail-empty">
          <h1>Proveedor no encontrado</h1>
          <p>El identificador no corresponde a un registro DEMO disponible.</p>
          <button className="button-primary" type="button" onClick={() => navigate("/proveedores")}>Volver al directorio</button>
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
            <p className="eyebrow"><span className="eyebrow-mark" />FICHA DE DEMOSTRACIÓN</p>
            <h1>{supplier.name}</h1>
            <p>{supplier.category} <span>·</span> {supplier.supplierType}</p>
          </div>
        </div>
        <button className="button-primary" type="button" onClick={() => navigate(`/comunicaciones/nueva?proveedor=${supplier.id}`)}>
          <Icon name="send" size={17} />Iniciar comunicación
        </button>
      </section>

      <div className="detail-grid">
        <section className="detail-panel">
          <div className="panel-heading"><div><p className="section-overline">INFORMACIÓN GENERAL</p><h2>Datos del proveedor</h2></div><span className={`supplier-status status-${supplier.status.toLowerCase().replace(" ", "-")}`}><span />{supplier.status}</span></div>
          <dl className="detail-list">
            <div><dt>Nombre</dt><dd>{supplier.name}</dd></div>
            <div><dt>NIT / identificación</dt><dd>{supplier.nit || "No disponible"}</dd></div>
            <div><dt>Código</dt><dd>{supplier.code || "No disponible"}</dd></div>
            <div><dt>Correo principal</dt><dd>{supplier.email}</dd></div>
            <div><dt>Persona de contacto</dt><dd>{supplier.contactName}</dd></div>
            <div><dt>Teléfono</dt><dd>{supplier.phone || "No disponible"}</dd></div>
            {supplier.address && <div><dt>Dirección</dt><dd>{supplier.address}</dd></div>}
            {supplier.city && <div><dt>Ciudad</dt><dd>{supplier.city}</dd></div>}
            {supplier.website && <div><dt>Sitio web</dt><dd>{supplier.website}</dd></div>}
          </dl>
        </section>

        <aside className="detail-side">
          <section className="detail-panel">
            <div className="panel-heading"><div><p className="section-overline">PERSONAS</p><h2>Contactos</h2></div></div>
            <div className="contact-list">
              {supplier.contacts.map((contact) => (
                <article className="contact-card" key={`${contact.name}-${contact.email}`}>
                  <span className="contact-avatar" aria-hidden="true">{contact.name.slice(0, 1)}</span>
                  <div><strong>{contact.name}</strong><small>{contact.role}</small><a href={`mailto:${contact.email}`}>{contact.email}</a>{contact.phone && <span>{contact.phone}</span>}</div>
                </article>
              ))}
            </div>
          </section>
          {supplier.complement && (
            <section className="detail-note"><Icon name="sparkles" size={16} /><div><strong>Información complementaria</strong><p>{supplier.complement}</p></div></section>
          )}
          <div className="detail-demo"><span>DEMO</span> Datos ficticios. No representan una empresa real.</div>
        </aside>
      </div>
    </main>
  );
}
