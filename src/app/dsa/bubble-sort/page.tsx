import { BubbleSortPlayground } from '@/modules/dsa/playground/BubbleSortPlayground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bubble Sort',
  description:
    'Interactive bubble sort algorithm visualization. Watch how bubble sort repeatedly swaps adjacent elements to sort arrays step by step.',
}

export default function BubbleSortPage() {
  return <BubbleSortPlayground />
}
