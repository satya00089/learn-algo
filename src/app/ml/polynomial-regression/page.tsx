import { PolynomialRegressionPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polynomial Regression',
  description:
    'Interactive polynomial regression visualization with gradient descent. Fit polynomial curves to data and understand overfitting, underfitting, and model complexity.',
}

export default function PolynomialRegressionPage() {
  return <PolynomialRegressionPlayground />
}
