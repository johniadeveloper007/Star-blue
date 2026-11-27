# Requisitos UI/UX y pendientes

## Propósito y alcance

Este documento registra la evidencia disponible para el trabajo UI/UX de HACEB
FUTURE, diferencia el comportamiento del frontend actual de las propuestas y
señala qué debe validarse antes de considerar decisiones como requisitos
aprobados. No constituye aprobación de HACEB ni de otro integrante.

El frontend existente en `Front End/mi_frontend/` es la referencia de
implementación. Esta entrega documental no solicita ni implica cambios en ese
código.

### Convenciones

- **Documentado:** aparece expresamente en la documentación del repositorio;
  no significa necesariamente que HACEB lo haya aprobado.
- **Observado:** se encuentra implementado en la interfaz o en el código actual.
- **Propuesta:** recomendación de diseño pendiente de revisión.
- **Pendiente de validación:** requiere una decisión de HACEB o coordinación
  con el responsable correspondiente.

## Requisitos documentados en el repositorio

| Tema | Evidencia y alcance |
|---|---|
| Producto y frente | La aplicación está identificada como HACEB FUTURE y el repositorio describe una interfaz web para el proyecto. |
| Áreas funcionales | La entrega frontend documenta dashboard, proveedores, composición de comunicaciones, plantillas y seguimiento. |
| Coordinación UI/UX | No se encontró una asignación versionada de responsabilidades UI/UX. La revisión de accesibilidad y experiencia se propone como trabajo de este frente; su coordinación y aprobación deben acordarse. No hay asignación individual confirmada a Yubeini. |
| Límite de arquitectura | El frontend no debe conectarse directamente a PostgreSQL. No hay consumo de API ni contratos de integración confirmados; cualquier integración futura debe pasar por una API autorizada y validarse con los responsables correspondientes. |
| Estado del producto | El frontend implementado presenta datos y comportamientos DEMO; no representa todavía una integración productiva con los servicios de HACEB. No hay integración API confirmada, autenticación integrada ni envío real de correos o mensajes. |
| Indicadores | El dashboard usa datos ilustrativos. No hay fórmulas productivas confirmadas en el frontend. Este trabajo no define fórmulas de In-Full, On-Time u OTIF. |

Fuentes versionadas: [documentación general del proyecto](<../README.md>),
[guía de frontend](<../Front End/mi_frontend/README.md>) y
[entrega frontend](<../Front End/mi_frontend/ENTREGA_FRONTEND.md>). Para
características observables se consultan también el [enrutamiento de la
aplicación](<../Front End/mi_frontend/src/app/App.tsx>), los
[estilos](<../Front End/mi_frontend/src/styles/global.css>) y el
[servicio local de comunicaciones](<../Front End/mi_frontend/src/services/communicationService.ts>).

## Características observadas

- Hay rutas para dashboard, listado y detalle de proveedores, composición,
  biblioteca de plantillas y seguimiento.
- El listado de proveedores ofrece búsqueda y filtros locales; el detalle puede
  abrir el compositor con el proveedor seleccionado.
- El compositor permite seleccionar proveedor y plantilla, editar contenido,
  revisar una vista previa y preparar un registro local. Preparar no envía.
- La biblioteca permite gestionar plantillas en la experiencia DEMO; los
  cambios locales usan `localStorage`.
- El seguimiento presenta historial DEMO, filtros, detalles y cronología.
- Los indicadores del dashboard son ilustrativos. Algunos contadores del
  seguimiento se derivan de registros locales; no son métricas de negocio
  aprobadas.
- La interfaz incorpora puntos de partida de accesibilidad y responsive, como
  etiquetas accesibles, foco visible, preferencias de movimiento reducido y
  reglas CSS adaptables. Su presencia no demuestra conformidad con un estándar
  ni reemplaza pruebas.

Estas observaciones describen el producto actual; no convierten sus datos,
textos, estados o decisiones visuales en requisitos de negocio aprobados.

## Propuestas de experiencia

Pendientes de aprobación; no son capacidades actuales:

1. Hacer visible y consistente que los datos, indicadores y registros son DEMO.
2. Dar a cada pantalla mensajes comprensibles para estados sin resultados,
   errores y validaciones, sin presentar una operación local como persistencia
   central.
3. Mantener el recorrido de preparación distinto de cualquier aprobación o
   envío. No mostrar éxito de envío o entrega hasta que una integración aprobada
   pueda confirmarlo.
4. Diseñar y validar estados de borrador, aprobación, envío y fallo solo cuando
   se acuerden sus significados, actores y transiciones.
5. Revisar navegación por teclado, foco, nombres accesibles, formularios,
   diálogos, contraste y lectura con tecnologías de asistencia.
6. Comprobar los flujos en anchos de pantalla y dispositivos acordados con
   HACEB, preservando la lectura y operación de tablas, formularios y navegación.

## Pendientes de validación

- Usuarios, tareas prioritarias, roles y permisos que tendrá la aplicación.
- Identidad visual oficial, uso de marca y aprobación del lenguaje visual actual.
- Requisitos de accesibilidad y criterios verificables que se deben cumplir.
- Dispositivos, navegadores, tamaños de pantalla y condiciones de uso objetivo.
- Terminología y significado de cada estado, incluidos borrador, aprobación,
  preparación, envío y fallo.
- Qué datos e indicadores deben aparecer, su fuente oficial y sus definiciones.
  UI/UX no define fórmulas de In-Full, On-Time u OTIF.
- Qué partes de proveedores, plantillas, historial y comunicaciones pasarán a
  datos reales y mediante qué contratos aprobados.
- Responsable, alcance de revisión y formato de coordinación con Yubeini.
- Quién de HACEB y del equipo acepta los flujos, diseños y entregables.

No se encontró documentación que confirme acuerdos con HACEB o con Yubeini
respecto de estos puntos.
