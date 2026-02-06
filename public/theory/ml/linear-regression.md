# Linear Regression

## Overview

Linear Regression is a fundamental supervised machine learning algorithm used for predicting continuous numerical values based on input features. It establishes a linear relationship between the dependent variable (target) and one or more independent variables (features).

## Mathematical Foundation

### Simple Linear Regression
For a single feature, the model is represented as:
```
y = mx + b
```
Where:
- `y` is the predicted value
- `x` is the input feature
- `m` is the slope (coefficient)
- `b` is the y-intercept

### Multiple Linear Regression
For multiple features, the model becomes:
```
y = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ
```
Where:
- `b₀` is the intercept
- `b₁, b₂, ..., bₙ` are the coefficients for each feature

## Cost Function

The algorithm minimizes the Mean Squared Error (MSE):
```
MSE = (1/n) Σ(yᵢ - ŷᵢ)²
```
Where:
- `n` is the number of training examples
- `yᵢ` is the actual value
- `ŷᵢ` is the predicted value

## Optimization Methods

### 1. Closed-Form Solution (Normal Equation)
```
β = (XᵀX)⁻¹Xᵀy
```
- Computationally expensive for large datasets
- No need for feature scaling
- Guaranteed to find optimal solution

### 2. Gradient Descent
Iteratively updates parameters to minimize cost:
```
θ := θ - α ∂J/∂θ
```
Where:
- `α` is the learning rate
- `∂J/∂θ` is the gradient of the cost function

## Assumptions

1. **Linearity**: Relationship between features and target is linear
2. **Independence**: Observations are independent
3. **Homoscedasticity**: Constant variance of errors
4. **No multicollinearity**: Features are not highly correlated
5. **Normality**: Residuals are normally distributed

## Evaluation Metrics

- **Mean Absolute Error (MAE)**: Average absolute difference
- **Mean Squared Error (MSE)**: Average squared difference
- **Root Mean Squared Error (RMSE)**: Square root of MSE
- **R² Score**: Proportion of variance explained

## Applications

- House price prediction
- Sales forecasting
- Risk assessment
- Medical diagnosis
- Financial modeling

## Advantages

- Simple and interpretable
- Fast training and prediction
- No hyperparameters to tune (for closed-form)
- Basis for more complex algorithms

## Limitations

- Assumes linear relationships
- Sensitive to outliers
- Cannot capture non-linear patterns
- Requires feature engineering