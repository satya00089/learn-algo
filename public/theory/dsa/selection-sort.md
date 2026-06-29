# Selection Sort

## What It Is

Selection sort repeatedly finds the smallest element in the unsorted part of the array and places it at the next correct position in the sorted part.

## Why It Matters

Selection sort is helpful because it separates sorting into a very clear idea:

- find the minimum
- place it where it belongs
- repeat

That makes it easy to reason about, even though it is not very fast.

## How It Works

1. Treat the array as two parts: sorted and unsorted.
2. Find the smallest value in the unsorted part.
3. Swap it with the first unsorted element.
4. Expand the sorted part by one position.
5. Repeat until the array is fully sorted.

## Key Formula or Rule

At step `i`, selection sort chooses:

$$
minIndex = \arg\min_{j \ge i} a[j]
$$

In plain language, it finds the smallest value in the remaining unsorted region and places it next.

## Worked Example

Sort `[29, 10, 14, 37, 13]`

Round 1:

- Smallest value is `10`
- Swap with first element
- Array becomes `[10, 29, 14, 37, 13]`

Round 2:

- Search remaining part `[29, 14, 37, 13]`
- Smallest value is `13`
- Swap with index 1
- Array becomes `[10, 13, 14, 37, 29]`

Round 3:

- Search remaining part `[14, 37, 29]`
- Smallest value is already `14`
- No useful change

Round 4:

- Search remaining part `[37, 29]`
- Smallest value is `29`
- Swap
- Array becomes `[10, 13, 14, 29, 37]`

## Looking Deeper

Selection sort keeps a clean invariant:

- the left side is already sorted
- the right side is still unsorted

Unlike bubble sort or insertion sort, it does not benefit much from partially sorted input. It still scans the remaining unsorted region to prove where the next minimum belongs.

Its main algorithmic advantage is not speed. It is the low number of swaps.

## Complexity

| Property | Value |
| --- | --- |
| Best time | `O(n^2)` |
| Average time | `O(n^2)` |
| Worst time | `O(n^2)` |
| Space | `O(1)` |
| Stable | No, not in its basic form |

## Advantages

- Easy to implement
- Uses only constant extra space
- Performs fewer swaps than bubble sort
- Useful when writes or swaps are expensive

## Limitations

- Still makes many comparisons
- Not adaptive, so nearly sorted data does not help much
- Too slow for large datasets

## Real-Life Uses

Selection sort is mostly seen in:

- teaching and interview discussions
- tiny embedded-style tasks where memory is tight
- cases where minimizing swaps matters more than minimizing comparisons

## When to Use and Avoid

Use selection sort when:

- the dataset is very small
- you want a simple in-place algorithm
- swap cost matters more than comparison cost

Avoid selection sort when:

- the input is medium or large
- stability matters
- the data is nearly sorted and insertion sort would do better

## Under the Hood

Selection sort becomes more interesting in environments where writes are expensive, such as memory-constrained devices or storage systems with limited rewrite budgets.

There are also stable variants of selection sort, but they usually need extra shifting work. That removes some of the simplicity that makes the basic version appealing in the first place.

## How to Think About It in Practice

- Think of selection sort mainly when teaching the idea of growing a sorted prefix or when swap count matters more than comparison count.
- For most practical data, it is better used as a contrast case that explains why stronger sorts exist.

## Common Mistakes

- Swapping too early before the full minimum is found
- Assuming it becomes fast on nearly sorted data
- Forgetting that basic selection sort is not stable

## Compare With

- [Insertion Sort](/dsa/insertion-sort): insertion sort is often more useful on nearly sorted input.
- [Bubble Sort](/dsa/bubble-sort): bubble sort repeatedly swaps neighbors, while selection sort minimizes the number of swaps.

## Key Takeaway

Selection sort is easy to reason about because each round places exactly one value in its final position. That clarity is its strength, even though its speed is limited.

## Try It Live

- [Open this playground](/dsa/selection-sort)
