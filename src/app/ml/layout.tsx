import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Machine Learning',
    template: '%s | ML | Learn Algo',
  },
  description:
    'Explore cutting-edge 3D interactive machine learning visualizations with theory explanations and multi-language code examples. Learn PCA (Principal Component Analysis), clustering (K-Means, DBSCAN, GMM, Hierarchical), regression models (Linear, Polynomial, Logistic), gradient descent optimization, anomaly detection, ensemble methods, feature scaling (Standard Scaler, MinMax Scaler), regularization, probability theory (Chance Events, Expectation, Variance), KNN, and decision trees.',
  keywords: [
    'machine learning',
    'ML algorithms',
    'PCA visualization',
    'principal component analysis',
    '3D PCA',
    'dimensionality reduction',
    'k-means clustering',
    'DBSCAN clustering',
    'GMM clustering',
    'gaussian mixture models',
    'hierarchical clustering',
    'linear regression',
    'polynomial regression',
    'logistic regression',
    'gradient descent',
    'gradient descent optimization',
    'anomaly detection',
    'ensemble models',
    'feature scaling',
    'standard scaler',
    'minmax scaler',
    'regularization',
    'probability theory',
    'expected value',
    'variance statistics',
    'KNN algorithm',
    'k-nearest neighbors',
    'decision tree',
    'supervised learning',
    'unsupervised learning',
    'machine learning visualization',
    '3D visualization',
    'interactive ML',
  ],
  authors: [{ name: 'LEARN ALGO' }],
  creator: 'LEARN ALGO',
  alternates: {
    canonical: 'https://www.learn-algo.com/ml',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Machine Learning - Interactive 3D Visualizations | LEARN ALGO',
    description:
      'Explore ML algorithms with cutting-edge 3D visualizations. PCA dimensionality reduction, clustering algorithms, regression models, gradient descent, anomaly detection, feature scaling, probability theory & more.',
    type: 'website',
    url: 'https://www.learn-algo.com/ml',
    siteName: 'LEARN ALGO',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.learn-algo.com/og/og-ml.png',
        width: 1200,
        height: 630,
        alt: 'Machine Learning Algorithm Visualizations',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Machine Learning | LEARN ALGO',
    description: 'Interactive ML visualizations: regression, classification, clustering',
    site: '@LearnAlgo',
    creator: '@LearnAlgo',
    images: ['https://www.learn-algo.com/og/og-ml.png'],
  },
}

export default function MLLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
