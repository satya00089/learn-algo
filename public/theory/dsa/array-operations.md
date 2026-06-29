# Array Operations

## What It Is

An array stores elements in a continuous block of memory. That makes some operations extremely fast, especially direct access by index, but it also makes some updates expensive because elements may need to shift.

## Why Arrays Matter

Arrays are one of the most common data structures in programming.

They are useful because they give you:

- fast access by index
- compact storage
- a strong foundation for many algorithms

## Core Idea

The strength of an array comes from **contiguous memory**. If you know the starting address and the size of each element, you can jump straight to any index.

That same design also explains the weakness:

- inserting or deleting in the middle often shifts many elements

## Common Operations and Cost

| Operation | Typical Cost | Why |
| --- | --- | --- |
| Read `arr[i]` | `O(1)` | Direct index lookup |
| Update `arr[i]` | `O(1)` | Replace value in place |
| Append at end | `O(1)` amortized | Usually just place next item |
| Insert in middle | `O(n)` | Later elements shift right |
| Delete in middle | `O(n)` | Later elements shift left |
| Linear search | `O(n)` | May scan all values |
| Binary search on sorted array | `O(log n)` | Repeatedly cuts range in half |

## Key Formula or Rule

For direct index access, the core array idea is:

$$
\text{address}(arr[i]) = base + i \times elementSize
$$

That formula is the reason array lookup by index is `O(1)`: once the start address is known, the location of `arr[i]` can be computed directly.

## Worked Example

Start with:

`[10, 20, 30, 40]`

Insert `25` at index 2:

- Move `30` and `40` one step right
- Place `25` at index 2
- Result: `[10, 20, 25, 30, 40]`

Delete the value at index 1:

- Remove `20`
- Shift `25`, `30`, and `40` left
- Result: `[10, 25, 30, 40]`

The values stay in order, but shifting creates extra work.

## Looking Deeper

Arrays become especially important once you understand **amortized cost**.

For example:

- appending to a dynamic array is often treated as `O(1)` on average
- but an occasional resize copies many elements at once

This is one reason arrays are so common in practice: the average behavior is excellent, and contiguous storage gives strong cache performance for iteration-heavy workloads.

## Patterns Built on Arrays

### Two Pointers

Useful when scanning from both ends or maintaining a small moving range.

Examples:

- checking palindromes
- removing duplicates from sorted arrays
- finding pairs with a target sum

### Sliding Window

Useful when the problem asks about a continuous subarray or substring.

Examples:

- longest substring without repeating characters
- maximum sum of a subarray of size `k`

### Prefix Sum

Useful when many range-sum queries are needed.

Idea:

- precompute cumulative sums once
- answer each range query quickly afterward

## Advantages

- Fast index-based access
- Simple memory layout
- Good cache performance
- Great for iteration and batch processing

## Limitations

- Middle insertions and deletions are expensive
- Fixed-size arrays cannot grow without creating a new array
- Dynamic arrays can resize, but resizing still costs time occasionally

## Real-Life Uses

- Image pixels stored in rows and columns
- Tabular data and spreadsheets
- Buffers, logs, and time-series data
- Backing storage for stacks, heaps, and dynamic lists

## When to Use and Avoid

Use arrays when:

- fast index access matters
- the order is important
- most work is reading, updating, or appending

Avoid arrays when:

- you insert or delete frequently in the middle
- the data structure needs cheap node-level rearrangement

## Under the Hood

In larger systems, arrays are not just a simple container. They are the foundation of many high-performance techniques:

- prefix sums
- sliding windows
- dynamic programming tables
- heaps
- array-backed deques and ring buffers

In systems work, contiguous layout also makes arrays friendly to vectorized operations, prefetching, and CPU cache lines, which is a big reason they remain a default choice.

## How to Think About It in Practice

- Think of arrays first when you need fast index access and most work is reading, updating, or appending.
- If the problem constantly inserts or deletes in the middle, treat that as a signal to compare arrays with linked or deque-like structures.

## Common Mistakes

- Treating appends and middle insertions as equally cheap
- Forgetting bounds checks
- Confusing arrays with linked structures that have different trade-offs

## Compare With

- [Stack](/dsa/stack): both can be array-backed, but a stack only exposes the top element.
- [Queue](/dsa/queue): queues preserve arrival order, while arrays give direct index access.

## Key Takeaway

Arrays are powerful because they make indexed access simple and fast. Their main trade-off is update cost when elements must shift.

## Try It Live

- [Open this playground](/dsa/array-operations)
