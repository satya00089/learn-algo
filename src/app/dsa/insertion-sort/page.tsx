import { InsertionSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insertion Sort',
  description:
    'Interactive insertion sort algorithm visualization. See how insertion sort builds a sorted array one element at a time by inserting elements in order.',
  openGraph: {
    title: 'Insertion Sort - Interactive Visualization | LEARN ALGO',
    description:
      'Learn insertion sort through interactive practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-insertion-sort.png',
        width: 1200,
        height: 630,
        alt: 'Insertion Sort Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insertion Sort - Interactive Visualization',
    description: 'Learn insertion sort through interactive practice',
    images: ['/og/og-dsa-insertion-sort.png'],
  },
}

export default function InsertionSortPage() {
  return <InsertionSortPlayground />
}
