import { TSNEPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('tsne')

export default function TSNEPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="tsne" />
      <TSNEPlayground />
    </>
  )
}
