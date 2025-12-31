import { BubbleSortPlayground } from '@/modules/dsa/playground/BubbleSortPlayground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'bubble-sort',
  'Bubble Sort Algorithm Visualization'
)

export default function BubbleSortPage() {
  return (
    <>
      <AlgorithmStructuredData route="bubble-sort" />
      <BubbleSortPlayground />
    </>
  )
}
