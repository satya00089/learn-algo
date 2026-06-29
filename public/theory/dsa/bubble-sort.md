# Bubble Sort

## What It Is

Bubble sort is a simple sorting algorithm that repeatedly compares neighboring elements and swaps them if they are in the wrong order. Larger elements "bubble" toward the end of the array after each pass.

## Why It Matters

Bubble sort is rarely used in production, but it is useful for learning:

- how repeated passes over an array work
- how swaps gradually improve order
- why algorithm efficiency matters

## How It Works

1. Start at the beginning of the array.
2. Compare each pair of neighboring elements.
3. Swap them if the left value is greater than the right value.
4. After one full pass, the largest unsorted value ends up in its final position.
5. Repeat for the remaining unsorted portion.

## Key Formula or Rule

Bubble sort repeatedly applies one rule:

$$
\text{if } a[j] > a[j+1] \text{ then swap}
$$

That tiny comparison-and-swap rule is what gradually pushes large values toward the end.

## Worked Example

Sort `[5, 1, 4, 2]`

Pass 1:

- Compare `5` and `1` -> swap -> `[1, 5, 4, 2]`
- Compare `5` and `4` -> swap -> `[1, 4, 5, 2]`
- Compare `5` and `2` -> swap -> `[1, 4, 2, 5]`

Pass 2:

- Compare `1` and `4` -> no swap
- Compare `4` and `2` -> swap -> `[1, 2, 4, 5]`

Pass 3:

- Compare `1` and `2` -> no swap
- No swaps needed, so the array is sorted

## Looking Deeper

After each pass, bubble sort guarantees that the largest unsorted element has reached its final position.

That means:

- the sorted portion grows from right to left
- the next pass can ignore the final element

This also explains why the early-stop optimization works. If an entire pass finishes with no swaps, the array is already sorted and the algorithm can stop immediately.

## Complexity

| Property | Value |
| --- | --- |
| Best time | `O(n)` with early-stop optimization |
| Average time | `O(n^2)` |
| Worst time | `O(n^2)` |
| Space | `O(1)` |
| Stable | Yes |

## Advantages

- Very easy to understand and implement
- Sorts in place
- Stable, so equal elements keep their original order
- Good for teaching loops, swaps, and invariants

## Limitations

- Too slow for large datasets
- Performs many unnecessary comparisons
- Usually worse than insertion sort for small real inputs

## Real-Life Uses

Bubble sort is mostly used in:

- education and visual demos
- small toy problems
- situations where code clarity matters more than speed

## When to Use and Avoid

Use bubble sort when:

- you are learning sorting basics
- the input is tiny
- you want a very visual step-by-step algorithm

Avoid bubble sort when:

- performance matters
- the array can grow beyond a few elements
- better simple choices like insertion sort are available

## Under the Hood

At a deeper level, bubble sort is useful for understanding **inversions** in an array. Each swap removes at least one inversion, which helps explain both why the algorithm works and why nearly sorted arrays can finish quickly.

Even so, bubble sort is rarely chosen in real systems because other algorithms offer much better performance without much more implementation cost.

## How to Think About It in Practice

- Think of bubble sort as a learning tool for repeated passes, swaps, and invariants rather than as a production sorting choice.
- If you are solving a real sorting problem, use the page mainly to build intuition before moving to stronger algorithms.

## Common Mistakes

- Forgetting that one pass is not enough
- Not shrinking the unsorted portion after each pass
- Missing the early-stop optimization when the array becomes sorted

## Compare With

- [Insertion Sort](/dsa/insertion-sort): both are simple and stable, but insertion sort usually wins on nearly sorted data.
- [Selection Sort](/dsa/selection-sort): selection sort minimizes swaps, while bubble sort repeatedly moves large values upward.

## Key Takeaway

Bubble sort is a teaching algorithm, not a practical default. Its main value is helping you build intuition about how sorting gradually improves an array.

## Try It Live

- [Open this playground](/dsa/bubble-sort)
