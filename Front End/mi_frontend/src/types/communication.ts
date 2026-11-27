export type CommunicationMode = "email" | "message";

export type TemplateCategory =
  | "Solicitud de información"
  | "Seguimiento de pedidos"
  | "Confirmación de entregas"
  | "Novedades"
  | "Cartera"
  | "Reclamaciones"
  | "Comunicación general";

export interface CommunicationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  mode: CommunicationMode;
  subject: string;
  content: string;
  updatedAt?: string;
  demo: true;
}

export interface CommunicationDraft {
  supplierId: string;
  mode: CommunicationMode;
  templateId: string;
  recipient: string;
  subject: string;
  content: string;
  variables: Record<string, string>;
}

export type CommunicationStatus =
  | "draft"
  | "prepared"
  | "pending_integration"
  | "sent"
  | "failed";

export interface CommunicationTimelineEvent {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  demo: true;
}

export interface TrackedCommunication {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierNit?: string;
  recipient: string;
  subject: string;
  mode: CommunicationMode;
  content: string;
  templateId?: string;
  templateName?: string;
  createdAt: string;
  status: CommunicationStatus;
  timeline: CommunicationTimelineEvent[];
  demo: true;
}

export interface PrepareCommunicationInput {
  supplierId: string;
  supplierName: string;
  supplierNit?: string;
  recipient: string;
  subject: string;
  mode: CommunicationMode;
  content: string;
  templateId?: string;
  templateName?: string;
}
