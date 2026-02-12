# Principal Component Analysis (PCA): A 17D Example

_Original example adapted from Mark Richardson's class notes on Principal Component Analysis_

## What is PCA?

Principal Component Analysis (PCA) is a **dimensionality reduction technique** that transforms high-dimensional data into a lower-dimensional space while preserving as much variance (information) as possible.

**Why PCA?**

- **Data Visualization**: Reduce 1000+ dimensions to 2D/3D for plotting
- **Noise Reduction**: Remove less important components
- **Computational Efficiency**: Speed up machine learning algorithms
- **Feature Extraction**: Create uncorrelated features

## The Curse of Dimensionality

When you have too many features (dimensions), several problems arise:

- **Visualization becomes impossible** - you can't plot 100+ dimensions
- **Algorithms slow down dramatically** - more dimensions = more computation
- **Overfitting risk increases** - models memorize noise instead of learning patterns
- **Data becomes sparse** - points spread out in high-dimensional space

---

## The Problem: Understanding 17-Dimensional Data

Each UK country is described using **17 food-consumption features** (grams per person per week).

Comparing countries across all dimensions directly is difficult. PCA helps by **reducing dimensionality** while preserving essential structure.

---

## Original Dataset (Selected Features)

| Food Category    | England | N. Ireland | Scotland | Wales |
| ---------------- | ------- | ---------- | -------- | ----- |
| Alcoholic drinks | 375     | 135        | 458      | 475   |
| Cereals          | 1472    | 1494       | 1462     | 1582  |
| Cheese           | 105     | 66         | 103      | 103   |
| Fish             | 147     | 93         | 122      | 160   |
| Fresh fruit      | 1102    | 674        | 957      | 1137  |
| Fresh potatoes   | 720     | 1033       | 566      | 874   |
| Soft drinks      | 1374    | 1506       | 1572     | 1256  |

_(Full dataset contains 17 food categories total)_

---

## PCA Transformation

After standardizing the data (mean=0, variance=1), PCA produces new axes:

- **PC1** → captures the largest dietary variation
- **PC2** → captures the second-largest, independent variation

---

## Country Scores on Principal Components

### PC1 Scores (Primary Dietary Differences)

| Country          | PC1 Score | Interpretation            |
| ---------------- | --------- | ------------------------- |
| Northern Ireland | +480      | Strong positive deviation |
| England          | -130      | Moderate                  |
| Scotland         | -90       | Moderate                  |
| Wales            | -220      | Strong negative           |

PC1 clearly separates Northern Ireland from the rest.

### PC2 Scores (Secondary Dietary Differences)

| Country    | PC2 Score | Interpretation |
| ---------- | --------- | -------------- |
| Wales      | +230      | High on PC2    |
| England    | +20       | Near center    |
| Scotland   | -280      | Low on PC2     |
| N. Ireland | +70       | Moderate       |

PC2 mainly separates Scotland and Wales.

---

## Combined PC1 + PC2 Interpretation

| Country          | PC1 | PC2 | Overall Position    |
| ---------------- | --- | --- | ------------------- |
| England          | -   | 0   | Central             |
| Scotland         | -   | --  | Lower-left          |
| Wales            | --  | ++  | Upper-left          |
| Northern Ireland | ++  | +   | Far right (outlier) |

Legend: ++ = strongly positive, -- = strongly negative, 0 = near zero

---

## Feature Contributions (Loadings)

### Major Drivers of PC1

| Food Type        | Contribution |
| ---------------- | ------------ |
| Fresh potatoes   | High (+)     |
| Soft drinks      | High (+)     |
| Fresh fruit      | High (-)     |
| Alcoholic drinks | High (-)     |
| Fish             | Moderate (-) |

PC1 represents a "potato-heavy vs fresh-food/alcohol" diet axis.

### Major Drivers of PC2

| Food Type        | Contribution |
| ---------------- | ------------ |
| Fresh vegetables | High (+)     |
| Other meat       | Moderate (+) |
| Processed foods  | Moderate (-) |

PC2 separates vegetable-heavy vs processed-heavy diets.

---

## Real-World Meaning

**Northern Ireland's unique position:**

- Much higher **fresh potato consumption** (1033g vs ~600-700g)
- Much lower **fruit, fish, cheese, and alcohol** consumption

This aligns with geography: **Northern Ireland is the only UK country not on the island of Great Britain**.

PCA uncovered this structure automatically from the raw data!

---

## What PCA Achieved

| Before PCA               | After PCA                |
| ------------------------ | ------------------------ |
| 17 dimensions            | 2 dimensions             |
| Hard to compare          | Easy comparison          |
| No clear structure       | Clear outlier identified |
| Manual inspection needed | Data-driven insights     |

---

## Key Takeaway

**PCA converts complex, high-dimensional data into structured, interpretable summaries.**

Using just PC1 and PC2, we can clearly see:

- Which countries differ most
- Along which dietary dimensions
- Why those differences exist

This demonstrates PCA's power to reveal hidden patterns in real data!

## How PCA Works: The Math Behind the Magic

### Step-by-Step Process

1. **Standardize Data**: Center data by subtracting mean and scale to unit variance
2. **Compute Covariance**: Calculate covariance matrix to understand feature relationships
3. **Find Eigenvectors**: Compute eigenvalues and eigenvectors of covariance matrix
4. **Select Components**: Choose top k eigenvectors (principal components)
5. **Transform Data**: Project original data onto new coordinate system

### Key Concepts

- **Variance**: Spread of data points (higher = more information)
- **Eigenvalues**: Amount of variance explained by each component
- **Eigenvectors**: Directions of maximum variance (principal components)
- **Loadings**: Feature contributions to each component

1. **Standardize Data**: Center data by subtracting mean and scale to unit variance
2. **Compute Covariance**: Calculate covariance matrix to understand feature relationships
3. **Find Eigenvectors**: Compute eigenvalues and eigenvectors of covariance matrix
4. **Select Components**: Choose top k eigenvectors (principal components)
5. **Transform Data**: Project original data onto new coordinate system

### Key Concepts

- **Variance**: Spread of data points (higher = more information)
- **Eigenvalues**: Amount of variance explained by each component
- **Eigenvectors**: Directions of maximum variance (principal components)
- **Loadings**: Feature contributions to each component

## Decision Rules for Component Selection

### The Scree Plot Method

Use a scree plot to visualize variance explained by each component. Look for the "elbow" where adding more components gives diminishing returns.

### Practical Rules

- **80% Rule**: Keep components that explain 80% of total variance
- **Elbow Method**: Stop at the plot's "elbow" point
- **Kaiser Rule**: Keep components with eigenvalues > 1

## Implementation Examples

```python
# Tab: From Scratch
import numpy as np

def pca_from_scratch(X, n_components=2):
    # Standardize data
    X_std = (X - np.mean(X, axis=0)) / np.std(X, axis=0)

    # Compute covariance matrix
    cov_matrix = np.cov(X_std.T)

    # Eigenvalue decomposition
    eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)

    # Sort by explained variance
    idx = np.argsort(eigenvalues)[::-1]
    eigenvectors = eigenvectors[:, idx][:n_components]

    # Transform data
    X_pca = X_std @ eigenvectors

    return X_pca, eigenvectors, eigenvalues[idx][:n_components]

# Usage
X_reduced, components, explained_var = pca_from_scratch(your_data, n_components=2)

# Tab: Using scikit-learn
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Standardize data
scaler = StandardScaler()
X_std = scaler.fit_transform(your_data)

# Apply PCA
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_std)

# Check explained variance
print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
print(f"Total variance explained: {sum(pca.explained_variance_ratio_):.2%}")
```

## 💡 Pro Tips

- **Always standardize** your data first (mean=0, variance=1)
- **Check explained variance** - aim for 80-95% retention
- **Interpret loadings** to understand what each component represents
- **Consider alternatives** like t-SNE for complex non-linear patterns
- **Test impact** on your specific algorithm's performance

---

_PCA transforms complexity into clarity, helping you see the forest for the trees in your data._
