import pytest

from ledger import Ledger, InsufficientFunds


def test_balance_after_deposit_and_withdraw():
    ledger = Ledger()
    ledger.deposit(100)
    ledger.withdraw(30)
    assert ledger.balance() == 70


def test_withdraw_overdraft_raises():
    ledger = Ledger()
    ledger.deposit(50)
    with pytest.raises(InsufficientFunds):
        ledger.withdraw(80)


def test_non_positive_amounts_rejected():
    ledger = Ledger()
    with pytest.raises(ValueError):
        ledger.deposit(0)
    with pytest.raises(ValueError):
        ledger.withdraw(-5)
