# Quick Sort

## What It Is

Quick sort is a divide-and-conquer sorting algorithm that chooses a **pivot**, partitions the array around that pivot, and then recursively sorts the left and right parts.

## Why It Matters

Quick sort is one of the fastest practical comparison sorts for arrays. Even though its worst case is poor, its average-case behavior and cache-friendly access pattern make it extremely popular.

## Intuition

Instead of fully sorting the whole array at once, quick sort first places one element, the pivot, into its correct final position. Then it only needs to sort the elements on the left and right of that pivot.

## How It Works

1. Choose a pivot.
2. Rearrange the array so values smaller than the pivot go left and larger values go right.
3. The pivot ends up in its final sorted position.
4. Recursively apply the same process to the left and right partitions.

## Key Formula or Rule

A partition-based recurrence looks like:

$$
T(n) = T(k) + T(n-k-1) + O(n)
$$

The split size `k` depends on where the pivot lands, which is exactly why pivot quality matters so much.

## Worked Example

Sort `[9, 4, 7, 3, 10, 5]` using `5` as the pivot.

Partition step:

- Smaller than `5`: `[4, 3]`
- Pivot: `[5]`
- Larger than `5`: `[9, 7, 10]`

Now sort the left and right parts:

- Left becomes `[3, 4]`
- Right becomes `[7, 9, 10]`

Final result:

- `[3, 4, 5, 7, 9, 10]`

## Looking Deeper

The heart of quick sort is the **partition invariant**:

- values less than the pivot move left
- values greater than the pivot move right
- once partitioning finishes, the pivot is already in its final place

This is important because quick sort does not merge sorted pieces later. It wins by solving the partitioning step well enough that the subproblems become smaller immediately.

## Complexity

| Case | Time |
| --- | --- |
| Best | `O(n log n)` |
| Average | `O(n log n)` |
| Worst | `O(n^2)` |

Other properties:

- Space: `O(log n)` average recursion depth
- Stable: No, not in basic in-place implementations

## Pivot Choice Matters

Good pivot choices produce balanced partitions. Poor pivot choices produce very uneven partitions.

Common strategies:

- first element
- last element
- middle element
- random pivot
- median of three

Random or median-style pivots usually reduce the chance of worst-case behavior.

## Advantages

- Very fast in practice
- Usually in place
- Great cache behavior on arrays
- Widely used as a building block in real sorting libraries

## Limitations

- Worst-case time is `O(n^2)`
- Not stable by default
- Poor pivot choices can hurt performance badly
- Recursive calls can become deep on bad inputs

## Real-Life Uses

- General-purpose array sorting
- Library sorting implementations and hybrids
- Partition-based problems such as quickselect

## When to Use and Avoid

Use quick sort when:

- you need strong average performance
- the data fits well in memory
- stability is not required

Avoid quick sort when:

- worst-case guarantees are critical
- you must preserve equal-element order
- the data is often already in a pattern that breaks your pivot strategy

## Under the Hood

Real implementations often add more ideas on top of basic quick sort:

- randomized pivots to reduce bad patterns
- median-of-three pivot selection
- three-way partitioning for many duplicates
- introsort, which falls back to heap sort if recursion gets too deep

This is why quick sort remains important: its simple core can be upgraded into very strong production-grade sorting strategies.

## How to Think About It in Practice

- Think of quick sort when you want strong average-case in-memory performance and do not need stability.
- Pivot quality matters, so always connect the algorithm choice back to the shape of the input.

## Common Mistakes

- Picking a consistently bad pivot
- Forgetting to stop recursion on very small ranges
- Confusing the partition step with full sorting

## Compare With

- [Merge Sort](/dsa/merge-sort): merge sort is stable and predictable, while quick sort is often faster on average.
- [Heap Sort](/dsa/heap-sort): heap sort keeps `O(n log n)` worst-case behavior without extra merge buffers.

## Key Takeaway

Quick sort is powerful because partitioning is cheap and often creates smaller problems quickly. Its speed in real life is excellent, but its pivot strategy determines how well it behaves.

## Try It Live

- [Open this playground](/dsa/quick-sort)
