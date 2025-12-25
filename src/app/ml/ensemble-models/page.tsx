import { EnsembleModelsPlayground } from '@/modules/ml/playground/EnsembleModelsPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ensemble Models - Random Forest',
  description:
    'Interactive Random Forest visualization for ensemble learning. Learn how multiple decision trees combine to make better predictions through bagging and voting.',
  openGraph: {
    title: 'Ensemble Models (Random Forest) - Interactive Visualization | LEARN ALGO',
    description:
      'Master ensemble learning with interactive practice. See how Random Forest works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-ml-ensemble-models.png',
        width: 1200,
        height: 630,
        alt: 'Ensemble Models Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ensemble Models - Interactive Visualization',
    description: 'Master ensemble learning with interactive practice',
    images: ['/og/og-ml-ensemble-models.png'],
  },
}

export default function EnsembleModelsPage() {
  return <EnsembleModelsPlayground />
}
