# Quick Sort Algorithm

## Overview
Quick Sort is a highly efficient, divide-and-conquer sorting algorithm that works by selecting a 'pivot' element from the array and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.

## Algorithm Steps

### 1. Selecting Phase
- Choose a pivot element (we use the last element)
- Initialize left and right pointers
- Highlight the pivot element

### 2. Comparing Phase
- Compare elements at left and right pointers with pivot
- Move left pointer right if element is smaller than pivot
- Move right pointer left if element is greater than pivot
- Identify elements that need to be swapped

### 3. Swapping Phase
- Swap elements at left and right pointers
- Move pointers inward
- Continue partitioning

### 4. Pivoting Phase
- Place pivot in its correct sorted position
- All elements to the left are smaller
- All elements to the right are greater

### 5. Recursing Phase
- Create sub-partitions for left and right sides
- Repeat the process recursively

## Time Complexity

- **Best Case**: O(n log n) - Balanced partitions
- **Average Case**: O(n log n)
- **Worst Case**: O(n²) - Already sorted or reverse sorted with poor pivot selection

## Space Complexity

- **O(log n)** - For the recursion stack

## Characteristics

- **Not Stable**: Equal elements may change relative order
- **In-Place**: Sorts within the original array
- **Divide and Conquer**: Breaks problem into smaller sub-problems
- **Cache Efficient**: Good locality of reference

## Visualization Colors

- 🔵 **Blue**: Unsorted elements
- 🟡 **Yellow**: Pivot or elements being compared
- 🔴 **Red**: Elements being swapped
- 🟢 **Green**: Elements in their final sorted position

## Implementation Details

### Multi-Phase Stepping
The implementation uses a state machine approach with 5 distinct phases:

1. **Selecting**: Pick pivot and initialize pointers
2. **Comparing**: Compare elements with pivot
3. **Swapping**: Swap misplaced elements
4. **Pivoting**: Place pivot in final position
5. **Recursing**: Create new sub-partitions

This allows users to see each operation separately and understand the algorithm's logic step-by-step.

### Partition Stack
The algorithm maintains a stack of partitions to process:
- Each partition has `low` and `high` indices
- Sub-partitions are added after pivot placement
- Algorithm completes when stack is empty

## Usage Tips

1. **Step Mode**: Click "Step" to advance through each phase
2. **Play Mode**: Watch automatic execution with adjustable speed
3. **Debug Mode**: Enable to see current phase, partition info, and action history
4. **Array Size**: Start with smaller arrays (5-10) to understand the algorithm better

## Advantages

- Very efficient for large datasets
- Good average-case performance
- In-place sorting (low memory overhead)
- Cache-friendly due to sequential access patterns

## Disadvantages

- Worst-case O(n²) time complexity
- Not stable (relative order not preserved)
- Poor performance on already sorted data (without optimization)
- Recursive nature can lead to stack overflow for very large arrays

## Real-World Applications

- General-purpose sorting in many programming libraries
- Database query optimization
- Operating system task scheduling
- Network packet routing
- File system operations

## Educational Value

Quick Sort is excellent for learning:
- Divide and conquer strategy
- Partitioning techniques
- Recursion and stack management
- Trade-offs between best, average, and worst case
- In-place algorithms
