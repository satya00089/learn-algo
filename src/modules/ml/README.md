# Machine Learning Module

This module contains interactive visualizations and step-by-step implementations of various machine learning algorithms.

## Algorithms

### Supervised Learning

- **Linear Regression**: Learn how gradient descent optimizes a line to fit data points
- **Logistic Regression**: Understand classification with sigmoid functions
- **Decision Trees**: Visualize tree splits and decision boundaries

### Unsupervised Learning

- **K-Means Clustering**: Watch centroids update iteratively
- **PCA**: Dimensionality reduction visualization

### Neural Networks

- **Perceptron**: Single neuron learning
- **Multi-layer Networks**: Backpropagation visualization

## Architecture

Each algorithm follows the strict separation of concerns:

- `algorithms/` - Pure mathematical functions
- `engines/` - Step-based debuggable implementations
- `visualizers/` - Canvas rendering logic
- `playground/` - Orchestration components
- `controls/` - Algorithm-specific UI controls
