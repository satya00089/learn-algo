import { StringOperationsPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'strings',
  'String Operations Algorithm Visualization'
)

export default function StringsPage() {
  return (
    <>
      <AlgorithmStructuredData route="strings" />
      <StringOperationsPlayground />
    </>
  )
}
