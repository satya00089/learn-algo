import { NeuralNetworkPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('neural-network-playground')

export default function NeuralNetworkPlaygroundPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="neural-network-playground" />
      <NeuralNetworkPlayground />
    </>
  )
}
