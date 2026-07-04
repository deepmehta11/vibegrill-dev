from parens import min_remove_to_valid, is_valid


def test_examples_from_prompt():
    assert min_remove_to_valid("a)b(c)d") == "ab(c)d"
    assert min_remove_to_valid("lee(t(c)o)de)") == "lee(t(c)o)de"


def test_all_removed_and_already_valid():
    assert min_remove_to_valid("))((") == ""
    assert min_remove_to_valid("(a(b)c)") == "(a(b)c)"


def test_is_valid_helper():
    assert is_valid("(a(b)c)") is True
    assert is_valid(")(") is False
