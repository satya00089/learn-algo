import { Suspense } from 'react'
import { GMMPlayground } from '@/modules/ml/playground/GMMPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('gmm')

export default function GMMPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="gmm" />
      <Suspense fallback={null}>
        <GMMPlayground />
      </Suspense>
    </>
  )
}
