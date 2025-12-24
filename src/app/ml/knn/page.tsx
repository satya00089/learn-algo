import { KNNPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K-Nearest Neighbors',
  description:
    'Interactive K-Nearest Neighbors (KNN) classification visualization. Explore how the KNN algorithm classifies data points based on their nearest neighbors.',
  openGraph: {
    title: 'K-Nearest Neighbors - Interactive Visualization | LEARN ALGO',
    description:
      'Learn KNN algorithm with interactive examples. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-knn.png',
        width: 1200,
        height: 630,
        alt: 'K-Nearest Neighbors Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K-Nearest Neighbors - Interactive Visualization',
    description: 'Learn KNN algorithm with interactive examples',
    images: ['/og/og-ml-knn.png'],
  },
}

export default function KNNPage() {
  return <KNNPlayground />
}
