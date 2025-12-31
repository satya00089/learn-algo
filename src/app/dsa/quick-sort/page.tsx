import { QuickSortPlayground } from '@/modules/dsa/playground/QuickSortPlayground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'quick-sort',
  'Quick Sort Algorithm Visualization'
)

export default function QuickSortPage() {
  return (
    <>
      <AlgorithmStructuredData route="quick-sort" />
      <QuickSortPlayground />
    </>
  )
}
