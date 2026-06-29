# Insertion Sort

## What It Is

Insertion sort builds the sorted array one element at a time. It takes the next value, moves it left until it reaches the correct position, and repeats.

## Why It Matters

Insertion sort is one of the most practical simple sorts because it works very well on:

- small arrays
- nearly sorted data
- data that arrives one item at a time

## Intuition

Think about sorting playing cards in your hand. When you pick up a new card, you insert it into the right place among the cards you already arranged. That is exactly how insertion sort works.

## How It Works

1. Assume the first element is already sorted.
2. Take the next element as the current value.
3. Compare it with elements to its left.
4. Shift larger elements one step to the right.
5. Insert the current value into the empty spot.
6. Repeat for all remaining elements.

## Key Formula or Rule

Insertion sort keeps moving a value left while:

$$
a[j] > key
$$

As long as that condition is true, elements shift right and `key` keeps moving into its proper place.

## Worked Example

Sort `[7, 3, 5, 2]`

Start:

- Sorted part: `[7]`
- Unsorted part: `[3, 5, 2]`

Insert `3`:

- `3` is smaller than `7`
- Shift `7` right
- Array becomes `[3, 7, 5, 2]`

Insert `5`:

- Compare with `7`, shift `7`
- Stop at `3`
- Array becomes `[3, 5, 7, 2]`

Insert `2`:

- Shift `7`, `5`, and `3`
- Insert `2` at the front
- Array becomes `[2, 3, 5, 7]`

## Looking Deeper

Insertion sort is fast on nearly sorted data because the number of shifts depends on how far each element is from its final position.

Another useful way to say that:

- the algorithm is efficient when the array has few inversions

This is why insertion sort often appears inside hybrid sorting algorithms. It handles small or almost-sorted partitions more efficiently than heavier `O(n log n)` algorithms.

## Complexity

| Property | Value |
| --- | --- |
| Best time | `O(n)` |
| Average time | `O(n^2)` |
| Worst time | `O(n^2)` |
| Space | `O(1)` |
| Stable | Yes |

## Advantages

- Very good for small inputs
- Fast on nearly sorted arrays
- Stable
- In place
- Often used inside faster hybrid sorting algorithms

## Limitations

- Slow on large random arrays
- May shift many elements in the worst case
- Not a good default for large unsorted data

## Real-Life Uses

- Sorting small batches of records
- Final cleanup step in hybrid sorts
- Online insertion where elements arrive gradually

## When to Use and Avoid

Use insertion sort when:

- the array is small
- the data is already almost sorted
- you need a stable in-place sort

Avoid insertion sort when:

- the data is large and random
- `O(n log n)` algorithms are available and easy to use

## Under the Hood

One useful variant is **binary insertion sort**, which uses binary search to find the insertion point. That reduces comparisons, though shifting elements still costs time.

Insertion sort is also an **online** algorithm, meaning it can maintain sorted order as new values arrive. That makes it more relevant than bubble sort in real systems, even though both share the same worst-case complexity.

## How to Think About It in Practice

- Think of insertion sort when the input is tiny or already almost sorted.
- It is also a useful mental model for how larger systems handle small base cases inside more complex sorts.

## Common Mistakes

- Swapping repeatedly instead of shifting, which does extra work
- Forgetting that the left portion must stay sorted after each step
- Expecting good performance on large unsorted input

## Compare With

- [Bubble Sort](/dsa/bubble-sort): insertion sort often does less movement on partially sorted data.
- [Selection Sort](/dsa/selection-sort): selection sort reduces swaps, while insertion sort preserves local order better.

## Key Takeaway

Insertion sort is simple, stable, and surprisingly useful on small or nearly sorted data. It is much more practical than bubble sort in real code.

## Try It Live

- [Open this playground](/dsa/insertion-sort)
