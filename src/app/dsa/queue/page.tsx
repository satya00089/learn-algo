import { QueuePlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Queue',
  description:
    'Interactive Queue data structure visualization. Learn FIFO (First In First Out) operations: enqueue, dequeue, and understand queue applications.',
  openGraph: {
    title: 'Queue - Interactive Visualization | LEARN ALGO',
    description:
      'Learn FIFO data structure through practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-queue.png',
        width: 1200,
        height: 630,
        alt: 'Queue Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Queue - Interactive Visualization',
    description: 'Learn FIFO data structure through practice',
    images: ['/og/og-dsa-queue.png'],
  },
}

export default function QueuePage() {
  return <QueuePlayground />
}
