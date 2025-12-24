import { SelectionSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Selection Sort',
  description:
    'Interactive selection sort algorithm visualization. Watch how selection sort finds the minimum element and places it in sorted position repeatedly.',
}

export default function SelectionSortPage() {
  return <SelectionSortPlayground />
}
