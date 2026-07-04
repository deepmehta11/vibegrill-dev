"""Demo: wrap a sample sentence to width 15 and print each line in bars."""

from wrap import wrap

SAMPLE = "the quick brown fox jumps over the lazy dog"


def main():
    for line in wrap(SAMPLE, 15):
        print("|" + line + "|")


if __name__ == "__main__":
    main()
