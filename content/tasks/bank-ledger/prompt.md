# Fix the account ledger

You've inherited a tiny `Ledger` class that tracks deposits and withdrawals for a single bank account. It has a bug, and it's missing a feature the team needs.

## What's wrong

1. **`balance()` returns the wrong number.** Right now a withdrawal *increases* the reported balance instead of decreasing it. A ledger with a \$100 deposit and a \$30 withdrawal should report a balance of \$70, not \$130.

2. **Overdrawing is allowed.** `withdraw()` happily lets the balance go negative. It should refuse: if a withdrawal would drop the balance below zero, raise `InsufficientFunds` and leave the ledger unchanged.

## What to add

3. **A `statement()` method.** It should return a `list[str]` — one line per transaction, in order. Each line is:

   > the transaction kind, left-justified in an **8-character field**, then a **single space**, then a sign (`+` for deposits, `-` for withdrawals) directly followed by the amount with exactly **two decimal places**.

   For a \$100 deposit followed by a \$30 withdrawal, `statement()` returns:

   ```
   ['deposit  +100.00', 'withdraw -30.00']
   ```

   (Note how the amounts line up: `deposit` is padded out to 8 characters so its `+` lands in the same column as `withdraw`'s `-`.)

## Notes

- `deposit()` and `withdraw()` already reject non-positive amounts with `ValueError` — keep that behavior.
- Amounts are given as numbers (ints or floats). Keep the existing rounding behavior; don't introduce currency libraries.
- `main.py` runs a small demo — use **Run** to see it, and **Run tests** to check your work against the visible tests.

When you're happy, hit **Submit** to run the hidden test suite and get your session scored.
