import type { TrackedCommunication } from "../../types/communication";

const demoDate = (daysAgo: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 20, 0, 0);
  return date.toISOString();
};

function demoRecord(
  id: string,
  supplierId: string,
  supplierName: string,
  supplierNit: string | undefined,
  recipient: string,
  subject: string,
  mode: TrackedCommunication["mode"],
  status: TrackedCommunication["status"],
  content: string,
  daysAgo: number,
  hour: number,
  templateName?: string,
): TrackedCommunication {
  const createdAt = demoDate(daysAgo, hour);
  const statusLabel = {
    draft: "Borrador DEMO guardado para edición.",
    prepared: "Preparación DEMO almacenada localmente; no se envió.",
    pending_integration: "Pendiente de integración con un servicio real.",
    sent: "Evento de envío simulado DEMO; no se transmitió ningún mensaje.",
    failed: "Resultado fallido simulado DEMO; no se intentó un envío real.",
  }[status];

  return {
    id,
    supplierId,
    supplierName,
    supplierNit,
    recipient,
    subject,
    mode,
    content,
    templateId: templateName ? `demo-template-${id}` : undefined,
    templateName,
    createdAt,
    status,
    timeline: [
      {
        id: `${id}-created`,
        title: "Registro DEMO creado",
        description: "Elemento ficticio de demostración para la vista de seguimiento.",
        createdAt,
        demo: true,
      },
      {
        id: `${id}-status`,
        title: status === "sent" ? "Envío simulado" : status === "failed" ? "Fallo simulado" : "Estado actual",
        description: statusLabel,
        createdAt: new Date(new Date(createdAt).getTime() + 60_000).toISOString(),
        demo: true,
      },
    ],
    demo: true,
  };
}

export const demoTrackingCommunications: TrackedCommunication[] = [
  demoRecord(
    "demo-track-1001",
    "demo-supplier-001",
    "Norte Hogar Suministros",
    "900.100.101-2",
    "compras@norte-hogar.demo",
    "Solicitud de cotización - Norte Hogar Suministros",
    "email",
    "draft",
    "Hola Laura,\n\nPor favor compartir una cotización de demostración.\n\nEquipo de Compras HACEB FUTURE",
    0,
    9,
    "Solicitud de cotización",
  ),
  demoRecord(
    "demo-track-1002",
    "demo-supplier-002",
    "Andina Componentes",
    "900.200.202-3",
    "contacto@andina-componentes.demo",
    "Confirmación de información comercial",
    "email",
    "prepared",
    "Hola Daniel,\n\nCompartimos una comunicación de ejemplo preparada localmente.",
    1,
    11,
    "Confirmación de entrega",
  ),
  demoRecord(
    "demo-track-1003",
    "demo-supplier-003",
    "Soluciones del Valle",
    "890.300.303-4",
    "proveedores@soluciones-valle.demo",
    "Actualización de estado de pedido",
    "email",
    "pending_integration",
    "Hola Mariana,\n\nEste registro de demostración está pendiente de integración.",
    2,
    14,
    "Seguimiento de pedido",
  ),
  demoRecord(
    "demo-track-1004",
    "demo-supplier-004",
    "Distribuciones Central",
    "800.400.404-5",
    "operaciones@dist-central.demo",
    "Confirmación de entrega",
    "email",
    "sent",
    "Mensaje ficticio de ejemplo con estado enviado simulado.",
    3,
    10,
    "Confirmación de entrega",
  ),
  demoRecord(
    "demo-track-1005",
    "demo-supplier-006",
    "Metales y Envolventes DEMO",
    "901.600.606-7",
    "comercial@metales-env.demo",
    "Revisión de información comercial",
    "message",
    "failed",
    "Resultado de fallo ficticio para presentación DEMO.",
    4,
    16,
  ),
];
