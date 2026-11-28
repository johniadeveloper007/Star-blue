# HACEB FUTURE — Frontend

Aplicación construida con React, Vite y TypeScript. El dashboard (indicadores)
y el directorio de proveedores consultan en modo de solo lectura los datos
importados desde Power BI mediante la API local de Perseo. Comunicaciones,
plantillas, seguimiento y los flujos de reportes continúan en DEMO.

## Requisitos

Se requiere Node.js y npm en versiones compatibles con Vite 7. El repositorio
incluye `package-lock.json`; para una instalación reproducible se recomienda
usar `npm ci`.

## Instalar y ejecutar

La integración utiliza dos terminales de PowerShell desde la raíz del
repositorio.

En la primera terminal, instala y ejecuta la API:

```powershell
py -m pip install -e ".[api,test]"
py "Back End\HACEB_BACKEND\run_api.py"
```

La API escucha únicamente en `127.0.0.1:8000` y utiliza por defecto
`Base de datos/powerbi_perseo.db`. Si la base está en otra ubicación, configura
`DATABASE_URL` antes de iniciar la API. Comprueba que responde en
`http://127.0.0.1:8000/api/v1/health`.

En la segunda terminal, desde `Front End/mi_frontend/`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Vite muestra la dirección local en la terminal y reenvía `/api` a la API
anterior. Para comprobar tipos y construir la aplicación:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Para servir localmente una compilación existente:

```powershell
npm.cmd run preview
```

## Pantallas y rutas

- **Dashboard:** `/` — indicadores actuales de proveedores y reportes del PBIX;
  la actividad semanal y las comunicaciones de ejemplo siguen en DEMO.
- **Proveedores:** `/proveedores` — directorio PBIX con búsqueda, estado y
  paginación.
- **Detalle de proveedor:** `/proveedores/:supplierId` — identificador e
  historial de indicadores mensuales PBIX.
- **Composición:** `/comunicaciones/nueva` — selección de proveedor y plantilla,
  edición, vista previa y preparación DEMO. Puede recibir `?proveedor=` y
  `?plantilla=`.
- **Biblioteca de plantillas:** `/plantillas` — búsqueda, filtros, vista previa
  y administración local DEMO.
- **Seguimiento:** `/seguimiento` y `/seguimiento/:communicationId` — historial,
  filtros, detalle y línea de tiempo DEMO.

## Funcionalidades y datos DEMO

El directorio consulta proveedores reales, permite buscar por nombre o código
y filtrar por estado. La ficha muestra el historial mensual importado. La base
no contiene correos ni teléfonos de contacto, por lo que la interfaz no inventa
contactos ni permite iniciar comunicaciones reales desde la ficha.

El compositor permite elegir un proveedor y un canal visual (correo o mensaje),
cargar plantillas DEMO, editar asunto y contenido, revisar la vista previa y
preparar una comunicación. **No envía correos ni mensajes**, no realiza llamadas
externas ni confirma entrega o recepción. Los estados “enviado” y “fallido” del
historial son únicamente eventos DEMO simulados.

Las plantillas de ejemplo se encuentran en
`src/data/demo/communicationTemplates.ts`. La biblioteca permite crear, editar,
duplicar, previsualizar y eliminar plantillas. Sus categorías incluyen
solicitudes de información, seguimiento de pedidos, confirmaciones de entrega,
novedades, cartera, reclamaciones y comunicaciones generales. Las variables de
ejemplo incluyen `{{nombre_proveedor}}`, `{{empresa}}`, `{{nit}}`, `{{fecha}}` y
`{{nombre_empleado}}`. No son plantillas oficiales.

El historial combina ejemplos ficticios con preparaciones DEMO creadas desde el
compositor. Sus indicadores se calculan a partir de los registros del
seguimiento; son independientes de los indicadores reales importados al
dashboard.

## Persistencia DEMO y limitaciones

Las plantillas creadas o modificadas se guardan en `localStorage` del navegador,
bajo la clave `haceb-future.communication-templates.demo`. El historial se
guarda bajo `haceb-future.communication-history.demo`. Si no existe historial
local, se muestran registros de ejemplo. Esta persistencia es local al navegador
y origen: no sincroniza entre empleados, dispositivos o navegadores, puede ser
borrada por el usuario y no es una copia de seguridad.

`localStorage` no es adecuado para secretos ni contenido sensible: los datos se
guardan en el navegador y no cuentan con control de acceso de servidor. Los
cambios locales no constituyen persistencia backend. En particular, el servicio
de plantillas trata el almacenamiento como opcional; una escritura bloqueada
por el navegador puede no conservar los cambios tras recargar.

## Integraciones y límites actuales

La API local de Perseo ofrece endpoints GET para el resumen del dashboard, el
directorio, el detalle y los reportes mensuales. El frontend la consulta por el
proxy `/api` de Vite (`VITE_API_BASE_URL=/api/v1`). La API no expone operaciones
de escritura ni contactos personales y no debe publicarse sin añadir controles
de autenticación y autorización. Las comunicaciones y otros canales no están
conectados y no se envían correos ni mensajes.

No guardar credenciales ni secretos en variables `VITE_*`, porque se exponen al
código del navegador.

## Organización

- `src/app/`: composición de la aplicación y rutas.
- `src/components/`: navegación, encabezado e iconos SVG reutilizables.
- `src/features/`: pantallas de dashboard, proveedores, composición, plantillas
  y seguimiento.
- `src/services/`: cliente HTTP de Perseo y servicios DEMO que aún no se migran.
- `src/data/demo/`: fixtures de proveedores, plantillas y comunicaciones.
- `src/types/`: modelos TypeScript del frontend.
- `src/styles/`: sistema visual y estilos responsive.
- `src/assets/`: recursos locales.
- `tests/`: no hay pruebas automatizadas propias del frontend configuradas.

Los iconos son SVG incluidos en el código; el proyecto no requiere dependencias
adicionales para ellos.
