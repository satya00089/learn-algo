# Principal Component Analysis (PCA)

## What It Is

Principal component analysis, or PCA, is a **linear dimensionality reduction** technique.

It takes data with many features and creates a smaller number of new features, called **principal components**, that preserve as much variation as possible.

## Why It Matters

PCA helps when data has many numeric features and you want to:

- visualize it
- remove redundancy
- reduce noise
- speed up later models

## Core Intuition

If several features move together, they may contain overlapping information.

PCA rotates the data into a new coordinate system where:

- the first component captures the largest variation
- the second captures the next largest variation
- each new component is independent from the previous ones

## Simple Example: 17-Dimensional Country Data

Imagine each country is described by 17 food-consumption features.

That is hard to visualize directly.

PCA can compress those 17 features into two main components:

- **PC1**: the strongest dietary pattern in the data
- **PC2**: the second strongest independent pattern

Now each country can be plotted as a single point in 2D instead of 17D.

That makes it much easier to spot:

- outliers
- similar countries
- major directions of variation

## Looking Deeper

A deeper way to view PCA is through **variance** and **projection**.

The algorithm finds new axes where:

- the first axis explains the most variance
- the second explains the next most, while staying independent from the first

The new components are weighted combinations of the original features. Those weights are often called **loadings**, and they help explain what each component represents.

## Key Formula or Rule

A principal component is a weighted combination of the original features:

$$
PC_1 = w_1x_1 + w_2x_2 + \cdots + w_dx_d
$$

You do not need heavy math to use PCA well. The practical idea is simply that PCA builds new axes that summarize the strongest patterns in the original features.

## How It Works

1. Standardize the features if their scales differ.
2. Measure how the features vary together.
3. Find the directions that explain the most variance.
4. Keep the top components.
5. Project the original data onto those new directions.

## What You Gain

Before PCA:

- many features
- harder visualization
- more noise and redundancy

After PCA:

- fewer dimensions
- easier plotting
- more compact representation

## What You Lose

PCA is a compression method, so some information is discarded unless you keep every component.

It also changes the meaning of the features:

- the new components are combinations of the original features
- they are often less intuitive than the original columns

## Explained Variance

Each principal component explains part of the total variance.

A common question is:

- how many components should we keep?

Typical answers include:

- keep enough to explain around 80 to 95 percent of the variance
- use a scree plot and look for an elbow

## Strengths

- Reduces dimensionality efficiently
- Helps visualization
- Removes some redundancy
- Often improves downstream model speed

## Limitations

- Only captures linear structure
- Components can be hard to interpret
- Sensitive to feature scaling
- Not always ideal when local non-linear structure matters

## Under the Hood

In practice, PCA work often focuses on trade-offs such as:

- how many components to keep
- whether to use **whitening**
- when to use randomized SVD for larger datasets
- when PCA should be replaced by a non-linear method such as t-SNE or UMAP

This is also where interpretation gets harder. A component may compress information well while still being difficult to explain in business or scientific terms.

## Real-Life Uses

- Data visualization
- Preprocessing before clustering or classification
- Feature compression in scientific data
- Noise reduction in numeric datasets

## When to Use and Avoid

Use PCA when:

- you have many numeric features
- features are correlated
- you want a compact summary of the data

Avoid PCA when:

- interpretability of original features is critical
- the important structure is strongly non-linear

## Implementation Example

```python
# Tab: From Scratch
import numpy as np

# Standardize features first
X_std = (X - X.mean(axis=0)) / X.std(axis=0)

# Covariance matrix
cov = np.cov(X_std.T)

# Eigenvalue decomposition
values, vectors = np.linalg.eig(cov)

# Sort by explained variance
order = np.argsort(values)[::-1]
principal_vectors = vectors[:, order[:2]]
X_pca = X_std @ principal_vectors

# Tab: Using scikit-learn
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X_std = StandardScaler().fit_transform(X)
X_pca = PCA(n_components=2).fit_transform(X_std)
```

## How to Think About It in Practice

- Think of PCA when you have many correlated numeric features and want a compact summary for visualization, denoising, or faster downstream modeling.
- It is best treated as a practical compression tool first, not as a topic that needs heavy math to be useful.

## Common Mistakes

- Forgetting to standardize features when the units are very different.
- Interpreting a principal component as if it were one original feature instead of a weighted combination.

## Compare With

- [t-SNE](/ml/tsne): PCA is linear and variance-focused, while t-SNE is non-linear and neighborhood-focused.
- [Standard Scaler](/ml/standard-scaler): PCA often works best after scaling because variance should be comparable across features.

## Key Takeaway

PCA helps you replace many correlated numeric features with a smaller set of summary directions. It is one of the most useful tools for exploring and simplifying high-dimensional data.

## Try It Live

- [Open this playground](/ml/pca)
