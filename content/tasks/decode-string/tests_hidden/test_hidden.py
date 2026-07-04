from decoder import decode


def test_multi_digit_count():
    assert decode("10[a]") == "a" * 10


def test_multi_digit_nested():
    assert decode("2[3[a]b]") == "aaabaaab"


def test_deeply_nested():
    assert decode("2[a2[b2[c]]]") == "abccbccabccbcc"


def test_empty_string():
    assert decode("") == ""


def test_large_multi_digit_inner():
    assert decode("2[12[a]]") == "a" * 24


def test_literals_between_groups():
    assert decode("x2[y]z") == "xyyz"


def test_count_after_nested_block():
    assert decode("3[ab2[c]d]") == "abccdabccdabccd"


def test_adjacent_nested_groups():
    assert decode("2[a]2[b2[c]]") == "aabccbcc"
