# Decision Trees

## What It Is

A decision tree is a supervised learning model that makes predictions by asking a sequence of questions.

Each internal node asks a question such as:

- Is age < 30?
- Is income > 50000?
- Does the customer have a premium plan?

Each leaf stores the final prediction.

## Core Intuition

A decision tree keeps splitting the data into smaller and more uniform groups.

The goal is simple:

- after each split, the resulting groups should be easier to predict than the original mixed group

## How It Works

1. Start with the full dataset at the root.
2. Try many possible splits.
3. Choose the split that creates the cleanest separation.
4. Repeat on each child group.
5. Stop when the groups are pure enough or other stopping rules are met.

## Classification vs Regression

### Classification Tree

Predicts a category such as yes/no or red/blue.

### Regression Tree

Predicts a number such as price or temperature.

## Key Formula or Rule

Two common impurity measures are:

$$
H(S) = -\sum_i p_i \log_2 p_i
$$

$$
Gini(S) = 1 - \sum_i p_i^2
$$

Both formulas try to measure how mixed a node is, so the tree can choose splits that make the child groups purer.

## Worked Example

Suppose we want to predict whether a person will buy a product.

A simple tree might ask:

1. Has the customer visited the site before?
2. If yes, is the price within budget?
3. If no, predict low purchase probability

A path from root to leaf becomes a readable rule.

Example rule:

```text
if visited_before = yes and budget_match = yes
then predict buy
```

## Looking Deeper

Under the hood, a decision tree chooses splits by trying to reduce impurity.

For classification that often means:

- Gini impurity
- entropy

For regression it usually means reducing variance or squared error.

This is the mathematical version of the treeâ€™s intuition: each split should make the child groups more predictable than the parent group.

## Why Trees Feel Intuitive

Decision trees are easy to explain because they look like human decision rules.

That makes them useful when stakeholders want answers such as:

- Which condition mattered most?
- Why did the model make this prediction?

## Overfitting Risk

A tree can keep splitting until it memorizes the training data.

That causes **overfitting**, where:

- training performance looks great
- new-data performance gets worse

Common controls include:

- maximum depth
- minimum samples per split
- minimum samples per leaf
- pruning

## Strengths

- Very interpretable
- Handles numeric and categorical features well
- Does not require feature scaling in the basic algorithm
- Can capture non-linear rules and feature interactions

## Limitations

- Can overfit easily
- Small data changes can lead to a very different tree
- Single trees are often less accurate than strong ensembles

## Under the Hood

In practice, tree work is mostly about controlling variance.

Important ideas include:

- **pruning** to stop memorization
- depth and leaf-size constraints
- handling missing values carefully
- using ensembles like Random Forests and Gradient Boosted Trees when one tree is too unstable

That is why single trees are excellent for teaching and interpretability, while ensembles are often chosen for stronger predictive performance.

## Real-Life Uses

- Credit approval rules
- Customer churn analysis
- Medical triage support
- Simple recommendation logic

## When to Use and Avoid

Use a decision tree when:

- interpretability matters
- the rules may be non-linear
- feature interactions are important

Avoid a single decision tree when:

- you need highly stable predictions
- top predictive accuracy matters more than interpretability
- the tree starts becoming too deep and specific

## How to Think About It in Practice

- Think of decision trees when rule-like explanations matter and the relationship may be non-linear or full of feature interactions.
- They are often a strong first interpretable model when you want more flexibility than a straight linear boundary.

## Common Mistakes

- Letting the tree grow too deep and overfit the training data.
- Ignoring split quality or leaking target information into the features.

## Compare With

- [Logistic Regression](/ml/logistic-regression): trees split by rules, while logistic regression builds a smoother linear boundary.
- [Ensemble Models](/ml/ensemble-models): ensembles combine many trees for better stability than a single tree.

## Key Takeaway

A decision tree works by turning prediction into a sequence of simple questions. Its biggest strength is readability, and its biggest weakness is overfitting.

## Try It Live

- [Open this playground](/ml/decision-tree)
