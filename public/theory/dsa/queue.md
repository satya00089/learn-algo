# Queue

## What It Is

A queue is a linear data structure that follows **FIFO**, or **First In, First Out**.

The first element added is the first element removed.

A real-world analogy is a line at a ticket counter: the person who arrives first gets served first.

## Core Operations

- `enqueue`: add to the back
- `dequeue`: remove from the front
- `front` or `peek`: read the front value without removing it
- `isEmpty`: check whether the queue has any elements

## Why It Matters

Queues are useful whenever tasks must be handled in arrival order.

That shows up constantly in software:

- scheduling
- buffering
- breadth-first search
- message processing

## Key Formula or Rule

For a circular-array queue, the core index update is:

$$
nextIndex = (index + 1) \bmod capacity
$$

That rule is what lets the queue wrap around and reuse freed space efficiently.

## How It Works

Start with an empty queue:

`[]`

Enqueue `10`, `20`, `30`:

`[10, 20, 30]`

Now dequeue once:

- `10` leaves first because it entered first
- queue becomes `[20, 30]`

That FIFO rule is the whole idea.

## Looking Deeper

Queues become more interesting when you look at how they are used inside algorithms.

For example, in **breadth-first search**:

- nodes discovered first are processed first
- that naturally explores the graph layer by layer

This is why queues are not just storage structures. They actively control the order in which work flows through an algorithm.

## Complexity

For a proper queue implementation:

| Operation | Cost |
| --- | --- |
| Enqueue | `O(1)` |
| Dequeue | `O(1)` |
| Peek | `O(1)` |
| isEmpty | `O(1)` |

Implementation note:

- A queue built with a naive array `shift()` operation may make dequeue slower in some languages.
- Circular arrays, linked lists, or deque-backed queues avoid that problem.

## Common Implementations

### Array-Based Queue

Simple and intuitive, but front removals can be expensive unless the array is treated as circular.

### Linked-List Queue

Efficient for enqueue and dequeue when you track both front and rear pointers.

## Real-Life Uses

- Printer job scheduling
- Breadth-first search in graphs and trees
- Customer support ticket processing
- Message queues between services
- Streaming and buffering systems

## Queue Variants

- **Circular queue**: reuses empty spots efficiently
- **Priority queue**: highest-priority item leaves first, so it is not pure FIFO
- **Deque**: allows insertion and removal at both ends

## Under the Hood

In real systems, queues often manage concurrency, throughput, and backpressure.

Examples include:

- job queues in distributed systems
- message brokers between services
- event loops and task scheduling

At that level, engineers care not just about FIFO behavior, but also about batching, blocking, bounded capacity, retry behavior, and what happens when producers are faster than consumers.

## When to Use and Avoid

Use a queue when:

- work should happen in arrival order
- you are processing layers or levels, such as BFS
- producers and consumers operate over time

Avoid a queue when:

- you need last-in-first-out behavior, which calls for a stack
- you need random access by index

## How to Think About It in Practice

- Think of a queue whenever work should happen in arrival order or level-by-level order.
- If producers and consumers run over time, a queue is often not just storage but the mechanism that controls flow.

## Common Mistakes

- Using a plain array implementation that makes dequeue expensive
- Confusing queues with stacks
- Forgetting edge cases such as dequeue on an empty queue

## Compare With

- [Stack](/dsa/stack): both are linear data structures, but queues process the oldest item first.
- [Array Operations](/dsa/array-operations): arrays can back a queue, but the access pattern is very different.

## Key Takeaway

A queue is the right tool whenever "first come, first served" is the rule. Its strength is preserving order while keeping insertion and removal simple.

## Try It Live

- [Open this playground](/dsa/queue)
