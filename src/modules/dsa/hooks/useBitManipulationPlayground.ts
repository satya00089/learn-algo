import { useState } from 'react'

export function useBitManipulationPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
  }
}
