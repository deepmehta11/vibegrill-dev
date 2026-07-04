from intervals import merge, total_covered

if __name__ == "__main__":
    sample = [[8, 10], [1, 3], [2, 6], [15, 18]]
    print("input:   ", sample)
    print("merged:  ", merge(sample))
    print("covered: ", total_covered(sample))
