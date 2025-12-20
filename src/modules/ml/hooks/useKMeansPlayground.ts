import { useState } from 'react'

export function useKMeansPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(50)
  const [isDebugMode, setIsDebugMode] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
  }
}
