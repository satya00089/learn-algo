import { MergeSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merge Sort',
  description:
    'Interactive merge sort algorithm visualization. Watch how merge sort divides arrays and merges them back in sorted order using divide-and-conquer.',
}

export default function MergeSortPage() {
  return <MergeSortPlayground />
}
