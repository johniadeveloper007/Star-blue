import { demoReportPeriods, demoSupplierReports } from "../data/demo/supplierReports";
import type {
  ReportDecision,
  ReportWorkflowEvent,
  ReportWorkflowEventType,
  ReportWorkflowRecord,
  SimulatedDeliveryResult,
  SupplierReportDemo,
} from "../types/reportWorkflow";

const HISTORY_STORAGE_KEY = "haceb-future.supplier-report-workflows.demo.v1";

function isWorkflowEvent(value: unknown): value is ReportWorkflowEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.id === "string" &&
    (event.type === "draft_saved" ||
      event.type === "approved" ||
      event.type === "rejected" ||
      event.type === "send_succeeded" ||
      event.type === "send_failed") &&
    typeof event.occurredAt === "string" &&
    typeof event.description === "string"
  );
}

function isMetric(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const metric = value as Record<string, unknown>;
  return (
    typeof metric.id === "string" &&
    typeof metric.label === "string" &&
    typeof metric.value === "number" &&
    Number.isFinite(metric.value)
  );
}

function isWorkflowRecord(value: unknown): value is ReportWorkflowRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.reportId === "string" &&
    typeof record.periodId === "string" &&
    typeof record.periodLabel === "string" &&
    typeof record.supplierId === "string" &&
    typeof record.supplierName === "string" &&
    Array.isArray(record.metrics) &&
    record.metrics.every(isMetric) &&
    (record.reviewStatus === "draft" ||
      record.reviewStatus === "approved_demo" ||
      record.reviewStatus === "rejected_demo") &&
    (record.deliveryStatus === "not_attempted" ||
      record.deliveryStatus === "sent_demo" ||
      record.deliveryStatus === "failed_demo") &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    Array.isArray(record.events) &&
    record.events.every(isWorkflowEvent) &&
    record.demo === true
  );
}

function readHistory(): ReportWorkflowRecord[] {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    throw new Error("No fue posible leer el historial DEMO local.", { cause: error });
  }

  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isWorkflowRecord)) {
      throw new TypeError("El historial guardado no tiene el formato DEMO esperado.");
    }
    return parsed;
  } catch (error) {
    throw new Error("El historial DEMO local está dañado o no se puede interpretar.", { cause: error });
  }
}

function writeHistory(records: ReportWorkflowRecord[]) {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    throw new Error("No fue posible guardar los cambios del historial DEMO local.", { cause: error });
  }
}

function createEvent(type: ReportWorkflowEventType, description: string): ReportWorkflowEvent {
  return {
    id: `demo-report-event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    occurredAt: new Date().toISOString(),
    description,
  };
}

function updateRecord(
  recordId: string,
  update: (record: ReportWorkflowRecord) => ReportWorkflowRecord,
): ReportWorkflowRecord {
  const records = readHistory();
  const existing = records.find((record) => record.id === recordId);
  if (!existing) throw new Error("No se encontró el registro de reporte DEMO.");

  const updated = update(existing);
  writeHistory(records.map((record) => record.id === recordId ? updated : record));
  return updated;
}

export const reportDemoService = {
  async listPeriods() {
    return demoReportPeriods.map((period) => ({ ...period }));
  },

  async listReports() {
    return demoSupplierReports.map((report) => ({
      ...report,
      metrics: report.metrics.map((metric) => ({ ...metric })),
    }));
  },

  async listWorkflows() {
    return readHistory();
  },

  async saveDraft(report: SupplierReportDemo, supplierName: string) {
    const records = readHistory();
    const existing = records.find((record) => record.reportId === report.id);
    if (existing) return existing;

    const now = new Date().toISOString();
    const record: ReportWorkflowRecord = {
      id: `demo-report-workflow-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reportId: report.id,
      periodId: report.periodId,
      periodLabel: report.periodLabel,
      supplierId: report.supplierId,
      supplierName,
      metrics: report.metrics.map((metric) => ({ ...metric })),
      reviewStatus: "draft",
      deliveryStatus: "not_attempted",
      createdAt: now,
      updatedAt: now,
      events: [
        createEvent("draft_saved", "Borrador DEMO guardado localmente; no es una aprobación."),
      ],
      demo: true,
    };
    writeHistory([record, ...records]);
    return record;
  },

  async recordDecision(recordId: string, decision: ReportDecision) {
    return updateRecord(recordId, (record) => {
      if (record.reviewStatus !== "draft") {
        throw new Error("Solo un borrador DEMO puede aprobarse o rechazarse.");
      }

      const approved = decision === "approve";
      const eventType = approved ? "approved" : "rejected";
      return {
        ...record,
        reviewStatus: approved ? "approved_demo" : "rejected_demo",
        updatedAt: new Date().toISOString(),
        events: [
          ...record.events,
          createEvent(
            eventType,
            approved
              ? "Aprobación simulada DEMO; no representa una aprobación real de HACEB."
              : "Rechazo simulado DEMO; el envío del reporte queda bloqueado.",
          ),
        ],
      };
    });
  },

  async simulateDelivery(recordId: string, result: SimulatedDeliveryResult) {
    return updateRecord(recordId, (record) => {
      if (record.reviewStatus !== "approved_demo") {
        throw new Error("Solo un reporte aprobado DEMO puede simular un envío.");
      }
      if (record.deliveryStatus === "sent_demo") {
        throw new Error("Este reporte ya tiene un envío simulado exitoso.");
      }

      const succeeded = result === "success";
      return {
        ...record,
        deliveryStatus: succeeded ? "sent_demo" : "failed_demo",
        updatedAt: new Date().toISOString(),
        events: [
          ...record.events,
          createEvent(
            succeeded ? "send_succeeded" : "send_failed",
            succeeded
              ? "Resultado de envío simulado DEMO; no se transmitió ninguna comunicación."
              : "Fallo de envío simulado DEMO; no se intentó ninguna transmisión real.",
          ),
        ],
      };
    });
  },
};
