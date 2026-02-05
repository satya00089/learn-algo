import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.learn-algo.com'

  // Define all your static routes with enhanced metadata
  const routeConfig = [
    {
      url: '',
      priority: 1,
      changeFrequency: 'daily' as const,
      description:
        'Interactive algorithm visualizations for learning data structures, machine learning, and AI concepts',
    },
    {
      url: '/dsa',
      priority: 0.9,
      changeFrequency: 'weekly' as const,
      description:
        'Data Structures & Algorithms - Interactive visualizations of fundamental computer science concepts',
    },
    {
      url: '/dsa/array-operations',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Learn array operations with step-by-step interactive visualizations and examples',
    },
    {
      url: '/dsa/binary-search',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Binary Search algorithm - efficient searching in sorted arrays with step-by-step visualization',
    },
    {
      url: '/dsa/binary-search-tree',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Binary Search Tree operations - insertion, deletion, traversal with visual demonstrations',
    },
    {
      url: '/dsa/bit-manipulation',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Bit manipulation techniques and algorithms with interactive bitwise operation visualizations',
    },
    {
      url: '/dsa/bubble-sort',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Bubble Sort algorithm - step-by-step visualization of this fundamental sorting technique',
    },
    {
      url: '/dsa/heap-sort',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Heap Sort algorithm - understand heap data structure and sorting with visual aids',
    },
    {
      url: '/dsa/insertion-sort',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Insertion Sort algorithm - interactive visualization of comparison-based sorting',
    },
    {
      url: '/dsa/merge-sort',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Merge Sort algorithm - divide and conquer sorting with step-by-step breakdown',
    },
    {
      url: '/dsa/queue',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Queue data structure - FIFO operations with interactive demonstrations',
    },
    {
      url: '/dsa/quick-sort',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Quick Sort algorithm - pivot-based sorting with partitioning visualizations',
    },
    {
      url: '/dsa/recursion',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Recursion concepts - understand recursive functions with call stack visualizations',
    },
    {
      url: '/dsa/selection-sort',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Selection Sort algorithm - minimum element selection with visual sorting steps',
    },
    {
      url: '/dsa/stack',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Stack data structure - LIFO operations with interactive push/pop demonstrations',
    },
    {
      url: '/dsa/strings',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'String algorithms and operations - pattern matching, manipulation with visualizations',
    },
    {
      url: '/ml',
      priority: 0.9,
      changeFrequency: 'weekly' as const,
      description:
        'Machine Learning algorithms - interactive visualizations of ML concepts and techniques',
    },
    {
      url: '/ml/chance-events',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Chance Events - probability visualization with coin flips and dice rolls demonstrating randomness',
    },
    {
      url: '/ml/expectation',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Expected Value - interactive dice rolling demonstrating E[X] and Law of Large Numbers',
    },
    {
      url: '/ml/variance',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Variance - measure statistical spread with card drawing and convergence visualization',
    },
    {
      url: '/ml/decision-tree',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Decision Tree algorithm - classification and regression with tree-based learning visualization',
    },
    {
      url: '/ml/ensemble-models',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Ensemble Models - Random Forest, Bagging, Boosting with interactive model combination demos',
    },
    {
      url: '/ml/gradient-descent',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Gradient Descent optimization - understand convergence and parameter updates visually',
    },
    {
      url: '/ml/k-means',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'K-Means clustering algorithm - centroid-based clustering with step-by-step visualization',
    },
    {
      url: '/ml/gmm',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Gaussian Mixture Model - probabilistic soft clustering with EM algorithm and covariance visualization',
    },
    {
      url: '/ml/knn',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'K-Nearest Neighbors classification - distance-based learning with interactive examples',
    },
    {
      url: '/ml/linear-regression',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Linear Regression - understand line fitting and prediction with visual demonstrations',
    },
    {
      url: '/ml/logistic-regression',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description:
        'Logistic Regression - binary classification with sigmoid function visualizations',
    },
    {
      url: '/ml/minmax-scaler',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Min-Max Scaler - feature scaling technique for machine learning preprocessing',
    },
    {
      url: '/ml/polynomial-regression',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Polynomial Regression - curve fitting beyond linear relationships',
    },
    {
      url: '/ml/standard-scaler',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Standard Scaler - Z-score normalization for feature standardization',
    },
    {
      url: '/ml/dbscan',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'DBSCAN Clustering - Density-based spatial clustering, core/border/noise points, epsilon and minPts parameters, outlier detection',
    },
    {
      url: '/ml/anomaly-detection',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Anomaly Detection - Isolation Forest, One-Class SVM, LOF, Z-Score, IQR methods for identifying outliers and anomalies in data',
    },
    {
      url: '/ml/hierarchical-clustering',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Hierarchical Clustering - Agglomerative and divisive clustering with dendrogram visualization and linkage methods',
    },
    {
      url: '/ml/pca',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
      description: 'Principal Component Analysis - Dimensionality reduction using principal components, eigenvalues, eigenvectors, and variance explained',
    },
    {
      url: '/ai',
      priority: 0.9,
      changeFrequency: 'weekly' as const,
      description:
        'Artificial Intelligence concepts - explore AI algorithms and intelligent systems',
    },
  ]

  return routeConfig.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
