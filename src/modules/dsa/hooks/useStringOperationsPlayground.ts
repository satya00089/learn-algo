import { useState } from 'react'

export function useStringOperationsPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
  }
}
