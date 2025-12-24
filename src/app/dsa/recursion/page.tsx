import { RecursionPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recursion',
  description:
    'Interactive recursion visualization. Understand recursive function calls, base cases, call stacks, and solve problems using recursive approaches.',
  openGraph: {
    title: 'Recursion - Interactive Visualization | LEARN ALGO',
    description:
      'Learn recursive thinking through practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-recursion.png',
        width: 1200,
        height: 630,
        alt: 'Recursion Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recursion - Interactive Visualization',
    description: 'Learn recursive thinking through practice',
    images: ['/og/og-dsa-recursion.png'],
  },
}

export default function RecursionPage() {
  return <RecursionPlayground />
}
