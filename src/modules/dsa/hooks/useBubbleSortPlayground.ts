'use client'

import { useState, useCallback } from 'react'

/**
 * Hook for managing bubble sort playground state
 * Handles user interactions and state management
 */
export function useBubbleSortPlayground() {
  const [arraySize, setArraySize] = useState(15)
  const [animationSpeed, setAnimationSpeed] = useState(100)
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
