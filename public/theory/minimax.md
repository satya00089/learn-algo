# Minimax Algorithm

## What It Is

Minimax is a decision-making algorithm used in **adversarial games**, where one player tries to maximize the score and the other tries to minimize it.

It is a natural fit for turn-based, two-player, zero-sum games with perfect information.

Examples include:

- tic-tac-toe
- checkers in simplified settings
- chess search at limited depth

## Core Intuition

Minimax assumes both players play as well as possible.

That means:

- **MAX** chooses the move with the best possible outcome
- **MIN** chooses the reply that hurts MAX the most

So the algorithm asks:

- "If I make this move, what is the best counter-move my opponent will make?"

## How It Works

1. Generate possible moves from the current state.
2. Recursively explore future game states.
3. Score terminal states, or depth-limited states, with an evaluation function.
4. Propagate scores back up the tree.
5. At MAX nodes, choose the highest score.
6. At MIN nodes, choose the lowest score.

## Key Formula or Rule

The minimax value of a game state is:

$$
V(s) = \max_{a \in A(s)} V(result(s,a)) \quad \text{for MAX}
$$

$$
V(s) = \min_{a \in A(s)} V(result(s,a)) \quad \text{for MIN}
$$

This is the mathematical version of the idea that one player chooses the best move while the opponent chooses the hardest reply.

## Worked Example: Tic-Tac-Toe

Suppose it is the AI's turn.

- one move eventually leads to a forced win
- another move leads only to a draw
- another move allows the opponent to win later

Minimax will choose the move that leads to the best worst-case outcome.

If a forced win exists, it will choose that.
If not, it will prefer a draw over a loss.

## Looking Deeper

Minimax becomes more useful once you think in terms of **game-tree evaluation** rather than just move generation.

Important ideas include:

- the branching factor, or how many moves each state creates
- depth-limited search
- heuristic evaluation functions when terminal states are too far away

That is what lets minimax scale beyond toy examples, even though the core idea stays the same.

## Why It Matters

Minimax teaches a very important idea in algorithm design:

- sometimes the correct choice depends not on your next move alone, but on the opponent's best reply

That makes it a foundation for game AI and adversarial search.

## Time Complexity

If:

- `b` is the branching factor
- `d` is the search depth

then a plain minimax search can take about:

```text
O(b^d)
```

That gets expensive very quickly as games become larger.

## Alpha-Beta Pruning

Alpha-beta pruning speeds minimax up by skipping branches that cannot change the final decision.

Two values are tracked:

- **alpha**: the best score MAX can guarantee so far
- **beta**: the best score MIN can guarantee so far

If a branch is already worse than what a player can get elsewhere, there is no reason to keep exploring it.

The result:

- same final answer as minimax
- less search work in many cases

## Strengths

- Produces optimal play when the full search is feasible
- Clear and principled decision rule
- Strong foundation for many game-search techniques

## Limitations

- Search grows exponentially
- Needs a good evaluation function for large games
- Pure exhaustive minimax is practical only for small game trees

## Under the Hood

In practice, strong minimax systems usually combine several techniques:

- **alpha-beta pruning**
- strong move ordering
- **iterative deepening**
- **transposition tables**
- the simplified **negamax** formulation

So while the plain algorithm is conceptually simple, real competitive game engines succeed by making the search smarter rather than by searching everything.

## Real-Life Uses

- Small board-game AI
- Strategy planning under adversarial conditions
- Teaching search, recursion, and game theory basics

For large modern games, real systems usually combine minimax-style search with pruning, heuristics, and careful move ordering rather than exploring everything.

## When to Use and Avoid

Use minimax when:

- two players have opposing goals
- the game is turn-based
- future moves can be simulated

Avoid plain minimax when:

- the game tree is too large to search deeply
- hidden information or randomness dominates the problem

## How to Think About It in Practice

- Think of minimax when two players alternate turns, their goals oppose each other, and future moves can be simulated.
- The moment the game tree becomes large, shift your thinking from plain minimax to pruning, heuristics, and move ordering.

## Common Mistakes

- Forgetting that alpha-beta pruning changes performance, not the final minimax result.
- Treating a depth-limited evaluation as if it were the exact game outcome.

## Compare With

- [Recursion](/dsa/recursion): minimax is a classic example of recursive search over a game tree.
- [Stack](/dsa/stack): explicit stacks can sometimes replace recursive exploration when you want more control.

## Key Takeaway

Minimax helps an agent choose the move with the best worst-case outcome. Its main challenge is cost, which is why pruning and heuristics matter so much in larger games.

## Try It Live

- [Open this playground](/ai/minimax)
