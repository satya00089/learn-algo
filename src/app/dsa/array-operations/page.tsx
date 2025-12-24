import { ArrayOperationsPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Array Operations',
  description:
    'Interactive array operations visualization. Learn fundamental array manipulations: insertion, deletion, searching, and traversal with step-by-step animations.',
  openGraph: {
    title: 'Array Operations - Interactive Visualization | LEARN ALGO',
    description:
      'Master array manipulation with visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-array-operations.png',
        width: 1200,
        height: 630,
        alt: 'Array Operations Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Array Operations - Interactive Visualization',
    description: 'Master array manipulation with visualizations',
    images: ['/og/og-dsa-array-operations.png'],
  },
}

export default function ArrayOperationsPage() {
  return <ArrayOperationsPlayground />
}
