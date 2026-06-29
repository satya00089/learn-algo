# K-Nearest Neighbors

## What It Is

K-nearest neighbors, or KNN, is a supervised learning algorithm that predicts a label by looking at the `k` training points closest to a new point.

It can be used for:

- **classification**: choose the most common nearby class
- **regression**: average the nearby target values

## Core Intuition

KNN follows a very human idea:

- points that look alike often behave alike

If a new point sits near many red points and very few blue points, KNN will likely predict red.

## How It Works

1. Store the training data.
2. Choose `k`, the number of neighbors to inspect.
3. Measure the distance from the new point to every training point.
4. Pick the `k` closest ones.
5. Use their labels to make the prediction.

## Key Formula or Rule

A common distance choice is Euclidean distance:

$$
d(x,z) = \sqrt{\sum_{j=1}^{m} (x_j - z_j)^2}
$$

After computing distances, the algorithm looks at the nearest `k` points and lets them vote or average.

## Worked Example

Suppose `k = 3` and a new point has these nearest labeled neighbors:

- Neighbor 1: class A
- Neighbor 2: class A
- Neighbor 3: class B

Majority vote:

- class A wins 2 to 1
- prediction = class A

For regression, you would average the neighbor values instead of voting.

## Looking Deeper

KNN is a **lazy learner**. That means training is mostly just storing the data, while the real computation happens during prediction.

This creates a trade-off:

- training is cheap
- prediction can be expensive

The value of `k` also controls the bias-variance balance. Small `k` reacts strongly to local detail, while large `k` smooths the decision boundary.

## Why Feature Scaling Matters

KNN depends heavily on distance.

If one feature ranges from `0` to `1` and another ranges from `0` to `100000`, the larger-scale feature can dominate the distance calculation.

That is why scaling is often essential before using KNN.

## Choosing `k`

Small `k`:

- more sensitive to noise
- more flexible
- can overfit

Large `k`:

- smoother decisions
- less sensitive to noise
- can underfit

A common approach is to try several values and validate performance.

## Common Distance Metrics

- **Euclidean distance**: common for continuous numeric features
- **Manhattan distance**: useful when axis-aligned differences matter
- **Hamming distance**: useful for binary or categorical style comparisons

## Strengths

- Easy to understand
- No training phase in the usual sense; it stores the data
- Can model complex decision boundaries
- Works for both classification and regression

## Limitations

- Prediction can be slow on large datasets
- Needs careful feature scaling
- Sensitive to noisy or irrelevant features
- Performance drops in very high dimensions

## Under the Hood

As datasets grow, practical implementations avoid checking every point directly.

Common ideas include:

- KD-trees or Ball Trees for structured search
- approximate nearest neighbor methods for speed
- distance-weighted voting so closer neighbors matter more

KNN also suffers from the **curse of dimensionality**. In very high dimensions, many points start to feel similarly far apart, which makes â€œnearestâ€ much less meaningful.

## Real-Life Uses

- Basic recommendation systems
- Similar-item search
- Pattern recognition
- Medical or sensor classification prototypes

## When to Use and Avoid

Use KNN when:

- the dataset is not huge
- local similarity is meaningful
- you want a simple baseline model

Avoid KNN when:

- fast prediction at scale is required
- there are many irrelevant features
- the data lives in very high-dimensional space

## How to Think About It in Practice

- Think of k-NN when local similarity should drive the prediction and you are comfortable storing the training examples directly.
- It is often a strong baseline when the dataset is not too large and distance makes domain sense.

## Common Mistakes

- Forgetting to scale features, which can let one dimension dominate the distance calculation.
- Picking `k` without checking how sensitive the result is to noise or class imbalance.

## Compare With

- [Logistic Regression](/ml/logistic-regression): k-NN stores examples and votes locally, while logistic regression learns one global boundary.
- [Decision Tree](/ml/decision-tree): both can model non-linear patterns, but trees learn rules and k-NN compares distances.

## Key Takeaway

KNN is simple because it does not try to build a global model. It makes a decision by asking, "What do the nearby examples look like?"

## Try It Live

- [Open this playground](/ml/knn)
