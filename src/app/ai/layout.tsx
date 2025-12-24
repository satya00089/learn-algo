import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'AI Algorithms',
    template: '%s | AI | Learn Algo',
  },
  description:
    'Explore artificial intelligence algorithms and techniques. Learn neural networks, deep learning, and advanced AI concepts through interactive visualizations.',
  openGraph: {
    title: 'AI Algorithms - Interactive Visualizations | LEARN ALGO',
    description:
      'Explore artificial intelligence with interactive visualizations. Neural networks, deep learning & AI concepts.',
    images: [
      {
        url: '/og/og-ai.png',
        width: 1200,
        height: 630,
        alt: 'AI Algorithm Visualizations',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Algorithms | LEARN ALGO',
    description: 'Interactive AI visualizations: neural networks, deep learning',
    images: ['/og/og-ai.png'],
  },
}

export default function AILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
