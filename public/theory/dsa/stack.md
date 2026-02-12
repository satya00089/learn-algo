# Stack: Last In, First Out (LIFO) Data Structure

## What is a Stack?

A Stack is a **linear data structure** that follows the Last In, First Out (LIFO) principle. Elements are added and removed from the same end, called the "top" of the stack. Think of it like a stack of plates - you add plates to the top and remove from the top.

**Core Operations:**

- **Push**: Add element to top
- **Pop**: Remove element from top
- **Peek/Top**: View top element without removing
- **isEmpty**: Check if stack is empty

## How Stack Works

### Basic Operations Example

**Initial Stack:** `[]` (empty)

**Push 10:**

```
Stack: [10]
       ↑
      top
```

**Push 20:**

```
Stack: [10, 20]
          ↑
         top
```

**Push 30:**

```
Stack: [10, 20, 30]
             ↑
            top
```

**Pop (removes 30):**

```
Stack: [10, 20]
          ↑
         top
```

**Peek (returns 20, stack unchanged):**

```
Stack: [10, 20]
          ↑
         top
```

## Stack Implementation

### Array-Based Implementation

```typescript
class Stack {
  private items: number[] = []

  push(item: number): void {
    this.items.push(item)
  }

  pop(): number | undefined {
    return this.items.pop()
  }

  peek(): number | undefined {
    return this.items[this.items.length - 1]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  size(): number {
    return this.items.length
  }
}
```

### Linked List Implementation

```typescript
class Node {
  value: number
  next: Node | null

  constructor(value: number) {
    this.value = value
    this.next = null
  }
}

class Stack {
  private top: Node | null = null
  private _size: number = 0

  push(value: number): void {
    const newNode = new Node(value)
    newNode.next = this.top
    this.top = newNode
    this._size++
  }

  pop(): number | undefined {
    if (this.isEmpty()) return undefined

    const value = this.top!.value
    this.top = this.top!.next
    this._size--
    return value
  }

  peek(): number | undefined {
    return this.top?.value
  }

  isEmpty(): boolean {
    return this.top === null
  }

  size(): number {
    return this._size
  }
}
```

## Time Complexity

| Operation | Time Complexity |
| --------- | --------------- |
| Push      | O(1)            |
| Pop       | O(1)            |
| Peek      | O(1)            |
| isEmpty   | O(1)            |
| Size      | O(1)            |

## Real-World Applications

### Function Call Stack

- **Recursion management** - each function call creates a stack frame
- **Return address storage** - where to return after function completes
- **Local variable storage** - function-scoped variables

### Expression Evaluation

- **Infix to Postfix conversion**
- **Postfix expression evaluation**
- **Parentheses matching**

### Browser History

- **Back button functionality**
- **Forward button functionality**
- **Navigation history management**

### Undo/Redo Operations

- **Text editors** - undo last action
- **Graphic editors** - undo drawing operations
- **Database transactions** - rollback operations\*\*

### Memory Management

- **Call stack** in programming languages
- **Heap memory allocation**
- **Garbage collection algorithms**

## Classic Stack Problems

### Balanced Parentheses

Check if parentheses are properly balanced: `"({[]})"` ✅, `"(]"` ❌

### Infix to Postfix Conversion

Convert: `A + B * C` → `A B C * +`

### Postfix Evaluation

Evaluate: `2 3 4 * +` → `2 + (3 * 4)` → `14`

### Next Greater Element

Find next greater element for each array element.

### Stock Span Problem

Calculate span of stock prices.

## Stack Variants

### Min Stack

Stack that supports finding minimum element in O(1) time.

### Max Stack

Stack that supports finding maximum element in O(1) time.

### Monotonic Stack

Stack that maintains elements in monotonic order.

### Two Stacks in One Array

Implement two stacks using single array efficiently.

## Advanced Applications

### Tree Traversals

- **Depth-First Search (DFS)** uses stack
- **Expression tree evaluation**
- **Syntax tree construction**

### Graph Algorithms

- **Depth-First Search**
- **Topological sorting**
- **Cycle detection**

### String Processing

- **String reversal**
- **Palindrome checking**
- **Bracket matching in code editors**

## Implementation Considerations

### Fixed vs Dynamic Size

- **Fixed size**: Array-based, may overflow
- **Dynamic size**: Linked list or resizable array

### Error Handling

- **Stack overflow**: Pushing to full stack
- **Stack underflow**: Popping from empty stack

### Thread Safety

- **Concurrent access**: Synchronization needed
- **Lock-free implementations**: For high-performance scenarios

## When to Use Stacks

✅ **Use when:**

- LIFO access pattern needed
- Recursion simulation required
- Expression evaluation needed
- Undo/redo functionality required
- Function call management needed

❌ **Avoid when:**

- FIFO access needed (use Queue)
- Random access required (use Array/List)
- Priority-based access needed (use Priority Queue)

## 💡 Pro Tips

- **Choose right implementation** - array for fixed size, linked list for dynamic
- **Handle edge cases** - empty stack operations
- **Consider space efficiency** - linked list uses more memory per element
- **Use built-in stacks** - most languages provide stack implementations
- **Combine with other data structures** - stack + queue for complex algorithms

---

_Stacks are fundamental to computer science, appearing in everything from function calls to complex algorithm implementations._
