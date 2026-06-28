import { Suspense } from 'react'
import { MinMaxScalerPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('minmax-scaler')

export default function MinMaxScalerPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="minmax-scaler" />
      <Suspense fallback={null}>
        <MinMaxScalerPlayground />
      </Suspense>
    </>
  )
}
