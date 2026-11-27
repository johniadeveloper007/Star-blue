# Sistema visual y componentes

## Alcance

Este inventario describe elementos observables en el frontend actual. No es una
guía de marca aprobada por HACEB ni afirma que el diseño haya sido validado por
usuarios. Las recomendaciones se etiquetan como propuestas para no confundirlas
con decisiones existentes.

## Identidad visual observada

En `Front End/mi_frontend/src/styles/global.css` se observa:

- Tipografía principal `"Segoe UI", system-ui, sans-serif`.
- Fondo general claro, con superficies blancas y una paleta verde oscura con
  acentos verde lima.
- Variables CSS actuales:

| Variable | Valor observado |
|---|---|
| `--ink` | `#17231e` |
| `--muted` | `#79857e` |
| `--line` | `#e7ebe5` |
| `--lime` | `#c3f56a` |
| `--lime-strong` | `#a9e84b` |
| `--deep` | `#111b17` |
| `--surface` | `#ffffff` |

- Barra lateral oscura fija, con marca textual, navegación, indicador de
  selección y elementos de estado.
- Áreas de contenido claras, tarjetas, bordes suaves, sombras discretas,
  botones, campos y tablas.
- El código usa gradientes y detalles decorativos junto con el color de acento.

Estos datos describen el CSS actual; no confirman paleta, tipografía o uso de
marca oficiales.

## Componentes observables

- **Estructura y navegación:** `Sidebar`, `TopBar` y contenedor principal.
- **Feedback global:** aviso tipo toast con rol de estado y cierre.
- **Dashboard:** tarjetas de indicadores DEMO, accesos, actividad y gráfico
  ilustrativo.
- **Proveedores:** controles de búsqueda/filtro, tabla y ficha con datos DEMO.
- **Composición:** selectores, campos editables, errores de validación, vista
  previa y confirmación de preparación local.
- **Plantillas:** controles de búsqueda/filtro, tarjetas o listado, editor,
  vista previa y diálogos de confirmación.
- **Seguimiento:** indicadores del historial, filtros, tabla/listado, detalle y
  cronología.
- **Elementos transversales:** iconos SVG, avatares decorativos, etiquetas de
  estado, botones y campos.

Los contenidos, registros, métricas y eventos de ejemplo deben tratarse como
DEMO. La interfaz actual no confirma envío real ni entrega de comunicaciones.

## Accesibilidad: observaciones y propuestas

### Observado

- Hay estilos de foco visible para controles interactivos.
- Varias pantallas usan nombres accesibles, etiquetas de regiones y anuncios de
  error o estado.
- El CSS incluye una preferencia `prefers-reduced-motion`.
- La implementación no documenta una auditoría de conformidad ni un nivel WCAG
  aprobado.

### Propuestas para validar

- Acordar con HACEB el estándar y los criterios de aceptación de accesibilidad.
- Revisar operación completa por teclado: orden, foco inicial, cierre de
  diálogos, retorno del foco y ausencia de trampas.
- Verificar contraste de texto, controles, estados y foco; no comunicar
  información solo mediante color.
- Comprobar nombres, instrucciones y errores de formularios con lector de
  pantalla, incluidos los campos inválidos.
- Verificar semántica de encabezados, tablas, botones e iconos, y revisar zoom y
  ampliación de texto.
- Confirmar que los mensajes de carga, error y éxito sean perceptibles y no
  anuncien una operación como enviada si solo fue preparada.

## Diseño responsive: observaciones y propuestas

### Observado

- La hoja de estilos contiene media queries en varios anchos, incluidos
  `1180px`, `960px`, `760px` y `520px`.
- El documento establece un ancho mínimo de `320px`.
- Hay reglas para reducir movimiento.

La existencia de breakpoints no demuestra que todos los recorridos funcionen
bien en todos los dispositivos.

### Propuestas para validar

- Probar, con HACEB, los anchos y dispositivos objetivo, incluyendo 320px,
  teléfono, tablet y escritorio.
- Revisar que navegación, filtros, formularios, tablas y diálogos sigan siendo
  utilizables sin pérdida de contenido ni desplazamiento inesperado.
- Validar objetivos táctiles, reflujo, zoom y orientación según las necesidades
  de uso acordadas.
- Registrar hallazgos con pantalla, tamaño, pasos para reproducir y resultado
  esperado, sin cambiar el frontend como parte de esta entrega documental.

## Recomendaciones de consistencia

Estas son recomendaciones, no requisitos aprobados:

1. Mantener una jerarquía uniforme de títulos, texto auxiliar, acciones
   primarias y secundarias.
2. Usar estados visuales y texto explícito para diferenciar datos DEMO,
   preparación local, aprobación y resultados externos futuros.
3. Documentar componentes reutilizables y sus estados una vez validados con el
   equipo.
4. No presentar paleta o estilo actual como identidad corporativa definitiva
   hasta su confirmación.

## Fuentes

- [Hoja de estilos actual](<../Front End/mi_frontend/src/styles/global.css>)
- [Componentes compartidos](<../Front End/mi_frontend/src/components/Sidebar.tsx>),
  [barra superior](<../Front End/mi_frontend/src/components/TopBar.tsx>) e
  [iconos](<../Front End/mi_frontend/src/components/Icon.tsx>)
- [Guía y limitaciones del frontend](<../Front End/mi_frontend/README.md>)
