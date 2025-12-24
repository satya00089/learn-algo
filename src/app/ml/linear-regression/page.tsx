import { LinearRegressionPlayground } from '@/modules/ml/playground/LinearRegressionPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Linear Regression',
  description:
    'Interactive linear regression visualization with gradient descent. Learn how to fit linear models to data and minimize cost functions.',
  openGraph: {
    title: 'Linear Regression - Interactive Visualization | LEARN ALGO',
    description:
      'Master linear regression with interactive practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-linear-regression.png',
        width: 1200,
        height: 630,
        alt: 'Linear Regression Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linear Regression - Interactive Visualization',
    description: 'Master linear regression with interactive practice',
    images: ['/og/og-ml-linear-regression.png'],
  },
}

export default function LinearRegressionPage() {
  return <LinearRegressionPlayground />
}
