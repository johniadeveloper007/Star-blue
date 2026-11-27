import type { IconName } from "../../components/Icon";

export interface DemoMetric {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  style: "lime" | "mint" | "blue" | "amber";
}

export interface DemoCommunication {
  id: string;
  supplier: string;
  subject: string;
  date: string;
  status: "sent" | "pending" | "draft";
  statusLabel: string;
}

export const demoMetrics: DemoMetric[] = [
  {
    label: "Comunicaciones enviadas",
    value: "128",
    detail: "Últimos 30 días",
    icon: "send",
    style: "lime",
  },
  {
    label: "Pendientes",
    value: "12",
    detail: "Requieren seguimiento",
    icon: "clock",
    style: "amber",
  },
  {
    label: "Proveedores",
    value: "246",
    detail: "En el directorio",
    icon: "users",
    style: "mint",
  },
  {
    label: "Actividad reciente",
    value: "04",
    detail: "Ejemplos en pantalla",
    icon: "activity",
    style: "blue",
  },
];

export const demoCommunications: DemoCommunication[] = [
  {
    id: "demo-1",
    supplier: "Norte Hogar Suministros",
    subject: "Actualización de calendario de entregas",
    date: "Hoy, 10:24",
    status: "sent",
    statusLabel: "Enviada · DEMO",
  },
  {
    id: "demo-2",
    supplier: "Andina Componentes",
    subject: "Revisión de indicadores mensuales",
    date: "Hoy, 09:16",
    status: "pending",
    statusLabel: "Pendiente · DEMO",
  },
  {
    id: "demo-3",
    supplier: "Soluciones del Valle",
    subject: "Confirmación de información comercial",
    date: "Ayer, 16:42",
    status: "sent",
    statusLabel: "Enviada · DEMO",
  },
  {
    id: "demo-4",
    supplier: "Distribuciones Central",
    subject: "Borrador de comunicación de bienvenida",
    date: "Ayer, 14:08",
    status: "draft",
    statusLabel: "Borrador · DEMO",
  },
];

export const demoWeeklyActivity = [
  { day: "LUN", height: 38 },
  { day: "MAR", height: 64 },
  { day: "MIÉ", height: 48 },
  { day: "JUE", height: 82 },
  { day: "VIE", height: 58 },
  { day: "SÁB", height: 28 },
  { day: "DOM", height: 44 },
];
