import { QuickSortPlayground } from '@/modules/dsa/playground/QuickSortPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quick Sort',
  description:
    'Interactive quick sort algorithm visualization. Understand partitioning, pivot selection, and divide-and-conquer approach to sorting.',
}

export default function QuickSortPage() {
  return <QuickSortPlayground />
}
