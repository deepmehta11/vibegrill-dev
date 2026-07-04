"""A minimal URL route matcher."""


def _split(path):
    if path.startswith("/"):
        path = path[1:]
    if path.endswith("/"):
        path = path[:-1]
    if path == "":
        return []
    return path.split("/")


def _try_match(pattern_segments, path_segments):
    params = {}
    for i, pattern_seg in enumerate(pattern_segments):
        if pattern_seg == "*":
            # Trailing wildcard: capture one or more remaining segments.
            remaining = path_segments[i:]
            if not remaining:
                return None
            params["*"] = "/".join(remaining)
            return params
        if i >= len(path_segments):
            return None
        path_seg = path_segments[i]
        if pattern_seg.startswith(":"):
            params[pattern_seg[1:]] = path_seg
        elif pattern_seg != path_seg:
            return None
    if len(pattern_segments) != len(path_segments):
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
