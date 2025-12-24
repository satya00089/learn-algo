import { LogisticRegressionPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logistic Regression',
  description:
    'Interactive logistic regression visualization for binary classification. Understand decision boundaries, sigmoid functions, and classification algorithms.',
}

export default function LogisticRegressionPage() {
  return <LogisticRegressionPlayground />
}
