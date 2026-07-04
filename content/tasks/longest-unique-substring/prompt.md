## Longest Substring Without Repeating Characters (Google-style)

You are given a string `s`. A *substring* is a contiguous slice of `s`. We want the longest substring whose characters are **all distinct** (no character repeats inside it).

This is a classic Google phone-screen / onsite question. It is usually solved with a **sliding window**: two pointers `left` and `right` define the current window, and a hash map records the most recent index at which each character was seen. When you hit a character that is already inside the window, you slide `left` forward past its previous occurrence.

### Part 1 — fix `length_of_longest_unique`

Implement (fix) `length_of_longest_unique(s: str) -> int` in `substrings.py`. It must return the **length** of the longest substring of `s` with all distinct characters.

Examples:

```
length_of_longest_unique("abcabcbb")  -> 3   # "abc"
length_of_longest_unique("bbbbb")     -> 1   # "b"
length_of_longest_unique("pwwkew")    -> 3   # "wke"
length_of_longest_unique("")          -> 0
length_of_longest_unique("abba")      -> 2   # "ab" or "ba"
length_of_longest_unique("dvdf")      -> 3   # "vdf"
length_of_longest_unique("tmmzuxt")   -> 5   # "mzuxt"
```

**What's wrong with the given attempt.** The starter code, on seeing a repeated character, blindly sets `left = last_seen[ch] + 1`. That is only correct when the previous occurrence is still *inside* the current window. When the previous occurrence is already to the *left* of `left`, this moves `left` **backwards**, letting a stale character re-enter the window and inflating the answer.

- On `"abba"`: after the window has slid to `"ba"`, the final `a` was last seen at index 0 (already outside the window), and the buggy code jumps `left` back to 1, wrongly yielding `3` instead of `2`.
- On `"tmmzuxt"`: the trailing `t` was last seen at index 0 (long gone), and the bug yields `6` instead of `5`.

The fix: only move `left` when the previous index is `>= left`, i.e. `left = max(left, last_seen[ch] + 1)`.

### Part 2 — add `longest_unique_substring`

Also implement `longest_unique_substring(s: str) -> str`, returning the **first** longest substring (the actual text) with all distinct characters. If several substrings tie for the maximum length, return the one that starts earliest. For the empty string return `""`.

Examples:

```
longest_unique_substring("abcabcbb") -> "abc"
longest_unique_substring("tmmzuxt")  -> "mzuxt"
longest_unique_substring("pwwkew")   -> "wke"   # "wke" starts before "kew"
longest_unique_substring("bbbbb")    -> "b"
longest_unique_substring("")         -> ""
```

### Constraints & format

- Pure Python standard library, Python 3.11+. Deterministic; no I/O, no randomness.
- `s` may be empty and may contain any Unicode characters (treat them as ordinary distinct characters; casing matters, so `"A"` and `"a"` are different).
- Keep both functions in the top-level module `substrings.py`. Tests import them as `from substrings import length_of_longest_unique, longest_unique_substring`.
- `main.py` prints a short demo over a few sample strings.
