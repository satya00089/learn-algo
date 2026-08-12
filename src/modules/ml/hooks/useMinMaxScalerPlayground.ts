import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

/**
 * Hook for managing MinMax Scaler playground state
 */
export function useMinMaxScalerPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [featureRangeMin, setFeatureRangeMin] = useState(0)
  const [featureRangeMax, setFeatureRangeMax] = useState(1)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'speed',
          value: animationSpeed,
          defaultValue: 500,
          setValue: setAnimationSpeed,
          codec: createNumberCodec({ min: 50, max: 2000, step: 50 }),
        },
        {
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
        {
          key: 'min',
          value: featureRangeMin,
          defaultValue: 0,
          setValue: setFeatureRangeMin,
          codec: createNumberCodec({ min: -100, max: 100, step: 1 }),
        },
        {
          key: 'max',
          value: featureRangeMax,
          defaultValue: 1,
          setValue: setFeatureRangeMax,
          codec: createNumberCodec({ min: -100, max: 100, step: 1 }),
        },
      ],
      [animationSpeed, featureRangeMax, featureRangeMin, isDebugMode]
    )
  )

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
