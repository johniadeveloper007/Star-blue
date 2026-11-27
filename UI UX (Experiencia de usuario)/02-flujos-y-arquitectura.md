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

## Estados observables y necesidades futuras

Algunos mensajes y estados ya existen en módulos concretos. Su presencia no
significa que estén estandarizados, que cubran todos los casos ni que todos los
módulos tengan los mismos estados.

| Estado o comportamiento | Presencia actual | Necesidad futura propuesta |
|---|---|---|
| Vacío / sin coincidencias | El directorio muestra un mensaje cuando no hay proveedores que coincidan. Seguimiento muestra “Sin coincidencias” cuando no hay comunicaciones para los filtros. El selector de proveedores del compositor también informa cuando la búsqueda no encuentra opciones DEMO. | Revisar y acordar mensajes y acciones para distinguir, donde corresponda, entre catálogo vacío, búsqueda sin coincidencias y datos temporalmente no disponibles. |
| Validación | Composición muestra errores de campos; la edición de plantillas valida campos obligatorios y muestra errores. | Revisar consistencia, claridad, asociación con campos y conservación del contexto en cada flujo. |
| Error | Composición puede informar un fallo al preparar localmente; plantillas informan errores de persistencia local; seguimiento puede mostrar un error al leer su historial. | Definir mensajes y acciones por tipo de error. Los errores de servicios remotos solo se diseñarán cuando exista una integración aprobada. |
| Carga | No se identificó un estado de carga dedicado para una consulta remota; actualmente los servicios descritos son locales DEMO. | Diseñar retroalimentación de carga para operaciones futuras solo si una integración real la requiere y se acuerdan sus tiempos y comportamiento. |
| Borrador | El seguimiento puede mostrar registros DEMO con estado de borrador. La preparación desde el compositor guarda un registro local con estado `prepared`; no se identificó un flujo de borrador editable y persistente desde el compositor. | Acordar qué significa un borrador, dónde se guarda, quién puede verlo y si puede editarse. |
| Aprobación | No se identificó un flujo de aprobación en la interfaz actual. | Acordar actor, permisos, significado y transiciones antes de representarlo. |
| Envío | No hay envío real. Los estados de envío de registros de ejemplo son simulados; preparar una comunicación no la transmite. | Diseñar solo después de confirmar canal, proveedor y respuesta verificable; diferenciar envío aceptado de entrega o lectura. |
| Fallo de envío | Los registros `failed` son ejemplos DEMO, no fallos informados por un proveedor de correo o mensajería. | Acordar información visible, reintentos, cancelación e idempotencia con los responsables técnicos y de canal. |

No se identificó un estado de carga dedicado ni una cobertura uniforme de los
estados de vacío, error o validación en todas las pantallas. Las propuestas
anteriores no describen capacidades actuales.

## Arquitectura observable de la experiencia

```text
Aplicación React y rutas
├── Navegación compartida: Sidebar, TopBar e iconos
├── Pantallas: dashboard, proveedores, composición, plantillas y seguimiento
├── Servicios locales: acceso a datos DEMO
├── Fixtures: proveedores, plantillas e historial de ejemplo
└── localStorage: plantillas e historial de preparaciones DEMO
```

### Límites de integración y coordinación

- El frontend actual usa datos y persistencia local DEMO; no consume una API ni
  se conecta directamente a PostgreSQL. La existencia de una variable de URL
  de API no confirma una integración.
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
- [Entrega funcional del frontend](<../Front End/mi_frontend/ENTREGA_FRONTEND.md>)
- [Guía del frontend](<../Front End/mi_frontend/README.md>)
