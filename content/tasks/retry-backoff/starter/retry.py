"""A retry decorator that re-attempts a function when it raises certain errors."""

import functools


def retry(times, exceptions=(Exception,)):
    """Return a decorator that retries the wrapped function up to ``times``
    total attempts. On one of ``exceptions`` the call is retried; other
    exceptions propagate immediately. If every attempt fails, the last
    exception is re-raised.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # BUG: off-by-one -- this makes only ``times - 1`` attempts instead
            # of ``times``. A function meant to get 3 tries only gets 2.
            for attempt in range(1, times):
                try:
                    return func(*args, **kwargs)
                except exceptions:
                    if attempt == times - 1:
                        raise
            # TODO: add the on_retry callback feature (see prompt.md)
        return wrapper
    return decorator
