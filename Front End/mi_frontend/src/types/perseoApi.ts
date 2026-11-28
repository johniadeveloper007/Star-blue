export interface DashboardSummary {
  supplier_count: number;
  active_supplier_count: number;
  report_count: number;
  period_count: number;
  latest_period: string | null;
  latest_metrics: Record<string, number>;
  latest_import: {
    source_system: string;
    status: string;
    row_count: number;
    completed_at: string | null;
  } | null;
}

export interface PerseoSupplier {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  report_count: number;
  latest_period: string | null;
}

export interface SupplierPage {
  items: PerseoSupplier[];
  total: number;
  limit: number;
  offset: number;
}

export interface SupplierReportMetric {
  code: string;
  label: string;
  value: number;
}

export interface SupplierMonthlyReport {
  period_start: string;
  revision_no: number;
  methodology_version: string;
  result_label: string | null;
  metrics: SupplierReportMetric[];
}
