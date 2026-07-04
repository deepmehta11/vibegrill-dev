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
    # BUG: the final line still held in `current` is never appended,
    # so the last line of every wrap is silently dropped.
    return lines


# TODO: add fill(text, width, indent="") -> str
#   Wrap `text` and join the lines with "\n", prefixing every line with
#   `indent`. The indent counts toward the width budget, so wrap to
#   width - len(indent) before adding the prefix. Whitespace-only text
#   returns the empty string "".
