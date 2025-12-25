import { MinMaxScalerPlayground } from '@/modules/ml/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MinMax Scaler',
  description:
    'Interactive MinMax Scaler normalization visualization. Learn how to scale features to a fixed range (typically 0 to 1) for machine learning.',
  openGraph: {
    title: 'MinMax Scaler - Interactive Visualization | LEARN ALGO',
    description:
      'Learn feature normalization through practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-minmax-scaler.png',
        width: 1200,
        height: 630,
        alt: 'MinMax Scaler Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MinMax Scaler - Interactive Visualization',
    description: 'Learn feature normalization through practice',
    images: ['/og/og-ml-minmax-scaler.png'],
  },
}

export default function MinMaxScalerPage() {
  return <MinMaxScalerPlayground />
}
