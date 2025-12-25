import { DecisionTreePlayground } from '@/modules/ml/playground/DecisionTreePlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Decision Tree',
  description:
    'Interactive decision tree visualization for binary classification. Learn how decision trees work with entropy, Gini impurity, and recursive partitioning.',
  openGraph: {
    title: 'Decision Tree - Interactive Visualization | LEARN ALGO',
    description:
      'Master decision trees with interactive practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-decision-tree.png',
        width: 1200,
        height: 630,
        alt: 'Decision Tree Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Decision Tree - Interactive Visualization',
    description: 'Master decision trees with interactive practice',
    images: ['/og/og-ml-decision-tree.png'],
  },
}

export default function DecisionTreePage() {
  return <DecisionTreePlayground />
}
