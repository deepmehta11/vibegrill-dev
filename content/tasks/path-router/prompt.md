# Path Router

`router.py` implements a tiny URL route matcher used by a web framework.

```python
from router import Router

r = Router()
r.add("/users/:id", "show_user")
handler, params = r.match("/users/42")   # ("show_user", {"id": "42"})
```

## How it works

- `Router.add(pattern, handler)` registers a route. `handler` is any object (the tests use plain strings).
- `Router.match(path)` returns `(handler, params)` for the **first** pattern (in insertion order) that matches, or `None` if nothing matches.
- A pattern is split on `/` into segments. A `:name` segment captures whatever is in that position of the path into `params["name"]` (always as a string). A plain segment must match exactly.
- Unless a wildcard is involved (see below), the number of segments must match **exactly**: `/users/:id` matches `/users/42` but not `/users/42/posts` and not `/users`.

## Part 1 — Fix the bug (trailing slash)

The matcher treats a trailing slash as a real, empty segment, so a path like `/users/42/` fails to match `/users/:id` even though it should. Trailing slashes must be ignored: `/users/42/` must match `/users/:id` and return `("show_user", {"id": "42"})`, exactly the same as `/users/42`.

## Part 2 — Add the feature (trailing wildcard)

Add support for a trailing `*` segment that matches **one or more** remaining path segments and captures them, joined by `/`, under `params["*"]`.

Rules:
- `"/files/*"` matches `/files/readme` with params `{"*": "readme"}`.
- `"/files/*"` matches `/files/img/logo.png` with params `{"*": "img/logo.png"}` (the captured value is the remaining segments joined by a single `/`, with no leading or trailing slash).
- The wildcard requires **at least one** remaining segment: `"/files/*"` must **not** match `/files` (returns `None`).
- Trailing slashes still do not count as a segment: `"/files/*"` matching `/files/img/logo.png/` returns `{"*": "img/logo.png"}`.

The wildcard only ever appears as the final segment of a pattern. No regular expressions are required (though `re` from the standard library is allowed).

## Run

`main.py` registers a few routes and prints some matches. Run it to see current behavior. Then make the visible tests pass; hidden tests cover the same rules with additional edge cases.
