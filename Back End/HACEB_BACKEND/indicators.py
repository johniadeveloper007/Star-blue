"""Motor de indicadores HACEB. No gestiona HTTP, persistencia ni correos."""
import csv
import io

REQUIRED_COLUMNS = {
    "supplier_id", "supplier_name", "supplier_email", "order_id",
    "item_id", "required_quantity", "delivered_on_time"
}

class IndicatorError(ValueError):
    def __init__(self, code, message, status_code=400):
        self.code, self.message, self.status_code = code, message, status_code
        super().__init__(f"{code}: {message}")

def error(code, message, status=400):
    raise IndicatorError(code, message, status)

def parse_and_calculate(content: bytes):
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        error("INVALID_ENCODING", "El CSV debe estar codificado en UTF-8.")
    reader = csv.DictReader(io.StringIO(text))
    missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
    if missing:
        error("MISSING_COLUMNS", "Faltan columnas: " + ", ".join(sorted(missing)))
    suppliers = {}
    seen = set()
    row_count = 0
    for row_no, row in enumerate(reader, start=2):
        row_count += 1
        vals = {k:(row.get(k) or "").strip() for k in REQUIRED_COLUMNS}
        if not all(vals[k] for k in ("supplier_id","supplier_name","supplier_email","order_id","item_id")):
            error("EMPTY_REQUIRED_FIELD", f"Hay un campo obligatorio vacío en la fila {row_no}.")
        try:
            required = float(vals["required_quantity"])
            delivered = float(vals["delivered_on_time"])
        except ValueError:
            error("INVALID_QUANTITY", f"Cantidad inválida en la fila {row_no}.")
        if required <= 0 or delivered < 0 or delivered > required:
            error("INVALID_QUANTITY_RANGE", f"Cantidad fuera de rango en la fila {row_no}.")
        key = (vals["supplier_id"], vals["order_id"], vals["item_id"])
        if key in seen:
            error("DUPLICATE_LINE", f"Línea duplicada en la fila {row_no}.", 409)
        seen.add(key)
        s = suppliers.setdefault(vals["supplier_id"], {
            "supplier_id":vals["supplier_id"],"supplier_name":vals["supplier_name"],
            "supplier_email":vals["supplier_email"],"orders":{}, "line_count":0
        })
        if s["supplier_name"] != vals["supplier_name"] or s["supplier_email"] != vals["supplier_email"]:
            error("INCONSISTENT_SUPPLIER", f"Datos inconsistentes para {vals['supplier_id']}.")
        # Replica la lógica del archivo inicial de Pedro, pero NO está certificada por HACEB.
        in_full = delivered / required * 100
        on_time = 100.0 if delivered == required else 0.0
        otif = (in_full + on_time) / 2
        order = s["orders"].setdefault(vals["order_id"], {"lines":[], "in_full":[], "on_time":[], "otif":[]})
        order["lines"].append({"item_id":vals["item_id"],"required_quantity":required,
                               "delivered_on_time":delivered,"in_full_pct":round(in_full,2),
                               "on_time_pct":round(on_time,2),"otif_pct":round(otif,2)})
        order["in_full"].append(in_full); order["on_time"].append(on_time); order["otif"].append(otif)
        s["line_count"] += 1
    if not row_count:
        error("EMPTY_CSV", "El CSV no contiene registros.")
    output = []
    for s in suppliers.values():
        orders_out = []
        for oid, o in s["orders"].items():
            avg = lambda xs: round(sum(xs)/len(xs), 2)
            orders_out.append({"order_id":oid,"line_count":len(o["lines"]),
                               "in_full_pct":avg(o["in_full"]),"on_time_pct":avg(o["on_time"]),
                               "otif_pct":avg(o["otif"]),"lines":o["lines"]})
        avg = lambda xs: round(sum(xs)/len(xs), 2)
        output.append({"supplier_id":s["supplier_id"],"supplier_name":s["supplier_name"],
                       "supplier_email":s["supplier_email"],"order_count":len(orders_out),
                       "line_count":s["line_count"],
                       "in_full_pct":avg([o["in_full_pct"] for o in orders_out]),
                       "on_time_pct":avg([o["on_time_pct"] for o in orders_out]),
                       "otif_pct":avg([o["otif_pct"] for o in orders_out]),
                       "orders":orders_out})
    return output, row_count

