import { GradientDescentPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gradient Descent',
  description:
    'Interactive gradient descent optimization visualization. Watch how gradient descent finds optimal parameters by minimizing cost functions step by step.',
  openGraph: {
    title: 'Gradient Descent - Interactive Visualization | LEARN ALGO',
    description:
      'Learn optimization with interactive practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-gradient-descent.png',
        width: 1200,
        height: 630,
        alt: 'Gradient Descent Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gradient Descent - Interactive Visualization',
    description: 'Learn optimization with interactive practice',
    images: ['/og/og-ml-gradient-descent.png'],
  },
}

export default function GradientDescentPage() {
  return <GradientDescentPlayground />
}
