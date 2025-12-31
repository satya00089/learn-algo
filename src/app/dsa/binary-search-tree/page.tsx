import { BinarySearchTreePlayground } from '@/modules/dsa/playground/BinarySearchTreePlayground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'binary-search-tree',
  'Binary Search Tree Algorithm Visualization'
)

export default function BinarySearchTreePage() {
  return (
    <>
      <AlgorithmStructuredData type="dsa" route="binary-search-tree" />
      <BinarySearchTreePlayground />
    </>
  )
}
