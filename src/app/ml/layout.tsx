import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Machine Learning',
    template: '%s | ML | Learn Algo',
  },
  description:
    'Explore interactive machine learning algorithm visualizations. Learn regression, classification, clustering, and optimization techniques with step-by-step animations.',
  openGraph: {
    title: 'Machine Learning - Interactive Visualizations | LEARN ALGO',
    description:
      'Explore ML algorithms with interactive visualizations. Regression, classification, clustering & preprocessing.',
    images: [
      {
        url: '/og/og-ml.png',
        width: 1200,
        height: 630,
        alt: 'Machine Learning Algorithm Visualizations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Machine Learning | LEARN ALGO',
    description: 'Interactive ML visualizations: regression, classification, clustering',
    images: ['/og/og-ml.png'],
  },
}

export default function MLLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
