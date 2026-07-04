from substrings import length_of_longest_unique, longest_unique_substring


def test_length_empty():
    assert length_of_longest_unique("") == 0


def test_length_abba():
    # Regression for the stale-index bug: 'a' at the end was last seen far
    # outside the current window.
    assert length_of_longest_unique("abba") == 2


def test_length_dvdf():
    assert length_of_longest_unique("dvdf") == 3


def test_length_tmmzuxt():
    # Trailing 't' repeats index 0, long gone from the window.
    assert length_of_longest_unique("tmmzuxt") == 5


def test_length_single_char():
    assert length_of_longest_unique("a") == 1


def test_length_all_unique():
    assert length_of_longest_unique("abcdef") == 6


def test_substring_tmmzuxt():
    assert longest_unique_substring("tmmzuxt") == "mzuxt"


def test_substring_first_of_ties():
    # 'wke' and 'kew' both have length 3; the FIRST (earliest) wins.
    assert longest_unique_substring("pwwkew") == "wke"


def test_substring_empty():
    assert longest_unique_substring("") == ""


def test_case_sensitivity():
    # Casing matters: 'A' and 'a' are distinct characters.
    assert length_of_longest_unique("aA") == 2
    assert longest_unique_substring("aA") == "aA"
