import { BinarySearchPlayground } from '@/modules/dsa/playground/BinarySearchPlayground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'binary-search',
  'Binary Search Algorithm Visualization'
)

export default function BinarySearchPage() {
  return (
    <>
      <AlgorithmStructuredData route="binary-search" />
      <BinarySearchPlayground />
    </>
  )
}
