# Binary Search Tree: Dynamic Sorted Data Structure

## What is a Binary Search Tree?

A Binary Search Tree (BST) is a **hierarchical data structure** where each node has at most two children, and for each node, all elements in its left subtree are less than the node, and all elements in its right subtree are greater than the node.

**Key Properties:**

- **Left subtree**: All values < node value
- **Right subtree**: All values > node value
- **No duplicates** (typically)
- **In-order traversal**: Produces sorted sequence

## Basic Operations

### Insertion

Add a new node while maintaining BST properties.

### Deletion

Remove a node while maintaining BST properties.

### Search

Find if a value exists in the tree.

### Traversal

Visit all nodes in different orders (in-order, pre-order, post-order).

## How BST Operations Work

### Insertion Example

Insert values: `50, 30, 70, 20, 40, 60, 80` into an empty BST.

```
Start with empty tree
Insert 50:
    50

Insert 30 (30 < 50, go left):
    50
   /
  30

Insert 70 (70 > 50, go right):
    50
   /  \
  30   70

Insert 20 (20 < 50, 20 < 30, go left):
    50
   /  \
  30   70
 /
20

Insert 40 (40 < 50, 40 > 30, go right):
    50
   /  \
  30   70
 / \
20  40

Insert 60 (60 > 50, 60 < 70, go left):
    50
   /  \
  30   70
 / \  /
20 40 60

Insert 80 (80 > 50, 80 > 70, go right):
    50
   /  \
  30   70
 / \  / \
20 40 60 80
```

### Search Example

Search for `40` in the above tree:

- Start at root (50): 40 < 50, go left to 30
- At 30: 40 > 30, go right to 40
- Found 40! ✅

Search for `25`:

- Start at root (50): 25 < 50, go left to 30
- At 30: 25 > 20, 25 < 30, but no right child of 20
- 25 not found ❌

## Algorithm Pseudocode

### Node Structure

```
class Node {
    value
    left
    right
}
```

### Search Operation

```
function search(node, target)
    if node is null or node.value == target
        return node

    if target < node.value
        return search(node.left, target)
    else
        return search(node.right, target)
```

### Insert Operation

```
function insert(node, value)
    if node is null
        return new Node(value)

    if value < node.value
        node.left = insert(node.left, value)
    else if value > node.value
        node.right = insert(node.right, value)

    return node
```

### Delete Operation

```
function delete(node, value)
    if node is null
        return null

    if value < node.value
        node.left = delete(node.left, value)
    else if value > node.value
        node.right = delete(node.right, value)
    else
        // Node found - handle three cases
        if node.left is null
            return node.right
        else if node.right is null
            return node.left
        else
            // Two children - find inorder successor
            successor = findMin(node.right)
            node.value = successor.value
            node.right = delete(node.right, successor.value)

    return node
```

## Tree Traversals

### In-Order Traversal (Left → Root → Right)

Produces sorted sequence: `20, 30, 40, 50, 60, 70, 80`

### Pre-Order Traversal (Root → Left → Right)

Root first: `50, 30, 20, 40, 70, 60, 80`

### Post-Order Traversal (Left → Right → Root)

Leaves first: `20, 40, 30, 60, 80, 70, 50`

### Level-Order Traversal

Breadth-first: `50, 30, 70, 20, 40, 60, 80`

## Time Complexity Analysis

| Operation | Best Case | Average Case | Worst Case |
| --------- | --------- | ------------ | ---------- |
| Search    | O(log n)  | O(log n)     | O(n)       |
| Insert    | O(log n)  | O(log n)     | O(n)       |
| Delete    | O(log n)  | O(log n)     | O(n)       |

### Best Case: Balanced Tree

- Height = log n
- All operations: O(log n)

### Worst Case: Skewed Tree

- Height = n
- All operations: O(n)
- Occurs with sorted input: `1, 2, 3, 4, 5...`

## Key Characteristics

### Advantages

- **Dynamic** - can grow and shrink
- **Ordered** - maintains sorted order
- **Efficient operations** when balanced
- **Simple to implement**

### Disadvantages

- **Can become unbalanced** - leads to poor performance
- **No random access** - must traverse from root
- **Extra memory** for node pointers

## Real-World Applications

- **Database indexing** - SQL indexes often use BST variants
- **File systems** - directory structures
- **Symbol tables** - compilers use BSTs for variables
- **Auto-completion** - prefix matching in search engines
- **Game AI** - decision trees for game states

## Self-Balancing BST Variants

### AVL Trees

- Balance factor: height difference ≤ 1
- Rotations maintain balance
- All operations: O(log n)

### Red-Black Trees

- Color property maintains balance
- Used in C++ STL, Java TreeMap
- Slightly less strict balance than AVL

### B-Trees

- Multi-way trees for disk storage
- Used in databases and file systems
- Optimized for disk I/O

## Common Problems and Solutions

### Tree Balance Issues

**Problem:** Sorted input creates skewed tree
**Solution:** Use self-balancing trees (AVL, Red-Black)

### Memory Overhead

**Problem:** Each node needs left/right pointers
**Solution:** Use array-based representation or consider other data structures

### Duplicate Handling

**Problem:** How to handle duplicate values
**Solutions:**

- Disallow duplicates
- Allow duplicates in right subtree
- Store count with each node

## When to Use BSTs

✅ **Use when:**

- Data needs to be sorted
- Dynamic insertions/deletions required
- Range queries needed
- Ordered iteration required

❌ **Avoid when:**

- Data is static (use sorted array)
- Balance is critical (use AVL/Red-Black)
- Memory is limited (consider arrays)
- Very large datasets (consider B-trees)

## 💡 Pro Tips

- **Monitor tree balance** - skewed trees kill performance
- **Consider self-balancing variants** - AVL/Red-Black for guaranteed performance
- **Use in-order traversal** - for sorted output
- **Handle duplicates explicitly** - decide policy upfront
- **Consider memory overhead** - each node has 2-3 pointers

---

_Binary Search Trees provide dynamic sorted storage with logarithmic performance when balanced, making them fundamental to many algorithms and data structures._
