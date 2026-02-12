# Gradient Descent

## Overview

Gradient Descent is an optimization algorithm used to minimize the cost function in machine learning models. It iteratively adjusts parameters to find the minimum of a function by moving in the direction of the negative gradient.

## Mathematical Foundation

### Basic Concept

The algorithm updates parameters by moving in the opposite direction of the gradient:

```
θ := θ - α ∇J(θ)
```

Where:

- `θ` represents the parameters
- `α` is the learning rate
- `∇J(θ)` is the gradient of the cost function

## Types of Gradient Descent

### 1. Batch Gradient Descent

- Uses entire training dataset for each update
- **Pros**: Stable convergence, accurate gradient
- **Cons**: Slow for large datasets, memory intensive
- **Update rule**: θ := θ - α (1/m) Σ ∇J(θ⁽ⁱ⁾)

### 2. Stochastic Gradient Descent (SGD)

- Uses one training example per update
- **Pros**: Fast, can escape local minima, online learning
- **Cons**: Noisy updates, may not converge exactly
- **Update rule**: θ := θ - α ∇J(θ⁽ⁱ⁾)

### 3. Mini-batch Gradient Descent

- Uses small batches of training examples
- **Pros**: Balance between batch and SGD, vectorized
- **Cons**: Additional hyperparameter (batch size)
- **Update rule**: θ := θ - α (1/batch_size) Σ ∇J(θ_batch)

## Learning Rate (α)

### Too Small

- Slow convergence
- May get stuck in local minima
- Requires many iterations

### Too Large

- May overshoot the minimum
- Can diverge
- Oscillates around minimum

### Adaptive Learning Rates

- **Momentum**: Accelerates in consistent directions
- **AdaGrad**: Adapts learning rate per parameter
- **RMSProp**: Addresses AdaGrad's aggressive decay
- **Adam**: Combines momentum and RMSProp

## Convergence Criteria

### Common stopping conditions:

1. **Maximum iterations reached**
2. **Cost function change < threshold**
3. **Gradient magnitude < threshold**
4. **Validation error stops improving**

## Challenges

### Local Minima

- GD can get stuck in local minima
- Solutions: Multiple random starts, momentum

### Saddle Points

- Flat regions where gradient is zero
- Solutions: Adaptive optimizers, momentum

### Vanishing/Exploding Gradients

- Gradients become too small/large
- Solutions: Gradient clipping, better initialization

## Applications

- Linear Regression training
- Logistic Regression training
- Neural Network training
- Any optimization problem with differentiable cost function

## Advantages

- Simple to implement
- Works for large datasets (SGD, mini-batch)
- Guaranteed convergence for convex functions
- Can be parallelized

## Limitations

- Requires differentiable cost function
- Sensitive to learning rate choice
- Can be slow for high-dimensional data
- May converge to local minima

## Best Practices

1. **Scale features**: Helps gradient descent converge faster
2. **Choose appropriate learning rate**: Start with small values, increase gradually
3. **Use mini-batch**: Balance between speed and stability
4. **Monitor convergence**: Plot cost function vs iterations
5. **Try different optimizers**: Adam often works well as default
6. **Early stopping**: Prevent overfitting

## Advanced Variants

### 1. Nesterov Accelerated Gradient

- Looks ahead before computing gradient
- Better momentum than standard momentum

### 2. Conjugate Gradient

- Uses conjugate directions instead of gradient
- Faster convergence than steepest descent

### 3. BFGS/L-BFGS

- Quasi-Newton methods
- Approximate second-order optimization
- Good for small to medium datasets
