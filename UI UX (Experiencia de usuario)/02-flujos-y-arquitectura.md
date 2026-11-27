# Flujos y arquitectura de experiencia

## Base de referencia

Los recorridos siguientes describen capacidades documentadas del frontend en
`Front End/mi_frontend/`. Se indican como **actuales** solo en el sentido de
que existen en la interfaz DEMO; no implican integración productiva. Los
recorridos futuros se marcan como **propuestas**.

## Mapa de pantallas actual

| Módulo | Ruta | Comportamiento documentado |
|---|---|---|
| Dashboard | `/` | Indicadores, actividad y accesos ilustrativos DEMO. |
| Directorio de proveedores | `/proveedores` | Búsqueda por nombre, NIT, código o correo y filtros locales. |
| Detalle de proveedor | `/proveedores/:supplierId` | Datos y contactos disponibles en fixtures DEMO; acceso al compositor. |
| Composición | `/comunicaciones/nueva` | Selección de proveedor y plantilla, edición, validación, vista previa y preparación local DEMO. Acepta `?proveedor=` y `?plantilla=`. |
| Biblioteca de plantillas | `/plantillas` | Búsqueda, filtros, vista previa y operaciones locales DEMO de creación, edición, duplicación y eliminación. |
| Seguimiento | `/seguimiento` | Historial DEMO con búsqueda, filtros, detalle y cronología. |
| Detalle de seguimiento | `/seguimiento/:communicationId` | Detalle de un registro del historial DEMO. |
| Reportes mensuales | `/reportes` | Selección local de período y proveedor, consulta de datos sintéticos, vista previa individual, borrador, aprobación/rechazo simulados y simulación de resultado de envío. |
| Historial de reportes | `/reportes/historial` | Búsqueda, filtro por estado y cronología local de los procesos DEMO de reportes. |

### Etiquetas del menú y opciones provisionales

En la barra lateral, la opción **“Enviar comunicación”** navega a
`/comunicaciones/nueva`, que es la pantalla de composición. El nombre del menú
no significa que se realice un envío: el flujo termina en una preparación local
DEMO.

La opción **“Configuración”** aparece marcada como “PRONTO”. No corresponde a
una pantalla funcional; al seleccionarla, la aplicación muestra un aviso de que
el módulo está en preparación.

## Recorridos actuales

### Consultar un proveedor

1. Abrir el directorio desde la navegación o desde un acceso de la aplicación.
2. Buscar localmente por nombre, NIT, código o correo; aplicar filtros locales.
3. Abrir el detalle del proveedor seleccionado.
4. Desde el detalle, iniciar la composición conservando el proveedor elegido.

Los registros son fixtures DEMO y no representan un directorio oficial conectado.

### Preparar una comunicación DEMO

1. Abrir el compositor, desde la navegación o desde el detalle de proveedor.
2. Seleccionar proveedor y plantilla; la ruta puede precargarlos mediante sus
   parámetros documentados.
3. Elegir la modalidad visual disponible y editar destinatario, asunto y
   contenido.
4. Revisar las validaciones y la vista previa.
5. Preparar el registro. La preparación se guarda localmente con estado
   `prepared`; la interfaz no transmite el correo o mensaje.

Los estados `sent` y `failed` presentes en ejemplos son simulaciones. No son
confirmaciones de un proveedor de correo o mensajería.

### Gestionar plantillas DEMO

1. Abrir la biblioteca.
2. Buscar, filtrar o previsualizar una plantilla.
3. Crear, editar, duplicar o eliminar localmente.
4. La persistencia disponible es `localStorage`, limitada al navegador y origen;
   no sincroniza con otros usuarios o dispositivos.

### Consultar seguimiento DEMO

1. Abrir seguimiento.
2. Buscar y filtrar registros locales por los controles disponibles.
3. Abrir el detalle para revisar información y cronología.

Los registros combinan ejemplos DEMO y preparaciones locales. Sus estados y
contadores no son telemetría ni resultados productivos.

### Revisar un reporte mensual DEMO

1. Abrir **Reportes mensuales** desde la navegación lateral.
2. Seleccionar uno de los períodos sintéticos y uno de los proveedores ficticios
   existentes en los fixtures DEMO.
3. Consultar la vista previa individual. Solo hay reportes sintéticos para
   algunas combinaciones; las demás muestran un mensaje de ausencia de datos.
4. Revisar las etiquetas neutrales “Métrica DEMO A”, “Métrica DEMO B” y
   “Métrica DEMO C” con valores ilustrativos. No son resultados oficiales ni
   representan fórmulas o umbrales.
5. Guardar un borrador local DEMO antes de registrar una aprobación o un
   rechazo simulados. La decisión queda guardada en el navegador; el rechazo
   bloquea la simulación de envío.
6. Solo después de aprobar DEMO, elegir un resultado exitoso o fallido
   simulado. No se transmite correo ni otra comunicación.
7. Consultar el historial independiente de reportes, buscar por proveedor,
   período o identificador, filtrar por estado y desplegar la actividad local.

El historial de reportes es un dominio independiente del historial de
comunicaciones. Su persistencia DEMO usa `localStorage` del navegador y no se
sincroniza con otros usuarios o dispositivos.

## Estados observables y necesidades futuras

Algunos mensajes y estados ya existen en módulos concretos. Su presencia no
significa que estén estandarizados, que cubran todos los casos ni que todos los
módulos tengan los mismos estados.

| Estado o comportamiento | Presencia actual | Necesidad futura propuesta |
|---|---|---|
| Vacío / sin coincidencias | El directorio informa cuando la búsqueda no encuentra proveedores; seguimiento muestra “Sin coincidencias”; el compositor informa si la búsqueda de proveedores no encuentra opciones; reportes mensuales muestra ausencia de datos para una combinación período/proveedor sin fixture; el historial de reportes distingue historial vacío de filtros sin coincidencias. | Revisar y acordar mensajes y acciones para distinguir, donde corresponda, catálogo vacío, búsqueda sin coincidencias y datos temporalmente no disponibles. |
| Validación | Composición y plantillas muestran validaciones de campos. En reportes DEMO, solicitar vista previa sin seleccionar ambos filtros muestra un mensaje de validación. | Revisar consistencia, claridad, asociación con campos y conservación del contexto en cada flujo. |
| Error | Composición puede informar un fallo al preparar localmente; plantillas informan errores de persistencia local; seguimiento y reportes pueden mostrar errores al leer el historial; reportes muestran error si no se pueden cargar o guardar datos DEMO. | Definir mensajes y acciones por tipo de error. Los errores de servicios remotos solo se diseñarán cuando exista una integración aprobada. |
| Carga | Reportes DEMO muestran una indicación durante la lectura inicial local. No es una carga de datos remotos. | Diseñar retroalimentación para operaciones futuras solo si una integración real la requiere y se acuerdan sus tiempos y comportamiento. |
| Borrador | El compositor de comunicaciones prepara y guarda localmente registros `prepared`; reportes mensuales permite guardar un borrador DEMO local antes de decidir. No son el mismo flujo ni dominio. | Acordar qué significa un borrador productivo, quién puede verlo y si puede editarse. |
| Aprobación / rechazo | Reportes mensuales permite registrar una aprobación o rechazo simulados después de guardar un borrador. Son acciones locales DEMO; el rechazo bloquea el envío simulado. No representan aprobación funcional ni decisión real de HACEB. | Acordar actor, permisos, significado, evidencia y transiciones antes de definir aprobación productiva. |
| Envío | No hay envío real. El flujo de reportes habilita una simulación local de resultado solo después de aprobar DEMO; preparar una comunicación tampoco la transmite. | Diseñar solo después de confirmar canal, proveedor y respuesta verificable; diferenciar envío aceptado de entrega o lectura. |
| Fallo de envío | Reportes permite registrar un resultado fallido simulado y volver a registrar un resultado DEMO; los registros `failed` de comunicaciones son ejemplos, no fallos informados por un proveedor. | Acordar información visible, reintentos, cancelación e idempotencia con los responsables técnicos y de canal. |

Estos comportamientos no estandarizan ni cubren todos los estados en todos los
módulos. Las necesidades futuras siguen pendientes de validación.

## Arquitectura observable de la experiencia

```text
Aplicación React y rutas
├── Navegación compartida: Sidebar, TopBar e iconos
├── Pantallas: dashboard, proveedores, comunicaciones, plantillas, seguimiento y reportes
├── Servicios locales separados: comunicaciones y reportes DEMO
├── Fixtures: proveedores, plantillas, comunicaciones y reportes sintéticos
└── localStorage: plantillas, historial de comunicaciones e historial de reportes DEMO
```

### Límites de integración y coordinación

- El frontend actual usa datos y persistencia local DEMO; no consume una API ni
  se conecta directamente a PostgreSQL. La existencia de una variable de URL
  de API no confirma una integración.
- El flujo de reportes usa períodos y valores sintéticos, y conserva borradores,
  decisiones y resultados simulados en el almacenamiento local del navegador.
  No realiza solicitudes a una API ni envía comunicaciones.
- Los servicios y tipos de reportes están separados del dominio de
  comunicaciones; sus historiales no se mezclan.
- Toda futura lectura o escritura persistente debe pasar por una API autorizada
  y validada con backend; no se deben diseñar interacciones como si existieran
  contratos, autenticación, permisos o canales confirmados.
- UI/UX puede documentar necesidades y proponer la experiencia. Las definiciones
  de datos e indicadores corresponden a responsables de negocio; contratos,
  identidad, permisos, persistencia y errores de integración requieren acuerdo
  con backend e identidad/seguridad. La operación de envío requiere además
  validación del proveedor y responsables del canal.
- No se asigna a Yubeini una responsabilidad ni aprobación. Su rol, mecanismo
  de revisión y coordinación siguen pendientes de confirmación.

## Fuentes de referencia

- [Rutas y composición de la aplicación](<../Front End/mi_frontend/src/app/App.tsx>)
- [Navegación lateral](<../Front End/mi_frontend/src/components/Sidebar.tsx>)
- [Directorio de proveedores](<../Front End/mi_frontend/src/features/suppliers/SuppliersPage.tsx>)
- [Composición](<../Front End/mi_frontend/src/features/compose/ComposePage.tsx>)
- [Plantillas](<../Front End/mi_frontend/src/features/templates/TemplatesPage.tsx>)
- [Seguimiento](<../Front End/mi_frontend/src/features/tracking/TrackingPage.tsx>)
- [Flujo de reportes mensuales DEMO](<../Front End/mi_frontend/src/features/reports/ReportWorkflowPage.tsx>)
- [Historial de reportes DEMO](<../Front End/mi_frontend/src/features/reports/ReportHistoryPage.tsx>)
- [Servicio local DEMO de reportes](<../Front End/mi_frontend/src/services/reportDemoService.ts>)
- [Fixtures sintéticos de reportes](<../Front End/mi_frontend/src/data/demo/supplierReports.ts>)
- [Documentación del flujo mensual](<./05-flujo-reportes-mensuales-demo.md>)
- [Entrega funcional del frontend](<../Front End/mi_frontend/ENTREGA_FRONTEND.md>)
- [Guía del frontend](<../Front End/mi_frontend/README.md>)
