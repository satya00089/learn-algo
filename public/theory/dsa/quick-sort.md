# Quick Sort: Fast and Efficient In-Place Sorting

## What is Quick Sort?

Quick Sort is a **highly efficient divide-and-conquer sorting algorithm** that works by selecting a 'pivot' element and partitioning the array around it. It's generally faster than other O(n log n) algorithms in practice, though it has a worst-case time complexity of O(n²).

**Time Complexity:**
- **Best Case**: O(n log n)
- **Average Case**: O(n log n)
- **Worst Case**: O(n²) - when pivot is always the smallest/largest element

**Space Complexity:** O(log n) - for recursion stack

## How Quick Sort Works

### Step-by-Step Example

Let's sort the array: `[10, 80, 30, 90, 40, 50, 70]`

**Step 1: Choose pivot and partition**
- Choose pivot = 70
- Partition around pivot: `[10, 30, 40, 50]` + `[70]` + `[80, 90]`

**Step 2: Recursively sort left subarray `[10, 30, 40, 50]`**
- Choose pivot = 50
- Partition: `[10, 30, 40]` + `[50]` + `[]`

**Step 3: Recursively sort `[10, 30, 40]`**
- Choose pivot = 40
- Partition: `[10, 30]` + `[40]` + `[]`

**Step 4: Recursively sort `[10, 30]`**
- Choose pivot = 30
- Partition: `[10]` + `[30]` + `[]`

**Step 5: Recursively sort right subarray `[80, 90]`**
- Choose pivot = 90
- Partition: `[80]` + `[90]` + `[]`

**Final result:** `[10, 30, 40, 50, 70, 80, 90]`

## The Partitioning Process

### Lomuto Partition Scheme

```
procedure partition(arr, low, high)
    pivot = arr[high]
    i = low - 1

    for j from low to high-1
        if arr[j] <= pivot
            i++
            swap arr[i] and arr[j]

    swap arr[i+1] and arr[high]
    return i+1
```

### Hoare Partition Scheme (Original)

```
procedure partition(arr, low, high)
    pivot = arr[low]
    i = low - 1
    j = high + 1

    while true
        do i++ while arr[i] < pivot
        do j-- while arr[j] > pivot

        if i >= j
            return j

        swap arr[i] and arr[j]
```

## Algorithm Pseudocode

```
procedure quickSort(arr, low, high)
    if low < high
        pivotIndex = partition(arr, low, high)
        quickSort(arr, low, pivotIndex - 1)
        quickSort(arr, pivotIndex + 1, high)

procedure partition(arr, low, high)
    pivot = arr[high]
    i = low - 1

    for j from low to high-1
        if arr[j] <= pivot
            i++
            swap arr[i] and arr[j]

    swap arr[i+1] and arr[high]
    return i+1
```

## Key Characteristics

### Advantages
- **Very fast in practice** - often fastest sorting algorithm
- **In-place sorting** - uses O(log n) extra space
- **Cache-friendly** - good locality of reference
- **Highly optimized** - used in many standard libraries

### Disadvantages
- **Unstable sort** - doesn't preserve relative order of equal elements
- **Worst case O(n²)** - can be slow on already sorted data
- **Not adaptive** - doesn't take advantage of existing order

## Pivot Selection Strategies

### First Element
- Simple but poor for sorted arrays
- Leads to O(n²) worst case

### Last Element
- Simple and commonly used
- Same issue with sorted arrays

### Middle Element
- Better choice, reduces worst case
- Still predictable

### Random Element
- Unpredictable, good average case
- Adds overhead of random number generation

### Median-of-Three
- Choose median of first, middle, and last elements
- Good balance of simplicity and effectiveness

## Real-World Applications

- **System libraries** - C's qsort(), Java's Arrays.sort()
- **Large datasets** - excellent average performance
- **In-memory sorting** - when space is not a major constraint
- **Database systems** - used in query optimization
- **Programming contests** - fast and reliable

## Performance Analysis

### Best Case
- **Balanced partitions** - each partition has roughly n/2 elements
- **Time**: O(n log n)

### Worst Case
- **Unbalanced partitions** - one partition has n-1 elements
- **Time**: O(n²)
- **Occurs when**: pivot is always smallest/largest element

### Average Case
- **Random pivot selection**: O(n log n)
- **Good pivot choice**: close to O(n log n)

## Comparison with Other Sorting Algorithms

| Algorithm | Best | Average | Worst | Stable | In-Place | Space |
|-----------|------|---------|-------|--------|----------|-------|
| Quick Sort | O(n log n) | O(n log n) | O(n²) | No | Yes | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | Yes | No | O(n) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | No | Yes | O(1) |
| Insertion Sort | O(n) | O(n²) | O(n²) | Yes | Yes | O(1) |
| Bubble Sort | O(n) | O(n²) | O(n²) | Yes | No | O(1) |

## Optimizations and Variants

### Three-Way Partitioning
Handles duplicate elements efficiently (used in Java).

### Hybrid Algorithms
- **IntroSort**: QuickSort + HeapSort (fallback for worst case)
- **TimSort**: MergeSort + InsertionSort (used in Python)

### Parallel QuickSort
Can be parallelized for multi-core systems.

## When to Use Quick Sort

✅ **Use when:**
- Average performance is more important than worst case
- In-place sorting is required
- Memory usage needs to be minimized
- Data is randomly ordered

❌ **Avoid when:**
- Worst-case performance must be guaranteed
- Stable sorting is required
- Data is already nearly sorted
- Memory is abundant (consider Merge Sort)

## 💡 Pro Tips

- **Choose good pivots** - median-of-three or random selection
- **Use hybrid approaches** - combine with other sorts for robustness
- **Consider three-way partitioning** - better for arrays with duplicates
- **Monitor recursion depth** - prevent stack overflow on bad pivots
- **Excellent in practice** - often the fastest sorting algorithm available

---

*Quick Sort's speed and efficiency make it the go-to choice for most sorting needs, despite its theoretical worst case.*