import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { communicationService } from "../../services/communicationService";
import { supplierService } from "../../services/supplierService";
import type { CommunicationMode, CommunicationTemplate } from "../../types/communication";
import type { Supplier } from "../../types/supplier";

const demoVariables = [
  { key: "supplierName", label: "Proveedor" },
  { key: "contactName", label: "Persona de contacto" },
  { key: "category", label: "Categoría" },
  { key: "nombre_proveedor", label: "Nombre proveedor" },
  { key: "empresa", label: "Empresa" },
  { key: "nit", label: "NIT" },
  { key: "fecha", label: "Fecha" },
  { key: "nombre_empleado", label: "Empleado" },
];

const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;

function replaceVariables(text: string, values: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] || `{{${key}}}`);
}

export function ComposePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplier, setSupplier] = useState<Supplier>();
  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierMenuOpen, setSupplierMenuOpen] = useState(false);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [mode, setMode] = useState<CommunicationMode>("email");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [preparedCommunicationId, setPreparedCommunicationId] = useState("");
  const [preparationError, setPreparationError] = useState("");

  useEffect(() => {
    let active = true;
    supplierService.list().then((results) => {
      if (!active) return;
      setSuppliers(results);
      const requestedId = params.get("proveedor");
      const initial = requestedId
        ? results.find((item) => item.id === requestedId)
        : undefined;
      if (initial) {
        setSupplier(initial);
        setRecipient(initial.email);
      }
    });
    communicationService.listTemplates().then((results) => {
      if (active) setTemplates(results);
    });
    return () => { active = false; };
  }, [params]);

  const filteredSuppliers = useMemo(() => {
    const search = supplierSearch.trim().toLocaleLowerCase("es");
    if (!search) return suppliers;
    return suppliers.filter((item) =>
      [item.name, item.nit, item.code]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(search),
    );
  }, [supplierSearch, suppliers]);

  const variables = useMemo(() => ({
    supplierName: supplier?.name || "",
    contactName: supplier?.contactName || "",
    category: supplier?.category || "",
    nombre_proveedor: supplier?.name || "",
    empresa: "HACEB FUTURE",
    nit: supplier?.nit || "",
    fecha: new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric" }).format(new Date()),
    nombre_empleado: "Equipo de Compras",
  }), [supplier]);

  const previewContent = replaceVariables(content, variables);
  const previewSubject = replaceVariables(subject, variables);

  const selectSupplier = (item: Supplier) => {
    setSupplier(item);
    setRecipient(mode === "email" ? item.email : item.contactName);
    setSupplierSearch("");
    setSupplierMenuOpen(false);
    setErrors((current) => ({ ...current, supplier: "", recipient: "" }));
  };

  const selectMode = (nextMode: CommunicationMode) => {
    setMode(nextMode);
    setErrors((current) => ({ ...current, recipient: "" }));
    if (nextMode === "email") {
      setRecipient(supplier?.email || "");
      setSubject((current) => current || "Comunicación de HACEB FUTURE");
    } else {
      setRecipient(supplier?.contactName || "");
      setSubject("");
    }
  };

  const loadTemplate = (template: CommunicationTemplate) => {
    setTemplateId(template.id);
    setMode(template.mode);
    setRecipient(template.mode === "email" ? (supplier?.email || "") : (supplier?.contactName || ""));
    setSubject(replaceVariables(template.subject, variables));
    setContent(template.content);
    setPrepared(false);
    setErrors({});
  };

  const resetTemplate = () => {
    const template = templates.find((item) => item.id === templateId);
    if (template) loadTemplate(template);
  };

  const clearEditor = () => {
    setSubject("");
    setContent("");
    setPrepared(false);
    setErrors({});
  };

  useEffect(() => {
    const requestedTemplateId = params.get("plantilla");
    if (!requestedTemplateId) return;
    const requested = templates.find((item) => item.id === requestedTemplateId);
    if (!requested) return;
    setTemplateId(requested.id);
    setMode(requested.mode);
    setRecipient(requested.mode === "email" ? (supplier?.email || "") : (supplier?.contactName || ""));
    setSubject(replaceVariables(requested.subject, variables));
    setContent(requested.content);
  }, [params, templates, supplier, variables]);

  const validateDraft = () => {
    const nextErrors: Record<string, string> = {};
    if (!supplier) nextErrors.supplier = "Selecciona un proveedor.";
    if (!recipient.trim()) {
      nextErrors.recipient = "Indica el destinatario.";
    } else if (mode === "email" && !emailPattern.test(recipient.trim())) {
      nextErrors.recipient = "Ingresa un correo electrónico válido.";
    }
    if (mode === "email" && !subject.trim()) nextErrors.subject = "El asunto es obligatorio para correo.";
    if (!content.trim()) nextErrors.content = "El contenido no puede estar vacío.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openConfirmation = () => {
    setPrepared(false);
    if (validateDraft()) setConfirmationOpen(true);
  };

  const confirmPreparation = async () => {
    if (!supplier) {
      setConfirmationOpen(false);
      setErrors((current) => ({ ...current, supplier: "Selecciona un proveedor." }));
      return;
    }
    try {
      const preparedItem = await communicationService.prepareDraft({
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierNit: supplier.nit,
        recipient: recipient.trim(),
        subject: previewSubject,
        mode,
        content: previewContent,
        templateId: templateId || undefined,
        templateName: templates.find((item) => item.id === templateId)?.name,
      });
      setPreparedCommunicationId(preparedItem.id);
      setPreparationError("");
      setConfirmationOpen(false);
      setPrepared(true);
    } catch {
      setPreparationError("No fue posible guardar la preparación DEMO en este navegador. Intenta nuevamente.");
    }
  };

  return (
    <main className="supplier-page compose-page">
      <section className="supplier-heading compose-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" />CENTRO DE COMUNICACIONES</p>
          <h1>Preparar comunicación</h1>
          <p className="welcome-copy">Crea, personaliza y revisa una comunicación de demostración.</p>
        </div>
        <span className="data-tag">DEMO · NO SE ENVÍA</span>
      </section>

      <div className="compose-grid">
        <div className="compose-controls">
          <section className="compose-section recipient-section">
            <div className="compose-section-heading">
              <span className="compose-step">01</span>
              <div><p className="section-overline">DESTINATARIO</p><h2>Proveedor seleccionado</h2></div>
            </div>

            {supplier ? (
              <div className="selected-supplier">
                <span className="detail-avatar" aria-hidden="true">{supplier.name.slice(0, 1)}</span>
                <div>
                  <strong>{supplier.name}</strong>
                  <small>{supplier.nit ? `NIT ${supplier.nit}` : supplier.code}</small>
                  <span className="category-chip">{supplier.category}</span>
                </div>
                <button type="button" onClick={() => setSupplierMenuOpen((open) => !open)}>
                  Cambiar
                </button>
              </div>
            ) : (
              <button className="recipient-empty" type="button" onClick={() => setSupplierMenuOpen(true)}>
                <Icon name="users" size={19} />Seleccionar proveedor DEMO
              </button>
            )}
            {errors.supplier && <p className="field-error" role="alert">{errors.supplier}</p>}

            {supplierMenuOpen && (
              <div className="supplier-picker">
                <label className="supplier-search picker-search">
                  <Icon name="search" size={17} />
                  <input
                    type="search"
                    value={supplierSearch}
                    onChange={(event) => setSupplierSearch(event.target.value)}
                    placeholder="Buscar nombre, NIT o código"
                    aria-label="Buscar proveedor"
                    autoFocus
                  />
                </label>
                <div className="supplier-picker-list">
                  {filteredSuppliers.map((item) => (
                    <button type="button" key={item.id} onClick={() => selectSupplier(item)}>
                      <span className="picker-avatar" aria-hidden="true">{item.name.slice(0, 1)}</span>
                      <span><strong>{item.name}</strong><small>{item.nit || item.code || "Identificación no disponible"} · {item.category}</small></span>
                      <Icon name="arrow-up-right" size={15} />
                    </button>
                  ))}
                  {filteredSuppliers.length === 0 && <p className="picker-empty">No hay proveedores DEMO con esa búsqueda.</p>}
                </div>
              </div>
            )}
          </section>

          <section className="compose-section">
            <div className="compose-section-heading">
              <span className="compose-step">02</span>
              <div><p className="section-overline">FORMATO</p><h2>Tipo de comunicación</h2></div>
            </div>
            <div className="mode-grid">
              <button className={mode === "email" ? "mode-card is-selected" : "mode-card"} type="button" onClick={() => selectMode("email")}>
                <span className="mode-icon"><Icon name="mail" size={18} /></span>
                <span><strong>Correo electrónico</strong><small>Disponible en modo DEMO</small></span>
                {mode === "email" && <Icon name="check" size={16} className="mode-check" />}
              </button>
              <button className={mode === "message" ? "mode-card is-selected" : "mode-card"} type="button" onClick={() => selectMode("message")}>
                <span className="mode-icon"><Icon name="message" size={18} /></span>
                <span><strong>Mensaje</strong><small>Pendiente de integración</small></span>
                {mode === "message" && <Icon name="check" size={16} className="mode-check" />}
              </button>
            </div>
          </section>

          <section className="compose-section">
            <div className="compose-section-heading">
              <span className="compose-step">03</span>
              <div><p className="section-overline">BASE</p><h2>Plantilla DEMO</h2></div>
            </div>
            <div className="template-grid">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className={templateId === template.id ? "template-card is-selected" : "template-card"}
                  type="button"
                  onClick={() => loadTemplate(template)}
                >
                  <span className="template-icon"><Icon name="template" size={17} /></span>
                  <span><strong>{template.name}</strong><small>{template.description}</small></span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="compose-editor-area">
          <section className="compose-section editor-section">
            <div className="compose-section-heading editor-heading">
              <span className="compose-step">04</span>
              <div><p className="section-overline">EDITOR</p><h2>Contenido de la comunicación</h2></div>
              <div className="editor-tools">
                <button type="button" onClick={resetTemplate} disabled={!templateId}><Icon name="refresh" size={15} />Restablecer</button>
                <button type="button" onClick={clearEditor}><Icon name="close" size={15} />Limpiar</button>
              </div>
            </div>

            <div className="variable-row" aria-label="Campos personalizados disponibles">
              {demoVariables.map((variable) => (
                <button
                  type="button"
                  key={variable.key}
                  onClick={() => setContent((current) => `${current}${current ? " " : ""}{{${variable.key}}}`)}
                >
                  {`{{${variable.key}}}`} <span>{variable.label}</span>
                </button>
              ))}
            </div>

            <div className="compose-fields">
              <label>
                <span>Destinatario <b>*</b></span>
                <input
                  type={mode === "email" ? "email" : "text"}
                  value={recipient}
                  aria-invalid={Boolean(errors.recipient)}
                  aria-describedby={errors.recipient ? "compose-recipient-error" : undefined}
                  onChange={(event) => {
                    setRecipient(event.target.value);
                    setErrors((current) => ({ ...current, recipient: "" }));
                  }}
                  placeholder={mode === "email" ? "correo@proveedor.demo" : "Nombre del contacto"}
                />
                {errors.recipient && <small id="compose-recipient-error" className="field-error" role="alert">{errors.recipient}</small>}
              </label>
              {mode === "email" && (
                <label>
                  <span>Asunto <b>*</b></span>
                  <input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Escribe el asunto"
                  />
                  {errors.subject && <small className="field-error" role="alert">{errors.subject}</small>}
                </label>
              )}
              <label>
                <span>Contenido <b>*</b></span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={11}
                  placeholder="Selecciona una plantilla o escribe el contenido..."
                />
                <span className={`character-count${content.length > 1800 ? " is-near-limit" : ""}`}>{content.length} caracteres</span>
                {errors.content && <small className="field-error" role="alert">{errors.content}</small>}
              </label>
            </div>
          </section>

          <section className="compose-section preview-section">
            <div className="compose-section-heading preview-heading">
              <span className="compose-step"><Icon name="eye" size={14} /></span>
              <div><p className="section-overline">REVISIÓN</p><h2>Vista previa</h2></div>
              <span className="preview-live">ACTUALIZACIÓN EN VIVO</span>
            </div>
            <article className="message-preview">
              <div className="preview-topbar">
                <div className="preview-window-dots" aria-hidden="true"><span /><span /><span /></div>
                <span>HACEB FUTURE · DEMO</span>
              </div>
              <div className="preview-meta">
                <span>Para</span>
                <strong>{supplier?.name || "Proveedor no seleccionado"}</strong>
                <small>{recipient || "Destinatario pendiente"}</small>
              </div>
              {mode === "email" && (
                <div className="preview-meta">
                  <span>Asunto</span>
                  <strong>{previewSubject || "Sin asunto"}</strong>
                </div>
              )}
              <div className="preview-content">{previewContent || "El contenido aparecerá aquí mientras escribes."}</div>
              <div className="preview-signature">
                <span>HF</span>
                <div><strong>Equipo de Compras</strong><small>HACEB FUTURE · Entorno DEMO</small></div>
              </div>
            </article>
          </section>

          {prepared && (
            <div className="prepared-banner" role="status">
              <span><Icon name="check" size={16} /></span>
              <div><strong>Comunicación preparada en modo DEMO</strong><small>No se realizó ningún envío.</small></div>
              <button type="button" onClick={() => navigate(`/seguimiento/${preparedCommunicationId}`)}>Ver seguimiento</button>
            </div>
          )}
          {preparationError && <p className="field-error" role="alert">{preparationError}</p>}

          <div className="compose-submit-row">
            <span><span className="footer-demo-dot" />Los datos y la preparación son ficticios.</span>
            <button className="button-primary" type="button" onClick={openConfirmation}>
              <Icon name="send" size={17} />Revisar y preparar
            </button>
          </div>
        </div>
      </div>

      {confirmationOpen && (
        <div className="confirmation-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setConfirmationOpen(false);
        }}>
          <section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <div className="confirmation-heading">
              <span className="confirmation-icon"><Icon name="check" size={18} /></span>
              <div><p className="section-overline">ÚLTIMA REVISIÓN</p><h2 id="confirmation-title">Confirmar preparación DEMO</h2></div>
              <button type="button" aria-label="Cerrar resumen" onClick={() => setConfirmationOpen(false)}><Icon name="close" size={17} /></button>
            </div>
            <dl className="confirmation-summary">
              <div><dt>Proveedor</dt><dd>{supplier?.name}</dd></div>
              <div><dt>Destinatario</dt><dd>{recipient}</dd></div>
              <div><dt>Modalidad</dt><dd>{mode === "email" ? "Correo electrónico DEMO" : "Mensaje DEMO"}</dd></div>
              {mode === "email" && <div><dt>Asunto</dt><dd>{previewSubject}</dd></div>}
            </dl>
            <div className="confirmation-content">
              <span>CONTENIDO</span>
              <p>{previewContent}</p>
            </div>
            <p className="confirmation-warning">Esta acción solo prepara el borrador. No enviará un correo ni un mensaje real.</p>
            <div className="confirmation-actions">
              <button type="button" className="button-quiet" onClick={() => setConfirmationOpen(false)}>Volver a editar</button>
              <button type="button" className="button-primary" onClick={confirmPreparation}>Confirmar preparación DEMO</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
