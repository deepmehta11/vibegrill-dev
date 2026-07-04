"""Greedy word wrapping utilities (do not use the textwrap module)."""


def wrap(text, width):
    """Greedily wrap text into lines of at most `width` characters."""
    words = text.split()
    if not words:
        return []
    lines = []
    current = ""
    for word in words:
        if current == "":
            current = word
        elif len(current) + 1 + len(word) <= width:
            current = current + " " + word
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def fill(text, width, indent=""):
    """Wrap `text` and join lines with newlines, prefixing each with `indent`.

    The indent counts toward the width budget, so the text is wrapped to
    width - len(indent) and then every line is prefixed with `indent`.
    """
    inner = wrap(text, width - len(indent))
    return "\n".join(indent + line for line in inner)
