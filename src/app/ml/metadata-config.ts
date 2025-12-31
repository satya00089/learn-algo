export const mlMetadata = {
  'gradient-descent': {
    title: 'Gradient Descent Optimization',
    description:
      'Master gradient descent algorithm with interactive 3D visualization. Watch how the optimizer finds minimum values on mathematical functions with adjustable learning rates and momentum.',
    keywords: [
      'gradient descent',
      'optimization algorithm',
      'machine learning optimization',
      'learning rate',
      'gradient descent visualization',
      'convex optimization',
      'machine learning',
      'ML algorithms',
    ],
    ogImage: '/og/og-ml-gradient-descent.png',
  },
  'minmax-scaler': {
    title: 'MinMax Scaler - Feature Scaling',
    description:
      'Learn MinMax scaling for feature normalization. Scale data to a fixed range [0,1] with interactive visualization showing before/after transformation and formula breakdown.',
    keywords: [
      'minmax scaler',
      'feature scaling',
      'data normalization',
      'feature normalization',
      'data preprocessing',
      'machine learning preprocessing',
      'ML',
    ],
    ogImage: '/og/og-ml-minmax-scaler.png',
  },
  'standard-scaler': {
    title: 'Standard Scaler - Feature Standardization',
    description:
      'Master standardization technique by removing mean and scaling to unit variance. Interactive visualization of z-score normalization for machine learning preprocessing.',
    keywords: [
      'standard scaler',
      'standardization',
      'z-score normalization',
      'feature standardization',
      'data preprocessing',
      'machine learning preprocessing',
      'ML',
    ],
    ogImage: '/og/og-ml-standard-scaler.png',
  },
  'linear-regression': {
    title: 'Linear Regression with Gradient Descent',
    description:
      'Visualize linear regression training with gradient descent optimization. Interactive 2D visualization showing loss reduction, weight updates, and prediction line fitting.',
    keywords: [
      'linear regression',
      'gradient descent',
      'supervised learning',
      'regression algorithm',
      'least squares',
      'machine learning regression',
      'ML',
    ],
    ogImage: '/og/og-ml-linear-regression.png',
  },
  'polynomial-regression': {
    title: 'Polynomial Regression Algorithm',
    description:
      'Explore polynomial curve fitting with gradient descent. Visualize how polynomial features capture non-linear relationships in data with adjustable degree.',
    keywords: [
      'polynomial regression',
      'curve fitting',
      'non-linear regression',
      'polynomial features',
      'regression algorithm',
      'machine learning',
      'ML',
    ],
    ogImage: '/og/og-ml-polynomial-regression.png',
  },
  'logistic-regression': {
    title: 'Logistic Regression - Binary Classification',
    description:
      'Master logistic regression for binary classification. Interactive visualization of sigmoid function, decision boundary, and gradient descent training process.',
    keywords: [
      'logistic regression',
      'binary classification',
      'sigmoid function',
      'classification algorithm',
      'supervised learning',
      'machine learning classification',
      'ML',
    ],
    ogImage: '/og/og-ml-logistic-regression.png',
  },
  'decision-tree': {
    title: 'Decision Tree Classifier',
    description:
      'Visualize decision tree classification with Gini impurity and information gain. Watch recursive partitioning build decision boundaries for multi-class problems.',
    keywords: [
      'decision tree',
      'classification tree',
      'gini impurity',
      'information gain',
      'recursive partitioning',
      'machine learning classification',
      'ML',
    ],
    ogImage: '/og/og-ml-decision-tree.png',
  },
  'ensemble-models': {
    title: 'Random Forest & Ensemble Models',
    description:
      'Explore ensemble learning with Random Forest visualization. See how multiple decision trees combine predictions for robust classification performance.',
    keywords: [
      'random forest',
      'ensemble learning',
      'bagging',
      'ensemble models',
      'decision trees',
      'machine learning ensemble',
      'ML',
    ],
    ogImage: '/og/og-ml-ensemble-models.png',
  },
  'k-means': {
    title: 'K-Means Clustering Algorithm',
    description:
      'Master K-Means unsupervised learning with interactive clustering visualization. Watch centroids update and data points cluster in real-time.',
    keywords: [
      'k-means clustering',
      'unsupervised learning',
      'clustering algorithm',
      'centroid-based clustering',
      'machine learning clustering',
      'ML',
    ],
    ogImage: '/og/og-ml-k-means.png',
  },
  knn: {
    title: 'K-Nearest Neighbors (KNN) Algorithm',
    description:
      'Learn K-Nearest Neighbors classification with interactive visualization. Explore distance metrics, k-value selection, and decision boundary formation.',
    keywords: [
      'k-nearest neighbors',
      'KNN algorithm',
      'instance-based learning',
      'classification algorithm',
      'distance metrics',
      'machine learning',
      'ML',
    ],
    ogImage: '/og/og-ml-knn.png',
  },
}

export type MLRoute = keyof typeof mlMetadata

// Helper function to generate metadata for ML pages
export function generateMLMetadata(route: MLRoute, customAlt?: string) {
  const meta = mlMetadata[route]
  const baseUrl = 'https://www.learn-algo.com'
  const canonicalUrl = `${baseUrl}/ml/${route}`

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: 'LEARN ALGO' }],
    creator: 'LEARN ALGO',
    publisher: 'LEARN ALGO',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${meta.title} | Learn Algo`,
      description: meta.description,
      type: 'article' as const,
      url: canonicalUrl,
      siteName: 'LEARN ALGO',
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}${meta.ogImage}`,
          width: 1200,
          height: 630,
          alt: customAlt || `${meta.title} Visualization`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${meta.title} | Learn Algo`,
      description: meta.description,
      site: '@LearnAlgo',
      creator: '@LearnAlgo',
      images: [`${baseUrl}${meta.ogImage}`],
    },
  }
}

// Helper function to generate structured data (JSON-LD) for ML algorithm pages
export function generateMLStructuredData(route: MLRoute) {
  const meta = mlMetadata[route]
  const baseUrl = 'https://www.learn-algo.com'
  const canonicalUrl = `${baseUrl}/ml/${route}`

  // Get algorithm category
  const getAlgorithmCategory = (keywords: string[]) => {
    if (keywords.includes('regression algorithm')) return 'Regression Algorithm'
    if (keywords.includes('classification algorithm')) return 'Classification Algorithm'
    if (keywords.includes('clustering algorithm')) return 'Clustering Algorithm'
    if (keywords.includes('data preprocessing')) return 'Data Preprocessing'
    if (keywords.includes('optimization algorithm')) return 'Optimization Algorithm'
    return 'Machine Learning Algorithm'
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    description: meta.description,
    url: canonicalUrl,
    image: `${baseUrl}${meta.ogImage}`,
    author: {
      '@type': 'Organization',
      name: 'LEARN ALGO',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LEARN ALGO',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo/logo.png`,
      },
    },
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    articleSection: getAlgorithmCategory(meta.keywords),
    keywords: meta.keywords.join(', '),
    educationalLevel: 'Beginner to Advanced',
    learningResourceType: 'Interactive Visualization',
    interactivityType: 'active',
    about: {
      '@type': 'Thing',
      name: meta.title,
      description: meta.description,
    },
    teaches: meta.title,
  }
}
