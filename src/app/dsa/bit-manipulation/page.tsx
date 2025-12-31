import { BitManipulationPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata(
  'bit-manipulation',
  'Bit Manipulation Algorithm Visualization'
)

export default function BitManipulationPage() {
  return (
    <>
      <AlgorithmStructuredData route="bit-manipulation" />
      <BitManipulationPlayground />
    </>
  )
}
