def is_valid(s: str) -> bool:
    depth = 0
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth < 0:
                return False
    return depth == 0


def min_remove_to_valid(s: str) -> str:
    chars = list(s)
    open_count = 0
    for i, ch in enumerate(chars):
        if ch == '(':
            open_count += 1
        elif ch == ')':
            if open_count > 0:
                open_count -= 1
            else:
                chars[i] = ''
    # BUG: leftover unmatched '(' are never removed, so "(a" stays "(a"
    #      and "))((" wrongly keeps the trailing "((".
    return ''.join(chars)
