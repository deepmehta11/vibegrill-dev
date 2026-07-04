from router import Router


def test_exact_static_match():
    r = Router()
    r.add("/health", "ok")
    assert r.match("/health") == ("ok", {})


def test_segment_count_must_match_exactly():
    r = Router()
    r.add("/users/:id", "user")
    assert r.match("/users/42/posts") is None


def test_first_matching_route_wins():
    r = Router()
    r.add("/:a/:b", "generic")
    r.add("/users/:id", "user")
    assert r.match("/users/42") == ("generic", {"a": "users", "b": "42"})


def test_wildcard_captures_multiple_segments():
    r = Router()
    r.add("/files/*", "file")
    assert r.match("/files/img/logo.png") == ("file", {"*": "img/logo.png"})


def test_wildcard_single_segment():
    r = Router()
    r.add("/files/*", "file")
    assert r.match("/files/readme") == ("file", {"*": "readme"})


def test_wildcard_requires_at_least_one_segment():
    r = Router()
    r.add("/files/*", "file")
    assert r.match("/files") is None


def test_wildcard_with_trailing_slash():
    r = Router()
    r.add("/files/*", "file")
    assert r.match("/files/img/logo.png/") == ("file", {"*": "img/logo.png"})
