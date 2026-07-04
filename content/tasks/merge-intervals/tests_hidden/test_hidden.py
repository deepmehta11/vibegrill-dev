from intervals import merge, total_covered


def test_empty():
    assert merge([]) == []
    assert total_covered([]) == 0


def test_single():
    assert merge([[5, 7]]) == [[5, 7]]


def test_fully_nested():
    assert merge([[1, 10], [2, 3], [4, 5]]) == [[1, 10]]


def test_reverse_sorted():
    assert merge([[15, 18], [8, 10], [2, 6], [1, 3]]) == [[1, 6], [8, 10], [15, 18]]


def test_duplicates():
    assert merge([[1, 4], [1, 4], [1, 4]]) == [[1, 4]]


def test_negatives():
    assert merge([[-5, -1], [-3, 0], [2, 4]]) == [[-5, 0], [2, 4]]


def test_does_not_mutate_input():
    data = [[1, 3], [2, 6]]
    merge(data)
    assert data == [[1, 3], [2, 6]]


def test_total_covered_overlapping():
    assert total_covered([[1, 5], [2, 3], [7, 9]]) == 6
