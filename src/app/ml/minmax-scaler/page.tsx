import { MinMaxScalerPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MinMax Scaler',
  description:
    'Interactive MinMax Scaler normalization visualization. Learn how to scale features to a fixed range (typically 0 to 1) for machine learning.',
}

export default function MinMaxScalerPage() {
  return <MinMaxScalerPlayground />
}
