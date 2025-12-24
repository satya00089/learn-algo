import { ArrayOperationsPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Array Operations',
  description:
    'Interactive array operations visualization. Learn fundamental array manipulations: insertion, deletion, searching, and traversal with step-by-step animations.',
}

export default function ArrayOperationsPage() {
  return <ArrayOperationsPlayground />
}
