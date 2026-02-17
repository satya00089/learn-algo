import { Metadata } from 'next'
import { MinimaxPlayground } from '@/modules/ai'
import { generateAIMetadata } from '../metadata-config'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'

export const metadata: Metadata = generateAIMetadata('minimax')

export default function MinimaxPage() {
  return (
    <>
      <AlgorithmStructuredData type="ai" route="minimax" />
      <MinimaxPlayground />
    </>
  )
}
