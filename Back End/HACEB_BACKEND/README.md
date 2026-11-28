# Backend HACEB – motor de indicadores

Lógica de negocio para leer CSV, validar filas y calcular indicadores agrupados por proveedor/orden. No contiene FastAPI, rutas HTTP, persistencia ni envío de correos.

Uso desde la raíz del proyecto:
```python
from backend.indicators import parse_and_calculate
resultados, cantidad_filas = parse_and_calculate(open("datos.csv", "rb").read())
```

Columnas CSV: `supplier_id,supplier_name,supplier_email,order_id,item_id,required_quantity,delivered_on_time`.

**Advertencia:** fórmulas provisionales heredadas del backend inicial de Pedro; deben validarse contra el modelo Power BI y la metodología oficial de HACEB.
