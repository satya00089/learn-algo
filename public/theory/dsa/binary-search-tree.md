# Binary Search Tree

## What It Is

A binary search tree, or BST, is a binary tree with an ordering rule:

- every value in the left subtree is smaller than the current node
- every value in the right subtree is larger than the current node

That rule makes search, insertion, and deletion much faster than scanning every node, at least when the tree stays reasonably balanced.

## Why It Matters

A BST gives you a way to keep data in sorted order **while still allowing updates**.

That makes it useful when you need both:

- fast lookup
- fast insertion and deletion

## Core Invariant

The BST property is the most important idea to remember:

- left subtree < node < right subtree

If that rule is broken, it is no longer a valid binary search tree.

## How Search Works

To search for a value:

1. Start at the root.
2. If the value matches, stop.
3. If the value is smaller, go left.
4. If the value is larger, go right.
5. Repeat until found or until you hit `null`.

## How Insertion Works

Insertion follows the same path as search.

- move left for smaller values
- move right for larger values
- insert the new node at the first empty spot

## How Deletion Works

Deletion is the trickiest BST operation because there are three cases:

1. **Leaf node**: remove it directly.
2. **One child**: connect the parent to the child.
3. **Two children**: replace the node with its inorder successor, usually the smallest node in the right subtree, or its inorder predecessor.

## Key Formula or Rule

The core BST rule is:

$$
\text{left subtree} < node < \text{right subtree}
$$

Every search, insertion, and deletion operation depends on preserving that ordering invariant.

## Worked Example

Insert these values in order:

`50, 30, 70, 20, 40, 60, 80`

The tree becomes:

```text
        50
      /    \
    30      70
   /  \    /  \
 20   40  60   80
```

Search for `60`:

- `60 > 50`, go right
- `60 < 70`, go left
- Found `60`

## Looking Deeper

One of the most useful BST facts is this:

- an **inorder traversal** of a valid BST visits values in sorted order

That is why BSTs are good for ordered tasks such as:

- finding the next larger value
- printing values in sorted order
- answering range queries

Deletion is where the data structure becomes more interesting. The two-child case matters because removing a node must preserve the BST ordering rule after the replacement.

## Complexity

Balanced BST:

- Search: `O(log n)`
- Insert: `O(log n)`
- Delete: `O(log n)`

Skewed BST, like a linked list:

- Search: `O(n)`
- Insert: `O(n)`
- Delete: `O(n)`

## Why Balance Matters

A BST is fast only when the height stays small.

Bad insertion order, such as already sorted input, can create a skewed tree. That is why self-balancing trees such as AVL trees and Red-Black trees are so useful in real systems.

## Advantages

- Keeps values in sorted order
- Supports efficient range queries and ordered traversal
- Insertions and deletions can be efficient

## Limitations

- Performance degrades badly when the tree becomes skewed
- More pointer overhead than arrays
- Basic BSTs are usually replaced by self-balancing versions in production code

## Real-Life Uses

- Ordered sets and maps
- Ranking systems and leaderboards
- Range queries such as "give me all values between x and y"

## When to Use and Avoid

Use a BST when:

- you need ordered data
- you insert and search frequently
- range queries matter

Avoid a plain BST when:

- the input order may create a skewed tree
- you need predictable performance without balancing

## Under the Hood

Many real tree structures build on the BST idea by keeping the tree balanced automatically.

Common examples:

- AVL trees
- Red-Black trees
- B-trees for storage systems

BSTs can also be **augmented** with extra information such as subtree size, interval bounds, or sums. That lets the same structure answer more advanced queries like order statistics and interval overlap checks.

## How to Think About It in Practice

- Think of a BST when values must stay ordered while insertions, lookups, and deletions all happen over time.
- If the dataset is mostly static, a sorted array plus binary search may be simpler than maintaining a tree.

## Common Mistakes

- Forgetting the left-smaller, right-larger rule
- Assuming every BST is balanced
- Mishandling deletion when a node has two children

## Compare With

- [Binary Search](/dsa/binary-search): both use ordering, but BSTs organize many values in a hierarchical shape.
- [Heap Sort](/dsa/heap-sort): heaps and BSTs are both tree-based, but they optimize different access patterns.

## Key Takeaway

A BST is useful because it combines sorted order with dynamic updates. Its power comes from the ordering invariant, and its weakness is losing performance when the tree becomes unbalanced.

## Try It Live

- [Open this playground](/dsa/binary-search-tree)
