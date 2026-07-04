"""Longest substring with all distinct characters (sliding window)."""


def length_of_longest_unique(s: str) -> int:
    """Return the length of the longest substring of ``s`` whose characters
    are all distinct.

    Single O(n) pass. ``last_seen`` maps each character to the most recent
    index where it appeared. On a repeat we only advance ``left`` when the
    previous occurrence is still inside the window (``prev >= left``); this is
    equivalent to ``left = max(left, prev + 1)`` and prevents ``left`` from
    ever moving backwards.
    """
    last_seen: dict[str, int] = {}
    left = 0
    best = 0
    for right, ch in enumerate(s):
        prev = last_seen.get(ch, -1)
        if prev >= left:
            left = prev + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best


def longest_unique_substring(s: str) -> str:
    """Return the FIRST longest substring of ``s`` whose characters are all
    distinct.

    Same window logic as :func:`length_of_longest_unique`, but we also record
    where the best window starts. Using a strict ``>`` when comparing lengths
    keeps the earliest-starting window on ties.
    """
    last_seen: dict[str, int] = {}
    left = 0
    best_len = 0
    best_start = 0
    for right, ch in enumerate(s):
        prev = last_seen.get(ch, -1)
        if prev >= left:
            left = prev + 1
        last_seen[ch] = right
        if right - left + 1 > best_len:
            best_len = right - left + 1
            best_start = left
    return s[best_start:best_start + best_len]
