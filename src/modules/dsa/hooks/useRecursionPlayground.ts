import { useState } from 'react'

export function useRecursionPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(800)
  const [isDebugMode, setIsDebugMode] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
  }
}
