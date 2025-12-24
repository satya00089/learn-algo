import { KNNPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K-Nearest Neighbors',
  description:
    'Interactive K-Nearest Neighbors (KNN) classification visualization. Explore how the KNN algorithm classifies data points based on their nearest neighbors.',
}

export default function KNNPage() {
  return <KNNPlayground />
}
