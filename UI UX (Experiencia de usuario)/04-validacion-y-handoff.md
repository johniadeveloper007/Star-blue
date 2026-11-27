# Validación y handoff UI/UX

## Objetivo del handoff

Dejar una base revisable para que HACEB, UI/UX, frontend y los demás
responsables puedan acordar requisitos y próximos pasos. Este documento no
registra aprobaciones que no estén documentadas ni autoriza cambios de código.

## Criterios de aceptación de esta entrega documental

Los criterios marcados a continuación verifican exclusivamente la calidad y el
alcance de estos documentos. **No representan aceptación del producto, de sus
flujos ni de sus diseños por HACEB.**

- [x] Los módulos y recorridos se describen con base en el frontend existente.
- [x] Se distingue comportamiento DEMO de integraciones o servicios reales.
- [x] Se distinguen estados observados en pantallas concretas de necesidades
  futuras propuestas.
- [x] Requisitos documentados, observaciones, propuestas y pendientes están
  diferenciados.
- [x] No se definen fórmulas de In-Full, On-Time u OTIF.
- [x] No se afirma que haya envío real de correo o mensajería ni integración API
  confirmada.
- [x] No se inventan acuerdos con HACEB o con Yubeini.
- [x] Se incluyen recomendaciones de experiencia, accesibilidad y responsive.
- [x] Los documentos no incluyen prototipos ficticios ni enlaces inexistentes.
- [x] El flujo mensual se documenta como DEMO local, sin atribuir integración,
  aprobación de HACEB ni envío real.

La aceptación del contenido por HACEB y por las personas responsables del
proyecto sigue pendiente.

## Verificaciones futuras y evidencia de aprobación

Todas las revisiones que dependen de decisiones o evidencia externa permanecen
**pendientes**. La verificación técnica del recorrido DEMO se registra abajo
como ejecutada en esta versión; no equivale a aceptación del producto.

| Revisión | Verificación concreta | Evidencia que permitiría marcar aprobado | Estado |
|---|---|---|---|
| Alcance y usuarios | Revisar usuarios, tareas prioritarias y módulos incluidos; registrar cualquier exclusión. | Requisitos o acta con alcance, tareas y visto bueno explícito de HACEB. | Pendiente de HACEB |
| Identidad visual y lenguaje | Revisar marca, paleta, tipografía y textos de interfaz frente a las guías que HACEB indique. | Guía aplicable identificada y aprobación escrita de la persona responsable de marca/HACEB. | Pendiente de HACEB |
| Accesibilidad | Acordar estándar y criterios; ejecutar pruebas de teclado, foco, nombres accesibles, formularios, diálogos y contraste contra esos criterios. | Criterios acordados y reporte con pantalla/elemento, resultado, evidencia y defectos pendientes; aceptación del responsable designado. | Pendiente de HACEB y equipo |
| Responsive | Acordar dispositivos y anchos objetivo; revisar navegación, tablas, filtros, formularios y diálogos en esos tamaños. | Matriz de tamaños acordados, resultados y capturas o registro de defectos; aceptación de HACEB/equipo. | Pendiente de HACEB y equipo |
| Estados por pantalla | Contrastar carga, vacío, validación y error con el inventario de [02-flujos-y-arquitectura.md](<./02-flujos-y-arquitectura.md>); separar lo existente de los casos futuros. | Matriz pantalla × estado con comportamiento esperado, evidencia de prueba y aprobación de quienes definan el flujo. | Pendiente de HACEB y equipo |
| Flujo mensual DEMO | Recorrer selección, vista previa, ausencia de datos, validación, error local, borrador, rechazo, aprobación, resultados simulados y filtros del historial. | Verificación manual en navegador: vista previa, combinación sin datos, validación de selección, lectura de historial malformado y presencia de acción de reintento, borrador y persistencia tras recargar, rechazo bloqueante, aprobación habilitante, resultados exitoso/fallido y reintento, filtros sin coincidencias, historial persistente y diseño móvil a 390 px. Typecheck y build exitosos; no se observaron solicitudes durante las interacciones ni envíos reales. | Verificado técnicamente en esta ejecución; no es aprobación de HACEB |
| Borrador y aprobación | Definir si se requiere guardar borrador o aprobar; acordar actores, permisos, transiciones y persistencia. | Decisión escrita de negocio y diseño de flujo aprobado por HACEB y responsables técnicos. | Pendiente de HACEB y equipo |
| Envío y fallo | Confirmar canal/proveedor y qué respuestas son verificables; revisar textos para que preparación no se confunda con envío, entrega o lectura. | Contrato y semántica aprobados por backend, seguridad y responsable de canal; casos de prueba para éxito/error antes de presentar estados reales. | Pendiente del equipo |
| Datos e indicadores | Identificar fuente, definiciones y responsables de cada indicador mostrado; no deducir fórmulas desde la UI. | Definiciones y fuente aprobadas por el responsable de negocio/HACEB. | Pendiente de negocio/HACEB |
| Coordinación | Confirmar puntos de contacto, responsabilidades y revisión de UI/UX, frontend y Yubeini, sin asumir asignaciones. | Acuerdo escrito o acta con nombres/roles, alcance y mecanismo de aprobación. | Pendiente del equipo |
| Handoff a frontend | Revisar recomendaciones priorizadas contra pantallas y componentes existentes; registrar qué se acepta, difiere o descarta. | Lista de decisiones con responsable y respuesta del equipo frontend antes de cualquier cambio de código. | Pendiente de frontend |
| Prototipo, si se solicita | Acordar si se requiere, su alcance, formato y ubicación antes de producirlo. | Confirmación escrita de herramienta/formato y enlace o archivo aprobado una vez creado. | Pendiente de HACEB/equipo |

## Límites de integración y coordinación

- El frontend presenta datos DEMO y persistencia local; no consume una API ni
  integra autenticación o envío real. El flujo de reportes agrega datos
  sintéticos, borradores, aprobaciones/rechazos simulados y resultados de envío
  locales; no envía correo ni otra comunicación. En comunicaciones, preparar
  un registro tampoco lo transmite y los ejemplos `sent` y `failed` son
  simulados.
- No se debe conectar el frontend directamente a PostgreSQL. Toda futura
  persistencia requiere una API autorizada y contratos acordados con backend.
  La identidad, permisos, estados, fuentes de datos y semántica de envío deben
  validarse con sus responsables antes de diseñar una experiencia productiva.
- UI/UX documenta y propone interacciones; no define contratos de API,
  autenticación, fórmulas de indicadores ni resultados de canales externos.
- No se atribuye a Yubeini un rol o aprobación. Su participación y mecanismo de
  coordinación deben confirmarse explícitamente.
- Este handoff se apoya en la guía/entrega frontend y el código referenciados
  abajo; no depende de documentos de coordinación locales que no estén
  versionados.

## Handoff recomendado

1. Compartir los cinco documentos para revisión, identificando por separado
   observaciones, propuestas y verificaciones pendientes.
2. Registrar cualquier aprobación futura con responsable, fecha y evidencia;
   no marcar como aprobado un punto sin esa constancia.
3. Si se solicita un prototipo, confirmar formato y ubicación antes de
   producirlo o enlazarlo.
4. Transferir a frontend recomendaciones priorizadas como propuestas separadas
   de requisitos aprobados. Cualquier cambio de código requiere autorización y
   coordinación independientes.

## Referencias

- [Entrega frontend](<../Front End/mi_frontend/ENTREGA_FRONTEND.md>)
- [Guía frontend](<../Front End/mi_frontend/README.md>)
- [Rutas y composición de la aplicación](<../Front End/mi_frontend/src/app/App.tsx>)
- [Flujo de reportes mensuales DEMO](<../Front End/mi_frontend/src/features/reports/ReportWorkflowPage.tsx>)
- [Historial de reportes DEMO](<../Front End/mi_frontend/src/features/reports/ReportHistoryPage.tsx>)
- [Documentación del flujo mensual](<./05-flujo-reportes-mensuales-demo.md>)
- [README UI/UX](<./README.md>)
