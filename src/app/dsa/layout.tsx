import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Data Structures & Algorithms',
    template: '%s | DSA | Learn Algo',
  },
  description:
    'Master data structures and algorithms through interactive visualizations. Explore sorting, searching, trees, graphs, stacks, queues, and more with animated step-by-step explanations.',
  openGraph: {
    title: 'Data Structures & Algorithms - Interactive Visualizations | LEARN ALGO',
    description:
      'Master DSA through practice. Sorting, searching, trees, graphs & more with step-by-step visualizations.',
    images: [
      {
        url: '/og/og-dsa.png',
        width: 1200,
        height: 630,
        alt: 'Data Structures & Algorithms Visualizations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Structures & Algorithms | LEARN ALGO',
    description: 'Master DSA through practice with interactive visualizations',
    images: ['/og/og-dsa.png'],
  },
}

export default function DSALayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
