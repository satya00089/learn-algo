import { LinearRegressionPlayground } from '@/modules/ml/playground/LinearRegressionPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('linear-regression')

export default function LinearRegressionPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="linear-regression" />
      <LinearRegressionPlayground />
    </>
  )
}
