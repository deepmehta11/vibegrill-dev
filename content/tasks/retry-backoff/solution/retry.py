"""A retry decorator that re-attempts a function when it raises certain errors."""

import functools


def retry(times, exceptions=(Exception,), on_retry=None):
    """Return a decorator that retries the wrapped function.

    The function is attempted up to ``times`` total ATTEMPTS. If a call raises
    one of ``exceptions``, it is retried; any other exception propagates
    immediately. If every attempt fails, the LAST exception is re-raised.

    When ``on_retry`` is provided it is called as ``on_retry(attempt_number,
    exception)`` BEFORE each retry, where ``attempt_number`` is the 1-based
    number of the attempt that just failed. It is not called after the final
    failing attempt.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    if attempt == times:
                        raise
                    if on_retry is not None:
                        on_retry(attempt, exc)
        return wrapper
    return decorator
