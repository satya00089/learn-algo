# Binary Search Tree (BST) Algorithm

## Overview

A Binary Search Tree is a hierarchical data structure where each node has at most two children (left and right). The key property is that for any node, all values in its left subtree are smaller and all values in its right subtree are larger.

## Tree Properties

### BST Invariant

For every node N:

- All nodes in N's left subtree have values < N.value
- All nodes in N's right subtree have values > N.value
- Both left and right subtrees are also BSTs (recursive property)
- No duplicate values allowed

## Operations

### 1. Insert Operation

**Steps:**

1. **Selecting**: Start at the root (or create root if tree is empty)
2. **Comparing**: Compare target value with current node
3. **Navigating**:
   - If target < current, go left
   - If target > current, go right
   - If target = current, value already exists (stop)
4. **Inserting**: When reaching null position, create new node
5. **Complete**: Update tree structure and positions

### 2. Search Operation

**Steps:**

1. **Selecting**: Start at the root
2. **Comparing**: Compare target value with current node
3. **Navigating**:
   - If target = current, found! (mark as found)
   - If target < current, go left
   - If target > current, go right
   - If reach null, not found
4. **Complete**: Operation finishes

### 3. Traversal Methods

- **In-Order**: Left → Root → Right (gives sorted order)
- **Pre-Order**: Root → Left → Right
- **Post-Order**: Left → Right → Root
- **Level-Order**: Breadth-first traversal

## Time Complexity

### Balanced Tree

- **Search**: O(log n)
- **Insert**: O(log n)
- **Delete**: O(log n)

### Unbalanced Tree (Worst Case - Skewed)

- **Search**: O(n)
- **Insert**: O(n)
- **Delete**: O(n)

## Space Complexity

- **Storage**: O(n) - One node per value
- **Recursion Stack**: O(h) where h is tree height
  - Balanced: O(log n)
  - Skewed: O(n)

## Visualization Colors

- 🔵 **Blue**: Default node state
- 🟡 **Yellow**: Node being compared
- 🟢 **Green**: Found node or newly inserted node
- 🔴 **Red**: Node not found

## Interactive Features

### Insert Mode

1. Enter a value in the input field
2. Click the **+** button or press Enter
3. Watch as the algorithm navigates to find the correct position
4. See the new node inserted in the tree

### Search Mode

1. Enter a value to search for
2. Click the **🔍** button
3. Follow the path taken through the tree
4. See if the value is found (green) or not found (red)

### Controls

- **Step**: Advance one step at a time
- **Play**: Auto-advance with adjustable speed
- **Random**: Insert a random value
- **Generate**: Create a random tree with 5-10 nodes
- **Clear**: Remove all nodes and start fresh

## Tree Balance

### Balanced Tree

- Height ≈ log(n)
- Optimal performance O(log n)
- Even distribution of nodes

### Unbalanced Tree

- Height → n (worst case)
- Degrades to O(n) performance
- Occurs when inserting sorted data

**Example**: Inserting 1, 2, 3, 4, 5 creates a right-skewed tree (like a linked list)

## Advanced Concepts

### Self-Balancing Trees

To maintain O(log n) performance, self-balancing variants exist:

- **AVL Tree**: Strict balance, faster searches
- **Red-Black Tree**: Relaxed balance, faster insertions
- **Splay Tree**: Recently accessed nodes near root
- **B-Tree**: Multi-way tree for databases

## Real-World Applications

### Databases

- Indexing for fast lookups
- Range queries
- Sorted data retrieval

### File Systems

- Directory structures
- File hierarchies

### Networking

- Router tables
- IP address lookups

### Compilers

- Symbol tables
- Expression trees

### Game Development

- Scene graphs
- Collision detection

## Learning Tips

### Understand the Invariant

The BST property must hold at EVERY node. This is what makes searching efficient.

### Practice with Different Inputs

- **Sorted**: 1, 2, 3, 4, 5 → Creates skewed tree
- **Reverse**: 5, 4, 3, 2, 1 → Creates left-skewed tree
- **Random**: Varied values → Creates balanced tree
- **Balanced**: 4, 2, 6, 1, 3, 5, 7 → Creates perfect tree

### Visualize the Path

Each operation follows a path from root to leaf. Understanding this path is key to understanding BST operations.

### Compare with Arrays

- BST: O(log n) search, O(log n) insert
- Sorted Array: O(log n) search, O(n) insert
- Unsorted Array: O(n) search, O(1) insert

## Common Pitfalls

1. **Forgetting the Recursive Nature**: Each subtree is also a BST
2. **Duplicate Values**: Standard BST doesn't allow duplicates
3. **Unbalanced Trees**: Sorted input creates worst-case performance
4. **Null Checks**: Always check if node is null before accessing

## Advantages

✅ Efficient searching O(log n) average case
✅ Maintains sorted order
✅ Dynamic size (grows/shrinks as needed)
✅ Efficient insertion and deletion
✅ Natural recursive structure

## Disadvantages

❌ Can become unbalanced (O(n) worst case)
❌ More complex than arrays
❌ Extra memory for pointers
❌ Not cache-friendly
❌ Requires balancing for guaranteed performance

## Practice Exercises

1. Insert values in different orders and observe tree shapes
2. Search for values and count comparisons
3. Try to create a balanced tree manually
4. Create the most unbalanced tree possible
5. Use in-order traversal to verify BST property
