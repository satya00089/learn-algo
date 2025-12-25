import { BitManipulationPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bit Manipulation',
  description:
    'Interactive bit manipulation visualization. Learn bitwise operations (AND, OR, XOR, NOT, shifts) and their applications in algorithms.',
  openGraph: {
    title: 'Bit Manipulation - Interactive Visualization | LEARN ALGO',
    description:
      'Master bitwise operations with visualizations. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-bit-manipulation.png',
        width: 1200,
        height: 630,
        alt: 'Bit Manipulation Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bit Manipulation - Interactive Visualization',
    description: 'Master bitwise operations with visualizations',
    images: ['/og/og-dsa-bit-manipulation.png'],
  },
}

export default function BitManipulationPage() {
  return <BitManipulationPlayground />
}
