import { SelectionSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'selection-sort',
  'Selection Sort Algorithm Visualization'
)

export default function SelectionSortPage() {
  return (
    <>
      <AlgorithmStructuredData type="dsa" route="selection-sort" />
      <SelectionSortPlayground />
    </>
  )
}
