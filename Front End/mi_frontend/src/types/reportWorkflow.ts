export interface ReportPeriod {
  id: string;
  startDate: string;
  label: string;
}

export interface DemoReportMetric {
  id: string;
  label: string;
  value: number;
}

export interface SupplierReportDemo {
  id: string;
  periodId: string;
  periodLabel: string;
  supplierId: string;
  metrics: DemoReportMetric[];
  demo: true;
}

export type ReportReviewStatus = "draft" | "approved_demo" | "rejected_demo";
export type ReportDeliveryStatus = "not_attempted" | "sent_demo" | "failed_demo";
export type ReportDecision = "approve" | "reject";
export type SimulatedDeliveryResult = "success" | "failure";

export type ReportWorkflowEventType =
  | "draft_saved"
  | "approved"
  | "rejected"
  | "send_succeeded"
  | "send_failed";

export interface ReportWorkflowEvent {
  id: string;
  type: ReportWorkflowEventType;
  occurredAt: string;
  description: string;
}

export interface ReportWorkflowRecord {
  id: string;
  reportId: string;
  periodId: string;
  periodLabel: string;
  supplierId: string;
  supplierName: string;
  metrics: DemoReportMetric[];
  reviewStatus: ReportReviewStatus;
  deliveryStatus: ReportDeliveryStatus;
  createdAt: string;
  updatedAt: string;
  events: ReportWorkflowEvent[];
  demo: true;
}
