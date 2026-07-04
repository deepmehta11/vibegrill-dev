from sales import parse_rows, total_by_region, top_products


def test_parse_skips_header_and_blanks():
    text = "product,amount,region\nWidget,100,North\n\nGadget,50,South\n"
    rows = parse_rows(text)
    assert rows == [
        {"product": "Widget", "amount": 100, "region": "North"},
        {"product": "Gadget", "amount": 50, "region": "South"},
    ]


def test_parse_float_amounts():
    rows = parse_rows("Widget,10.5,North")
    assert rows == [{"product": "Widget", "amount": 10.5, "region": "North"}]


def test_total_by_region_empty():
    assert total_by_region([]) == {}


def test_total_by_region_mixed_numeric():
    rows = parse_rows("Widget,10.5,North\nGadget,4,North")
    assert total_by_region(rows) == {"North": 14.5}


def test_top_products_tie_breaks_by_name():
    rows = parse_rows("Beta,50,X\nAlpha,50,X\nGamma,30,X")
    assert top_products(rows, 2) == [("Alpha", 50), ("Beta", 50)]


def test_top_products_n_larger_than_products():
    rows = parse_rows("Widget,100,North\nGadget,50,South")
    assert top_products(rows, 5) == [("Widget", 100), ("Gadget", 50)]


def test_top_products_sums_duplicates():
    rows = parse_rows("Widget,10,North\nWidget,5,South\nGadget,40,North")
    assert top_products(rows, 1) == [("Gadget", 40)]
