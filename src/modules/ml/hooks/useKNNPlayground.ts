import { useState } from 'react'

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

  return {
    k,
    setK,
    selectedDataset,
    setSelectedDataset,
    showDecisionBoundary,
    setShowDecisionBoundary,
    testPoint,
    setTestPoint,
  }
}
