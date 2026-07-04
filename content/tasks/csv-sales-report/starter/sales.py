"""A tiny sales-report library."""


def parse_rows(text):
    """Parse CSV-ish text into a list of row dicts.

    Each non-empty line is "product,amount,region". amount is parsed as an
    int when it has no decimal point, otherwise as a float. A leading header
    line "product,amount,region" is skipped if present.
    """
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        product, amount, region = line.split(",")
        product = product.strip()
        amount = amount.strip()
        region = region.strip()
        if product == "product" and amount == "amount" and region == "region":
            continue
        value = float(amount) if "." in amount else int(amount)
        rows.append({"product": product, "amount": value, "region": region})
    return rows


def total_by_region(rows):
    """Return a dict mapping each region to the sum of its amounts."""
    totals = {}
    for row in rows:
        region = row["region"]
        # BUG: this overwrites the running total for the region instead of
        # adding to it, so each region ends up with only its last row's amount.
        totals[region] = row["amount"]
    return totals


# TODO: add top_products(rows, n) -> list[tuple[str, float]].
# Sum amounts per product, then return the n products with the highest total,
# sorted by total descending and product name ascending, as (product, total)
# tuples. Return all products if there are fewer than n.
