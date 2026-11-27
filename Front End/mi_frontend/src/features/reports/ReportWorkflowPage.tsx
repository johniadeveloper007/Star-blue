import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { reportDemoService } from "../../services/reportDemoService";
import { supplierService } from "../../services/supplierService";
import type { Supplier } from "../../types/supplier";
import type {
  ReportPeriod,
  ReportWorkflowRecord,
  SupplierReportDemo,
} from "../../types/reportWorkflow";
import "./reports.css";

function formatMetric(value: number) {
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} %`;
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

function reviewStatusLabel(record: ReportWorkflowRecord) {
  if (record.reviewStatus === "rejected_demo") return "Rechazado · DEMO";
  if (record.reviewStatus === "approved_demo") return "Aprobado · DEMO";
  return "Borrador · DEMO";
}

export function ReportWorkflowPage() {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState<ReportPeriod[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [reports, setReports] = useState<SupplierReportDemo[]>([]);
  const [workflows, setWorkflows] = useState<ReportWorkflowRecord[]>([]);
  const [periodId, setPeriodId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [periodItems, supplierItems, reportItems, workflowItems] = await Promise.all([
        reportDemoService.listPeriods(),
        supplierService.list(),
        reportDemoService.listReports(),
        reportDemoService.listWorkflows(),
      ]);
      setPeriods(periodItems);
      setSuppliers(supplierItems);
      setReports(reportItems);
      setWorkflows(workflowItems);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los datos DEMO. Intenta nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selectedReport = useMemo(
    () => reports.find((report) => report.periodId === periodId && report.supplierId === supplierId),
    [periodId, reports, supplierId],
  );
  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId);
  const workflow = workflows.find((record) => record.reportId === selectedReport?.id);

  const changePeriod = (value: string) => {
    setPeriodId(value);
    setPreviewOpen(false);
    setValidationMessage("");
    setActionError("");
    setNotice("");
  };

  const changeSupplier = (value: string) => {
    setSupplierId(value);
    setPreviewOpen(false);
    setValidationMessage("");
    setActionError("");
    setNotice("");
  };

  const openPreview = () => {
    if (!periodId || !supplierId) {
      setValidationMessage("Selecciona un período y un proveedor para consultar el reporte DEMO.");
      return;
    }
    setValidationMessage("");
    setPreviewOpen(true);
  };

  const saveDraft = async () => {
    if (!selectedReport || !selectedSupplier) return;
    setActionPending(true);
    setActionError("");
    setNotice("");
    try {
      const record = await reportDemoService.saveDraft(selectedReport, selectedSupplier.name);
      setWorkflows(await reportDemoService.listWorkflows());
      setNotice(record.reviewStatus === "draft"
        ? "Borrador DEMO guardado localmente."
        : "Este reporte ya tiene una decisión registrada en el historial DEMO.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No fue posible guardar el borrador DEMO.");
    } finally {
      setActionPending(false);
    }
  };

  const recordDecision = async (decision: "approve" | "reject") => {
    if (!workflow) return;
    setActionPending(true);
    setActionError("");
    setNotice("");
    try {
      await reportDemoService.recordDecision(workflow.id, decision);
      setWorkflows(await reportDemoService.listWorkflows());
      setNotice(decision === "approve"
        ? "Aprobación simulada DEMO registrada."
        : "Rechazo simulado DEMO registrado; el envío está bloqueado.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No fue posible registrar la decisión DEMO.");
    } finally {
      setActionPending(false);
    }
  };

  const simulateDelivery = async (result: "success" | "failure") => {
    if (!workflow) return;
    setActionPending(true);
    setActionError("");
    setNotice("");
    try {
      await reportDemoService.simulateDelivery(workflow.id, result);
      setWorkflows(await reportDemoService.listWorkflows());
      setNotice(result === "success"
        ? "Resultado exitoso simulado. No se envió ninguna comunicación."
        : "Fallo de envío simulado. No se realizó ninguna transmisión.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No fue posible simular el envío DEMO.");
    } finally {
      setActionPending(false);
    }
  };

  if (loading) {
    return (
      <main className="supplier-page report-page">
        <p className="report-loading" role="status" aria-live="polite">Cargando datos sintéticos DEMO…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="supplier-page report-page">
        <section className="report-empty report-error" role="alert">
          <h1>No se pudo cargar el módulo DEMO</h1>
          <p>{loadError}</p>
          <button className="button-primary" type="button" onClick={() => void loadData()}>
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
          <h1>Reportes mensuales por proveedor</h1>
          <p className="welcome-copy">
            Consulta y revisa una muestra mensual de indicadores sintéticos.
          </p>
        </div>
        <div className="report-header-actions">
          <button className="report-button-secondary" type="button" onClick={() => navigate("/reportes/historial")}>
            Ver historial DEMO <Icon name="arrow-up-right" size={15} />
          </button>
          <span className="data-tag">DEMO · DATOS SINTÉTICOS</span>
        </div>
      </section>

      <div className="report-demo-notice" role="note">
        <Icon name="sparkles" size={17} />
        <p>
          Esta experiencia usa datos ficticios y acciones locales. No representa cálculos oficiales,
          aprobación real de HACEB ni envío de correos.
        </p>
      </div>

      <section className="report-panel report-selection" aria-labelledby="report-selection-title">
        <div className="report-panel-heading">
          <div>
            <p className="section-overline">01 · SELECCIÓN</p>
            <h2 id="report-selection-title">Período y proveedor</h2>
          </div>
          <span className="report-step-tag">CONSULTA DEMO</span>
        </div>

        <div className="report-fields">
          <label>
            <span>Período mensual</span>
            <select value={periodId} onChange={(event) => changePeriod(event.target.value)}>
              <option value="">Selecciona un período</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Proveedor ficticio</span>
            <select value={supplierId} onChange={(event) => changeSupplier(event.target.value)}>
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name} · DEMO</option>
              ))}
            </select>
          </label>
          <button className="button-primary report-preview-button" type="button" onClick={openPreview}>
            <Icon name="eye" size={16} />Consultar vista previa
          </button>
        </div>
        {validationMessage && <p className="report-message is-error" role="alert">{validationMessage}</p>}

        {periodId && supplierId && !selectedReport && (
          <div className="report-empty report-no-data" role="status">
            <span className="report-empty-icon"><Icon name="search" size={20} /></span>
            <div>
              <h3>No hay reporte DEMO para esta selección</h3>
              <p>La combinación elegida no cuenta con datos sintéticos disponibles. Prueba otro período o proveedor.</p>
            </div>
          </div>
        )}
      </section>

      {previewOpen && selectedReport && selectedSupplier && (
        <section className="report-panel report-preview" aria-labelledby="report-preview-title">
          <div className="report-panel-heading">
            <div>
              <p className="section-overline">02 · REVISIÓN INDIVIDUAL</p>
              <h2 id="report-preview-title">Vista previa del reporte</h2>
            </div>
            <span className="report-status-badge">{workflow ? reviewStatusLabel(workflow) : "Sin decisión · DEMO"}</span>
          </div>

          <dl className="report-summary">
            <div><dt>Proveedor</dt><dd>{selectedSupplier.name}</dd></div>
            <div><dt>Período</dt><dd>{selectedReport.periodLabel}</dd></div>
            <div><dt>Identificador DEMO</dt><dd>{selectedReport.id}</dd></div>
          </dl>

          <div className="report-metrics" aria-label="Métricas ilustrativas">
            {selectedReport.metrics.map((metric) => (
              <article className="report-metric-card" key={metric.id}>
                <span>{metric.label}</span>
                <strong>{formatMetric(metric.value)}</strong>
                <small>Valor sintético ilustrativo</small>
              </article>
            ))}
          </div>
          <p className="report-metric-disclaimer">
            Las etiquetas y valores son exclusivamente DEMO; no definen fórmulas, umbrales ni resultados oficiales.
          </p>

          {actionError && <p className="report-message is-error" role="alert">{actionError}</p>}
          {notice && <p className="report-message is-success" role="status">{notice}</p>}

          {!workflow && (
            <div className="report-actions">
              <p>Guarda un borrador local DEMO antes de registrar una aprobación o un rechazo simulado.</p>
              <button className="button-primary" type="button" disabled={actionPending} onClick={() => void saveDraft()}>
                {actionPending ? "Guardando…" : "Guardar borrador DEMO"}
              </button>
            </div>
          )}

          {workflow?.reviewStatus === "draft" && (
            <div className="report-actions report-decision-actions">
              <div>
                <h3>Borrador DEMO guardado</h3>
                <p>La decisión se registra solo en este navegador; no inicia una aprobación productiva.</p>
              </div>
              <div className="report-action-buttons">
                <button className="button-primary" type="button" disabled={actionPending} onClick={() => void recordDecision("approve")}>
                  <Icon name="check" size={16} />Aprobar DEMO
                </button>
                <button className="report-button-secondary" type="button" disabled={actionPending} onClick={() => void recordDecision("reject")}>
                  <Icon name="close" size={16} />Rechazar DEMO
                </button>
              </div>
            </div>
          )}

          {workflow?.reviewStatus === "rejected_demo" && (
            <div className="report-state-panel is-rejected" role="status">
              <strong>Reporte rechazado · DEMO</strong>
              <p>El rechazo simulado queda en el historial. No se permite simular el envío de este reporte.</p>
              <small>Registrado {formatDate(workflow.updatedAt)}</small>
            </div>
          )}

          {workflow?.reviewStatus === "approved_demo" && (
            <div className="report-state-panel is-approved">
              <strong>Aprobación simulada · DEMO</strong>
              <p>Solo esta aprobación local habilita los resultados de envío simulados.</p>
              {workflow.deliveryStatus === "sent_demo" ? (
                <div className="report-state-result" role="status">
                  <strong>Envío exitoso simulado</strong>
                  <span>No se envió ningún correo ni comunicación real.</span>
                </div>
              ) : workflow.deliveryStatus === "failed_demo" ? (
                <div className="report-state-result is-failed" role="status">
                  <strong>Fallo de envío simulado</strong>
                  <span>No se realizó transmisión; puedes registrar otro resultado DEMO.</span>
                </div>
              ) : null}
              {workflow.deliveryStatus !== "sent_demo" && (
                <div className="report-action-buttons">
                  <button className="button-primary" type="button" disabled={actionPending} onClick={() => void simulateDelivery("success")}>
                    <Icon name="send" size={16} />Simular envío exitoso
                  </button>
                  <button className="report-button-secondary" type="button" disabled={actionPending} onClick={() => void simulateDelivery("failure")}>
                    <Icon name="close" size={16} />Simular fallo
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="report-preview-footer">
            {workflow && <span>Último cambio local: {formatDate(workflow.updatedAt)}</span>}
            <button type="button" className="report-text-button" onClick={() => navigate("/reportes/historial")}>
              Consultar historial <Icon name="arrow-up-right" size={15} />
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
