# Merge Sort

## What It Is

Merge sort is a divide-and-conquer sorting algorithm. It splits the array into smaller halves, sorts each half, and then merges the sorted halves back together.

## Why It Matters

Merge sort is important because it gives reliable `O(n log n)` performance, even in the worst case. It is also stable, which makes it useful when the order of equal elements should be preserved.

## How It Works

1. Split the array into two halves.
2. Recursively sort the left half.
3. Recursively sort the right half.
4. Merge the two sorted halves into one sorted array.

The key idea is that merging two sorted lists is much easier than sorting a large unsorted list from scratch.

## Key Formula or Rule

The time recurrence is:

$$
T(n) = 2T(n/2) + O(n)
$$

The `2T(n/2)` part comes from sorting the two halves, and the `O(n)` part comes from merging them back together.

## Worked Example

Sort `[8, 3, 5, 4, 7, 6, 1, 2]`

Split phase:

- `[8, 3, 5, 4]` and `[7, 6, 1, 2]`
- Then split again until each subarray has one element

Merge phase:

- Merge `[8]` and `[3]` -> `[3, 8]`
- Merge `[5]` and `[4]` -> `[4, 5]`
- Merge `[3, 8]` and `[4, 5]` -> `[3, 4, 5, 8]`
- Do the same on the right side
- Final merge produces `[1, 2, 3, 4, 5, 6, 7, 8]`

## Looking Deeper

Merge sort gets its speed from the recursion tree:

- there are about `log n` levels of splitting
- each level does about `n` total merge work

That is why the total time becomes `O(n log n)`.

The merge step is also where stability comes from. If equal values are taken from the left half first, their original relative order is preserved.

## Complexity

| Property | Value |
| --- | --- |
| Best time | `O(n log n)` |
| Average time | `O(n log n)` |
| Worst time | `O(n log n)` |
| Extra space | `O(n)` |
| Stable | Yes |

## Advantages

- Reliable performance
- Stable sorting
- Works well for linked lists and external sorting
- Easy to parallelize because the halves are independent

## Limitations

- Needs extra memory for arrays
- Recursive implementation adds overhead
- Usually not the fastest in-place choice for small arrays

## Real-Life Uses

- Sorting large datasets on disk
- Stable sorting of records by multiple fields
- Parallel sorting systems
- Linked-list sorting

## When to Use and Avoid

Use merge sort when:

- worst-case performance matters
- stability matters
- you are working with linked lists or large external data

Avoid merge sort when:

- memory is very limited
- you need a fully in-place solution
- the input is tiny and a simpler sort is enough

## Under the Hood

Common deeper implementations include:

- **bottom-up merge sort**, which avoids recursion
- **external merge sort**, which handles data too large for memory
- **parallel merge sort**, which sorts halves on different workers

Merge sort is also especially strong on linked lists, where splitting and merging can be cheaper than array-style shifting.

## How to Think About It in Practice

- Think of merge sort when worst-case predictability and stability both matter.
- It becomes even more attractive when data is naturally split across workers, files, or linked-list segments.

## Common Mistakes

- Forgetting that merging must compare both halves in order
- Ignoring the extra memory cost
- Assuming recursive splitting is the expensive part; the merge work also matters

## Compare With

- [Quick Sort](/dsa/quick-sort): merge sort is stable and predictable, while quick sort is often faster in practice.
- [Heap Sort](/dsa/heap-sort): both guarantee `O(n log n)`, but merge sort usually uses more auxiliary memory.

## Key Takeaway

Merge sort wins by breaking a hard problem into smaller ones and then combining the answers. It is a dependable choice when you want consistent speed and stable results.

## Try It Live

- [Open this playground](/dsa/merge-sort)
