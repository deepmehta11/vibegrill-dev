"""A simple single-account ledger."""


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
        # TODO: refuse the withdrawal if it would overdraw the account.
        self._transactions.append(("withdraw", amount))

    def balance(self):
        total = 0
        for kind, amount in self._transactions:
            if kind == "deposit":
                total += amount
            else:
                total += amount  # BUG: a withdrawal should reduce the balance
        return total

    # TODO: add a statement() method that returns a list[str], one line per
    # transaction (see the task description for the exact format).
