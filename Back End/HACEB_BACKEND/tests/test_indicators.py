import pytest

from indicators import IndicatorError, parse_and_calculate


@pytest.mark.parametrize("quantity", ["nan", "inf", "-inf"])
@pytest.mark.parametrize("column", ["required_quantity", "delivered_on_time"])
def test_non_finite_quantities_are_rejected(quantity, column):
    values = {
        "supplier_id": "S1",
        "supplier_name": "Supplier",
        "supplier_email": "supplier@example.com",
        "order_id": "O1",
        "item_id": "I1",
        "required_quantity": "10",
        "delivered_on_time": "10",
    }
    values[column] = quantity
    content = (
        "supplier_id,supplier_name,supplier_email,order_id,item_id,"
        "required_quantity,delivered_on_time\n"
        + ",".join(values.values())
        + "\n"
    ).encode()

    with pytest.raises(IndicatorError) as exc_info:
        parse_and_calculate(content)

    assert exc_info.value.code == "INVALID_QUANTITY"
