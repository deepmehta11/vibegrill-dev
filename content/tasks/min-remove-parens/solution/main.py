from parens import min_remove_to_valid, is_valid

if __name__ == "__main__":
    samples = ["a)b(c)d", "))((", "(a(b)c)", "lee(t(c)o)de)", "(a"]
    for s in samples:
        out = min_remove_to_valid(s)
        print(f"{s!r:18} -> {out!r:14} valid={is_valid(out)}")
