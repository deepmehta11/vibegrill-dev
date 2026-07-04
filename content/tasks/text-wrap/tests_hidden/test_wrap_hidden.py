from wrap import wrap, fill


def test_wrap_single_word_kept():
    assert wrap("hello", 3) == ["hello"]


def test_wrap_exact_width_boundary():
    assert wrap("abcde fghij", 5) == ["abcde", "fghij"]


def test_wrap_long_word_on_own_line():
    assert wrap("hi supercalifragilistic yo", 8) == ["hi", "supercalifragilistic", "yo"]


def test_wrap_packs_greedily():
    assert wrap("aa bb cc dd", 5) == ["aa bb", "cc dd"]


def test_fill_with_indent():
    assert fill("one two three four five", 12, indent="> ") == "> one two\n> three four\n> five"


def test_fill_indent_counts_toward_width():
    # indent '    ' (4) shrinks the wrap width from 8 to 4.
    assert fill("aa bb cc", 8, indent="    ") == "    aa\n    bb\n    cc"


def test_fill_empty_is_empty_string():
    assert fill("   ", 10) == ""
