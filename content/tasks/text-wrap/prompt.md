## Greedy Text Wrapper

`wrap.py` implements simple greedy word wrapping from scratch (do **not** use the standard-library `textwrap` module). You will fix a bug in `wrap` and add a new `fill` function.

### `wrap(text, width) -> list[str]`

Split `text` on whitespace into words, then greedily pack words into lines so that each line is at most `width` characters long, joining consecutive words with a **single space**. A word longer than `width` is never split — it goes on its own line (and may exceed `width`). Return the list of lines. Empty or whitespace-only text returns `[]`.

Example:

```python
wrap("the quick brown fox", 10) == ["the quick", "brown fox"]
```

#### The bug

The final line being built is never added to the result, so `wrap` **drops the last line**. For example, the starter returns `["the quick"]` for `wrap("the quick brown fox", 10)` and `[]` for `wrap("hello", 3)`. Fix it so every line — including the last — is returned.

### The feature: `fill(text, width, indent="") -> str`

Add a `fill` function that wraps `text` and returns a **single string** with lines joined by `"\n"`, where **every** line is prefixed by the `indent` string. The indent counts toward the width budget: wrap to `width - len(indent)` first, then prefix each resulting line with `indent`.

Example:

```python
fill("one two three four five", 12, indent="> ")
# wraps to width 10 (12 - len("> ")), then prefixes each line:
# "> one two\n> three four\n> five"
```

With no indent it is just wrapped text joined by newlines:

```python
fill("the quick brown fox", 10) == "the quick\nbrown fox"
```

Whitespace-only text yields the empty string `""`.

### Running

`main.py` wraps a sample sentence to width 15 and prints each line between `|` bars. Run it to see the bug (the last line is missing), then again after your fix.

All Python is standard library only. Match the output formats above exactly — spacing and punctuation are checked.
