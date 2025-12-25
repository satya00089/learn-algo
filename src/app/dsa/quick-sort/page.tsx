import { QuickSortPlayground } from '@/modules/dsa/playground/QuickSortPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quick Sort',
  description:
    'Interactive quick sort algorithm visualization. Understand partitioning, pivot selection, and divide-and-conquer approach to sorting.',
  openGraph: {
    title: 'Quick Sort - Interactive Visualization | LEARN ALGO',
    description:
      'Learn quick sort with interactive visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-quick-sort.png',
        width: 1200,
        height: 630,
        alt: 'Quick Sort Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Sort - Interactive Visualization',
    description: 'Learn quick sort with interactive visualizations',
    images: ['/og/og-dsa-quick-sort.png'],
  },
}

export default function QuickSortPage() {
  return <QuickSortPlayground />
}
