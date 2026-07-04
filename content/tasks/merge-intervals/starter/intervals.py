def merge(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    # BUG: assumes the input is already sorted by start; unsorted inputs break.
    merged: list[list[int]] = [list(intervals[0])]
    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            if end > last[1]:
                last[1] = end
        else:
            merged.append([start, end])
    return merged


def total_covered(intervals: list[list[int]]) -> int:
    # BUG: not implemented for the extension yet.
    raise NotImplementedError
