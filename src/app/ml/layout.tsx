import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Machine Learning',
    template: '%s | ML | Learn Algo',
  },
  description:
    'Explore interactive machine learning algorithm visualizations. Learn regression, classification, clustering, and optimization techniques with step-by-step animations.',
  keywords: [
    'machine learning',
    'ML algorithms',
    'regression algorithms',
    'classification algorithms',
    'clustering algorithms',
    'gradient descent',
    'neural networks',
    'supervised learning',
    'unsupervised learning',
    'machine learning visualization',
  ],
  authors: [{ name: 'LEARN ALGO' }],
  creator: 'LEARN ALGO',
  alternates: {
    canonical: 'https://www.learn-algo.com/ml',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Machine Learning - Interactive Visualizations | LEARN ALGO',
    description:
      'Explore ML algorithms with interactive visualizations. Regression, classification, clustering & preprocessing.',
    type: 'website',
    url: 'https://www.learn-algo.com/ml',
    siteName: 'LEARN ALGO',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.learn-algo.com/og/og-ml.png',
        width: 1200,
        height: 630,
        alt: 'Machine Learning Algorithm Visualizations',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Machine Learning | LEARN ALGO',
    description: 'Interactive ML visualizations: regression, classification, clustering',
    site: '@LearnAlgo',
    creator: '@LearnAlgo',
    images: ['https://www.learn-algo.com/og/og-ml.png'],
  },
}

export default function MLLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
