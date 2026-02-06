# Polynomial Regression

## Overview

Polynomial Regression is an extension of linear regression that models the relationship between the independent variable x and dependent variable y as an nth-degree polynomial. It's used when the relationship between variables is non-linear.

## Mathematical Foundation

### Polynomial Model
Instead of a straight line, polynomial regression fits a curve:
```
y = b₀ + b₁x + b₂x² + b₃x³ + ... + bₙxⁿ
```
Where:
- `n` is the degree of the polynomial
- `b₀, b₁, ..., bₙ` are the coefficients

### Feature Transformation
The algorithm transforms the original feature x into polynomial features:
```
[x] → [1, x, x², x³, ..., xⁿ]
```

## Choosing the Degree

### Underfitting vs Overfitting
- **Low degree**: May underfit (high bias)
- **High degree**: May overfit (high variance)
- **Optimal degree**: Balances bias-variance tradeoff

### Cross-Validation
Use techniques like k-fold cross-validation to find the best degree.

## Cost Function

Same as linear regression - minimizes Mean Squared Error:
```
MSE = (1/n) Σ(yᵢ - ŷᵢ)²
```

## Advantages

- Can model non-linear relationships
- Still uses linear regression techniques
- Easy to implement and understand
- Interpretable coefficients

## Limitations

- Prone to overfitting with high degrees
- Extrapolation can be unreliable
- Sensitive to outliers
- Requires careful degree selection

## Applications

- Growth rate modeling
- Physics (motion under gravity)
- Economics (supply/demand curves)
- Biology (population growth)

## Regularization

To prevent overfitting, use regularization techniques:

### Ridge Regression
```
J(θ) = MSE + λ Σ θ_j²
```

### Lasso Regression
```
J(θ) = MSE + λ Σ |θ_j|
```

## Evaluation

- **R² Score**: Proportion of variance explained
- **Adjusted R²**: Penalizes for adding unnecessary terms
- **Cross-validation scores**: Prevents overfitting

## Best Practices

1. Start with low-degree polynomials
2. Use cross-validation for degree selection
3. Consider regularization for high degrees
4. Visualize the fit to check for overfitting
5. Scale features when using regularization