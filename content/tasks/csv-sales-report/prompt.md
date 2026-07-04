# CSV Sales Report

You are working on `sales.py`, a tiny library that turns lines of sales data into simple reports. Each data line looks like:

```
product,amount,region
```

`parse_rows(text)` already works: it turns the text into a list of dicts like `{"product": "Widget", "amount": 100, "region": "North"}`, parsing `amount` as an `int` when it has no decimal point and a `float` when it does. It skips blank lines and skips a leading header line that is exactly `product,amount,region`.

Running the demo shows something is wrong:

```
$ python main.py
Rows parsed: 4
Totals by region:
  North: 50
  South: 20
```

North should be `150` (100 + 50), not `50`.

## Part 1 — Fix the bug

`total_by_region(rows)` is supposed to return a dict mapping each region to the **sum** of the `amount` values for that region. Right now it **overwrites** the running value for a region on every row, so each region only reflects its **last** row. Fix it so amounts accumulate.

Example:

```python
rows = parse_rows("Widget,100,North\nGadget,50,North\nGizmo,20,South")
total_by_region(rows) == {"North": 150, "South": 20}
```

`total_by_region([])` must return `{}`.

## Part 2 — Add a feature: `top_products(rows, n)`

Add a new function `top_products(rows, n)` that returns the `n` products with the highest total amount.

Rules:
- Sum amounts across duplicate product names (the same product can appear in multiple rows/regions).
- Return a list of `(product, total)` tuples.
- Sort by **total descending**, and break ties by **product name ascending** (alphabetical).
- Return at most `n` tuples. If there are fewer than `n` distinct products, return all of them.

Example:

```python
rows = parse_rows("Widget,100,North\nWidget,75,South\nGadget,50,North")
top_products(rows, 2) == [("Widget", 175), ("Gadget", 50)]
```

Tie-break example (equal totals sort alphabetically):

```python
rows = parse_rows("Beta,50,X\nAlpha,50,X\nGamma,30,X")
top_products(rows, 2) == [("Alpha", 50), ("Beta", 50)]
```

Do not change the behavior of `parse_rows`. Keep everything pure standard library.
