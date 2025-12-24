import { HeapSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Heap Sort',
  description:
    'Interactive heap sort algorithm visualization. Learn how heap sort uses binary heap data structure to efficiently sort arrays.',
}

export default function HeapSortPage() {
  return <HeapSortPlayground />
}
