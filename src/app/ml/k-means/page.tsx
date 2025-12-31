import { KMeansClusteringPlayground } from '@/modules/ml/playground'
import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('k-means')

export default function KMeansPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="k-means" />
      <KMeansClusteringPlayground />
    </>
  )
}
