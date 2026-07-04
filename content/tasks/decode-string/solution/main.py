from decoder import decode


def main() -> None:
    samples = ["3[a]2[bc]", "3[a2[c]]", "2[abc]3[cd]ef", "10[a]", "abc"]
    for s in samples:
        print(f"{s!r} -> {decode(s)!r}")


if __name__ == "__main__":
    main()
