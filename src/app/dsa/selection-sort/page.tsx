import { SelectionSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Selection Sort',
  description:
    'Interactive selection sort algorithm visualization. Watch how selection sort finds the minimum element and places it in sorted position repeatedly.',
  openGraph: {
    title: 'Selection Sort - Interactive Visualization | LEARN ALGO',
    description:
      'Master selection sort with interactive visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-selection-sort.png',
        width: 1200,
        height: 630,
        alt: 'Selection Sort Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selection Sort - Interactive Visualization',
    description: 'Master selection sort with interactive visualizations',
    images: ['/og/og-dsa-selection-sort.png'],
  },
}

export default function SelectionSortPage() {
  return <SelectionSortPlayground />
}
