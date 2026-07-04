from substrings import length_of_longest_unique, longest_unique_substring


def test_length_basic():
    assert length_of_longest_unique("abcabcbb") == 3


def test_length_all_same():
    assert length_of_longest_unique("bbbbb") == 1


def test_length_pwwkew():
    assert length_of_longest_unique("pwwkew") == 3


def test_substring_basic():
    assert longest_unique_substring("abcabcbb") == "abc"
