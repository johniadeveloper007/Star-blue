# Versión de prueba de proveedores

Este directorio contiene datos locales generados para pruebas.

Ejemplo:

```powershell
& .\.venv\Scripts\python.exe "Base de datos\demo_create_suppliers.py" \
  "correo1@example.com" "correo2@example.com" --count 2
```

La base SQLite y el CSV local se excluyen de Git porque pueden contener direcciones de contacto.
No hay envío de correos ni modificación de proveedores reales.
