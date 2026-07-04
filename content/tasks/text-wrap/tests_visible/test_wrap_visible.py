from wrap import wrap, fill


def test_wrap_basic():
    assert wrap("the quick brown fox", 10) == ["the quick", "brown fox"]


def test_wrap_last_line_kept():
    # The final line must not be dropped.
    assert wrap("a b c d e", 3) == ["a b", "c d", "e"]


def test_wrap_empty():
    assert wrap("   ", 5) == []


def test_fill_basic():
    assert fill("the quick brown fox", 10) == "the quick\nbrown fox"
