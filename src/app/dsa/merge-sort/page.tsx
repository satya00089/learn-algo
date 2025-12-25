import { MergeSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merge Sort',
  description:
    'Interactive merge sort algorithm visualization. Watch how merge sort divides arrays and merges them back in sorted order using divide-and-conquer.',
  openGraph: {
    title: 'Merge Sort - Interactive Visualization | LEARN ALGO',
    description:
      'Master divide and conquer with merge sort. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-merge-sort.png',
        width: 1200,
        height: 630,
        alt: 'Merge Sort Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merge Sort - Interactive Visualization',
    description: 'Master divide and conquer with merge sort',
    images: ['/og/og-dsa-merge-sort.png'],
  },
}

export default function MergeSortPage() {
  return <MergeSortPlayground />
}
