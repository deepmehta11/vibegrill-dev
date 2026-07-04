"""Longest substring with all distinct characters (sliding window)."""


def length_of_longest_unique(s: str) -> int:
    """Return the length of the longest substring of ``s`` whose characters
    are all distinct."""
    last_seen: dict[str, int] = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        if ch in last_seen:
            # BUG: jumps left to just after the previous occurrence even when
            # that occurrence is already OUTSIDE the current window, so left
            # can move backwards and let a repeated character back in.
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best


def longest_unique_substring(s: str) -> str:
    """Return the FIRST longest substring of ``s`` whose characters are all
    distinct."""
    last_seen: dict[str, int] = {}
    left = 0
    best_len = 0
    best_start = 0
    for right, ch in enumerate(s):
        if ch in last_seen:
            # BUG: same stale-index problem as above.
            left = last_seen[ch] + 1
        last_seen[ch] = right
        if right - left + 1 > best_len:
            best_len = right - left + 1
            best_start = left
    return s[best_start:best_start + best_len]
