# Heap Sort: Sorting with a Binary Heap

## What is Heap Sort?

Heap Sort is a **comparison-based sorting algorithm** that uses a binary heap data structure. It divides the input into a sorted and an unsorted region, and iteratively shrinks the unsorted region by extracting the largest element and moving it to the sorted region.

**Time Complexity:**
- **Best Case**: O(n log n)
- **Average Case**: O(n log n)
- **Worst Case**: O(n log n)

**Space Complexity:** O(1) - in-place sorting (excluding recursion)

## Understanding Binary Heaps

### Max Heap Property
A max heap is a complete binary tree where each node is greater than or equal to its children.

### Min Heap Property
A min heap is a complete binary tree where each node is less than or equal to its children.

### Array Representation
Heaps are typically stored in arrays where:
- **Root**: index 0
- **Left child** of node i: 2*i + 1
- **Right child** of node i: 2*i + 2
- **Parent** of node i: floor((i-1)/2)

## How Heap Sort Works

### Step-by-Step Example

Let's sort the array: `[4, 10, 3, 5, 1]`

**Step 1: Build Max Heap**
```
Initial array: [4, 10, 3, 5, 1]

Build heap:
         4
       /   \
      10    3
     / \
    5   1

After heapify operations:
        10
       /  \
      5    3
     / \
    4   1
```

**Step 2: Sort by extracting maximum**
```
Iteration 1: Swap root (10) with last element
Array: [1, 5, 3, 4, 10] → Sorted portion: [10]

Iteration 2: Heapify remaining [1, 5, 3, 4]
Array: [5, 1, 3, 4, 10] → Sorted portion: [5, 10]

Iteration 3: Heapify remaining [1, 4, 3]
Array: [4, 1, 3, 5, 10] → Sorted portion: [4, 5, 10]

Iteration 4: Heapify remaining [1, 3]
Array: [3, 1, 4, 5, 10] → Sorted portion: [3, 4, 5, 10]

Iteration 5: Final swap
Array: [1, 3, 4, 5, 10] → Sorted portion: [1, 3, 4, 5, 10]
```

## Key Operations

### Heapify (Sink Down)
Restores heap property by moving an element down the tree.

```
procedure heapify(arr, n, i)
    largest = i
    left = 2*i + 1
    right = 2*i + 2

    if left < n and arr[left] > arr[largest]
        largest = left

    if right < n and arr[right] > arr[largest]
        largest = right

    if largest != i
        swap arr[i] and arr[largest]
        heapify(arr, n, largest)
```

### Build Heap
Converts an array into a valid heap.

```
procedure buildHeap(arr, n)
    for i from n/2 - 1 downto 0
        heapify(arr, n, i)
```

## Algorithm Pseudocode

```
procedure heapSort(arr)
    n = length(arr)

    // Build max heap
    for i from n/2 - 1 downto 0
        heapify(arr, n, i)

    // Extract elements one by one
    for i from n-1 downto 1
        swap arr[0] and arr[i]  // Move current root to end
        heapify(arr, i, 0)      // Heapify reduced heap
```

## Key Characteristics

### Advantages
- **Guaranteed O(n log n)** performance in all cases
- **In-place sorting** - uses constant extra space
- **No worst-case scenarios** - predictable performance
- **Cache-friendly** - good locality of reference

### Disadvantages
- **Not stable** - doesn't preserve relative order of equal elements
- **Not adaptive** - doesn't benefit from existing order
- **Complex to implement** compared to simpler sorts

## Real-World Applications

- **Priority queues** - heap data structure foundation
- **Systems requiring predictable performance**
- **Embedded systems** - in-place sorting with bounded time
- **Large datasets** - when stability isn't required
- **Selection algorithms** - finding k-th largest element

## Performance Analysis

### Time Complexity Breakdown
- **Build heap**: O(n)
- **Extract maximum**: O(log n) per element
- **Total**: O(n log n)

### Space Complexity
- **In-place**: O(1) auxiliary space
- **No recursion overhead** in iterative implementations

## Comparison with Other Sorting Algorithms

| Algorithm | Best | Average | Worst | Stable | In-Place | Space |
|-----------|------|---------|-------|--------|----------|-------|
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | No | Yes | O(1) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | No | Yes | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | Yes | No | O(n) |
| Insertion Sort | O(n) | O(n²) | O(n²) | Yes | Yes | O(1) |
| Bubble Sort | O(n) | O(n²) | O(n²) | Yes | No | O(1) |

## Heap Operations in Detail

### Insert Operation
Add element to heap and restore heap property.

### Extract Max/Min
Remove and return root element, then restore heap property.

### Increase/Decrease Key
Modify element value and restore heap property.

## Variants and Optimizations

### Min Heap Sort
Sorts in ascending order using a min heap.

### Bottom-Up Heap Construction
More efficient heap building algorithm.

### Tournament Method
Alternative heap construction approach.

## When to Use Heap Sort

✅ **Use when:**
- Predictable performance is required
- In-place sorting is needed
- Memory is limited
- Stability is not required
- Large datasets need sorting

❌ **Avoid when:**
- Stable sorting is required
- Data is nearly sorted
- Simplicity is preferred over performance

## 💡 Pro Tips

- **Excellent for large datasets** - guaranteed O(n log n) performance
- **In-place sorting** - uses minimal extra memory
- **Foundation of priority queues** - essential data structure
- **Good cache performance** - operates on contiguous memory
- **Used in practice** - reliable choice when predictability matters

---

*Heap Sort combines the best of both worlds: the efficiency of advanced algorithms with the memory efficiency of in-place sorting.*