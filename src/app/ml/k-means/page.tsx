import { KMeansClusteringPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K-Means Clustering',
  description:
    'Interactive K-Means clustering algorithm visualization. Watch centroids converge and understand unsupervised learning through real-time clustering.',
}

export default function KMeansPage() {
  return <KMeansClusteringPlayground />
}
