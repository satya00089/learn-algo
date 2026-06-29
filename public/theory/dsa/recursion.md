# Recursion

## What It Is

Recursion is a problem-solving technique where a function solves a problem by calling itself on a smaller version of the same problem.

## Why It Matters

Many important problems are naturally recursive:

- tree traversal
- divide-and-conquer sorting
- backtracking
- dynamic programming with memoization

Recursion often matches the shape of the problem better than loops do.

## The Two Required Parts

Every recursive solution needs these two pieces:

### Base Case

The condition that stops the recursion.

### Recursive Case

The part that reduces the problem toward the base case.

If either part is missing or wrong, the function may never stop.

## How It Works

A recursive call adds a new frame to the call stack. When the base case is finally reached, the stack starts to unwind and each earlier call finishes its work.

## Key Formula or Rule

Many recursive solutions follow the pattern:

$$
f(n) = f(\text{smaller subproblem}) + \text{combine work}
$$

The exact form changes by problem, but the idea is always the same: reduce the problem, solve the smaller case, then combine the result.

## Worked Example: Factorial

Definition:

- `factorial(0) = 1`
- `factorial(n) = n * factorial(n - 1)` for `n > 0`

Call `factorial(4)`:

- `factorial(4)` -> `4 * factorial(3)`
- `factorial(3)` -> `3 * factorial(2)`
- `factorial(2)` -> `2 * factorial(1)`
- `factorial(1)` -> `1 * factorial(0)`
- `factorial(0)` -> `1`

Now unwind:

- `factorial(1) = 1`
- `factorial(2) = 2`
- `factorial(3) = 6`
- `factorial(4) = 24`

## Looking Deeper

Once the core idea is clear, recursion is really about understanding the **call stack** and the **shape of the subproblem tree**.

Important questions include:

- how deep can the recursion go?
- does the function branch into many subcalls?
- are the same subproblems being solved repeatedly?

That last question leads directly to memoization and dynamic programming.

## Where Recursion Shines

### Trees and Graphs

Recursive structure matches nested nodes naturally.

### Divide and Conquer

Algorithms like merge sort and quick sort repeatedly solve smaller subproblems.

### Backtracking

Problems such as permutations, combinations, and maze solving often explore choices recursively.

## Limitations

- Too much recursion can cause stack overflow
- Recursive solutions sometimes use more memory than iterative ones
- Some recursive code is elegant but slower if it repeats work

## When to Prefer Iteration

Iteration is often better when:

- the logic is simple and linear
- recursion depth could become very large
- stack space is limited

## Under the Hood

Common deeper techniques include:

- **memoization** to avoid repeated work
- **backtracking** to explore choices and undo them
- **divide and conquer** to solve large problems from smaller pieces

Some languages also optimize **tail recursion**, but many do not. That is why experienced engineers treat recursion as a design tool, not as an automatic replacement for loops.

## Real-Life Uses

- File-system traversal
- Parsing nested expressions
- Tree traversal in search and UI rendering
- Game solving and backtracking problems

## How to Think About It in Practice

- Think recursively when the problem naturally breaks into smaller copies of itself, especially in trees, divide-and-conquer, or backtracking.
- If the recursive idea is clear but stack depth is risky, keep the same logic and switch to an explicit stack.

## Common Mistakes

- Forgetting the base case
- Making a recursive call that does not reduce the problem
- Recomputing the same subproblem many times without memoization
- Not visualizing the call stack when debugging

## Compare With

- [Stack](/dsa/stack): recursion uses the call stack automatically, while an explicit stack gives more control.
- [Binary Search Tree](/dsa/binary-search-tree): trees are a common place where recursive structure becomes natural.

## Key Takeaway

Recursion is powerful when a problem naturally breaks into smaller copies of itself. The secret is always the same: define a clear base case and move toward it every time.

## Try It Live

- [Open this playground](/dsa/recursion)
