import { BinarySearchTreePlayground } from '@/modules/dsa/playground/BinarySearchTreePlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Binary Search Tree',
  description:
    'Interactive Binary Search Tree (BST) visualization. Learn insertion, deletion, searching, and tree traversal operations with animated demonstrations.',
}

export default function BinarySearchTreePage() {
  return <BinarySearchTreePlayground />
}
