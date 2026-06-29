# Stack

## What It Is

A stack is a linear data structure that follows **LIFO**, or **Last In, First Out**.

The last element added is the first one removed.

A simple analogy is a stack of plates: you usually add and remove from the top.

## Core Operations

- `push`: add to the top
- `pop`: remove from the top
- `peek` or `top`: read the top value without removing it
- `isEmpty`: check whether the stack is empty

## Why It Matters

Stacks appear in many places where the most recent work must be handled first.

Common examples:

- function calls
- undo operations
- expression parsing
- depth-first search

## Key Formula or Rule

For an array-based stack, the top index follows the rule:

$$
top \leftarrow top + 1 \text{ on push}, \quad top \leftarrow top - 1 \text{ on pop}
$$

That simple update captures the whole LIFO behavior: every operation happens at one end only.

## How It Works

Start with an empty stack:

`[]`

Push `10`, then `20`, then `30`:

`[10, 20, 30]`

Now pop once:

- `30` leaves first because it was added last
- stack becomes `[10, 20]`

That LIFO behavior defines the structure.

## Looking Deeper

Stacks matter because they model nested or reversible work.

That shows up in:

- function calls
- expression parsing
- undo history
- depth-first search

The same idea also appears in **monotonic stacks**, where the stack is maintained in sorted order to solve more advanced problems like next greater element.

## Complexity

| Operation | Cost |
| --- | --- |
| Push | `O(1)` |
| Pop | `O(1)` |
| Peek | `O(1)` |
| isEmpty | `O(1)` |

## Common Implementations

### Array-Based Stack

Very common and efficient because the top usually maps to the end of the array.

### Linked-List Stack

Also efficient and useful when dynamic node-based storage is preferred.

## Real-Life Uses

- Function call stack in programming languages
- Undo and redo systems
- Browser backtracking logic
- Depth-first search
- Balanced parentheses checking

## Classic Patterns

### Matching Brackets

Push opening brackets, pop when a matching closing bracket appears.

### Expression Evaluation

Stacks help convert or evaluate prefix, infix, and postfix expressions.

### Monotonic Stack

A specialized pattern used in problems like next greater element and stock span.

## Under the Hood

In larger systems, stacks often replace recursion explicitly.

That is useful when:

- recursion depth may overflow
- you need tighter control over traversal order
- you want to store extra state with each frame

This is common in iterative DFS, parsers, compilers, and algorithms that simulate recursive behavior without depending on the language call stack.

## When to Use and Avoid

Use a stack when:

- the most recent item should be processed first
- you need backtracking behavior
- nested structures must be matched or unwound

Avoid a stack when:

- tasks must be handled in arrival order, which calls for a queue
- you need random access to older elements

## How to Think About It in Practice

- Think of a stack whenever the most recent unfinished task should be handled first.
- Nested structure, undo behavior, parser state, and depth-first exploration are all strong signals that a stack is the right fit.

## Common Mistakes

- Confusing stack order with queue order
- Popping from an empty stack
- Ignoring how recursion already uses a call stack behind the scenes

## Compare With

- [Queue](/dsa/queue): stacks are LIFO, while queues are FIFO.
- [Recursion](/dsa/recursion): recursion already uses a call stack under the hood.

## Key Takeaway

A stack is the right choice when "most recent first" is the rule. Its simplicity makes it one of the most widely used data structures in algorithms and software systems.

## Try It Live

- [Open this playground](/dsa/stack)
