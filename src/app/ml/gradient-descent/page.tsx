import { GradientDescentPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gradient Descent',
  description:
    'Interactive gradient descent optimization visualization. Watch how gradient descent finds optimal parameters by minimizing cost functions step by step.',
}

export default function GradientDescentPage() {
  return <GradientDescentPlayground />
}
