# Star-blue

Proyecto EstudIA Eafit

# Perseo — base de datos de indicadores de proveedores

Perseo implementa la capa de datos para los reportes mensuales de servicio a proveedores nacionales. La solución usa PostgreSQL en producción y Python con SQLAlchemy/Alembic. No incluye interfaz de usuario ni envío de correo.

## Alcance implementado

- Catálogo de proveedores y contactos separados para limitar el acceso a correos personales.
- Periodos mensuales, métricas OTIF y sus definiciones iniciales.
- Importaciones identificadas por SHA-256 para rechazar la repetición del mismo archivo.
- Reportes por proveedor/mes con revisiones inmutables: una corrección genera una nueva revisión, no pisa la ya publicada.
- Métricas porcentuales con validación de rango y restricciones de unicidad.
- Registro de intentos de entrega con clave de idempotencia, destinatario snapshot y estado.
- Bitácora de eventos de importación y creación de revisiones sin copiar valores personales.
- Migración versionada, roles iniciales de aplicación/migración, comando de salud y pruebas unitarias.

## Configuración y ejecución

Requiere Python 3.11+ y PostgreSQL 14+.

```powershell
Copy-Item .env.example .env
# Edita .env con el URL de una base local. Nunca uses credenciales reales en Git.
.\.venv\Scripts\python.exe -m pip install -e ".[test]"
.\.venv\Scripts\alembic.exe upgrade head
.\.venv\Scripts\perseo-db.exe check
.\.venv\Scripts\pytest.exe
```

También se puede usar `alembic upgrade head` y `perseo-db check` desde un entorno virtual activado. `DATABASE_URL` debe apuntar a PostgreSQL (`postgresql+psycopg://...`). Sin esa variable, la aplicación falla explícitamente; no hay una base temporal o credencial predeterminada.

## Importación desde Power BI

`perseo_db.importer.import_monthly_reports` recibe registros normalizados, no interpreta directamente un PBIX. El contrato de integración es `MonthlyReportInput`: código y nombre de proveedor, primer día del periodo, mapa `{codigo_metrica: valor}`, versión de metodología y etiqueta opcional del resultado. Las definiciones iniciales son `overall_compliance`, `on_time` e `in_full`; se insertan con la migración.

Antes de conectar el origen real, hay que confirmar columnas, claves, definición exacta de porcentajes y etiqueta de cumplimiento en el PBIX y en el procedimiento operativo. El importador conserva los valores calculados por la fuente; no recalcula OTIF ni asume umbrales.

La función de importación es dueña de sus transacciones. El checksum es único, y cualquier error durante el proceso deja el lote marcado como fallido, revierte todos los registros del lote y vuelve a propagar el error.

## Operación y seguridad

- Mantener `perseo_app` sin privilegios de migración y `perseo_migrator` separado. Ejecutar `ops/roles.sql` con una cuenta administradora; la asignación de `LOGIN` y contraseñas corresponde al gestor corporativo de secretos.
- Limitar acceso a `supplier_contacts` y `report_deliveries`: contienen correos. No almacenar cuerpos de correo, adjuntos ni datos de personas de contacto no necesarios.
- La cuenta de aplicación solo puede consultar/insertar la bitácora; las modificaciones y borrados de bitácora no se conceden.
- Ejecutar respaldo cifrado y con retención acorde con la política organizacional. Ejemplo manual:

```powershell
pg_dump --format=custom --no-owner --file="$env:TEMP\perseo.dump" "$env:PERSEO_ADMIN_DATABASE_URL"
```

- Probar restauraciones periódicamente en una base separada antes de un corte. No restaurar sobre producción como prueba.
- Supervisar conexiones, espacio, latencia, lotes fallidos y entregas pendientes/fallidas. Configurar alta disponibilidad y recuperación en la plataforma PostgreSQL elegida; el código no puede habilitar esas garantías por sí solo.

## Pruebas

Las pruebas unitarias usan SQLite en memoria para validar reglas del modelo y del importador. La migración de producción debe validarse adicionalmente en un PostgreSQL de integración antes de desplegar. Playwright no se incluye aquí: no hay interfaz de navegador en esta entrega; podrá usarse en pruebas E2E cuando el frontend del equipo esté disponible.
