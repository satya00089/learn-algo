export type MLRoute =
  | 'chance-events'
  | 'expectation'
  | 'linear-regression'
  | 'polynomial-regression'
  | 'logistic-regression'
  | 'decision-tree'
  | 'ensemble-models'
  | 'knn'
  | 'k-means'
  | 'gradient-descent'
  | 'minmax-scaler'
  | 'standard-scaler'
  | 'regularization'

export interface RelatedAlgorithm {
  name: string
  route: MLRoute
  category: string
}

export const mlAlgorithmRelations: Record<MLRoute, RelatedAlgorithm[]> = {
  'chance-events': [
    {
      name: 'Expectation',
      route: 'expectation',
      category: 'Probability',
    },
    {
      name: 'Linear Regression',
      route: 'linear-regression',
      category: 'Regression',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
  ],
  expectation: [
    {
      name: 'Chance Events',
      route: 'chance-events',
      category: 'Probability',
    },
    {
      name: 'Decision Tree',
      route: 'decision-tree',
      category: 'Classification',
    },
    {
      name: 'K-Means Clustering',
      route: 'k-means',
      category: 'Clustering',
    },
  ],
  'linear-regression': [
    {
      name: 'Polynomial Regression',
      route: 'polynomial-regression',
      category: 'Regression',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
    {
      name: 'Gradient Descent',
      route: 'gradient-descent',
      category: 'Optimization',
    },
  ],
  'polynomial-regression': [
    {
      name: 'Linear Regression',
      route: 'linear-regression',
      category: 'Regression',
    },
    {
      name: 'Gradient Descent',
      route: 'gradient-descent',
      category: 'Optimization',
    },
    {
      name: 'Standard Scaler',
      route: 'standard-scaler',
      category: 'Preprocessing',
    },
  ],
  'logistic-regression': [
    {
      name: 'Decision Tree',
      route: 'decision-tree',
      category: 'Classification',
    },
    {
      name: 'KNN',
      route: 'knn',
      category: 'Classification',
    },
    {
      name: 'Gradient Descent',
      route: 'gradient-descent',
      category: 'Optimization',
    },
  ],
  'decision-tree': [
    {
      name: 'Ensemble Models',
      route: 'ensemble-models',
      category: 'Classification',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
    {
      name: 'KNN',
      route: 'knn',
      category: 'Classification',
    },
  ],
  'ensemble-models': [
    {
      name: 'Decision Tree',
      route: 'decision-tree',
      category: 'Classification',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
    {
      name: 'KNN',
      route: 'knn',
      category: 'Classification',
    },
  ],
  knn: [
    {
      name: 'Decision Tree',
      route: 'decision-tree',
      category: 'Classification',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
    {
      name: 'K-Means',
      route: 'k-means',
      category: 'Clustering',
    },
  ],
  'k-means': [
    {
      name: 'KNN',
      route: 'knn',
      category: 'Classification',
    },
    {
      name: 'Standard Scaler',
      route: 'standard-scaler',
      category: 'Preprocessing',
    },
    {
      name: 'MinMax Scaler',
      route: 'minmax-scaler',
      category: 'Preprocessing',
    },
  ],
  'gradient-descent': [
    {
      name: 'Linear Regression',
      route: 'linear-regression',
      category: 'Regression',
    },
    {
      name: 'Polynomial Regression',
      route: 'polynomial-regression',
      category: 'Regression',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
  ],
  'minmax-scaler': [
    {
      name: 'Standard Scaler',
      route: 'standard-scaler',
      category: 'Preprocessing',
    },
    {
      name: 'K-Means',
      route: 'k-means',
      category: 'Clustering',
    },
    {
      name: 'Linear Regression',
      route: 'linear-regression',
      category: 'Regression',
    },
  ],
  'standard-scaler': [
    {
      name: 'MinMax Scaler',
      route: 'minmax-scaler',
      category: 'Preprocessing',
    },
    {
      name: 'K-Means',
      route: 'k-means',
      category: 'Clustering',
    },
    {
      name: 'Polynomial Regression',
      route: 'polynomial-regression',
      category: 'Regression',
    },
  ],
  regularization: [
    {
      name: 'Linear Regression',
      route: 'linear-regression',
      category: 'Regression',
    },
    {
      name: 'Logistic Regression',
      route: 'logistic-regression',
      category: 'Classification',
    },
    {
      name: 'Gradient Descent',
      route: 'gradient-descent',
      category: 'Optimization',
    },
  ],
}
