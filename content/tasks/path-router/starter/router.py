"""A minimal URL route matcher."""


def _split(path):
    # TODO: trailing slashes are not handled here, so "/users/5/" produces an
    # extra empty segment and fails to match the pattern "/users/:id".
    if path.startswith("/"):
        path = path[1:]
    if path == "":
        return []
    return path.split("/")


def _try_match(pattern_segments, path_segments):
    # BUG: a trailing "*" wildcard segment is treated as an ordinary literal
    # segment here, so wildcard patterns never match. See prompt for the
    # feature you need to add.
    if len(pattern_segments) != len(path_segments):
        return None
    params = {}
    for pattern_seg, path_seg in zip(pattern_segments, path_segments):
        if pattern_seg.startswith(":"):
            params[pattern_seg[1:]] = path_seg
        elif pattern_seg != path_seg:
            return None
    return params


class Router:
    def __init__(self):
        self._routes = []

    def add(self, pattern, handler):
        self._routes.append((pattern, handler))

    def match(self, path):
        path_segments = _split(path)
        for pattern, handler in self._routes:
            params = _try_match(_split(pattern), path_segments)
            if params is not None:
                return (handler, params)
        return None
