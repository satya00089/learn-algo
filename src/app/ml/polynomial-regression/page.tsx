import { PolynomialRegressionPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polynomial Regression',
  description:
    'Interactive polynomial regression visualization with gradient descent. Fit polynomial curves to data and understand overfitting, underfitting, and model complexity.',
  openGraph: {
    title: 'Polynomial Regression - Interactive Visualization | LEARN ALGO',
    description:
      'Learn non-linear curve fitting with visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-polynomial-regression.png',
        width: 1200,
        height: 630,
        alt: 'Polynomial Regression Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polynomial Regression - Interactive Visualization',
    description: 'Learn non-linear curve fitting with visualizations',
    images: ['/og/og-ml-polynomial-regression.png'],
  },
}

export default function PolynomialRegressionPage() {
  return <PolynomialRegressionPlayground />
}
