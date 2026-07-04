# Decode Nested Encoded Strings

This is a Google-style coding interview problem.

## The task

Implement `decode(s: str) -> str` in `decoder.py`.

The input is an encoded string built from the following pieces:

- **Literals**: runs of lowercase letters (`a`–`z`) that copy through unchanged.
- **Encoded segments** of the form `k[encoded]`, meaning the string `encoded` repeated `k` times. `k` is a positive integer.

The encoding rules you must support:

- **Nesting**: an `encoded` segment can itself contain more `k[...]` segments to any depth. For example `3[a2[c]]` means `a2[c]` repeated 3 times, where `2[c]` is `cc`, so the inner block is `acc` and the result is `accaccacc`.
- **Multi-digit counts**: `k` may be more than one digit, e.g. `10[a]` decodes to ten `a` characters.

The input is **always valid**: brackets are balanced, digits only ever appear immediately before a `[`, and only lowercase letters, digits, and the characters `[` and `]` appear. There are no negative numbers and no whitespace. An empty string decodes to an empty string.

## Examples

```
decode("3[a]2[bc]")      == "aaabcbc"
decode("3[a2[c]]")       == "accaccacc"
decode("2[abc]3[cd]ef")  == "abcabccdcdcdef"
decode("10[a]")          == "aaaaaaaaaa"
decode("abc")            == "abc"
decode("2[3[a]b]")       == "aaabaaab"
```

## What's wrong with the given attempt

The starter `decoder.py` scans left to right and, whenever it hits a digit, reads a **single** digit as the count and grabs everything up to the **first** `]` it can find as the segment body. This is broken in two ways:

1. It reads only one digit, so `10[a]` is misparsed (it treats `1` as the count and `0[a...` as content).
2. It stops at the first `]`, which is the *inner* closing bracket for any nested input, so `3[a2[c]]` produces garbage.

Rewrite `decode` so it correctly handles nesting and multi-digit counts. A single left-to-right pass using an explicit stack (pushing the current partial result and repeat count on each `[`, popping and repeating on each `]`) is the intended approach. Recursion is also acceptable. Do not use `eval` or regex-based expansion tricks that assume a fixed depth.

## Deliverable

`decoder.py` with a correct `decode`. `main.py` prints a short demo. All visible and hidden tests must pass.
