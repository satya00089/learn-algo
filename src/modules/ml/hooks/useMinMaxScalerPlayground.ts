import { useState } from 'react'

/**
 * Hook for managing MinMax Scaler playground state
 */
export function useMinMaxScalerPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [featureRangeMin, setFeatureRangeMin] = useState(0)
  const [featureRangeMax, setFeatureRangeMax] = useState(1)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    featureRangeMin,
    setFeatureRangeMin,
    featureRangeMax,
    setFeatureRangeMax,
  }
}