import { EnsembleModelsPlayground } from '@/modules/ml/playground/EnsembleModelsPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('ensemble-models')

export default function EnsembleModelsPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="ensemble-models" />
      <EnsembleModelsPlayground />
    </>
  )
}
