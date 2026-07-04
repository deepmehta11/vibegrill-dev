def decode(s: str) -> str:
    """Decode strings of the form k[encoded], with nesting and multi-digit counts."""
    count_stack = []
    string_stack = []
    current = []
    num = 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == '[':
            count_stack.append(num)
            string_stack.append(current)
            num = 0
            current = []
        elif ch == ']':
            k = count_stack.pop()
            prev = string_stack.pop()
            prev.extend(current * k)
            current = prev
        else:
            current.append(ch)
    return ''.join(current)
