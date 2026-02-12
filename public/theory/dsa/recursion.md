# Recursion: Solving Problems by Breaking Them Down

## What is Recursion?

Recursion is a **programming technique** where a function calls itself to solve a problem by breaking it down into smaller, identical subproblems. Each recursive call works on a smaller version of the original problem until reaching a base case.

**Key Components:**

- **Base Case**: Stopping condition that doesn't recurse
- **Recursive Case**: Calls itself with smaller input
- **Call Stack**: Memory structure for tracking function calls

## How Recursion Works

### Classic Example: Factorial

**Mathematical Definition:**

```
n! = n × (n-1) × (n-2) × ... × 1
0! = 1
```

**Recursive Implementation:**

```typescript
function factorial(n: number): number {
  // Base case
  if (n === 0 || n === 1) {
    return 1
  }

  // Recursive case
  return n * factorial(n - 1)
}
```

**Call Stack for factorial(4):**

```
factorial(4) = 4 * factorial(3)
factorial(3) = 3 * factorial(2)
factorial(2) = 2 * factorial(1)
factorial(1) = 1
factorial(2) = 2 * 1 = 2
factorial(3) = 3 * 2 = 6
factorial(4) = 4 * 6 = 24
```

## Types of Recursion

### Direct Recursion

Function calls itself directly.

### Indirect Recursion

Function calls another function which eventually calls the first function.

### Linear Recursion

Each call makes at most one recursive call (like factorial).

### Tree Recursion

Each call makes multiple recursive calls (like Fibonacci).

## Classic Recursive Problems

### Fibonacci Sequence

**Naive Recursive (Inefficient):**

```typescript
function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
// Time: O(2^n) - exponential!
```

**Memoized Version (Efficient):**

```typescript
function fibonacci(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!

  const result = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
  memo.set(n, result)
  return result
}
// Time: O(n) - linear!
```

### Tower of Hanoi

**Problem:** Move n disks from source to destination using auxiliary peg.

```typescript
function towerOfHanoi(n: number, source: string, auxiliary: string, destination: string): void {
  if (n === 1) {
    console.log(`Move disk 1 from ${source} to ${destination}`)
    return
  }

  // Move n-1 disks from source to auxiliary
  towerOfHanoi(n - 1, source, destination, auxiliary)

  // Move nth disk from source to destination
  console.log(`Move disk ${n} from ${source} to ${destination}`)

  // Move n-1 disks from auxiliary to destination
  towerOfHanoi(n - 1, auxiliary, source, destination)
}
```

### Binary Search (Recursive)

```typescript
function binarySearch(
  arr: number[],
  target: number,
  left: number = 0,
  right: number = arr.length - 1
): number {
  if (left > right) return -1

  const mid = Math.floor((left + right) / 2)

  if (arr[mid] === target) return mid
  if (arr[mid] > target) {
    return binarySearch(arr, target, left, mid - 1)
  } else {
    return binarySearch(arr, target, mid + 1, right)
  }
}
```

## Recursion vs Iteration

### When to Use Recursion

✅ **Use recursion when:**

- Problem has natural recursive structure
- Solution is more elegant/readable
- Tree/graph traversal needed
- Divide-and-conquer algorithms
- Backtracking problems

### When to Use Iteration

✅ **Use iteration when:**

- Performance is critical
- Stack space is limited
- Tail recursion not optimized
- Simple loops suffice

### Performance Comparison

| Aspect         | Recursion     | Iteration         |
| -------------- | ------------- | ----------------- |
| Time           | Often same    | Often same        |
| Space          | O(depth)      | O(1)              |
| Readability    | Often clearer | Sometimes clearer |
| Debugging      | Harder        | Easier            |
| Stack overflow | Possible      | Impossible        |

## Advanced Recursion Concepts

### Tail Recursion

Recursive call is the last operation.

```typescript
// Tail recursive factorial
function factorialTail(n: number, accumulator: number = 1): number {
  if (n === 0) return accumulator
  return factorialTail(n - 1, n * accumulator)
}
```

### Mutual Recursion

Functions that call each other.

```typescript
function isEven(n: number): boolean {
  if (n === 0) return true
  return isOdd(n - 1)
}

function isOdd(n: number): boolean {
  if (n === 0) return false
  return isEven(n - 1)
}
```

### Recursion with Memoization

Cache results to avoid redundant calculations.

### Backtracking

Try solutions, backtrack when they don't work.

```typescript
function solveNQueens(n: number): string[][] {
  const board: string[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill('.'))
  const solutions: string[][] = []

  function isSafe(row: number, col: number): boolean {
    // Check if queen can be placed at board[row][col]
    // Implementation omitted for brevity
    return true
  }

  function backtrack(row: number): void {
    if (row === n) {
      solutions.push(board.map((r) => r.join('')))
      return
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row][col] = 'Q'
        backtrack(row + 1)
        board[row][col] = '.' // Backtrack
      }
    }
  }

  backtrack(0)
  return solutions
}
```

## Recursion in Data Structures

### Tree Traversals

**Pre-order (Root → Left → Right):**

```typescript
function preorderTraversal(root: TreeNode | null): number[] {
  if (!root) return []
  return [root.val, ...preorderTraversal(root.left), ...preorderTraversal(root.right)]
}
```

**In-order (Left → Root → Right):**

```typescript
function inorderTraversal(root: TreeNode | null): number[] {
  if (!root) return []
  return [...inorderTraversal(root.left), root.val, ...inorderTraversal(root.right)]
}
```

**Post-order (Left → Right → Root):**

```typescript
function postorderTraversal(root: TreeNode | null): number[] {
  if (!root) return []
  return [...postorderTraversal(root.left), ...postorderTraversal(root.right), root.val]
}
```

### Graph Algorithms

- **Depth-First Search (DFS)**
- **Topological Sort**
- **Cycle Detection**

## Common Recursion Patterns

### Divide and Conquer

- **Merge Sort**
- **Quick Sort**
- **Binary Search**

### Dynamic Programming with Memoization

- **Fibonacci with memoization**
- **Longest Common Subsequence**
- **Knapsack Problem**

### Combinatorial Problems

- **Permutations**
- **Combinations**
- **Subsets**

## Handling Recursion Limits

### Stack Overflow Prevention

- **Increase stack size** (if possible)
- **Convert to iteration**
- **Use tail recursion** (if language supports optimization)

### JavaScript Specific

```javascript
// Check recursion depth
let depth = 0
const MAX_DEPTH = 10000

function recursiveFunction(n) {
  depth++
  if (depth > MAX_DEPTH) {
    throw new Error('Maximum recursion depth exceeded')
  }

  // ... function logic

  depth--
}
```

## Real-World Applications

### File System Traversal

- **Directory walking**
- **File searching**
- **Permission checking**

### Compiler Design

- **Syntax tree construction**
- **Expression evaluation**
- **Code optimization**

### Artificial Intelligence

- **Game tree search**
- **Pathfinding algorithms**
- **Decision trees**

### Mathematical Computations

- **Fractal generation**
- **Numerical integration**
- **Series summation**

## Debugging Recursive Functions

### Common Issues

- **Missing base case** → infinite recursion
- **Wrong base case** → incorrect results
- **Incorrect recursive calls** → wrong logic
- **Stack overflow** → too deep recursion

### Debugging Techniques

- **Add debug prints** for each call
- **Use debugger** to step through calls
- **Draw call tree** on paper
- **Test with small inputs** first

## When to Use Recursion

✅ **Use when:**

- Problem is naturally recursive
- Code clarity is important
- Tree/graph structures involved
- Backtracking needed
- Divide-and-conquer fits

❌ **Avoid when:**

- Performance critical
- Stack space limited
- Simple iteration suffices
- Language doesn't optimize tail recursion

## 💡 Pro Tips

- **Always define base case first**
- **Ensure progress toward base case**
- **Consider memoization** for expensive computations
- **Test with small inputs** to verify correctness
- **Convert to iteration** if stack overflow occurs
- **Use tail recursion** when possible

---

_Recursion is a powerful technique that elegantly solves complex problems by breaking them into simpler subproblems._
