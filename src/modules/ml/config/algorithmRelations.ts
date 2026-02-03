export type MLRoute =
  | 'chance-events'
  | 'expectation'
  | 'variance'
  | 'linear-regression'
  | 'polynomial-regression'
  | 'logistic-regression'
  | 'decision-tree'
  | 'ensemble-models'
  | 'knn'
  | 'k-means'
  | 'gmm'
  | 'dbscan'
  | 'hierarchical-clustering'
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
      name: 'Variance',
      route: 'variance',
      category: 'Probability',
    },
    {
      name: 'Chance Events',
      route: 'chance-events',
      category: 'Probability',
    },
    {
      name: 'Standard Scaler',
      route: 'standard-scaler',
      category: 'Preprocessing',
    },
  ],
  variance: [
    {
      name: 'Expectation',
      route: 'expectation',
      category: 'Probability',
    },
    {
      name: 'Standard Scaler',
      route: 'standard-scaler',
      category: 'Preprocessing',
    },
    {
      name: 'Chance Events',
      route: 'chance-events',
      category: 'Probability',
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
    {
      name: 'GMM',
      route: 'gmm',
      category: 'Clustering',
    },
  ],
  'k-means': [
    {
      name: 'GMM',
      route: 'gmm',
      category: 'Clustering',
    },
    {
      name: 'DBSCAN',
      route: 'dbscan',
      category: 'Clustering',
    },
    {
      name: 'KNN',
      route: 'knn',
      category: 'Classification',
    },
  ],
  gmm: [
    {
      name: 'K-Means',
      route: 'k-means',
      category: 'Clustering',
    },
    {
      name: 'DBSCAN',
      route: 'dbscan',
      category: 'Clustering',
    },
    {
      name: 'KNN',
      route: 'knn',
      category: 'Classification',
    },
  ],
  dbscan: [
    {
      name: 'K-Means',
      route: 'k-means',
      category: 'Clustering',
    },
    {
      name: 'GMM',
      route: 'gmm',
      category: 'Clustering',
    },
    {
      name: 'Hierarchical Clustering',
      route: 'hierarchical-clustering',
      category: 'Clustering',
    },
  ],
  'hierarchical-clustering': [
    {
      name: 'K-Means',
      route: 'k-means',
      category: 'Clustering',
    },
    {
      name: 'DBSCAN',
      route: 'dbscan',
      category: 'Clustering',
    },
    {
      name: 'GMM',
      route: 'gmm',
      category: 'Clustering',
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
