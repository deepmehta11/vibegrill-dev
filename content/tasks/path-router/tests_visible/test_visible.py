from router import Router


def test_matches_single_param():
    r = Router()
    r.add("/users/:id", "user")
    assert r.match("/users/42") == ("user", {"id": "42"})


def test_matches_multiple_params():
    r = Router()
    r.add("/posts/:year/:slug", "post")
    assert r.match("/posts/2024/hello") == ("post", {"year": "2024", "slug": "hello"})


def test_no_match_returns_none():
    r = Router()
    r.add("/users/:id", "user")
    assert r.match("/teams/42") is None


def test_trailing_slash_matches():
    r = Router()
    r.add("/users/:id", "user")
    assert r.match("/users/42/") == ("user", {"id": "42"})
