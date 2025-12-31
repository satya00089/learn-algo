import { LogisticRegressionPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('logistic-regression')

export default function LogisticRegressionPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="logistic-regression" />
      <LogisticRegressionPlayground />
    </>
  )
}
