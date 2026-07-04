## Minimum Remove to Make Valid Parentheses (Meta-style)

This is a classic Meta phone-screen / onsite question.

You are given a string `s` consisting of lowercase English letters and the characters `'('` and `')'`. Write:

```python
def min_remove_to_valid(s: str) -> str
```

that removes the **minimum** number of parentheses (either `'('` or `')'`) so that the resulting string is **valid**, and returns that result. All letters must be kept, and every character that is not removed must stay in its original order.

A string is **valid** when:
- every `')'` has a matching `'('` that appears **earlier**, and
- every `'('` has a matching `')'` that appears **later**.

(Equivalently: scanning left to right, the running count of `'('` minus `')'` is never negative, and ends at zero.)

The answer is **unique** under this deterministic rule: drop each `')'` that has no unmatched `'('` before it, and drop any `'('` that is still unmatched when the scan ends.

### Examples

| Input | Output |
|-------|--------|
| `"a)b(c)d"` | `"ab(c)d"` |
| `"))(("` | `""` |
| `"(a(b)c)"` | `"(a(b)c)"` |
| `"lee(t(c)o)de)"` | `"lee(t(c)o)de"` |
| `"(a"` | `"a"` |

Note in the second example both a leading unmatched `')'` group and a trailing unmatched `'('` group are removed. In the last example the lone `'('` has no closing partner, so it must be removed.

### The buggy attempt

The provided `parens.py` tracks a running `open_count` and correctly deletes any `')'` that arrives with `open_count == 0`. But it **never removes the leftover unmatched `'('`** once the scan finishes. So:
- `min_remove_to_valid("(a")` wrongly returns `"(a"` instead of `"a"`.
- `min_remove_to_valid("))((")` wrongly returns `"(("` instead of `""`.

### Your task

1. Fix `min_remove_to_valid` so it removes **both** kinds of unmatched parentheses. A clean approach: push the **indices** of unmatched `'('` onto a stack; when you see a `')'`, pop a matching index if the stack is non-empty, otherwise mark that `')'` for removal; after the scan, every index still on the stack is an unmatched `'('` that must be removed.
2. Keep the helper `is_valid(s: str) -> bool` working; the tests use it to confirm your output is actually valid.

Input length can be 0 or larger; the empty string returns `""`. Only `'('`, `')'`, and lowercase letters appear in the input.
