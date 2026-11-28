# API de Perseo

API local de solo lectura para consultar los indicadores mensuales de
proveedores guardados en la base Perseo.

## Endpoints

- `GET /api/v1/health`: comprueba que la API puede consultar la base.
- `GET /api/v1/dashboard/summary`: conteos y promedios del período más reciente.
- `GET /api/v1/suppliers`: directorio con búsqueda, estado y paginación.
- `GET /api/v1/suppliers/{supplier_code}`: datos del proveedor.
- `GET /api/v1/suppliers/{supplier_code}/reports`: reportes por período usando
  la revisión más reciente.

La API no expone contactos, no modifica registros ni envía comunicaciones.

## Ejecución local

Desde la raíz del repositorio, en PowerShell:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".[api,test]"
.\.venv\Scripts\python.exe "Back End\HACEB_BACKEND\run_api.py"
```

`run_api.py` utiliza por defecto `Base de datos/powerbi_perseo.db` y enlaza
únicamente en `127.0.0.1:8000`. Puedes sobrescribir la conexión con
`DATABASE_URL`. `CORS_ORIGINS` permite configurar los orígenes autorizados.

Comprueba `http://127.0.0.1:8000/api/v1/health`. La documentación interactiva
OpenAPI está en `http://127.0.0.1:8000/docs`.

La API está diseñada para desarrollo local; no la expongas a una red pública sin
autenticación y autorización.
