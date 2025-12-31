import { StackPlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata('stack', 'Stack Algorithm Visualization')

export default function StackPage() {
  return (
    <>
      <AlgorithmStructuredData type="dsa" route="stack" />
      <StackPlayground />
    </>
  )
}
