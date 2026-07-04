import pytest

from retry import retry


def test_times_one_means_single_attempt():
    calls = {"n": 0}

    @retry(times=1, exceptions=(ValueError,))
    def f():
        calls["n"] += 1
        raise ValueError("x")

    with pytest.raises(ValueError):
        f()
    assert calls["n"] == 1


def test_first_attempt_success_no_retry():
    calls = {"n": 0}
    log = []

    @retry(times=3, exceptions=(ValueError,), on_retry=lambda a, e: log.append(a))
    def f():
        calls["n"] += 1
        return 42

    assert f() == 42
    assert calls["n"] == 1
    assert log == []


def test_on_retry_called_before_each_retry():
    calls = {"n": 0}
    log = []

    @retry(times=3, exceptions=(ValueError,), on_retry=lambda a, e: log.append((a, str(e))))
    def f():
        calls["n"] += 1
        if calls["n"] < 3:
            raise ValueError(f"e{calls['n']}")
        return "ok"

    assert f() == "ok"
    assert log == [(1, "e1"), (2, "e2")]


def test_on_retry_not_called_after_final_failure():
    log = []

    @retry(times=2, exceptions=(ValueError,), on_retry=lambda a, e: log.append(a))
    def f():
        raise ValueError("boom")

    with pytest.raises(ValueError):
        f()
    assert log == [1]


def test_multiple_exception_types_are_caught():
    calls = {"n": 0}

    @retry(times=4, exceptions=(ValueError, KeyError))
    def f():
        calls["n"] += 1
        if calls["n"] == 1:
            raise ValueError("v")
        if calls["n"] == 2:
            raise KeyError("k")
        return "ok"

    assert f() == "ok"
    assert calls["n"] == 3


def test_default_exceptions_catches_all():
    calls = {"n": 0}

    @retry(times=2)
    def f():
        calls["n"] += 1
        if calls["n"] < 2:
            raise RuntimeError("boom")
        return "ok"

    assert f() == "ok"
    assert calls["n"] == 2


def test_arguments_forwarded_to_wrapped_function():
    calls = {"n": 0}

    @retry(times=3, exceptions=(ValueError,))
    def add(a, b):
        calls["n"] += 1
        if calls["n"] < 2:
            raise ValueError("retry")
        return a + b

    assert add(2, b=5) == 7
    assert calls["n"] == 2
