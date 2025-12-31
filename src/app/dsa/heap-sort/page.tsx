import { HeapSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'heap-sort',
  'Heap Sort Algorithm Visualization'
)

export default function HeapSortPage() {
  return (
    <>
      <AlgorithmStructuredData type="dsa" route="heap-sort" />
      <HeapSortPlayground />
    </>
  )
}
