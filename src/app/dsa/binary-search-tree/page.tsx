import { BinarySearchTreePlayground } from '@/modules/dsa/playground/BinarySearchTreePlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Binary Search Tree',
  description:
    'Interactive Binary Search Tree (BST) visualization. Learn insertion, deletion, searching, and tree traversal operations with animated demonstrations.',
  openGraph: {
    title: 'Binary Search Tree - Interactive Visualization | LEARN ALGO',
    description:
      'Learn BST operations with interactive practice. See how this algorithm works step by step with interactive visualizations.',
    images: [
      {
        url: '/og/og-dsa-binary-search-tree.png',
        width: 1200,
        height: 630,
        alt: 'Binary Search Tree Algorithm Visualization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Binary Search Tree - Interactive Visualization',
    description: 'Learn BST operations with interactive practice',
    images: ['/og/og-dsa-binary-search-tree.png'],
  },
}

export default function BinarySearchTreePage() {
  return <BinarySearchTreePlayground />
}
