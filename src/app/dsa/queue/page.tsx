import { QueuePlayground } from '@/modules/dsa/playground'
import type { Metadata } from 'next'
import { generateDSAMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateDSAMetadata('queue', 'Queue Algorithm Visualization')

export default function QueuePage() {
  return (
    <>
      <AlgorithmStructuredData route="queue" />
      <QueuePlayground />
    </>
  )
}
