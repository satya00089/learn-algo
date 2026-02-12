# Standard Scaler (Z-score Normalization)

## Overview

Standard Scaler transforms features by removing the mean and scaling to unit variance. Also known as Z-score normalization, it centers the data around 0 with a standard deviation of 1.

## Mathematical Foundation

### Standardization Formula

```
x_scaled = (x - μ) / σ
```

Where:

- `x` is the original feature value
- `μ` is the mean of the feature
- `σ` is the standard deviation of the feature

## Properties After Scaling

- **Mean**: 0
- **Standard Deviation**: 1
- **Preserves shape**: Only changes scale and location
- **Outliers**: Can still be present (not robust)

## When to Use

### Recommended for algorithms that assume:

- Gaussian distributed data
- Features with different scales
- Algorithms sensitive to feature scales

### Good for:

- Linear Regression
- Logistic Regression
- KNN
- SVM
- PCA
- Neural Networks

## Advantages

- Centers data around mean
- Maintains relative distances
- Works well with gradient-based algorithms
- Preserves outliers (can be good or bad)

## Limitations

- Sensitive to outliers
- Doesn't handle categorical features
- Assumes Gaussian distribution for some algorithms

## Comparison with Other Scalers

### vs Min-Max Scaler

- **Standard Scaler**: Mean=0, Std=1, preserves outliers
- **Min-Max Scaler**: Range=[0,1], sensitive to outliers

### vs Robust Scaler

- **Standard Scaler**: Uses mean and std (sensitive to outliers)
- **Robust Scaler**: Uses median and IQR (robust to outliers)

## Implementation Details

### Training Phase

```python
# Calculate mean and std from training data
mean = np.mean(X_train, axis=0)
std = np.std(X_train, axis=0)
```

### Transform Phase

```python
# Apply to both train and test data
X_train_scaled = (X_train - mean) / std
X_test_scaled = (X_test - mean) / std
```

## Best Practices

1. **Fit on training data only**: Prevents data leakage
2. **Transform both train and test**: Using training statistics
3. **Handle zero variance**: Features with no variation
4. **Consider outliers**: May need robust scaling instead

## Applications

- Machine learning preprocessing
- Statistical analysis
- Feature engineering
- Data normalization for visualization

## Common Pitfalls

1. **Data leakage**: Fitting scaler on entire dataset
2. **Different statistics**: Using different means/stds for train/test
3. **Categorical features**: Don't apply to categorical data
4. **Sparse matrices**: Can break sparsity

## Alternatives

- **MinMaxScaler**: For bounded ranges
- **RobustScaler**: For outlier-prone data
- **Normalizer**: For row-wise normalization
- **PowerTransformer**: For non-Gaussian data
