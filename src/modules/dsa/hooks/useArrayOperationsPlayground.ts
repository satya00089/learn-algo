import { useState, useCallback } from 'react'

/**
 * Hook for Array Operations Playground
 * Manages state for array operations visualization
 */
export function useArrayOperationsPlayground() {
  const [arraySize, setArraySize] = useState(8)
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

  // Generate random array
  const generateRandomArray = useCallback((size: number) => {
    const maxValue = 99
    const minValue = 1
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    )
  }, [])

  return {
    arraySize,
    setArraySize,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    generateRandomArray,
  }
}
