import { DecisionTreePlayground } from '@/modules/ml/playground/DecisionTreePlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('decision-tree')

export default function DecisionTreePage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="decision-tree" />
      <DecisionTreePlayground />
    </>
  )
}
