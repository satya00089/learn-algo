import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Data Structures & Algorithms',
    template: '%s | DSA | Learn Algo',
  },
  description:
    'Master data structures and algorithms through interactive visualizations. Explore sorting, searching, trees, graphs, stacks, queues, and more with animated step-by-step explanations.',
  keywords: [
    'data structures',
    'algorithms',
    'DSA',
    'sorting algorithms',
    'search algorithms',
    'tree data structures',
    'graph algorithms',
    'algorithm visualization',
    'interactive learning',
    'coding interview preparation',
  ],
  authors: [{ name: 'LEARN ALGO' }],
  creator: 'LEARN ALGO',
  alternates: {
    canonical: 'https://www.learn-algo.com/dsa',
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
    title: 'Data Structures & Algorithms - Interactive Visualizations | LEARN ALGO',
    description:
      'Master DSA through practice. Sorting, searching, trees, graphs & more with step-by-step visualizations.',
    type: 'website',
    url: 'https://www.learn-algo.com/dsa',
    siteName: 'LEARN ALGO',
    locale: 'en_US',
    images: [
      {
        url: 'https://www.learn-algo.com/og/og-dsa.png',
        width: 1200,
        height: 630,
        alt: 'Data Structures & Algorithms Visualizations',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Structures & Algorithms | LEARN ALGO',
    description: 'Master DSA through practice with interactive visualizations',
    site: '@LearnAlgo',
    creator: '@LearnAlgo',
    images: ['https://www.learn-algo.com/og/og-dsa.png'],
  },
}

export default function DSALayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
