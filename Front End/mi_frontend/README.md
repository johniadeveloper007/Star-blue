# HACEB FUTURE — Frontend

Aplicación construida con React, Vite y TypeScript. La interfaz mantiene el
lenguaje visual HACEB FUTURE y funciona actualmente con datos de demostración.

## Requisitos

Se requiere Node.js y npm en versiones compatibles con Vite 7. El repositorio
incluye `package-lock.json`; para una instalación reproducible se recomienda
usar `npm ci`.

## Instalar y ejecutar

Desde esta carpeta (`Front End/mi_frontend/`), en PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Vite muestra en la terminal la dirección local de desarrollo. Para comprobar
tipos y construir la aplicación:

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Para servir localmente una compilación existente:

```powershell
npm.cmd run preview
```

## Pantallas y rutas

- **Dashboard:** `/` — indicadores y actividad ilustrativos DEMO.
- **Proveedores:** `/proveedores` — directorio con búsqueda y filtros locales.
- **Detalle de proveedor:** `/proveedores/:supplierId` — información y contactos
  disponibles en los datos DEMO.
- **Composición:** `/comunicaciones/nueva` — selección de proveedor y plantilla,
  edición, vista previa y preparación DEMO. Puede recibir `?proveedor=` y
  `?plantilla=`.
- **Biblioteca de plantillas:** `/plantillas` — búsqueda, filtros, vista previa
  y administración local DEMO.
- **Seguimiento:** `/seguimiento` y `/seguimiento/:communicationId` — historial,
  filtros, detalle y línea de tiempo DEMO.

## Funcionalidades y datos DEMO

Las cifras del dashboard, proveedores, plantillas, estados y eventos de
seguimiento son demostrativos. Los registros de proveedores están en
`src/data/demo/suppliers.ts`; son ficticios y no representan empresas reales.
La capa `src/services/supplierService.ts` consulta esa colección local.

El directorio busca por nombre, NIT, código o correo y filtra por estado,
categoría y tipo. La ficha muestra los datos disponibles y permite abrir el
compositor conservando el proveedor seleccionado.

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
seguimiento; las métricas del dashboard, en cambio, son ejemplos ilustrativos
independientes.

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

Todavía **no hay integración real con una API, autenticación, usuario empleado,
servicio de correo ni otros canales**. El frontend no se conecta directamente a
PostgreSQL. Los servicios bajo `src/services/` acceden a datos DEMO locales y no
implementan consumo HTTP.

`.env.example` contiene `VITE_API_BASE_URL=` como variable de preparación. Está
vacía y no se consume actualmente; definirla no implica que exista un backend,
un contrato confirmado ni una conexión activa. No guardar credenciales ni
secretos en variables `VITE_*`, porque se exponen al código del navegador.

## Organización

- `src/app/`: composición de la aplicación y rutas.
- `src/components/`: navegación, encabezado e iconos SVG reutilizables.
- `src/features/`: pantallas de dashboard, proveedores, composición, plantillas
  y seguimiento.
- `src/services/`: acceso local DEMO; no es una integración HTTP.
- `src/data/demo/`: fixtures de proveedores, plantillas y comunicaciones.
- `src/types/`: modelos TypeScript del frontend.
- `src/styles/`: sistema visual y estilos responsive.
- `src/assets/`: recursos locales.
- `tests/`: reservado para pruebas; actualmente no hay un conjunto automatizado
  configurado.

Los iconos son SVG incluidos en el código; el proyecto no requiere dependencias
adicionales para ellos.
