import { BubbleSortPlayground } from '@/modules/dsa/playground/BubbleSortPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bubble Sort',
  description:
    'Interactive bubble sort algorithm visualization. Watch how bubble sort repeatedly swaps adjacent elements to sort arrays step by step.',
  openGraph: {
    title: 'Bubble Sort - Interactive Visualization | LEARN ALGO',
    description:
      'Master bubble sort with interactive visualizations. See how this simple comparison-based sorting algorithm works step by step.',
    images: [
      {
        url: '/og/og-dsa-bubble-sort.png',
        width: 1200,
        height: 630,
        alt: 'Bubble Sort Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bubble Sort - Interactive Visualization',
    description: 'Master bubble sort with interactive visualizations',
    images: ['/og/og-dsa-bubble-sort.png'],
  },
}

export default function BubbleSortPage() {
  return <BubbleSortPlayground />
}
