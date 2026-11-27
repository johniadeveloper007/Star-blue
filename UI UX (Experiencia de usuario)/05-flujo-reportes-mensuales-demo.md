# Flujo DEMO de reportes mensuales por proveedor

## Alcance y límites

Este documento describe el recorrido implementado en la interfaz DEMO del
frontend. No registra aprobación de HACEB, requisitos productivos ni acuerdos
con el equipo.

| Clasificación | Descripción |
|---|---|
| Implementado en la DEMO | Selección local de período y proveedor, consulta de reportes sintéticos disponibles, vista previa individual, borrador local, aprobación/rechazo simulados, resultados de envío simulados e historial local con búsqueda y filtro por estado. |
| Observación técnica | Las acciones se guardan en `localStorage` del navegador. La experiencia no llama una API, no consulta PostgreSQL y no transmite correos ni otras comunicaciones. |
| Propuesta futura | Acordar estados, contenido, comportamiento y recuperación para una versión productiva después de validar requisitos y contratos con HACEB y el equipo. |
| Pendiente externo | Definición y fuente de indicadores, fórmulas, períodos oficiales, usuarios, permisos, significado de aprobación/rechazo, canal de envío, integraciones y operación productiva. |

Todos los períodos, reportes y valores presentados por este módulo están
marcados como DEMO y son sintéticos. Los valores no son datos de HACEB ni
representan fórmulas, umbrales o interpretaciones de In-Full, On-Time u OTIF.
Las métricas se muestran con nombres neutrales: “Métrica DEMO A”, “Métrica
DEMO B” y “Métrica DEMO C”.

## Pantallas y navegación implementadas

| Pantalla | Ruta | Contenido |
|---|---|---|
| Reportes mensuales por proveedor | `/reportes` | Período, proveedor ficticio, consulta, vista previa y acciones del flujo DEMO. Se abre desde la opción “Reportes mensuales” de la navegación lateral. |
| Historial de reportes DEMO | `/reportes/historial` | Registros persistidos localmente, búsqueda, filtro de estado y actividad desplegable por registro. Se accede desde el encabezado del flujo o la vista previa; “Crear revisión DEMO” regresa a `/reportes`. |

El historial de reportes está separado del seguimiento de comunicaciones. No
comparte estados ni registros con ese módulo.

## Recorrido de usuario

1. **Seleccionar período y proveedor.** La página ofrece tres períodos
   sintéticos y los seis proveedores ficticios ya incluidos en los fixtures
   DEMO del directorio. La selección no es una consulta a una fuente externa.
2. **Consultar disponibilidad.** La aplicación encuentra un reporte solo para
   algunas combinaciones. Si no existe fixture para la combinación, muestra
   “No hay reporte DEMO para esta selección” y permite elegir otros valores.
3. **Revisar la vista previa individual.** La vista muestra proveedor, período,
   identificador DEMO y tres métricas sintéticas con valores ilustrativos.
   Cada valor se etiqueta como sintético y se advierte que no representa un
   resultado oficial.
4. **Guardar borrador.** El usuario guarda el reporte seleccionado como
   borrador local. Guardarlo no significa que se haya aprobado ni enviado.
5. **Aprobar o rechazar de forma simulada.** Desde el borrador se puede
   registrar una decisión local DEMO. El rechazo queda en el historial y
   bloquea la simulación del envío. La aprobación no representa una decisión
   real de HACEB ni habilita un envío productivo.
6. **Simular un resultado de envío.** Solo un reporte aprobado DEMO muestra
   acciones para simular un resultado exitoso o fallido. Un fallo permite
   registrar otro intento simulado; un resultado exitoso finaliza las acciones
   de envío para ese registro. Ninguna opción transmite información.
7. **Consultar el historial.** La pantalla de historial permite buscar por
   proveedor, período o identificador, filtrar por estado y desplegar eventos
   locales ordenados cronológicamente.

## Campos y componentes observables

### Selección y vista previa

- Selector nativo de período mensual.
- Selector nativo con nombre de proveedor ficticio y etiqueta DEMO.
- Botón “Consultar vista previa”; si falta una selección, aparece un mensaje de
  validación y se conserva la página.
- Mensaje de ausencia de reporte para combinaciones sin datos sintéticos.
- Resumen con proveedor, período e identificador.
- Tarjetas de “Métrica DEMO A/B/C”, valor porcentual ilustrativo y etiqueta
  “Valor sintético ilustrativo”.
- Advertencia visible sobre la naturaleza sintética de los valores.

### Revisión y acciones

- Estado visible del registro: sin decisión, borrador, aprobación o rechazo
  DEMO.
- Botón para guardar el borrador antes de decidir.
- Acciones separadas “Aprobar DEMO” y “Rechazar DEMO”.
- Acciones de resultado “Simular envío exitoso” y “Simular fallo”, disponibles
  únicamente después de aprobación DEMO.
- Mensajes de confirmación, error local y resultado de la simulación.
- Enlace a la pantalla de historial.

### Historial

- Búsqueda por nombre de proveedor, período o identificador de reporte.
- Filtro por borrador, aprobación, rechazo, resultado exitoso o fallo simulado.
- Tabla adaptable a tarjetas para pantallas estrechas.
- Actividad expandible con descripción y fecha/hora de cada evento.
- Estado vacío cuando no hay registros y estado “Sin coincidencias” cuando los
  filtros no producen resultados.

## Estados y mensajes

| Estado | Implementación DEMO | Límite o recuperación |
|---|---|---|
| Carga | Indicación mientras se leen proveedores, fixtures e historial local. | No indica una consulta remota ni tiempos de backend. |
| Vacío | No hay reporte para la combinación seleccionada; mensaje en el historial cuando todavía no hay registros. | Cambiar período/proveedor o iniciar una revisión. |
| Filtros sin coincidencias | Mensaje en el historial cuando búsqueda y filtro no encuentran registros. | Acción “Limpiar filtros”. |
| Validación | Se solicita período y proveedor antes de abrir la vista previa. | Completar ambos selectores e intentar nuevamente. |
| Error | La página informa errores de lectura, formato o escritura del almacenamiento local. | Hay acción para reintentar la carga; ante error en una acción, volver a ejecutar la acción disponible. No se elimina ni repara el almacenamiento automáticamente. |
| Borrador | Registro DEMO guardado en el navegador; permite decidir aprobación o rechazo. | No equivale a borrador productivo ni sincronizado. |
| Aprobación | Decisión local “Aprobado · DEMO”; habilita resultados simulados. | No representa una aprobación funcional, identidad o permiso real. |
| Rechazo | Decisión local “Rechazado · DEMO”. | La interfaz y el servicio local bloquean el envío simulado para este registro. |
| Envío exitoso | Resultado local “Envío exitoso simulado”. | No se envía correo ni se confirma entrega. Este registro no ofrece otra simulación de envío después del éxito. |
| Fallo | Resultado local “Fallo de envío simulado”. | No se intentó transmisión real; permite registrar otro resultado DEMO. |

Estos estados describen la cobertura actual del prototipo y no definen una
máquina de estados productiva. La semántica, permisos, retención, reintentos y
reglas de aprobación requieren validación.

## Persistencia y separación de dominios

- Los períodos e informes son fixtures estáticos en
  `src/data/demo/supplierReports.ts`; sus proveedores se referencian desde los
  fixtures de proveedores existentes.
- `reportDemoService` gestiona el historial de reportes por separado del
  servicio de comunicaciones. La clave local es
  `haceb-future.supplier-report-workflows.demo.v1`.
- Los registros guardan una copia de valores visibles, el proveedor y el
  período, junto con eventos de borrador, decisión y resultados simulados.
- Los datos permanecen en el mismo navegador y origen. No se envían a otros
  usuarios o dispositivos y no deben considerarse un registro oficial o
  auditable de HACEB.

## Accesibilidad y responsive

- Los selectores y la búsqueda tienen etiquetas accesibles; los mensajes de
  validación y error usan anuncios de estado o alerta.
- La estructura utiliza encabezados, etiquetas de formulario, tablas con
  encabezados, listas ordenadas para actividad y controles nativos expandibles.
- Los botones conservan foco visible mediante los estilos globales existentes;
  las acciones quedan deshabilitadas mientras una escritura está en curso.
- En escritorio, selección y métricas se distribuyen en columnas; el historial
  utiliza tabla.
- En anchos de hasta 960 px se reorganizan los selectores; hasta 760 px las
  columnas pasan a una sola columna y la tabla se reemplaza por tarjetas. Los
  controles y textos pueden envolver en pantallas estrechas.
- Se respeta la preferencia del sistema para reducir movimiento.
- La verificación con tecnologías de asistencia y dispositivos reales sigue
  pendiente; estos puntos describen las decisiones observables, no certifican
  conformidad con un estándar externo.

## Decisiones que requieren coordinación

No se deben reemplazar las etiquetas neutrales ni presentar valores sintéticos
como indicadores reales sin validación del responsable de negocio/HACEB.
También requieren definición externa:

- Nombres, significado, fuente, periodicidad, fórmula y reglas de los
  indicadores.
- Períodos y criterios para que un reporte exista o esté completo.
- Personas usuarias, roles, permisos, evidencia y significado de aprobar o
  rechazar; incluida cualquier posibilidad de reabrir o versionar un reporte.
- Política productiva de envío, canal, destinatarios, reintentos y significado
  de enviado, entregado o fallido.
- API, autenticación, persistencia, auditoría, seguridad y respuestas de error,
  coordinadas con responsables técnicos.
- Responsables, agenda y mecanismo de revisión entre HACEB, UI/UX, frontend,
  Back End y Yubeini. No se presupone asignación ni aprobación de ninguna
  persona.

## Verificación de aceptación de la DEMO

La lista siguiente verifica el recorrido implementado, no aceptación de
producto por HACEB. Los puntos marcados fueron comprobados en esta ejecución;
los que quedan abiertos requieren otra revisión.

- [x] Seleccionar período y proveedor con datos sintéticos y abrir la vista
      previa del proveedor y período elegidos.
- [x] Seleccionar una combinación sin reporte y confirmar el mensaje de vacío.
- [x] Guardar borrador y comprobar que el estado se mantiene al recargar la
      página en el mismo navegador.
- [x] Rechazar un borrador y confirmar que no aparece la acción de
      envío simulado.
- [x] Aprobar un borrador y confirmar que las simulaciones de resultado quedan
      disponibles.
- [x] Registrar resultados exitosos y fallidos, incluido un reintento tras un
      fallo.
- [x] Buscar un registro existente y aplicar filtros con y sin coincidencias;
      comprobar que “Limpiar filtros” recupera la lista.
- [x] Confirmar que el historial y sus registros persisten tras recargar en el
      mismo navegador.
- [x] Revisar la navegación y presentación responsive en 390 px; las tarjetas
      móviles aparecen, la tabla se oculta y no hay desbordamiento horizontal.
- [x] Verificar que las interacciones no llaman API/servicios externos ni
      envíos reales.
- [ ] Revisar teclado, foco y tecnologías de asistencia en las pantallas del
      módulo.

La lectura de almacenamiento local malformado y su mensaje de error con acción
de reintento también se comprobó. Las verificaciones técnicas no sustituyen
pruebas completas de accesibilidad ni aprobación externa.

## Referencias de implementación

- [Aplicación y rutas](<../Front End/mi_frontend/src/app/App.tsx>)
- [Navegación lateral](<../Front End/mi_frontend/src/components/Sidebar.tsx>)
- [Pantalla de reportes mensuales](<../Front End/mi_frontend/src/features/reports/ReportWorkflowPage.tsx>)
- [Pantalla de historial](<../Front End/mi_frontend/src/features/reports/ReportHistoryPage.tsx>)
- [Estilos del módulo](<../Front End/mi_frontend/src/features/reports/reports.css>)
- [Servicio local DEMO](<../Front End/mi_frontend/src/services/reportDemoService.ts>)
- [Fixtures sintéticos](<../Front End/mi_frontend/src/data/demo/supplierReports.ts>)
- [Tipos del flujo](<../Front End/mi_frontend/src/types/reportWorkflow.ts>)
- [Fixtures de proveedores](<../Front End/mi_frontend/src/data/demo/suppliers.ts>)
