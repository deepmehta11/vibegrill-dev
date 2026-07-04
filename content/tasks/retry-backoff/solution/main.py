"""Demo: a flaky function that fails twice, then succeeds on the third attempt."""

from retry import retry


def make_flaky():
    calls = {"n": 0}

    @retry(times=3, exceptions=(ValueError,), on_retry=lambda a, e: print(f"retry after attempt {a}: {e}"))
    def flaky():
        calls["n"] += 1
        if calls["n"] < 3:
            raise ValueError(f"boom on call {calls['n']}")
        return "ok"

    return flaky


if __name__ == "__main__":
    flaky = make_flaky()
    result = flaky()
    print(f"result: {result}")
