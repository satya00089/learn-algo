import { useState, useCallback } from 'react'

/**
 * Hook for Stack Playground
 * Manages state for stack visualization
 */
export function useStackPlayground() {
  const [maxSize, setMaxSize] = useState(10)
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

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
