# t-SNE

## What It Is

t-SNE, short for **t-distributed stochastic neighbor embedding**, is a non-linear dimensionality reduction technique used mainly for **visualization**.

Its usual goal is not prediction. Its goal is to turn complex high-dimensional data into a 2D or 3D picture that helps humans notice local groups.

## What t-SNE Is Good At

t-SNE is especially good at preserving **local neighborhoods**.

That means:

- points that are close in the original space tend to stay close in the visualization
- small clusters often become easy to see
- dense regions and local structure become much easier to inspect visually

## What t-SNE Is Not For

t-SNE is usually not the right tool for:

- training a predictive model directly
- measuring exact distances between far-apart clusters
- proving exact global geometry with precision

It is a visualization tool first.

## Core Intuition

t-SNE tries to keep "who is near whom" consistent.

Very roughly:

1. Measure how likely points are to be neighbors in high-dimensional space.
2. Place points in 2D or 3D.
3. Move them until nearby relationships are preserved as well as possible.

## Important Parameters

### Perplexity

Controls how many neighbors each point pays attention to.

- lower perplexity focuses on very local structure
- higher perplexity pays attention to broader neighborhoods

You can think of perplexity as an effective neighborhood size.

$$
\mathrm{Perplexity}(P_i) = 2^{H(P_i)}
$$

Here `H(P_i)` is the entropy of the neighbor-probability distribution around point `i`.

### Learning Rate

Controls how large the optimization steps are.

- too small can make optimization slow
- too large can make the layout unstable

### Number of Iterations

The layout improves gradually, so enough optimization steps are needed.

## Worked Example

Imagine each document in a dataset is described by thousands of word features.

You cannot look at that space directly.

After applying t-SNE, the plot might show:

- sports documents close together
- finance documents close together
- mixed or unusual documents between clusters

That does not mean the cluster spacing is mathematically exact. It means local similarity became visible.

## Looking Deeper

The key idea is that t-SNE does not try to preserve raw coordinates. It tries to preserve **neighbor relationships**.

That is why:

- local structure is usually more trustworthy than global spacing
- parameter choices can change the picture significantly
- the exact distance between far-apart groups should be interpreted carefully

This is also why many workflows run PCA first, then t-SNE, especially when the original feature space is very large or noisy.

## The Core Equations

### Similarity in the Original Space

For each point `x_i`, t-SNE measures how likely another point `x_j` is to be its neighbor.

$$
p(j|i) = \frac{\exp\left(-\|x_i - x_j\|^2 / \left(2\sigma_i^2\right)\right)}{\sum_{k \ne i} \exp\left(-\|x_i - x_k\|^2 / \left(2\sigma_i^2\right)\right)}
$$

What this means:

- `x_i` and `x_j` are points in the original high-dimensional space
- `||x_i - x_j||` is the distance between those points
- `sigma_i` controls how wide the neighborhood is around `x_i`
- closer points get larger probability values

Each point gets its own `sigma_i`, which helps t-SNE adapt to dense and sparse regions differently.

t-SNE then turns those conditional probabilities into a symmetric pairwise similarity:

$$
p(i,j) = \frac{p(j|i) + p(i|j)}{2n}
$$

Here `n` is the number of data points, and `p(i,j)` is the final similarity used in the optimization.

### Similarity in the Reduced Space

After the points move into a 2D or 3D map as `y_i` and `y_j`, t-SNE defines a second similarity:

$$
q(i,j) = \frac{\left(1 + \|y_i - y_j\|^2\right)^{-1}}{\sum_{k \ne l} \left(1 + \|y_k - y_l\|^2\right)^{-1}}
$$

This looks different for an important reason:

- the reduced space uses a **Student t-distribution**
- its heavier tail gives distant points more room
- that helps reduce the **crowding problem** that appears when many dimensions are compressed into two

### What the Algorithm Optimizes

t-SNE tries to make the reduced-space similarities `q(i,j)` match the original-space similarities `p(i,j)`.

It does that by minimizing the KL divergence:

$$
\mathrm{KL}(P \parallel Q) = \sum_i \sum_j p(i,j)\,\log\left(\frac{p(i,j)}{q(i,j)}\right)
$$

How to read this:

- if two points are close in the original space, `p(i,j)` is large
- if the map places them far apart, `q(i,j)` becomes small
- that creates a large penalty

So the optimization strongly encourages true neighbors to stay close in the final visualization.

## Strengths

- Excellent for visualizing local clusters
- Helpful for exploring embeddings and high-dimensional feature spaces
- Often reveals patterns that PCA cannot separate clearly

## Limitations

- Different runs can produce different layouts
- Global distances are not always meaningful
- Parameter choices affect the picture
- It can be slow on large datasets
- It does not naturally provide an inverse transform for new points

## Under the Hood

Practical t-SNE work often focuses on scalability and reproducibility.

Important ideas include:

- running PCA first to reduce noise and dimensionality
- using **early exaggeration** to separate neighborhoods early in training
- Barnes-Hut or FFT-based accelerations
- fixing random seeds for more stable comparisons
- comparing results against PCA or UMAP instead of trusting one view blindly

Experts also remember that t-SNE is excellent at storytelling for local structure, but dangerous when used as proof of exact cluster distance, cluster size meaning, or true global topology.

## Practical Interpretation Rules

When reading a t-SNE plot:

- trust local neighborhoods more than global spacing
- do not over-interpret the exact distance between clusters
- compare multiple runs and parameter settings before drawing strong conclusions

## Real-Life Uses

- Visualizing word embeddings
- Exploring image feature spaces
- Inspecting biological data such as single-cell measurements
- Understanding whether a dataset contains distinct local groups

## Simple Python Example

```python
from sklearn.manifold import TSNE

embedding = TSNE(n_components=2, perplexity=30, learning_rate=200)
X_2d = embedding.fit_transform(X)
```

## When to Use and Avoid

Use t-SNE when:

- you want a human-friendly visualization of complex data
- local cluster structure matters most

Avoid t-SNE when:

- you need a stable, exact global map
- you need a dimensionality reduction method mainly for downstream modeling

## Common Mistakes

- Over-interpreting the global spacing between clusters or the exact size of a group.
- Using t-SNE as a downstream feature reducer or comparing runs without checking parameters and random seeds.

## Compare With

- [PCA](/ml/pca): PCA preserves global variance structure, while t-SNE preserves local neighborhoods for visualization.
- [K-Means Clustering](/ml/k-means): k-means assigns cluster labels, while t-SNE only builds a visual embedding.

## Key Takeaway

t-SNE is powerful because it can make local structure visible in high-dimensional data. The safest way to use it is as an exploratory visualization tool, not as proof of exact global geometry.

## Try It Live

- [Open t-SNE playground](/ml/tsne)
