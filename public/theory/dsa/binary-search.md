# Binary Search

## What It Is

Binary search is a fast way to find a value in a **sorted** array. Instead of checking every element one by one, it looks at the middle element and throws away half of the remaining search space after each comparison.

## Why It Matters

When data is sorted, binary search turns a slow search problem into a much faster one.

- Linear search may check every item.
- Binary search keeps cutting the problem in half.
- That makes it one of the most important ideas in algorithm design.

## Before You Use It

Binary search only works well when these conditions are true:

- The data is sorted.
- You can jump directly to the middle element, so arrays are a good fit.
- You are searching for exact values, boundaries, or insertion positions.

## How It Works

1. Start with the full sorted array.
2. Look at the middle element.
3. If the middle value is the target, stop.
4. If the target is smaller, search only the left half.
5. If the target is larger, search only the right half.
6. Repeat until the value is found or the range becomes empty.

## Key Formula or Rule

The midpoint is usually computed as:

$$
mid = low + \left\lfloor \frac{high - low}{2} \right\rfloor
$$

This keeps the search range shrinking safely while avoiding the classic `low + high` overflow issue in some languages.

## Worked Example

Search for `23` in:

`[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`

Step 1:

- Low = 0, High = 9
- Middle index = 4
- Value = 16
- `23` is larger, so ignore the left half up to index 4

Step 2:

- Low = 5, High = 9
- Middle index = 7
- Value = 56
- `23` is smaller, so ignore the right half from index 7 onward

Step 3:

- Low = 5, High = 6
- Middle index = 5
- Value = 23
- Found

## Looking Deeper

The key invariant in binary search is that the target, if it exists, must always stay inside the current range `[low, high]`.

That means every update must be precise:

- when `arr[mid]` is too small, the new range becomes `mid + 1` to `high`
- when `arr[mid]` is too large, the new range becomes `low` to `mid - 1`

This same pattern is also the foundation for related problems such as:

- finding the first occurrence
- finding the last occurrence
- finding the insertion position
- searching over any monotonic condition, not just exact values

## Complexity

| Case | Time |
| --- | --- |
| Best | `O(1)` |
| Average | `O(log n)` |
| Worst | `O(log n)` |

Space complexity:

- Iterative version: `O(1)`
- Recursive version: `O(log n)` because of the call stack

## Advantages

- Very fast on large sorted arrays
- Easy to adapt for first occurrence, last occurrence, and insertion point problems
- Predictable performance
- Uses very little extra memory in iterative form

## Limitations

- Requires sorted data
- Sorting first can be expensive if the data changes often
- Not a good fit for linked lists because jumping to the middle is slow
- With duplicate values, a basic version may return any matching position

## Real-Life Uses

- Looking up a word in a dictionary-like sorted list
- Finding a value range in a database index
- Searching version history or timestamps
- Finding where a new value should be inserted to keep data sorted

## When to Use and Avoid

Use binary search when:

- Data is already sorted
- Fast repeated lookups matter
- You need boundary-style answers such as "first element greater than x"

Avoid binary search when:

- Data is unsorted
- The collection changes constantly
- You only have sequential access to the data

## Under the Hood

Many binary-search problems do not search for a value directly. Instead, they search for the smallest or largest answer that makes a condition true.

This is sometimes called:

- binary search on answer
- lower bound / upper bound search
- monotonic predicate search

In production code, experienced engineers also watch for subtle issues such as overflow-safe midpoint calculation, duplicate handling, and off-by-one errors at the edges of the range.

## How to Think About It in Practice

- Think of binary search when the data is already sorted or when a yes/no condition becomes true in a monotonic way.
- In interviews and real systems, the real question is often a boundary search such as first valid answer, not just exact lookup.

## Common Mistakes

- Forgetting to sort the input first
- Using the wrong loop condition
- Updating `low` and `high` incorrectly
- Assuming it always returns the first duplicate value

## Compare With

- [Binary Search Tree](/dsa/binary-search-tree): both rely on ordering, but BSTs support updates in a tree structure.
- [Array Operations](/dsa/array-operations): binary search is fast on sorted arrays, while linear scans work on any array.

## Key Takeaway

Binary search is powerful because it removes half of the remaining work after each comparison. If the data is sorted, this is usually the first fast search technique to consider.

## Try It Live

- [Open this playground](/dsa/binary-search)
