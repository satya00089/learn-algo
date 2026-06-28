import { useState, useMemo } from 'react'
import { createBooleanCodec, createNumberCodec, useShareableQueryState } from '@/core/share/query-state'

/**
 * Hook for managing Standard Scaler playground state
 */
export function useStandardScalerPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

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
      ],
      [animationSpeed, isDebugMode]
    )
  )

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
  }
}
