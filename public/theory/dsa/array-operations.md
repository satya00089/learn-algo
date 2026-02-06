# Array Operations: Fundamental Data Structure Manipulations

## What are Arrays?

Arrays are **contiguous blocks of memory** that store elements of the same type. They provide **O(1) access time** by index but have **fixed size** once allocated. Arrays are the foundation of most data structures and algorithms.

**Key Characteristics:**
- **Fixed size** - cannot grow/shrink dynamically
- **Contiguous memory** - elements stored sequentially
- **Random access** - O(1) access by index
- **Homogeneous** - all elements same type

## Basic Array Operations

### Access Operations
- **Direct Access**: `arr[index]` - O(1)
- **Sequential Access**: Iterate through elements - O(n)

### Modification Operations
- **Insert**: Add element at specific position
- **Delete**: Remove element at specific position
- **Update**: Modify element at specific position

## Array Operations in Detail

### Insertion Operations

#### Insert at End (Append)
- **Time**: O(1) amortized
- **Space**: May require resizing

```typescript
function insertAtEnd(arr: number[], value: number): number[] {
    return [...arr, value]
}
```

#### Insert at Beginning
- **Time**: O(n) - all elements shift right
- **Space**: O(n) temporary space

```typescript
function insertAtBeginning(arr: number[], value: number): number[] {
    return [value, ...arr]
}
```

#### Insert at Specific Index
- **Time**: O(n) - elements after index shift right
- **Space**: O(n) temporary space

```typescript
function insertAtIndex(arr: number[], index: number, value: number): number[] {
    return [...arr.slice(0, index), value, ...arr.slice(index)]
}
```

### Deletion Operations

#### Delete from End
- **Time**: O(1)
- **Space**: Array shrinks

```typescript
function deleteFromEnd(arr: number[]): number[] {
    return arr.slice(0, -1)
}
```

#### Delete from Beginning
- **Time**: O(n) - all elements shift left
- **Space**: O(n) temporary space

```typescript
function deleteFromBeginning(arr: number[]): number[] {
    return arr.slice(1)
}
```

#### Delete at Specific Index
- **Time**: O(n) - elements after index shift left
- **Space**: O(n) temporary space

```typescript
function deleteAtIndex(arr: number[], index: number): number[] {
    return [...arr.slice(0, index), ...arr.slice(index + 1)]
}
```

## Advanced Array Operations

### Searching Operations

#### Linear Search
- **Time**: O(n)
- **Best for**: Unsorted arrays, small arrays

```typescript
function linearSearch(arr: number[], target: number): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i
    }
    return -1
}
```

#### Binary Search (requires sorted array)
- **Time**: O(log n)
- **Best for**: Large sorted arrays

### Sorting Operations

#### In-Place Sorting
- **Bubble Sort**: O(n²)
- **Selection Sort**: O(n²)
- **Insertion Sort**: O(n²)
- **Quick Sort**: O(n log n) average
- **Merge Sort**: O(n log n)
- **Heap Sort**: O(n log n)

#### Stable vs Unstable Sorts
- **Stable**: Maintains relative order of equal elements
- **Unstable**: May change relative order of equal elements

### Transformation Operations

#### Reverse Array
- **Time**: O(n)
- **Space**: O(1) in-place, O(n) with new array

```typescript
function reverseArray(arr: number[]): number[] {
    const result = [...arr]
    let left = 0, right = arr.length - 1

    while (left < right) {
        [result[left], result[right]] = [result[right], result[left]]
        left++
        right--
    }

    return result
}
```

#### Rotate Array
- **Left Rotate**: Move elements left by k positions
- **Right Rotate**: Move elements right by k positions
- **Time**: O(n)
- **Space**: O(k) or O(1) with clever algorithms

### Subarray Operations

#### Maximum Subarray Sum (Kadane's Algorithm)
Find contiguous subarray with largest sum.

```typescript
function maxSubarraySum(arr: number[]): number {
    let maxCurrent = maxGlobal = arr[0]

    for (let i = 1; i < arr.length; i++) {
        maxCurrent = Math.max(arr[i], maxCurrent + arr[i])
        maxGlobal = Math.max(maxGlobal, maxCurrent)
    }

    return maxGlobal
}
```

#### Subarray Sum Equals K
Count subarrays that sum to target value.

## Multi-Dimensional Arrays

### 2D Arrays (Matrices)
- **Access**: `matrix[row][col]`
- **Traversal**: Row-major or column-major order
- **Operations**: Matrix multiplication, transpose, etc.

### Common 2D Array Problems
- **Matrix Rotation**: Rotate 90°, 180°, 270°
- **Spiral Traversal**: Visit elements in spiral order
- **Search in 2D Array**: Find element in sorted matrix

## Array Implementation Details

### Dynamic Arrays
- **Automatic resizing** when capacity reached
- **Amortized O(1)** insertion time
- **Growth factor**: Usually 1.5x or 2x

### Memory Layout
- **Contiguous allocation**
- **Cache-friendly access patterns**
- **Prefetching benefits**

### Bounds Checking
- **Prevents buffer overflows**
- **Runtime vs compile-time checking**
- **Performance implications**

## Real-World Applications

### Database Systems
- **Column storage** in analytical databases
- **Index arrays** for fast lookups
- **Bitmap indexes** for compressed storage

### Image Processing
- **Pixel arrays** in digital images
- **Convolution operations**
- **Matrix transformations**

### Scientific Computing
- **Vector operations**
- **Matrix computations**
- **Signal processing**

### Game Development
- **Tile maps** in 2D games
- **Particle systems**
- **Audio buffers**

## Performance Considerations

### Cache Performance
- **Spatial locality**: Access nearby elements
- **Temporal locality**: Reuse recently accessed elements
- **Cache line alignment**

### Memory Usage
- **Fixed overhead** per array
- **Element size** determines total memory
- **Alignment requirements**

### Algorithm Selection
- **Small arrays**: Simple algorithms often faster
- **Large arrays**: Complex algorithms worth the overhead
- **Sorted arrays**: Binary search instead of linear

## Common Array Patterns

### Two-Pointer Technique
- **Opposite ends**: For palindrome checking, reversal
- **Same direction**: For removing duplicates, partitioning

### Sliding Window
- **Fixed size**: Maximum sum subarray of size k
- **Variable size**: Longest substring without repeating characters

### Prefix Sum
- **Cumulative sums**: Range sum queries in O(1)
- **Difference arrays**: Range updates in O(1)

## When to Use Arrays

✅ **Use when:**
- Fast random access needed
- Size is known and fixed
- Memory efficiency is critical
- Cache performance matters
- Simple data structure suffices

❌ **Avoid when:**
- Dynamic sizing needed frequently
- Insertions/deletions in middle are common
- Memory is fragmented
- Data structure needs to grow/shrink dynamically

## 💡 Pro Tips

- **Pre-allocate capacity** when size is known
- **Use appropriate data types** to minimize memory usage
- **Consider cache effects** in algorithm design
- **Profile performance** - arrays can be surprisingly fast
- **Combine with other structures** - arrays as building blocks

---

*Arrays are the fundamental building blocks of data structures, offering unbeatable performance for random access operations.*