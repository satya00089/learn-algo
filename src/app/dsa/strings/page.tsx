import { StringOperationsPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'String Operations',
  description:
    'Interactive string operations visualization. Master string manipulation algorithms, pattern matching, and text processing techniques.',
  openGraph: {
    title: 'String Operations - Interactive Visualization | LEARN ALGO',
    description:
      'Learn string processing with interactive examples. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-strings.png',
        width: 1200,
        height: 630,
        alt: 'String Operations Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'String Operations - Interactive Visualization',
    description: 'Learn string processing with interactive examples',
    images: ['/og/og-dsa-strings.png'],
  },
}

export default function StringsPage() {
  return <StringOperationsPlayground />
}
