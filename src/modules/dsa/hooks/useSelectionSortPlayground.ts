import { useState, useCallback } from 'react'

/**
 * Selection Sort Playground State Hook
 */
export function useSelectionSortPlayground() {
  const [arraySize, setArraySize] = useState(12)
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
