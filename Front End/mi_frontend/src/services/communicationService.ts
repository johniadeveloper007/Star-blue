import { demoCommunicationTemplates } from "../data/demo/communicationTemplates";
import { demoTrackingCommunications } from "../data/demo/trackingCommunications";
import type {
  CommunicationTemplate,
  PrepareCommunicationInput,
  TrackedCommunication,
} from "../types/communication";

const STORAGE_KEY = "haceb-future.communication-templates.demo";
const TRACKING_STORAGE_KEY = "haceb-future.communication-history.demo";

function readStoredTemplates(): CommunicationTemplate[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as CommunicationTemplate[] : null;
  } catch {
    return null;
  }
}

function writeStoredTemplates(templates: CommunicationTemplate[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    throw new Error("No fue posible guardar las plantillas DEMO en el almacenamiento local.", { cause: error });
  }
}

function readStoredCommunications(): TrackedCommunication[] {
  try {
    const raw = window.localStorage.getItem(TRACKING_STORAGE_KEY);
    return raw ? JSON.parse(raw) as TrackedCommunication[] : demoTrackingCommunications.map((item) => ({ ...item }));
  } catch (error) {
    throw new Error("No fue posible leer el historial DEMO del almacenamiento local.", { cause: error });
  }
}

function writeStoredCommunications(items: TrackedCommunication[]) {
  try {
    window.localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    throw new Error("No fue posible guardar el historial DEMO en el almacenamiento local.", { cause: error });
  }
}

export const communicationService = {
  async listTemplates(): Promise<CommunicationTemplate[]> {
    return readStoredTemplates() ?? demoCommunicationTemplates.map((template) => ({ ...template }));
  },

  async saveTemplates(templates: CommunicationTemplate[]): Promise<CommunicationTemplate[]> {
    writeStoredTemplates(templates);
    return templates;
  },

  async listCommunications(): Promise<TrackedCommunication[]> {
    return readStoredCommunications();
  },

  async getCommunication(id: string): Promise<TrackedCommunication | undefined> {
    return readStoredCommunications().find((item) => item.id === id);
  },

  async prepareDraft(input: PrepareCommunicationInput): Promise<TrackedCommunication> {
    const now = new Date().toISOString();
    const communication: TrackedCommunication = {
      ...input,
      id: `demo-track-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      status: "prepared",
      demo: true,
      timeline: [
        {
          id: `demo-event-${Date.now()}`,
          title: "Comunicación preparada",
          description: "Borrador DEMO almacenado localmente; no se envió ninguna comunicación.",
          createdAt: now,
          demo: true,
        },
      ],
    };
    const items = [communication, ...readStoredCommunications()];
    writeStoredCommunications(items);
    return communication;
  },
};
