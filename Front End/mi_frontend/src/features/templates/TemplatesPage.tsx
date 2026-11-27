import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { communicationService } from "../../services/communicationService";
import type {
  CommunicationMode,
  CommunicationTemplate,
  TemplateCategory,
} from "../../types/communication";

const categories: TemplateCategory[] = [
  "Solicitud de información",
  "Seguimiento de pedidos",
  "Confirmación de entregas",
  "Novedades",
  "Cartera",
  "Reclamaciones",
  "Comunicación general",
];

const variables = [
  "{{nombre_proveedor}}",
  "{{empresa}}",
  "{{nit}}",
  "{{fecha}}",
  "{{nombre_empleado}}",
];

const emptyTemplate = (): CommunicationTemplate => ({
  id: "",
  name: "",
  description: "",
  category: "Comunicación general",
  mode: "email",
  subject: "",
  content: "",
  updatedAt: new Date().toISOString().slice(0, 10),
  demo: true,
});

export function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string>();
  const [draft, setDraft] = useState<CommunicationTemplate>(emptyTemplate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [persistenceError, setPersistenceError] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<CommunicationTemplate>();
  const [deleteTemplate, setDeleteTemplate] = useState<CommunicationTemplate>();

  useEffect(() => {
    let active = true;
    communicationService.listTemplates().then((items) => {
      if (active) setTemplates(items);
    });
    return () => { active = false; };
  }, []);

  const visibleTemplates = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("es");
    return templates.filter((template) =>
      (!normalized ||
        `${template.name} ${template.description} ${template.category}`
          .toLocaleLowerCase("es")
          .includes(normalized)) &&
      (!category || template.category === category) &&
      (!mode || template.mode === mode),
    );
  }, [templates, search, category, mode]);

  const persist = async (nextTemplates: CommunicationTemplate[]) => {
    const saved = await communicationService.saveTemplates(nextTemplates);
    setTemplates(saved);
    setPersistenceError("");
  };

  const openCreate = () => {
    setEditingId(undefined);
    setDraft(emptyTemplate());
    setErrors({});
    setPersistenceError("");
    setEditorOpen(true);
  };

  const openEdit = (template: CommunicationTemplate) => {
    setEditingId(template.id);
    setDraft({ ...template });
    setErrors({});
    setPersistenceError("");
    setEditorOpen(true);
  };

  const cancelEditor = () => {
    setEditorOpen(false);
    setEditingId(undefined);
    setDraft(emptyTemplate());
    setErrors({});
    setPersistenceError("");
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "El nombre es obligatorio.";
    if (!draft.category) nextErrors.category = "Selecciona una categoría.";
    if (draft.mode === "email" && !draft.subject.trim()) {
      nextErrors.subject = "El asunto es obligatorio para correo electrónico.";
    }
    if (!draft.content.trim()) nextErrors.content = "El contenido no puede estar vacío.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveTemplate = async () => {
    if (!validate()) return;
    const updated: CommunicationTemplate = {
      ...draft,
      id: editingId || `demo-template-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
      demo: true,
    };
    const nextTemplates = editingId
      ? templates.map((template) => template.id === editingId ? updated : template)
      : [updated, ...templates];
    try {
      await persist(nextTemplates);
      cancelEditor();
    } catch (error) {
      setPersistenceError(error instanceof Error
        ? error.message
        : "No fue posible guardar la plantilla DEMO en este navegador.");
    }
  };

  const duplicateTemplate = async (template: CommunicationTemplate) => {
    const duplicate: CommunicationTemplate = {
      ...template,
      id: `demo-template-${Date.now()}`,
      name: `${template.name} (copia)`,
      updatedAt: new Date().toISOString().slice(0, 10),
      demo: true,
    };
    try {
      await persist([duplicate, ...templates]);
    } catch (error) {
      setPersistenceError(error instanceof Error
        ? error.message
        : "No fue posible duplicar la plantilla DEMO en este navegador.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTemplate) return;
    try {
      await persist(templates.filter((template) => template.id !== deleteTemplate.id));
      setDeleteTemplate(undefined);
    } catch (error) {
      setPersistenceError(error instanceof Error
        ? error.message
        : "No fue posible eliminar la plantilla DEMO en este navegador.");
    }
  };

  const insertVariable = (variable: string) => {
    setDraft((current) => ({
      ...current,
      content: `${current.content}${current.content ? " " : ""}${variable}`,
    }));
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMode("");
  };

  return (
    <main className="supplier-page templates-page">
      <section className="supplier-heading templates-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-mark" />CENTRO DE GESTIÓN</p>
          <h1>Biblioteca de plantillas</h1>
          <p className="welcome-copy">Administra ejemplos DEMO reutilizables para comunicaciones con proveedores.</p>
        </div>
        <button className="button-primary" type="button" onClick={openCreate}>
          <Icon name="template" size={17} />Nueva plantilla
        </button>
      </section>

      <section className="template-toolbar" aria-label="Búsqueda y filtros de plantillas">
        <label className="supplier-search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar plantilla..."
            aria-label="Buscar plantillas"
          />
        </label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={mode} onChange={(event) => setMode(event.target.value)} aria-label="Filtrar por tipo">
          <option value="">Todos los tipos</option>
          <option value="email">Correo electrónico</option>
          <option value="message">Mensaje</option>
        </select>
        <button className="clear-filter" type="button" onClick={clearFilters}>
          <Icon name="close" size={15} />Limpiar
        </button>
      </section>

      <div className="template-library-summary">
        <span><strong>{visibleTemplates.length}</strong> plantillas visibles</span>
        <span className="demo-storage-indicator"><span />Almacenamiento local DEMO</span>
      </div>
      {persistenceError && !editorOpen && !deleteTemplate && (
        <p className="field-error" role="alert">{persistenceError}</p>
      )}

      {visibleTemplates.length ? (
        <section className="template-card-grid" aria-label="Plantillas disponibles">
          {visibleTemplates.map((template, index) => (
            <article className="library-template-card" key={template.id} style={{ animationDelay: `${index * 55}ms` }}>
              <div className="library-template-top">
                <span className="library-template-icon"><Icon name={template.mode === "email" ? "mail" : "message"} size={18} /></span>
                <div>
                  <span className="category-chip">{template.category}</span>
                  <span className="template-demo-tag">DEMO</span>
                </div>
              </div>
              <h2>{template.name}</h2>
              <p>{template.description || "Sin descripción."}</p>
              <div className="library-template-meta">
                <span><Icon name={template.mode === "email" ? "mail" : "message"} size={14} />
                  {template.mode === "email" ? "Correo electrónico" : "Mensaje"}
                </span>
                <span><Icon name="clock" size={14} />
                  {template.updatedAt ? `Modificada ${template.updatedAt}` : "Fecha no disponible"}
                </span>
              </div>
              <div className="library-template-actions">
                <button type="button" onClick={() => setPreviewTemplate(template)}><Icon name="eye" size={15} />Vista previa</button>
                <button type="button" onClick={() => openEdit(template)}>Editar</button>
                <button type="button" aria-label={`Duplicar ${template.name}`} onClick={() => duplicateTemplate(template)}><Icon name="template" size={15} /></button>
                <button type="button" aria-label={`Eliminar ${template.name}`} onClick={() => setDeleteTemplate(template)}><Icon name="close" size={15} /></button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="template-empty">
          <span><Icon name="template" size={22} /></span>
          <h2>No hay plantillas que coincidan</h2>
          <p>Modifica la búsqueda o limpia los filtros.</p>
          <button className="button-primary" type="button" onClick={clearFilters}>Limpiar filtros</button>
        </section>
      )}

      {editorOpen && (
        <div className="confirmation-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) cancelEditor();
        }}>
          <section className="template-editor-modal" role="dialog" aria-modal="true" aria-labelledby="template-editor-title">
            <header className="template-editor-heading">
              <div>
                <p className="section-overline">PLANTILLA DEMO</p>
                <h2 id="template-editor-title">{editingId ? "Editar plantilla" : "Crear plantilla"}</h2>
              </div>
              <button type="button" aria-label="Cerrar editor" onClick={cancelEditor}><Icon name="close" size={17} /></button>
            </header>

            <div className="template-editor-layout">
              <div className="template-editor-fields">
                <label>
                  <span>Nombre <b>*</b></span>
                  <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Nombre descriptivo" />
                  {errors.name && <small className="field-error" role="alert">{errors.name}</small>}
                </label>
                <label>
                  <span>Descripción</span>
                  <input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Resumen breve de uso" />
                </label>
                <div className="template-editor-two-columns">
                  <label>
                    <span>Categoría <b>*</b></span>
                    <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as TemplateCategory })}>
                      {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Tipo de comunicación</span>
                    <select value={draft.mode} onChange={(event) => setDraft({ ...draft, mode: event.target.value as CommunicationMode })}>
                      <option value="email">Correo electrónico</option>
                      <option value="message">Mensaje</option>
                    </select>
                  </label>
                </div>
                {draft.mode === "email" && (
                  <label>
                    <span>Asunto <b>*</b></span>
                    <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} placeholder="Asunto de la plantilla" />
                    {errors.subject && <small className="field-error" role="alert">{errors.subject}</small>}
                  </label>
                )}
                <label className="template-content-label">
                  <span>Contenido <b>*</b></span>
                  <textarea
                    value={draft.content}
                    onChange={(event) => setDraft({ ...draft, content: event.target.value })}
                    rows={10}
                    placeholder="Escribe el contenido..."
                  />
                  <span className="character-count">{draft.content.length} caracteres</span>
                  {errors.content && <small className="field-error" role="alert">{errors.content}</small>}
                </label>
              </div>

              <aside className="template-editor-preview">
                <div className="template-variable-heading">
                  <p className="section-overline">VARIABLES</p>
                  <span>INSERTAR</span>
                </div>
                <div className="template-variable-list">
                  {variables.map((variable) => (
                    <button type="button" key={variable} onClick={() => insertVariable(variable)}>{variable}<Icon name="template" size={13} /></button>
                  ))}
                </div>
                <p className="section-overline preview-editor-label">VISTA PREVIA</p>
                <div className="template-mini-preview">
                  <span>DEMO</span>
                  {draft.mode === "email" && <strong>{draft.subject || "Sin asunto"}</strong>}
                  <p>{draft.content || "El contenido aparecerá aquí."}</p>
                </div>
              </aside>
            </div>

            {persistenceError && <p className="field-error" role="alert">{persistenceError}</p>}
            <footer className="template-editor-actions">
              <span>Persistencia DEMO local en este navegador.</span>
              <div>
                <button type="button" className="button-quiet" onClick={cancelEditor}>Cancelar</button>
                <button type="button" className="button-primary" onClick={saveTemplate}>
                  <Icon name="check" size={16} />Guardar plantilla
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {previewTemplate && (
        <div className="confirmation-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPreviewTemplate(undefined);
        }}>
          <section className="template-preview-modal" role="dialog" aria-modal="true" aria-labelledby="template-preview-title">
            <header className="template-editor-heading">
              <div><p className="section-overline">VISTA PREVIA DEMO</p><h2 id="template-preview-title">{previewTemplate.name}</h2></div>
              <button type="button" aria-label="Cerrar vista previa" onClick={() => setPreviewTemplate(undefined)}><Icon name="close" size={17} /></button>
            </header>
            <div className="template-preview-recipient">
              <span className="preview-live">PLANTILLA</span>
              <span>{previewTemplate.category}</span>
            </div>
            {previewTemplate.mode === "email" && <div className="template-preview-subject"><span>Asunto</span><strong>{previewTemplate.subject}</strong></div>}
            <div className="template-preview-content">{previewTemplate.content}</div>
            <footer className="template-preview-footer">
              <button type="button" className="button-quiet" onClick={() => setPreviewTemplate(undefined)}>Cerrar</button>
              <button type="button" className="button-primary" onClick={() => navigate(`/comunicaciones/nueva?plantilla=${previewTemplate.id}`)}>
                <Icon name="send" size={16} />Usar en compositor
              </button>
            </footer>
          </section>
        </div>
      )}

      {deleteTemplate && (
        <div className="confirmation-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDeleteTemplate(undefined);
        }}>
          <section className="confirmation-modal delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-template-title">
            <div className="confirmation-heading">
              <span className="confirmation-icon"><Icon name="close" size={18} /></span>
              <div><p className="section-overline">CONFIRMAR ELIMINACIÓN</p><h2 id="delete-template-title">Eliminar plantilla</h2></div>
              <button type="button" aria-label="Cancelar eliminación" onClick={() => setDeleteTemplate(undefined)}><Icon name="close" size={17} /></button>
            </div>
            <p className="delete-template-copy">¿Deseas eliminar <strong>{deleteTemplate.name}</strong>? Esta acción solo afecta los datos DEMO guardados en este navegador.</p>
            {persistenceError && <p className="field-error" role="alert">{persistenceError}</p>}
            <div className="confirmation-actions">
              <button type="button" className="button-quiet" onClick={() => setDeleteTemplate(undefined)}>Cancelar</button>
              <button type="button" className="button-primary" onClick={confirmDelete}>Eliminar DEMO</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
