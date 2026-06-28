import { Suspense } from 'react'
import { KNNPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('knn')

export default function KNNPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="knn" />
      <Suspense fallback={null}>
        <KNNPlayground />
      </Suspense>
    </>
  )
}
