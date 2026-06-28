import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  createStringCodec,
  useShareableQueryState,
} from '@/core/share/query-state'
import { generateRandomSeed } from '@/core/utils'

export interface KNNPlaygroundState {
  k: number
  selectedDataset: string
  showDecisionBoundary: boolean
  testPoint: { x: number; y: number } | null
}

export function useKNNPlayground() {
  const [k, setK] = useState(3)
  const [selectedDataset, setSelectedDataset] = useState('blobs')
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true)
  const [testPoint, setTestPoint] = useState<{ x: number; y: number } | null>(null)
  const [seed, setSeed] = useState(() => generateRandomSeed())

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'k',
          value: k,
          defaultValue: 3,
          setValue: setK,
          codec: createNumberCodec({ min: 1, max: 15, step: 1 }),
        },
        {
          key: 'dataset',
          value: selectedDataset,
          defaultValue: 'blobs',
          setValue: setSelectedDataset,
          codec: createStringCodec({
            allowedValues: ['blobs', 'overlapping', 'linear', 'complex'],
          }),
        },
        {
          key: 'boundary',
          value: showDecisionBoundary,
          defaultValue: true,
          setValue: setShowDecisionBoundary,
          codec: createBooleanCodec(),
        },
        {
          key: 'seed',
          value: seed,
          defaultValue: seed,
          setValue: setSeed,
          codec: createNumberCodec({ min: 1, max: 2147483647, step: 1 }),
          includeDefaultInUrl: true,
        },
      ],
      [k, seed, selectedDataset, showDecisionBoundary]
    )
  )

  return {
    k,
    setK,
    selectedDataset,
    setSelectedDataset,
    showDecisionBoundary,
    setShowDecisionBoundary,
    seed,
    setSeed,
    testPoint,
    setTestPoint,
  }
}
