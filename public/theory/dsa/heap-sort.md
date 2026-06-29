# Heap Sort

## What It Is

Heap sort sorts an array by first turning it into a **max heap** and then repeatedly moving the largest element to the end of the array.

## Why It Matters

Heap sort is important because it combines two useful ideas:

- the heap data structure
- guaranteed `O(n log n)` sorting time

It is also in place, which gives it an advantage over merge sort when extra memory is a concern.

## Heap Idea in One Sentence

In a max heap, every parent is greater than or equal to its children, so the largest value is always at the root.

## How It Works

1. Build a max heap from the array.
2. Swap the root, the largest value, with the last element.
3. Shrink the heap by one element.
4. Restore the heap property with heapify.
5. Repeat until the heap becomes empty.

## Key Formula or Rule

In an array-based binary heap:

$$
left(i) = 2i + 1, \quad right(i) = 2i + 2, \quad parent(i) = \left\lfloor \frac{i-1}{2} \right\rfloor
$$

These index formulas are what let heap sort use a tree structure without storing explicit pointers.

## Worked Example

Sort `[4, 10, 3, 5, 1]`

After building a max heap, the array represents:

`[10, 5, 3, 4, 1]`

Now repeat:

- Swap `10` with `1` -> largest value is now fixed at the end
- Heapify the remaining part
- Next largest value moves to its final position

After all rounds, the result is:

`[1, 3, 4, 5, 10]`

## Looking Deeper

Heap sort depends on two separate ideas:

- **build heap** creates a valid heap from the raw array
- **heapify** restores the heap property after the root is removed

The array representation matters too. For index `i`:

- left child is `2i + 1`
- right child is `2i + 2`
- parent is usually `(i - 1) / 2`

That mapping is what lets heap sort stay in place without creating a separate tree structure.

## Complexity

| Property | Value |
| --- | --- |
| Build heap | `O(n)` |
| Total sort time | `O(n log n)` |
| Extra space | `O(1)` |
| Stable | No |

## Advantages

- Guaranteed `O(n log n)` time
- In-place sorting
- Useful when you want predictable time without extra array memory
- Naturally connected to priority queues and heaps

## Limitations

- Not stable
- Usually slower in practice than quick sort on arrays
- Harder to understand than insertion sort or merge sort

## Real-Life Uses

- Systems that already use heaps or priority queues
- Situations where worst-case guarantees matter
- Memory-constrained sorting tasks

## When to Use and Avoid

Use heap sort when:

- you need in-place sorting
- you want worst-case `O(n log n)` behavior
- stability is not required

Avoid heap sort when:

- you need a stable sort
- average-case speed on arrays matters more than worst-case guarantees
- readability is more important than algorithmic strength

## Under the Hood

Heap sort is closely related to priority queues. In fact, the sorting process is basically repeated `extract-max` operations on a heap.

Important trade-offs at this stage:

- better worst-case guarantees than quick sort
- less extra memory than merge sort
- often slower in practice because heap operations are branch-heavy and less cache-friendly

This makes heap sort an important algorithmic tool, even if it is not always the fastest real-world choice.

## How to Think About It in Practice

- Think of heap sort when you want predictable `O(n log n)` time with low extra array memory.
- If stability matters or the data is easier to split and merge, compare it against merge sort before choosing it.

## Common Mistakes

- Confusing heap order with fully sorted order
- Forgetting to reduce the heap size after each extraction
- Assuming the array is sorted immediately after building the heap

## Compare With

- [Merge Sort](/dsa/merge-sort): both guarantee `O(n log n)` time, but merge sort needs extra memory.
- [Quick Sort](/dsa/quick-sort): quick sort is often faster in practice, while heap sort is more predictable.

## Key Takeaway

Heap sort works by repeatedly taking the current maximum from a heap. It is a strong choice when you want good worst-case performance without using extra array memory.

## Try It Live

- [Open this playground](/dsa/heap-sort)
