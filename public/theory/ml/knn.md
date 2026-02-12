# K-Nearest Neighbors (KNN)

## Overview

K-Nearest Neighbors is a simple, non-parametric, lazy learning algorithm used for both classification and regression. It makes predictions based on the k closest training examples in the feature space.

## How It Works

### 1. Training Phase

- Simply stores the training data
- No actual "training" occurs (lazy learning)

### 2. Prediction Phase

- Calculate distance to all training points
- Find k nearest neighbors
- Make prediction based on neighbors

## Distance Metrics

### Euclidean Distance (most common)

```
d(p,q) = √Σᵢ(pᵢ - qᵢ)²
```

### Manhattan Distance

```
d(p,q) = Σᵢ|pᵢ - qᵢ|
```

### Minkowski Distance

```
d(p,q) = (Σᵢ|pᵢ - qᵢ|^p)^(1/p)
```

### Hamming Distance (for categorical data)

```
d(p,q) = number of positions where pᵢ ≠ qᵢ
```

## Choosing K

### Small K (e.g., 1, 3)

- **Pros**: Low bias, captures local patterns
- **Cons**: High variance, sensitive to noise

### Large K (e.g., 10, 20)

- **Pros**: More stable, less sensitive to noise
- **Cons**: Higher bias, may miss local patterns

### Optimal K Selection

- Use cross-validation
- Odd numbers for binary classification (avoid ties)
- Square root of n (number of samples) as starting point

## Classification vs Regression

### Classification

- Majority voting among k neighbors
- Can use weighted voting (closer neighbors have more influence)

### Regression

- Average of k neighbors' target values
- Can use weighted average

## Curse of Dimensionality

As dimensions increase:

- Distance calculations become less meaningful
- All points become equally distant
- Performance degrades

### Solutions

- Feature selection
- Dimensionality reduction (PCA)
- Use distance metrics appropriate for high dimensions

## Advantages

- Simple and intuitive
- No assumptions about data distribution
- Can handle multi-class problems
- Naturally handles non-linear relationships
- Easy to implement

## Limitations

- Computationally expensive for large datasets
- Sensitive to irrelevant features
- Requires good distance metric
- Doesn't work well in high dimensions
- Memory intensive

## Optimization Techniques

### 1. KD-Trees

- Efficient data structure for low-dimensional data
- Reduces search time from O(n) to O(log n)

### 2. Ball Trees

- Better for high-dimensional data
- Uses hyperspheres instead of hyperrectangles

### 3. Approximate Nearest Neighbors

- Sacrifices accuracy for speed
- Useful for very large datasets

## Applications

- Recommendation systems
- Image recognition
- Handwriting recognition
- Medical diagnosis
- Financial forecasting

## Evaluation

### Classification Metrics

- Accuracy, Precision, Recall, F1-Score
- Confusion Matrix

### Regression Metrics

- Mean Squared Error (MSE)
- Mean Absolute Error (MAE)
- R² Score

## Best Practices

1. Scale features (normalization/standardization)
2. Remove outliers
3. Handle missing values
4. Choose appropriate distance metric
5. Use cross-validation for k selection
6. Consider dimensionality reduction for high-D data
