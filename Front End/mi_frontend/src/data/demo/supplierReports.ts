import type { ReportPeriod, SupplierReportDemo } from "../../types/reportWorkflow";

export const demoReportPeriods: ReportPeriod[] = [
  { id: "demo-period-2026-09", startDate: "2026-09-01", label: "Septiembre 2026 · DEMO" },
  { id: "demo-period-2026-10", startDate: "2026-10-01", label: "Octubre 2026 · DEMO" },
  { id: "demo-period-2026-11", startDate: "2026-11-01", label: "Noviembre 2026 · DEMO" },
];

const demoMetrics = (values: [number, number, number]) => [
  { id: "metric-demo-a", label: "Métrica DEMO A", value: values[0] },
  { id: "metric-demo-b", label: "Métrica DEMO B", value: values[1] },
  { id: "metric-demo-c", label: "Métrica DEMO C", value: values[2] },
];

export const demoSupplierReports: SupplierReportDemo[] = [
  {
    id: "demo-report-2026-09-supplier-001",
    periodId: "demo-period-2026-09",
    periodLabel: "Septiembre 2026 · DEMO",
    supplierId: "demo-supplier-001",
    metrics: demoMetrics([82.4, 97.1, 68.5]),
    demo: true,
  },
  {
    id: "demo-report-2026-09-supplier-002",
    periodId: "demo-period-2026-09",
    periodLabel: "Septiembre 2026 · DEMO",
    supplierId: "demo-supplier-002",
    metrics: demoMetrics([74.2, 88.6, 91.3]),
    demo: true,
  },
  {
    id: "demo-report-2026-10-supplier-001",
    periodId: "demo-period-2026-10",
    periodLabel: "Octubre 2026 · DEMO",
    supplierId: "demo-supplier-001",
    metrics: demoMetrics([91.6, 79.4, 85.8]),
    demo: true,
  },
  {
    id: "demo-report-2026-10-supplier-004",
    periodId: "demo-period-2026-10",
    periodLabel: "Octubre 2026 · DEMO",
    supplierId: "demo-supplier-004",
    metrics: demoMetrics([68.7, 93.2, 76.1]),
    demo: true,
  },
  {
    id: "demo-report-2026-11-supplier-002",
    periodId: "demo-period-2026-11",
    periodLabel: "Noviembre 2026 · DEMO",
    supplierId: "demo-supplier-002",
    metrics: demoMetrics([86.3, 72.8, 94.5]),
    demo: true,
  },
  {
    id: "demo-report-2026-11-supplier-006",
    periodId: "demo-period-2026-11",
    periodLabel: "Noviembre 2026 · DEMO",
    supplierId: "demo-supplier-006",
    metrics: demoMetrics([77.9, 89.4, 81.2]),
    demo: true,
  },
];
