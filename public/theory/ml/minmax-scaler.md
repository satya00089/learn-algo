# Min-Max Scaler (Normalization)

## Overview

Min-Max Scaler transforms features by scaling each feature to a given range, typically [0, 1]. It preserves the shape of the original distribution while changing the scale.

## Mathematical Foundation

### Scaling Formula

```
x_scaled = (x - min) / (max - min)
```

Where:

- `x` is the original feature value
- `min` is the minimum value of the feature
- `max` is the maximum value of the feature

### Custom Range

Can scale to any range [a, b]:

```
x_scaled = a + (x - min) / (max - min) * (b - a)
```

## Properties After Scaling

- **Range**: [0, 1] (or custom range)
- **Preserves relationships**: Relative distances maintained
- **Shape**: Original distribution shape preserved
- **Outliers**: Highly sensitive to outliers

## When to Use

### Recommended for:

- Image processing (pixel values 0-255 → 0-1)
- Neural networks (activation functions work better with [0,1])
- Algorithms requiring bounded inputs
- When you need interpretable feature scales

### Good for:

- Neural Networks
- KNN (when using uniform weights)
- Image processing algorithms

## Advantages

- Preserves relative relationships
- Easy to understand (0-1 range)
- Works with any distribution
- Maintains sparsity in sparse matrices

## Limitations

- Very sensitive to outliers
- Compresses inliers into small range if outliers exist
- Doesn't center data (mean ≠ 0)
- Assumes known min/max values

## Comparison with Other Scalers

### vs Standard Scaler

- **Min-Max**: Range=[0,1], sensitive to outliers
- **Standard**: Mean=0, Std=1, handles outliers better

### vs Robust Scaler

- **Min-Max**: Uses min/max (very sensitive to outliers)
- **Robust**: Uses quantiles (robust to outliers)

## Implementation Details

### Training Phase

```python
# Calculate min and max from training data
min_val = np.min(X_train, axis=0)
max_val = np.max(X_train, axis=0)
```

### Transform Phase

```python
# Apply to both train and test data
X_train_scaled = (X_train - min_val) / (max_val - min_val)
X_test_scaled = (X_test - min_val) / (max_val - min_val)
```

## Best Practices

1. **Fit on training data only**: Prevents data leakage
2. **Handle outliers**: Consider robust scaling if outliers present
3. **Feature range**: Choose appropriate [min, max] range
4. **Zero variance**: Handle constant features

## Applications

- Image processing
- Neural networks
- Computer vision
- Any algorithm requiring bounded inputs

## Common Pitfalls

1. **Data leakage**: Fitting on entire dataset
2. **Outliers**: Can compress useful data
3. **Test data**: Using wrong min/max values
4. **Sparsity**: Can break sparse matrix sparsity

## Alternatives

- **StandardScaler**: For normally distributed data
- **RobustScaler**: For outlier-prone data
- **MaxAbsScaler**: For sparse data
- **PowerTransformer**: For non-Gaussian data
