import { RecursionPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'recursion',
  'Recursion Algorithm Visualization'
)

export default function RecursionPage() {
  return (
    <>
      <AlgorithmStructuredData route="recursion" />
      <RecursionPlayground />
    </>
  )
}
