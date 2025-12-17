import { useState, useCallback } from 'react'

/**
 * Quick Sort Playground State Hook
 * Manages UI state separate from algorithm logic
 */
export function useQuickSortPlayground() {
  const [arraySize, setArraySize] = useState(10)
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

  const generateRandomArray = useCallback((size: number): number[] => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1)
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
