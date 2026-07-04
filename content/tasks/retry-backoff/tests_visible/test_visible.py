import pytest

from retry import retry


def test_succeeds_after_failures():
    calls = {"n": 0}

    @retry(times=3, exceptions=(ValueError,))
    def f():
        calls["n"] += 1
        if calls["n"] < 3:
            raise ValueError("nope")
        return "done"

    assert f() == "done"
    assert calls["n"] == 3


def test_exhausts_attempts_and_reraises_last():
    calls = {"n": 0}

    @retry(times=3, exceptions=(ValueError,))
    def always_fail():
        calls["n"] += 1
        raise ValueError(f"fail {calls['n']}")

    with pytest.raises(ValueError) as info:
        always_fail()
    assert str(info.value) == "fail 3"
    assert calls["n"] == 3


def test_unlisted_exception_propagates_immediately():
    calls = {"n": 0}

    @retry(times=5, exceptions=(ValueError,))
    def wrong_error():
        calls["n"] += 1
        raise KeyError("boom")

    with pytest.raises(KeyError):
        wrong_error()
    assert calls["n"] == 1
