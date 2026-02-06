import { Metadata } from 'next'
import { PCAPlayground } from '@/modules/ml/playground/PCAPlayground'

export const metadata: Metadata = {
  title: 'Principal Component Analysis (PCA) - Dimensionality Reduction',
  description: 'Explore Principal Component Analysis for dimensionality reduction. See how PCA finds principal components that capture maximum variance in your data, with interactive step-by-step visualization.',
  keywords: [
    'principal component analysis',
    'pca',
    'dimensionality reduction',
    'principal components',
    'eigenvalues',
    'eigenvectors',
    'covariance matrix',
    'data transformation',
    'feature extraction',
    'unsupervised learning',
    'machine learning',
    'data visualization',
    'interactive tutorial',
    'variance explained',
  ],
  openGraph: {
    title: 'PCA - Principal Component Analysis Visualization',
    description: 'Interactive visualization of Principal Component Analysis for dimensionality reduction. Learn how PCA transforms high-dimensional data.',
    images: [
      {
        url: '/og/og-ml-pca.png',
        width: 1200,
        height: 630,
        alt: 'Principal Component Analysis Visualization',
      },
    ],
  },
}

export const dynamic = 'force-dynamic'

export default function PCAPage() {
  return <PCAPlayground />
}