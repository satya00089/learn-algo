import { InsertionSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insertion Sort',
  description:
    'Interactive insertion sort algorithm visualization. See how insertion sort builds a sorted array one element at a time by inserting elements in order.',
}

export default function InsertionSortPage() {
  return <InsertionSortPlayground />
}
