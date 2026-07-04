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
    stack = []  # indices of so-far-unmatched '('
    for i, ch in enumerate(chars):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            if stack:
                stack.pop()      # match with a pending '('
            else:
                chars[i] = ''    # unmatched ')': remove it
    for i in stack:
        chars[i] = ''            # leftover unmatched '(': remove them
    return ''.join(chars)
