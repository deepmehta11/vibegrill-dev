from sales import parse_rows, total_by_region

DATA = """product,amount,region
Widget,100,North
Gadget,50,North
Widget,75,South
Gizmo,20,South
"""


def main():
    rows = parse_rows(DATA)
    print("Rows parsed:", len(rows))
    print("Totals by region:")
    for region, total in total_by_region(rows).items():
        print(f"  {region}: {total}")


if __name__ == "__main__":
    main()
