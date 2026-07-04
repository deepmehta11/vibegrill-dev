"""Reference solution — used only by scripts/verify-tasks.mjs. Never shipped."""


class InsufficientFunds(Exception):
    """Raised when a withdrawal would overdraw the account."""


class Ledger:
    def __init__(self):
        self._transactions = []  # list of (kind, amount)

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._transactions.append(("deposit", amount))

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance():
            raise InsufficientFunds("insufficient funds")
        self._transactions.append(("withdraw", amount))

    def balance(self):
        total = 0
        for kind, amount in self._transactions:
            if kind == "deposit":
                total += amount
            else:
                total -= amount
        return total

    def statement(self):
        lines = []
        for kind, amount in self._transactions:
            sign = "+" if kind == "deposit" else "-"
            lines.append(f"{kind:<8} {sign}{amount:.2f}")
        return lines
