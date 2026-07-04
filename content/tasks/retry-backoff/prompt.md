# Retry Decorator

`retry.py` provides a `retry` decorator that re-runs a function when it raises certain exceptions. It's meant to work like this:

```python
@retry(times=3, exceptions=(ValueError,))
def flaky():
    ...
```

`times` is the **total number of attempts** (not the number of *extra* retries). So `times=3` means the function may run up to 3 times. If a call raises one of the listed `exceptions`, it is retried; any *other* exception propagates immediately. If **every** attempt fails, the **last** exception is re-raised.

## Part 1 — Fix the bug

There is an **off-by-one bug**: the decorator currently makes only `times - 1` attempts instead of `times`. For example, a function decorated with `times=3` that always fails only runs twice, and re-raises the exception from the *second* attempt instead of the third. Fix it so exactly `times` attempts are made and the exception re-raised on total exhaustion is the one from the final (`times`-th) attempt.

Edge cases to respect:
- `times=1` means a single attempt (no retries).
- A function that succeeds on the first attempt runs exactly once.
- An exception not listed in `exceptions` propagates immediately, with no retry.

## Part 2 — Add the `on_retry` callback (new feature)

Extend the signature to:

```python
def retry(times, exceptions=(Exception,), on_retry=None):
```

When `on_retry` is provided, call it as `on_retry(attempt_number, exception)` **before each retry**. `attempt_number` is the **1-based number of the attempt that just failed** (so the first failure passes `1`, the second passes `2`, and so on). It must **not** be called after the final failing attempt (there is no retry after the last attempt).

### Example

```python
log = []

@retry(times=3, exceptions=(ValueError,), on_retry=lambda a, e: log.append((a, str(e))))
def f():
    ...  # fails on attempts 1 and 2 with "e1"/"e2", succeeds on attempt 3

f()
# log == [(1, "e1"), (2, "e2")]
```

If the function succeeds on its first attempt, `on_retry` is never called and `log == []`.

Positional/keyword arguments passed to the decorated function must be forwarded on every attempt. Do not use `time.sleep` — retries happen immediately.
