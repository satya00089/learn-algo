import { LinearRegressionPlayground } from '@/modules/ml/playground/LinearRegressionPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Linear Regression',
  description:
    'Interactive linear regression visualization with gradient descent. Learn how to fit linear models to data and minimize cost functions.',
}

export default function LinearRegressionPage() {
  return <LinearRegressionPlayground />
}
