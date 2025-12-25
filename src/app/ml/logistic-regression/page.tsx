import { LogisticRegressionPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logistic Regression',
  description:
    'Interactive logistic regression visualization for binary classification. Understand decision boundaries, sigmoid functions, and classification algorithms.',
  openGraph: {
    title: 'Logistic Regression - Interactive Visualization | LEARN ALGO',
    description:
      'Master binary classification with practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-logistic-regression.png',
        width: 1200,
        height: 630,
        alt: 'Logistic Regression Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logistic Regression - Interactive Visualization',
    description: 'Master binary classification with practice',
    images: ['/og/og-ml-logistic-regression.png'],
  },
}

export default function LogisticRegressionPage() {
  return <LogisticRegressionPlayground />
}
