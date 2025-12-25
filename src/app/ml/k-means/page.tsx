import { KMeansClusteringPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K-Means Clustering',
  description:
    'Interactive K-Means clustering algorithm visualization. Watch centroids converge and understand unsupervised learning through real-time clustering.',
  openGraph: {
    title: 'K-Means Clustering - Interactive Visualization | LEARN ALGO',
    description:
      'Master unsupervised learning with visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-k-means.png',
        width: 1200,
        height: 630,
        alt: 'K-Means Clustering Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K-Means Clustering - Interactive Visualization',
    description: 'Master unsupervised learning with visualizations',
    images: ['/og/og-ml-k-means.png'],
  },
}

export default function KMeansPage() {
  return <KMeansClusteringPlayground />
}
