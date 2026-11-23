# Entrega para Ribe, Pedro, Juan se y frontend

## Qué construyó Perseo

La capa de datos está preparada para el reto de automatizar el reporte mensual de indicadores OTIF por proveedor. Incluye PostgreSQL, modelos Python/SQLAlchemy, migración Alembic inicial, importador transaccional, controles de duplicidad, revisiones históricas, bitácora y registro de entregas.

### Tablas principales

- `suppliers`, `supplier_contacts`: catálogo y destinatarios (separados por privacidad).
- `reporting_periods`, `metric_definitions`: periodos y catálogo de indicadores (`overall_compliance`, `on_time`, `in_full`).
- `import_batches`: seguimiento e idempotencia SHA-256.
- `supplier_reports`, `report_revisions`, `report_metrics`: resultados por proveedor/mes con historial de correcciones.
- `report_deliveries`: estado y cada intento de entrega por revisión, con idempotencia.
- `audit_events`: trazabilidad de importaciones y revisiones.

## Contrato de integración

Importador: `perseo_db.importer.import_monthly_reports`. Recibe una sesión-fábrica y registros `MonthlyReportInput`. El contrato exige código estable de proveedor, nombre legal, fecha inicial del mes, métricas en rango 0–100 y versión de metodología. El importador no lee el PBIX ni envía correos; el equipo que conecte Power BI debe mapear los campos al contrato después de validar la fuente.

La consulta para mostrar un reporte debe seleccionar la revisión que corresponda al proveedor y periodo, y luego sus métricas. Para evitar envíos duplicados, cada solicitud de envío debe crear una clave de idempotencia estable en `report_deliveries`; cada reintento incrementa `attempt_no`.

## Para ejecutar

1. Configurar `DATABASE_URL` con una instancia PostgreSQL aprobada.
2. Ejecutar `alembic upgrade head`.
3. Comprobar conexión con `perseo-db check`.
4. Ejecutar `pytest`.
5. Confirmar el esquema real del PBIX, las reglas OTIF y autorización para manejar datos antes de importar información real.

La temperatura solicitada para el agente Perseo es 0.2; es una configuración del agente/modelo, no de PostgreSQL ni del código de base de datos. Playwright queda para E2E de navegador cuando exista frontend; la validación de esta capa se hace con pytest y PostgreSQL de integración.

