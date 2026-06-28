import { useState, useCallback, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

/**
 * Hook for Stack Playground
 * Manages state for stack visualization
 */
export function useStackPlayground() {
  const [maxSize, setMaxSize] = useState(10)
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'max',
          value: maxSize,
          defaultValue: 10,
          setValue: setMaxSize,
          codec: createNumberCodec({ min: 5, max: 15, step: 1 }),
        },
        {
          key: 'speed',
          value: animationSpeed,
          defaultValue: 500,
          setValue: setAnimationSpeed,
          codec: createNumberCodec({ min: 100, max: 2000, step: 100 }),
        },
        {
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
      ],
      [animationSpeed, isDebugMode, maxSize]
    )
  )

  // Generate initial stack
  const generateInitialStack = useCallback((size: number) => {
    const count = Math.min(3, size) // Start with 3 elements
    const maxValue = 99
    const minValue = 1
    return Array.from(
      { length: count },
      () => Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    )
  }, [])

  return {
    maxSize,
    setMaxSize,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    generateInitialStack,
  }
}
