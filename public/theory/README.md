# Theory Content System

## Overview

The `public/theory` folder stores the markdown content shown inside the reusable `TheoryModal` component.

This keeps explanation content separate from the playground code so theory can be improved without changing the visualization logic.

## How It Is Used

Each playground opens a `TheoryModal` and points it to a markdown file such as:

```text
/theory/dsa/binary-search.md
/theory/ml/k-means.md
/theory/minimax.md
```

The modal reads the file at runtime and renders it with markdown support.

## Supported Markdown Features

The current renderer supports:

- `#`, `##`, and `###` headings
- paragraphs and bullet lists
- tables
- fenced code blocks
- code tabs through `# Tab:` markers inside a fenced code block
- inline code using backticks
- inline math with `$...$`
- display math with `$$...$$`

Avoid relying on unsupported raw LaTeX blocks outside math delimiters. If equations matter, write them as inline or display math and explain the symbols immediately below.

## Recommended Content Structure

The goal of theory content is not to be encyclopedic. It should help a learner progress from first intuition to deeper understanding.

Each page should ideally answer:

- what the algorithm does
- why it matters
- how it works
- when to use it
- where it breaks down

## Progressive Flow

Theory pages should follow a layered teaching style:

### Start With Intuition

Cover:

- plain-language definition
- intuition
- small worked example
- basic trade-offs

### Look Deeper

Cover:

- invariants, assumptions, or objectives
- why the algorithm behaves the way it does
- implementation or modeling trade-offs

### Go Under the Hood

Cover:

- optimizations, variants, or failure modes
- scaling concerns
- deeper engineering or mathematical interpretation

Not every page needs the same amount of depth, but each page should clearly move beyond the first explanation.

## Family-Based Templates

### DSA Pages

Recommended section order:

1. Title
2. What It Is
3. Why It Matters
4. Core Rule or Intuition
5. Key Formula or Rule
6. How It Works
7. Worked Example
8. Looking Deeper
9. Complexity
10. Advantages
11. Limitations
12. Under the Hood
13. Real-Life Uses
14. When to Use and Avoid
15. How to Think About It in Practice
16. Common Mistakes
17. Compare With
18. Key Takeaway
19. Try It Live

### ML Model Pages

Recommended section order:

1. Title
2. What It Is
3. What Problem It Solves
4. Core Intuition
5. Key Formula or Rule
6. How It Works
7. Worked Example
8. Looking Deeper
9. Important Parameters or Assumptions
10. Evaluation Metrics
11. Strengths
12. Limitations
13. Under the Hood
14. Real-Life Uses
15. When to Use and Avoid
16. How to Think About It in Practice
17. Common Mistakes
18. Compare With
19. Key Takeaway
20. Try It Live

### ML Preprocessing and Visualization Pages

Recommended section order:

1. Title
2. What It Does
3. Why It Is Useful
4. Core Intuition
5. Key Formula or Rule
6. Step-by-Step Process
7. Worked Example
8. Looking Deeper
9. Key Parameters or Pitfalls
10. Strengths
11. Limitations
12. Under the Hood
13. Real-Life Uses
14. When to Use and Avoid
15. How to Think About It in Practice
16. Common Mistakes
17. Compare With
18. Key Takeaway
19. Try It Live

## Writing Guidelines

When updating theory files:

- Prefer plain-language explanations before formal math.
- Keep sections short enough to read comfortably inside a modal.
- Use one concrete worked example in every file.
- Explain trade-offs, not just definitions.
- Add deeper explanation and practical nuance instead of stopping at first intuition.
- When equations are important, use readable math blocks and explain each symbol right after.
- Add a `Key Formula or Rule` section whenever a compact equation, invariant, recurrence, or index rule helps the learner reason about the algorithm.
- Prefer readable markdown, math blocks, or code blocks over dense symbolic notation.
- Use code tabs only when multiple implementations genuinely help understanding.
- Add a practical guidance section that helps learners recognize when the algorithm is a good fit.
- Add a `Common Mistakes` section for any topic where learners commonly confuse concepts, edge cases, or assumptions.
- End every theory page with a short comparison to related algorithms and a direct link to try the playground.

## File Organization

```text
public/theory/
  dsa/
  ml/
  minimax.md
  README.md
```

## Benefits of This Approach

- Consistent learner experience across playgrounds
- Easier content maintenance
- Clear separation between explanation and implementation
- Reusable structure for future algorithms
