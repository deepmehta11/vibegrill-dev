from parens import min_remove_to_valid, is_valid


def test_leftover_open_removed():
    assert min_remove_to_valid("(a") == "a"
    assert min_remove_to_valid("(x)(y") == "(x)y"


def test_empty_and_no_parens():
    assert min_remove_to_valid("") == ""
    assert min_remove_to_valid("abc") == "abc"


def test_result_is_always_valid():
    for s in ["))((", ")(", "(((", ")))", "a)b)c)", "((a)b", "())()(()"]:
        assert is_valid(min_remove_to_valid(s))


def test_letters_and_order_preserved():
    out = min_remove_to_valid("a)b(c)d")
    assert [c for c in out if c.isalpha()] == list("abcd")


def test_nested_and_minimal_removal():
    assert min_remove_to_valid("a(b(c)d") == "ab(c)d"
    assert min_remove_to_valid("())()(()") == "()()()"


def test_only_unmatched_close():
    assert min_remove_to_valid("a)") == "a"
    assert min_remove_to_valid(")))") == ""


def test_idempotent_on_valid_input():
    for s in ["()", "((()))", "(a)(b)(c)", "abc"]:
        assert min_remove_to_valid(s) == s
