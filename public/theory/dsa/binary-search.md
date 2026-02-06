# Binary Search: Efficient Searching in Sorted Arrays

## What is Binary Search?

Binary Search is a **divide-and-conquer algorithm** that finds the position of a target value within a sorted array. It works by repeatedly dividing the search interval in half, comparing the target value to the middle element, and narrowing the search to the appropriate half.

**Time Complexity:** O(log n)
**Space Complexity:** O(1) - iterative version

## How Binary Search Works

### Step-by-Step Example

Let's search for target `23` in the sorted array: `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]`

**Step 1: Initial bounds**
- Low = 0, High = 9, Mid = 4
- Array[4] = 16
- 23 > 16, so search right half

**Step 2: Right half**
- Low = 5, High = 9, Mid = 7
- Array[7] = 56
- 23 < 56, so search left half

**Step 3: Left half**
- Low = 5, High = 6, Mid = 5
- Array[5] = 23
- 23 == 23, **found at index 5!**

## Algorithm Pseudocode

### Iterative Implementation

```
function binarySearch(arr, target)
    low = 0
    high = arr.length - 1

    while low <= high
        mid = low + (high - low) / 2

        if arr[mid] == target
            return mid
        else if arr[mid] < target
            low = mid + 1
        else
            high = mid - 1

    return -1  // Not found
```

### Recursive Implementation

```
function binarySearchRecursive(arr, target, low, high)
    if low > high
        return -1

    mid = low + (high - low) / 2

    if arr[mid] == target
        return mid
    else if arr[mid] < target
        return binarySearchRecursive(arr, target, mid + 1, high)
    else
        return binarySearchRecursive(arr, target, low, mid - 1)
```

## Key Characteristics

### Advantages
- **Very efficient** - O(log n) time complexity
- **Simple to implement** - few lines of code
- **Memory efficient** - O(1) space for iterative version
- **Predictable performance** - consistent speed

### Disadvantages
- **Requires sorted array** - preprocessing needed
- **Only works on arrays** - not suitable for linked lists
- **Not adaptive** - doesn't benefit from data patterns

## Real-World Applications

- **Database indexing** - B-trees and B+ trees
- **Dictionary lookups** - word search in sorted dictionaries
- **File system searches** - finding files in sorted directories
- **IP routing tables** - network packet routing
- **Version control** - finding commits in git history

## Edge Cases and Considerations

### Empty Array
- Return -1 immediately

### Single Element
- Check if it matches target

### Target Not Found
- Low > High condition triggers

### Duplicate Elements
- May return any occurrence
- Can be modified to return first/last occurrence

### Integer Overflow
- Use `mid = low + (high - low) / 2` instead of `(low + high) / 2`

## Variants

### First Occurrence
Find the leftmost occurrence of target in array with duplicates.

### Last Occurrence
Find the rightmost occurrence of target in array with duplicates.

### Count Occurrences
Count how many times target appears in sorted array.

### Find Insertion Point
Find where target should be inserted to maintain sorted order.

## Performance Analysis

### Time Complexity
- **Best Case**: O(1) - target is middle element
- **Worst Case**: O(log n) - target not found or at end
- **Average Case**: O(log n)

### Space Complexity
- **Iterative**: O(1)
- **Recursive**: O(log n) for call stack

## Comparison with Other Search Algorithms

| Algorithm | Time Complexity | Space Complexity | Requirements |
|-----------|----------------|------------------|--------------|
| Binary Search | O(log n) | O(1) | Sorted array |
| Linear Search | O(n) | O(1) | None |
| Interpolation Search | O(log log n) avg | O(1) | Uniform distribution |
| Exponential Search | O(log n) | O(1) | Sorted array |
| Jump Search | O(√n) | O(1) | Sorted array |

## Implementation Tips

### Language-Specific Considerations

**JavaScript/TypeScript:**
```typescript
// Handle large arrays to prevent integer overflow
const mid = Math.floor(low + (high - low) / 2)
```

**Python:**
```python
# Use integer division
mid = low + (high - low) // 2
```

**Java:**
```java
// Use safe calculation
int mid = low + (high - low) / 2;
```

### Testing Strategy
- Test with empty arrays
- Test with single element
- Test with target at beginning, middle, end
- Test with target not in array
- Test with duplicate elements

## When to Use Binary Search

✅ **Use when:**
- Data is sorted and static
- Fast lookups are critical
- Memory is limited
- Predictable performance is needed

❌ **Avoid when:**
- Data changes frequently (requires resorting)
- Data is unsorted
- Small datasets (linear search may be faster)
- Data structure doesn't support random access

## 💡 Pro Tips

- **Always sort first** - ensure data is sorted before searching
- **Handle edge cases** - empty arrays, single elements, not found
- **Use iterative version** - avoids recursion stack overflow
- **Consider data distribution** - interpolation search for uniform data
- **Combine with other algorithms** - part of more complex search strategies

---

*Binary Search transforms linear search problems into logarithmic ones, making it one of the most important algorithms in computer science.*