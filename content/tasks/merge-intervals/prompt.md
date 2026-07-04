## Merge Intervals (Meta-style)

This is a classic Meta-style array/sorting interview question.

You are given a list of intervals, where each interval is a two-element list `[start, end]` with `start <= end`. Implement:

```python
def merge(intervals: list[list[int]]) -> list[list[int]]:
    ...
```

`merge` returns a new list of the **merged** intervals, **sorted by start**, where any intervals that **overlap or touch** are combined into a single interval.

- Two intervals overlap or touch when the later one's start is `<= ` the earlier one's end. In that case they merge into `[min(start), max(end)]`.
- Touching counts as merging: `[1, 4]` and `[4, 5]` become `[1, 5]` (they share the endpoint `4`).
- The input is **not guaranteed to be sorted**.
- Do **not** mutate the caller's input list or its inner lists.

### Examples

```python
merge([[1, 3], [2, 6], [8, 10], [15, 18]]) == [[1, 6], [8, 10], [15, 18]]
merge([[1, 4], [4, 5]])                     == [[1, 5]]
merge([])                                   == []
merge([[8, 10], [1, 3], [2, 6]])            == [[1, 6], [8, 10]]   # unsorted input
```

### What's wrong with the given attempt

The starter `merge` walks the list in the order it is given and assumes it is already sorted by start. For an unsorted input like `[[8, 10], [1, 3], [2, 6]]` it never merges the later, smaller intervals into the first one, so it returns the wrong answer (e.g. `[[8, 10]]`). Your job is to make it correct for **any** input order.

### Extension to add

Also implement:

```python
def total_covered(intervals: list[list[int]]) -> int:
    ...
```

`total_covered` returns the total length of the number line covered by the intervals **after merging** — the sum of `(end - start)` over the merged intervals. Overlapping regions must only be counted once.

```python
total_covered([[1, 3], [2, 6], [8, 10]]) == 7   # merged -> [[1, 6], [8, 10]] -> 5 + 2
total_covered([])                         == 0
```

Both functions live in `intervals.py`. Aim for an `O(n log n)` approach.
