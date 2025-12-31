import { GradientDescentPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('gradient-descent')

export default function GradientDescentPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="gradient-descent" />
      <GradientDescentPlayground />
    </>
  )
}
