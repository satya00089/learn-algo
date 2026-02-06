# Selection Sort: Finding Minimums Repeatedly

## What is Selection Sort?

Selection Sort is an **in-place comparison sorting algorithm** that divides the input list into two parts: a sorted sublist and an unsorted sublist. It repeatedly finds the minimum element from the unsorted portion and places it at the end of the sorted portion.

**Time Complexity:**
- **Best Case**: O(n²)
- **Average Case**: O(n²)
- **Worst Case**: O(n²)

**Space Complexity:** O(1) - in-place sorting

## How Selection Sort Works

### Step-by-Step Example

Let's sort the array: `[64, 25, 12, 22, 11]`

**Pass 1:** Find minimum in entire array
- Minimum is 11 at index 4
- Swap 11 with first element → `[11, 25, 12, 22, 64]`

**Pass 2:** Find minimum in remaining unsorted array `[25, 12, 22, 64]`
- Minimum is 12 at index 2
- Swap 12 with second element → `[11, 12, 25, 22, 64]`

**Pass 3:** Find minimum in remaining unsorted array `[25, 22, 64]`
- Minimum is 22 at index 3
- Swap 22 with third element → `[11, 12, 22, 25, 64]`

**Pass 4:** Find minimum in remaining unsorted array `[25, 64]`
- Minimum is 25 at index 3
- Swap 25 with fourth element → `[11, 12, 22, 25, 64]`

**Result:** Array is now sorted!

## Algorithm Pseudocode

```
procedure selectionSort(arr)
    n = length(arr)
    for i from 0 to n-2
        minIndex = i
        for j from i+1 to n-1
            if arr[j] < arr[minIndex]
                minIndex = j
        swap arr[i] and arr[minIndex]
```

## Key Characteristics

### Advantages
- **Simple to understand and implement**
- **In-place sorting** - uses constant extra space
- **Performs well in terms of memory writes** - makes at most n-1 swaps

### Disadvantages
- **Always O(n²)** - even for already sorted arrays
- **Unstable sort** - doesn't preserve relative order of equal elements
- **Inefficient** for large datasets

## Real-World Applications

- **Small datasets** - acceptable for n < 1000
- **Memory-constrained systems** - minimal extra space usage
- **Educational purposes** - clear demonstration of sorting concepts
- **Systems where swap operations are expensive** - minimizes swaps

## Comparison with Other Sorting Algorithms

| Algorithm | Best | Average | Worst | Stable | In-Place | Swaps |
|-----------|------|---------|-------|--------|----------|-------|
| Selection Sort | O(n²) | O(n²) | O(n²) | No | Yes | O(n) |
| Bubble Sort | O(n) | O(n²) | O(n²) | Yes | Yes | O(n²) |
| Insertion Sort | O(n) | O(n²) | O(n²) | Yes | Yes | O(n²) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | Yes | No | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | No | Yes | O(n) |

## Performance Analysis

### Number of Comparisons
- **Total comparisons**: n(n-1)/2
- **Always the same** regardless of input order

### Number of Swaps
- **Minimum**: 0 (already sorted)
- **Maximum**: n-1 (reverse sorted)

## When to Use Selection Sort

✅ **Use when:**
- Memory usage is critical
- Swap operations are expensive
- Dataset is small
- Simplicity is preferred over performance

❌ **Avoid when:**
- Large datasets
- Stability is required
- Performance is critical

## 💡 Pro Tips

- **Consider stability requirements** - use insertion sort if stability matters
- **Good for small arrays** - often used in hybrid sorting algorithms
- **Monitor swap counts** - can indicate how sorted the data was originally
- **Combine with other sorts** - selection sort can be part of more complex algorithms

---

*Selection Sort may not be the fastest, but its minimal memory usage and bounded swaps make it valuable in constrained environments.*