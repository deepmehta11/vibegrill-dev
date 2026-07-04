def decode(s: str) -> str:
    """Decode strings of the form k[encoded]."""
    # BUG: single-pass scan that only handles one flat level of brackets and
    # assumes the repeat count is a single digit. It breaks on nested brackets
    # like "3[a2[c]]" and on multi-digit counts like "10[a]".
    result = []
    i = 0
    while i < len(s):
        ch = s[i]
        if ch.isdigit():
            k = int(ch)  # BUG: only reads one digit
            j = s.index(']', i)  # BUG: matches the FIRST ']', not the balanced one
            inner = s[i + 2:j]  # assumes "d[...]" with no nesting
            result.append(inner * k)
            i = j + 1
        else:
            result.append(ch)
            i += 1
    return ''.join(result)
