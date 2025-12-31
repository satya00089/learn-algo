import { ArrayOperationsPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'array-operations',
  'Array Operations Algorithm Visualization'
)

export default function ArrayOperationsPage() {
  return (
    <>
      <AlgorithmStructuredData route="array-operations" />
      <ArrayOperationsPlayground />
    </>
  )
}
