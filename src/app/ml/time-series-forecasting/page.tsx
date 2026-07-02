import { AlgorithmStructuredData } from '@/components/AlgorithmStructuredData'
import { TimeSeriesForecastingPlayground } from '@/modules/ml/playground'
import { generateMLMetadata } from '../metadata-config'

export const metadata = generateMLMetadata('time-series-forecasting')

export default function TimeSeriesForecastingPage() {
  return (
    <>
      <AlgorithmStructuredData type="ml" route="time-series-forecasting" />
      <TimeSeriesForecastingPlayground />
    </>
  )
}
