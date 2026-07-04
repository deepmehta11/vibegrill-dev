from sales import parse_rows, total_by_region, top_products


def test_parse_rows_basic():
    rows = parse_rows("Widget,100,North\nGadget,50,South")
    assert rows == [
        {"product": "Widget", "amount": 100, "region": "North"},
        {"product": "Gadget", "amount": 50, "region": "South"},
    ]


def test_total_by_region_accumulates():
    rows = parse_rows("Widget,100,North\nGadget,50,North")
    assert total_by_region(rows) == {"North": 150}


def test_total_by_region_multiple():
    rows = parse_rows("Widget,100,North\nGadget,50,North\nGizmo,20,South")
    assert total_by_region(rows) == {"North": 150, "South": 20}


def test_top_products_basic():
    rows = parse_rows("Widget,100,North\nWidget,75,South\nGadget,50,North")
    assert top_products(rows, 2) == [("Widget", 175), ("Gadget", 50)]
