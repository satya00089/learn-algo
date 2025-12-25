import { HeapSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Heap Sort',
  description:
    'Interactive heap sort algorithm visualization. Learn how heap sort uses binary heap data structure to efficiently sort arrays.',
  openGraph: {
    title: 'Heap Sort - Interactive Visualization | LEARN ALGO',
    description:
      'Master heap sort algorithm with visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-heap-sort.png',
        width: 1200,
        height: 630,
        alt: 'Heap Sort Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heap Sort - Interactive Visualization',
    description: 'Master heap sort algorithm with visualizations',
    images: ['/og/og-dsa-heap-sort.png'],
  },
}

export default function HeapSortPage() {
  return <HeapSortPlayground />
}
