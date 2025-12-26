import { useState, useCallback } from 'react'

export function useBinarySearchPlayground() {
  const [arraySize, setArraySize] = useState(15)
  const [target, setTarget] = useState(50)
  const [animationSpeed, setAnimationSpeed] = useState(800)
  const [isDebugMode, setIsDebugMode] = useState(false)

  const generateSortedArray = useCallback((size: number): number[] => {
    const arr: number[] = []
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * 100) + 1)
    }
    return arr.sort((a, b) => a - b)
  }, [])

  return {
    arraySize,
    setArraySize,
    target,
    setTarget,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    generateSortedArray,
  }
}
