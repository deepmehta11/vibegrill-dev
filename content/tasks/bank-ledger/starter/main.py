"""Small demo of the ledger. Run this to see it in action."""

from ledger import Ledger, InsufficientFunds


def main():
    ledger = Ledger()
    ledger.deposit(100)
    ledger.withdraw(30)

    print("Balance:", ledger.balance())  # should print 70

    try:
        ledger.withdraw(1000)
    except InsufficientFunds:
        print("Refused overdraft, as expected")

    print("Statement:")
    for line in ledger.statement():
        print(" ", line)


if __name__ == "__main__":
    main()
