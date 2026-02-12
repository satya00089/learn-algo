# Decision Trees

## Overview

Decision Trees are supervised machine learning algorithms that create a tree-like model of decisions and their possible consequences. They recursively split the dataset based on feature values to create homogeneous subsets.

## How Decision Trees Work

### 1. Root Node

- Contains the entire dataset
- Chooses the best feature to split on

### 2. Internal Nodes

- Represent decisions based on feature values
- Each split creates branches

### 3. Leaf Nodes

- Represent final predictions
- No further splits

## Splitting Criteria

### For Classification

- **Gini Impurity**: Measures probability of incorrect classification
  ```
  Gini = 1 - Σ p_i²
  ```
- **Entropy**: Measures disorder in the data
  ```
  Entropy = - Σ p_i log₂(p_i)
  ```
- **Information Gain**: Reduction in entropy after split

### For Regression

- **Mean Squared Error (MSE)**
- **Mean Absolute Error (MAE)**
- **Friedman MSE**

## Advantages

- Easy to understand and interpret
- Can handle both numerical and categorical data
- Requires little data preprocessing
- Non-parametric (no assumptions about data distribution)
- Fast prediction

## Limitations

- Prone to overfitting
- Unstable (small changes can create very different trees)
- Biased towards features with more categories
- Cannot extrapolate beyond training data

## Preventing Overfitting

### Pre-pruning

- Set maximum depth
- Set minimum samples per leaf
- Set minimum samples per split
- Set maximum number of features

### Post-pruning

- Remove branches that don't improve validation accuracy
- Cost complexity pruning (uses α parameter)

## Ensemble Methods

### Random Forest

- Builds multiple decision trees
- Each tree trained on random subset of data/features
- Predictions averaged (regression) or majority voted (classification)

### Gradient Boosting

- Builds trees sequentially
- Each tree corrects errors of previous trees
- Uses gradient descent to minimize loss

## Applications

- Customer churn prediction
- Credit risk assessment
- Medical diagnosis
- Fraud detection
- Recommendation systems

## Evaluation Metrics

### Classification

- Accuracy, Precision, Recall, F1-Score
- ROC-AUC curve
- Confusion matrix

### Regression

- Mean Squared Error (MSE)
- Mean Absolute Error (MAE)
- R² Score

## Best Practices

1. Handle missing values appropriately
2. Consider feature scaling for distance-based splits
3. Use cross-validation for hyperparameter tuning
4. Consider ensemble methods for better performance
5. Visualize trees for interpretability
