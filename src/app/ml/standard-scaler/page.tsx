import { Suspense } from 'react'
import { StandardScalerPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('standard-scaler')

export default function StandardScalerPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="standard-scaler" />
      <Suspense fallback={null}>
        <StandardScalerPlayground />
      </Suspense>
    </>
  )
}
