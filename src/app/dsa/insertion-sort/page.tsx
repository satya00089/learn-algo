import { InsertionSortPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'insertion-sort',
  'Insertion Sort Algorithm Visualization'
)

export default function InsertionSortPage() {
  return (
    <>
      <AlgorithmStructuredData type="dsa" route="insertion-sort" />
      <InsertionSortPlayground />
    </>
  )
}
