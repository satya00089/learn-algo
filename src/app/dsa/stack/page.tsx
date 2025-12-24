import { StackPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stack',
  description:
    'Interactive Stack data structure visualization. Learn LIFO (Last In First Out) operations: push, pop, peek, and understand stack applications.',
  openGraph: {
    title: 'Stack - Interactive Visualization | LEARN ALGO',
    description:
      'Master LIFO data structure with visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-stack.png',
        width: 1200,
        height: 630,
        alt: 'Stack Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stack - Interactive Visualization',
    description: 'Master LIFO data structure with visualizations',
    images: ['/og/og-dsa-stack.png'],
  },
}

export default function StackPage() {
  return <StackPlayground />
}
