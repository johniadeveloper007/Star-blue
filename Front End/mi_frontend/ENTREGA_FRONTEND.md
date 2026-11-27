# Entrega del frontend HACEB FUTURE

## Identificación y alcance de la entrega

- Repositorio: `Star-blue`.
- Rama respaldada: `frontend/proyecto`.
- Commit incluido: `ac7232b5b620a03a58d141b4bb3a371056ca6d4f`.
- Bundle: `C:\Users\Usuario\Desktop\Star-blue-frontend.bundle`.

El bundle contiene la rama y su historia Git alcanzable; no es una exportación
aislada de `Front End/mi_frontend/` y puede incluir archivos versionados de
otras áreas que ya formen parte de esa historia. El bundle no incluye cambios
locales sin commit.

Esta guía se entrega como archivo separado: se creó después del commit y no se
creó otro commit. `COMUNICACION_AGENTES_FRONTEND.md` tampoco está en la historia
de la rama y se excluye del bundle. Entregue `ENTREGA_FRONTEND.md` junto al
bundle por un canal separado.

## Funcionalidades implementadas

- Dashboard con accesos a proveedores, composición de comunicaciones,
  plantillas y seguimiento.
- Directorio DEMO de proveedores con búsqueda por nombre, NIT, código o correo,
  filtros locales y ficha de detalle.
- Compositor DEMO: selección de proveedor y plantilla, modalidad visual de
  correo o mensaje, edición de destinatario/asunto/contenido, variables y vista
  previa. La preparación crea un registro local; no envía mensajes.
- Biblioteca DEMO de plantillas con búsqueda, filtros, vista previa, creación,
  edición, duplicación y eliminación local.
- Seguimiento DEMO con búsqueda, filtros por estado, modalidad y fechas, detalle
  y línea de tiempo.
- Flujo DEMO de reportes mensuales por proveedor: selección de período y
  proveedor, vista previa de métricas sintéticas, borrador, aprobación o rechazo
  simulados, resultados de envío simulados e historial local.

Las rutas implementadas son:

| Pantalla | Ruta |
|---|---|
| Dashboard | `/` |
| Proveedores | `/proveedores` |
| Detalle de proveedor | `/proveedores/:supplierId` |
| Nueva comunicación | `/comunicaciones/nueva` |
| Biblioteca de plantillas | `/plantillas` |
| Seguimiento | `/seguimiento` |
| Detalle de seguimiento | `/seguimiento/:communicationId` |
| Reportes mensuales DEMO | `/reportes` |
| Historial de reportes DEMO | `/reportes/historial` |

El compositor acepta `?proveedor=` y `?plantilla=` para preseleccionar datos
DEMO.

## Datos DEMO y persistencia local

Los proveedores, plantillas iniciales, ejemplos de comunicaciones, cifras del
dashboard y eventos de seguimiento son datos ilustrativos; los proveedores de
ejemplo no son registros oficiales. Los estados `sent` y `failed` del historial
son simulaciones, no resultados de un envío.

Las plantillas editadas y el historial de preparaciones se guardan en el
`localStorage` del navegador y origen, con estas claves:

- `haceb-future.communication-templates.demo`
- `haceb-future.communication-history.demo`
- `haceb-future.supplier-report-workflows.demo.v1`

Ese almacenamiento no sincroniza entre personas, navegadores o dispositivos;
puede ser eliminado y no es una copia de seguridad. Si falla una escritura de
plantillas, la interfaz informa el error y no confirma la operación como
guardada. La preparación DEMO de una comunicación tampoco envía correo o
mensajes ni confirma entrega o recepción.

## Flujo DEMO de reportes mensuales

El módulo `/reportes` permite seleccionar uno de los períodos sintéticos y uno
de los proveedores ficticios ya incluidos en los fixtures DEMO. Solo algunas
combinaciones tienen un reporte de ejemplo; para las demás se muestra un estado
sin datos. La vista previa muestra tres métricas neutrales —“Métrica DEMO A”,
“Métrica DEMO B” y “Métrica DEMO C”— con valores ilustrativos. No son datos de
HACEB y no representan fórmulas, umbrales ni resultados oficiales de In-Full,
On-Time u OTIF.

El usuario puede guardar un borrador local, aprobarlo o rechazarlo de forma
simulada. El rechazo bloquea la simulación de envío; solo un reporte aprobado
DEMO habilita simular un resultado exitoso o fallido. Un fallo permite otra
simulación; un resultado exitoso termina las acciones de envío para ese
registro. Estas decisiones y resultados se guardan en el historial accesible
desde `/reportes/historial`, con búsqueda, filtro de estado y actividad por
registro.

El historial de reportes está separado del historial de comunicaciones y se
persiste en `localStorage` del mismo navegador y origen. No se sincroniza con
otros usuarios ni constituye un registro oficial. La aprobación y el envío son
simulaciones locales: no hay autorización productiva ni transmisión de correo
u otra comunicación.

## Indicadores y decisiones pendientes

Los cuatro indicadores y las barras semanales del dashboard son valores DEMO
estáticos; no se calculan desde información productiva. En seguimiento, los
contadores actuales se calculan contando los registros del historial por estado
(total, borrador, preparado, pendiente de integración, enviado y fallido). Esto
describe el comportamiento presente, no una fórmula aprobada para indicadores
del negocio.

Antes de una integración real, el equipo debe acordar la fuente de datos y la
definición de cada indicador: estados que cuentan, periodo, zona horaria,
filtros, inclusión de preparaciones y diferencia entre envío aceptado y entrega.
No hay fórmulas productivas confirmadas en este frontend.

## Instalación, ejecución y comprobaciones

Se requiere Node.js y npm compatibles con Vite 7. Desde PowerShell:

```powershell
Set-Location 'C:\Users\Usuario\Desktop\Proyecto EAFIT\Star-blue\Front End\mi_frontend'
npm.cmd ci
npm.cmd run dev
```

Vite muestra en la terminal la dirección local de desarrollo. Comprobaciones:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

No hay un script `test` ni una suite automatizada configurada. En la
verificación del módulo DEMO, `npm.cmd run typecheck` terminó correctamente y
`npm.cmd run build` compiló correctamente 61 módulos. También pasaron siete
casos del patrón de validación de correo (dos válidos y cinco inválidos).
Las pruebas manuales de interfaz del frontend existente fueron reportadas como
satisfactorias por el equipo.

La verificación manual en navegador del flujo mensual comprobó selección y
vista previa, combinación sin reporte, validación de selección, borrador e
historial persistentes tras recargar, rechazo bloqueante, aprobación habilitante,
resultados simulados exitoso y fallido, reintento tras fallo, filtros sin
coincidencias, recuperación con filtros limpios, rutas heredadas y diseño móvil
sin desbordamiento horizontal. También se comprobó que los errores de lectura y
escritura del almacenamiento muestran error sin falso mensaje de éxito. No se
observaron solicitudes externas durante las interacciones ni envíos reales.

El build genera `dist/` y metadatos de TypeScript bajo `node_modules/.tmp/`;
ambos son artefactos locales ignorados por Git. `npm.cmd ci` reinstala
dependencias a partir del lockfile. No se requiere ni se debe añadir un archivo
`.env` real: `.env.example` contiene `VITE_API_BASE_URL` vacía y actualmente no
se consume.

## Integraciones que faltan

El frontend no consume una API, no implementa autenticación ni identidad de
empleado, no tiene persistencia central y no se conecta directamente a
PostgreSQL. Tampoco implementa envío real de correo o mensajería. Los servicios
actuales leen datos DEMO locales.

Los períodos, reportes y métricas mensuales son fixtures estáticos. Las
decisiones, eventos y resultados de envío de ese módulo se guardan solo en el
navegador; no hay sincronización, aprobación funcional, auditoría central ni
integración con el sistema de proveedores de HACEB.

Backend, frontend e identidad deben confirmar antes de implementar cualquier
integración: contratos y modelos de API, autorización y roles, fuente oficial
de proveedores, persistencia y versionado de plantillas, estados y eventos,
permisos para preparar o autorizar comunicaciones, tratamiento de errores,
idempotencia, seguridad y privacidad. No hay endpoints confirmados ni
consumidos por esta entrega. `VITE_API_BASE_URL` vacía no establece una
conexión. No introducir secretos en variables `VITE_*`.

Para reportes mensuales también deben validarse externamente la fuente,
definición y fórmula de cada indicador, los períodos, los actores y permisos de
aprobación/rechazo, y el canal y significado de cualquier envío productivo. Esta
entrega no decide esos puntos.

## Recuperar la rama desde el bundle en otro computador

Copie `Star-blue-frontend.bundle` al Escritorio del otro computador. En
PowerShell, clone la rama y compruebe el commit:

```powershell
$bundle = "$env:USERPROFILE\Desktop\Star-blue-frontend.bundle"
git clone --branch frontend/proyecto $bundle Star-blue
git -C .\Star-blue bundle verify $bundle
git -C .\Star-blue rev-parse frontend/proyecto
git -C .\Star-blue status -sb
```

`rev-parse` debe mostrar
`ac7232b5b620a03a58d141b4bb3a371056ca6d4f`. Después instale y ejecute:

```powershell
Set-Location '.\Star-blue\Front End\mi_frontend'
npm.cmd ci
npm.cmd run dev
```

Copie también este documento por separado: no está dentro del bundle porque no
se creó un commit adicional. El documento de coordinación excluido no forma
parte de la entrega.
