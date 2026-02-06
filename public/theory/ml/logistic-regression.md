# Logistic Regression

## Overview

Logistic Regression is a statistical method for analyzing datasets where the outcome is binary (0 or 1). Despite its name, it's used for classification problems, not regression. It predicts the probability that an instance belongs to a particular class.

## Mathematical Foundation

### Sigmoid Function
The core of logistic regression is the sigmoid function:
```
σ(z) = 1 / (1 + e^(-z))
```
Where `z` is the linear combination of features.

### Hypothesis Function
```
h_θ(x) = σ(θᵀx) = 1 / (1 + e^(-θᵀx))
```
Where:
- `h_θ(x)` outputs values between 0 and 1
- `θ` represents the parameters (weights)
- `x` represents the input features

## Cost Function

Unlike linear regression, logistic regression uses log loss:
```
J(θ) = - (1/m) Σ [y⁽ⁱ⁾ log(h_θ(x⁽ⁱ⁾)) + (1-y⁽ⁱ⁾) log(1-h_θ(x⁽ⁱ⁾))]
```
Where:
- `m` is the number of training examples
- `y⁽ⁱ⁾` is the actual label (0 or 1)
- `h_θ(x⁽ⁱ⁾)` is the predicted probability

## Optimization

Parameters are optimized using gradient descent:
```
θ_j := θ_j - α ∂J/∂θ_j
```
Where the gradient is:
```
∂J/∂θ_j = (1/m) Σ (h_θ(x⁽ⁱ⁾) - y⁽ⁱ⁾)x_j⁽ⁱ⁾
```

## Decision Boundary

Predictions are made using a threshold (typically 0.5):
```
ŷ = { 1 if h_θ(x) ≥ 0.5
     { 0 if h_θ(x) < 0.5
```

## Types of Logistic Regression

### 1. Binary Logistic Regression
- Two classes (0 or 1)
- Single sigmoid function

### 2. Multinomial Logistic Regression
- Multiple classes
- Uses softmax instead of sigmoid

### 3. Ordinal Logistic Regression
- Ordered categories
- Maintains order information

## Regularization

To prevent overfitting, regularization can be added:

### L2 Regularization (Ridge)
```
J(θ) = J(θ) + λ Σ θ_j²
```

### L1 Regularization (Lasso)
```
J(θ) = J(θ) + λ Σ |θ_j|
```

## Evaluation Metrics

- **Accuracy**: (TP + TN) / (TP + TN + FP + FN)
- **Precision**: TP / (TP + FP)
- **Recall**: TP / (TP + FN)
- **F1-Score**: 2 * (Precision * Recall) / (Precision + Recall)
- **AUC-ROC**: Area under the ROC curve

## Assumptions

1. Independent observations
2. No multicollinearity
3. Linear relationship between features and log-odds
4. Large sample size

## Applications

- Email spam detection
- Credit risk assessment
- Medical diagnosis
- Customer churn prediction
- Fraud detection

## Advantages

- Simple and interpretable
- Fast training and prediction
- Outputs probabilities
- Works well with linearly separable data

## Limitations

- Assumes linear decision boundary
- Sensitive to outliers
- Cannot handle non-linear relationships
- Requires feature engineering