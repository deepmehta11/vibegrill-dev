"""Small demo for the longest-unique-substring functions."""

from substrings import length_of_longest_unique, longest_unique_substring


def main() -> None:
    samples = ["abcabcbb", "bbbbb", "pwwkew", "abba", "tmmzuxt"]
    for s in samples:
        n = length_of_longest_unique(s)
        sub = longest_unique_substring(s)
        print(f"{s!r}: length={n}, substring={sub!r}")


if __name__ == "__main__":
    main()
