import { PolynomialRegressionPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('polynomial-regression')

export default function PolynomialRegressionPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="polynomial-regression" />
      <PolynomialRegressionPlayground />
    </>
  )
}
