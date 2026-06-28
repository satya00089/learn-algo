import { Suspense } from 'react'
import { DBSCANPlayground } from '@/modules/ml/playground/DBSCANPlayground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('dbscan')

export default function DBSCANPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="dbscan" />
      <Suspense fallback={null}>
        <DBSCANPlayground />
      </Suspense>
    </>
  )
}
