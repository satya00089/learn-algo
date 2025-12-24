import { StandardScalerPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Standard Scaler',
  description:
    'Interactive Standard Scaler (Z-score normalization) visualization. Learn how to standardize features by removing mean and scaling to unit variance.',
  openGraph: {
    title: 'Standard Scaler - Interactive Visualization | LEARN ALGO',
    description:
      'Master feature standardization with examples. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-standard-scaler.png',
        width: 1200,
        height: 630,
        alt: 'Standard Scaler Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Standard Scaler - Interactive Visualization',
    description: 'Master feature standardization with examples',
    images: ['/og/og-ml-standard-scaler.png'],
  },
}

export default function StandardScalerPage() {
  return <StandardScalerPlayground />
}
