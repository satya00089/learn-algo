import { useState, useCallback } from 'react'

/**
 * Binary Search Tree Playground State Hook
 * Manages UI state separate from algorithm logic
 */
export function useBinarySearchTreePlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const generateRandomValue = useCallback((): number => {
    return Math.floor(Math.random() * 100) + 1
  }, [])

  const generateRandomTree = useCallback((): number[] => {
    const size = Math.floor(Math.random() * 5) + 5 // 5-10 nodes
    const values = new Set<number>()
    while (values.size < size) {
      values.add(Math.floor(Math.random() * 100) + 1)
    }
    // Shuffle the array to create more balanced trees
    const valuesArray = Array.from(values)
    for (let i = valuesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[valuesArray[i], valuesArray[j]] = [valuesArray[j], valuesArray[i]]
    }
    return valuesArray
  }, [])

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    inputValue,
    setInputValue,
    generateRandomValue,
    generateRandomTree,
  }
}
