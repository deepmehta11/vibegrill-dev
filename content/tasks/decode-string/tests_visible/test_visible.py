from decoder import decode


def test_simple_sequence():
    assert decode("3[a]2[bc]") == "aaabcbc"


def test_nested():
    assert decode("3[a2[c]]") == "accaccacc"


def test_mixed_with_trailing_literals():
    assert decode("2[abc]3[cd]ef") == "abcabccdcdcdef"


def test_plain_literals():
    assert decode("abc") == "abc"
