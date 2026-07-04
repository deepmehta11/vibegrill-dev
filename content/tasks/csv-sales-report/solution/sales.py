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
        totals[region] = totals.get(region, 0) + row["amount"]
    return totals


def top_products(rows, n):
    """Return the n products with the highest total amount.

    Duplicate products are summed. Result is sorted by total descending, then
    product name ascending, as (product, total) tuples.
    """
    totals = {}
    for row in rows:
        product = row["product"]
        totals[product] = totals.get(product, 0) + row["amount"]
    ranked = sorted(totals.items(), key=lambda item: (-item[1], item[0]))
    return ranked[:n]
