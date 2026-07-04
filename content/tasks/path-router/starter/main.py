from router import Router


def main():
    router = Router()
    router.add("/users/:id", "show_user")
    router.add("/posts/:year/:slug", "show_post")
    router.add("/files/*", "serve_file")

    for path in ["/users/42", "/posts/2024/hello-world", "/files/img/logo.png", "/nope"]:
        result = router.match(path)
        if result is None:
            print(f"{path} -> no match")
        else:
            handler, params = result
            print(f"{path} -> {handler} {params}")


if __name__ == "__main__":
    main()
