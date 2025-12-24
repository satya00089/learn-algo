import { StandardScalerPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standard Scaler',
  description:
    'Interactive Standard Scaler (Z-score normalization) visualization. Learn how to standardize features by removing mean and scaling to unit variance.',
}

export default function StandardScalerPage() {
  return <StandardScalerPlayground />
}
