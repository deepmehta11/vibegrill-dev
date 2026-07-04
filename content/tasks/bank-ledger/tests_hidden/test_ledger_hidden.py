import pytest

from ledger import Ledger, InsufficientFunds


def test_overdraft_leaves_balance_unchanged():
    ledger = Ledger()
    ledger.deposit(50)
    with pytest.raises(InsufficientFunds):
        ledger.withdraw(80)
    assert ledger.balance() == 50


def test_exact_balance_withdrawal_allowed():
    ledger = Ledger()
    ledger.deposit(50)
    ledger.withdraw(50)
    assert ledger.balance() == 0


def test_multiple_transactions_balance():
    ledger = Ledger()
    ledger.deposit(100)
    ledger.deposit(50)
    ledger.withdraw(30)
    ledger.withdraw(20)
    assert ledger.balance() == 100


def test_statement_format():
    ledger = Ledger()
    ledger.deposit(100)
    ledger.withdraw(30)
    assert ledger.statement() == ["deposit  +100.00", "withdraw -30.00"]


def test_statement_empty():
    ledger = Ledger()
    assert ledger.statement() == []


def test_statement_reflects_float_amounts():
    ledger = Ledger()
    ledger.deposit(12.5)
    assert ledger.statement() == ["deposit  +12.50"]
