import { MergeSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'merge-sort',
  'Merge Sort Algorithm Visualization'
)

export default function MergeSortPage() {
  return (
    <>
      <AlgorithmStructuredData route="merge-sort" />
      <MergeSortPlayground />
    </>
  )
}
