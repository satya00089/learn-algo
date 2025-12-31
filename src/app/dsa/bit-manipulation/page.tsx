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
      <AlgorithmStructuredData type="dsa" route="bit-manipulation" />
      <BitManipulationPlayground />
    </>
  )
}
