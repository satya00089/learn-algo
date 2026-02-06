# Queue: First In, First Out (FIFO) Data Structure

## What is a Queue?

A Queue is a **linear data structure** that follows the First In, First Out (FIFO) principle. Elements are added at the rear (enqueue) and removed from the front (dequeue). Think of it like a line at a store - the first person in line is served first.

**Core Operations:**
- **Enqueue**: Add element to rear
- **Dequeue**: Remove element from front
- **Front/Peek**: View front element without removing
- **Rear**: View rear element
- **isEmpty**: Check if queue is empty

## How Queue Works

### Basic Operations Example

**Initial Queue:** `[]` (empty)

**Enqueue 10:**
```
Queue: [10]
       ↑
     front
      rear
```

**Enqueue 20:**
```
Queue: [10, 20]
       ↑    ↑
     front rear
```

**Enqueue 30:**
```
Queue: [10, 20, 30]
       ↑        ↑
     front     rear
```

**Dequeue (removes 10):**
```
Queue: [20, 30]
          ↑  ↑
       front rear
```

**Peek (returns 20, queue unchanged):**
```
Queue: [20, 30]
          ↑  ↑
       front rear
```

## Queue Implementation

### Array-Based Implementation

```typescript
class Queue {
    private items: number[] = []

    enqueue(item: number): void {
        this.items.push(item)
    }

    dequeue(): number | undefined {
        return this.items.shift()
    }

    front(): number | undefined {
        return this.items[0]
    }

    rear(): number | undefined {
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

class Queue {
    private front: Node | null = null
    private rear: Node | null = null
    private _size: number = 0

    enqueue(value: number): void {
        const newNode = new Node(value)

        if (this.isEmpty()) {
            this.front = this.rear = newNode
        } else {
            this.rear!.next = newNode
            this.rear = newNode
        }
        this._size++
    }

    dequeue(): number | undefined {
        if (this.isEmpty()) return undefined

        const value = this.front!.value
        this.front = this.front!.next

        if (this.front === null) {
            this.rear = null
        }

        this._size--
        return value
    }

    front(): number | undefined {
        return this.front?.value
    }

    rear(): number | undefined {
        return this.rear?.value
    }

    isEmpty(): boolean {
        return this.front === null
    }

    size(): number {
        return this._size
    }
}
```

## Time Complexity

| Operation | Array Implementation | Linked List Implementation |
|-----------|---------------------|---------------------------|
| Enqueue | O(1) | O(1) |
| Dequeue | O(n) | O(1) |
| Front | O(1) | O(1) |
| Rear | O(1) | O(1) |
| isEmpty | O(1) | O(1) |

## Real-World Applications

### Task Scheduling
- **Print queues** - documents wait in queue for printing
- **CPU scheduling** - processes wait for CPU time
- **Job queues** - background tasks in web servers

### Breadth-First Search (BFS)
- **Graph traversal** - visiting nodes level by level
- **Shortest path** in unweighted graphs
- **Web crawling** - processing URLs in order

### Message Queues
- **Asynchronous communication** between services
- **Load balancing** - distribute work among workers
- **Event-driven systems** - handle events in order

### Operating System
- **I/O request handling**
- **Interrupt handling**
- **Process scheduling**

### Real-Time Systems
- **Event processing** in order of occurrence
- **Network packet handling**
- **Audio/video streaming buffers**

## Queue Variants

### Circular Queue
- **Fixed size** with wrap-around
- **Efficient space usage**
- **No shifting required**

### Priority Queue
- **Elements have priorities**
- **Highest priority served first**
- **Implemented with heaps**

### Deque (Double-Ended Queue)
- **Insert/delete from both ends**
- **Combines stack and queue operations**
- **Used in sliding window algorithms**

### Blocking Queue
- **Blocks when full/empty**
- **Thread-safe operations**
- **Producer-consumer pattern**

## Classic Queue Problems

### Implement Queue using Stacks
Use two stacks to implement queue operations.

### First Non-Repeating Character
Find first character that appears only once in a stream.

### Sliding Window Maximum
Find maximum in each window of size k.

### Rotten Oranges (BFS)
Model multi-source BFS with queues.

## Implementation Considerations

### Array vs Linked List
- **Array**: Simple, but dequeue is O(n)
- **Linked List**: Efficient operations, but more memory overhead

### Circular Queue Implementation
```typescript
class CircularQueue {
    private items: (number | null)[] = []
    private front: number = -1
    private rear: number = -1
    private capacity: number

    constructor(capacity: number) {
        this.capacity = capacity
        this.items = new Array(capacity).fill(null)
    }

    enqueue(value: number): boolean {
        if (this.isFull()) return false

        this.rear = (this.rear + 1) % this.capacity
        this.items[this.rear] = value

        if (this.front === -1) {
            this.front = this.rear
        }

        return true
    }

    dequeue(): number | null {
        if (this.isEmpty()) return null

        const value = this.items[this.front]
        this.items[this.front] = null

        if (this.front === this.rear) {
            this.front = this.rear = -1
        } else {
            this.front = (this.front + 1) % this.capacity
        }

        return value
    }
}
```

### Thread Safety
- **Synchronization** for concurrent access
- **Atomic operations** for thread-safe implementations

## When to Use Queues

✅ **Use when:**
- FIFO access pattern needed
- Order preservation is important
- Producer-consumer scenarios
- BFS algorithms
- Task scheduling

❌ **Avoid when:**
- LIFO access needed (use Stack)
- Priority-based access needed (use Priority Queue)
- Random access required (use Array/List)
- Frequent insertions in middle needed

## 💡 Pro Tips

- **Choose right implementation** - linked list for frequent dequeues
- **Consider circular queues** - for fixed-size scenarios
- **Use built-in queues** - most languages provide queue implementations
- **Handle overflow/underflow** - proper error handling
- **Consider thread safety** - for concurrent applications

---

*Queues are essential for managing ordered operations, appearing in everything from operating systems to web servers.*