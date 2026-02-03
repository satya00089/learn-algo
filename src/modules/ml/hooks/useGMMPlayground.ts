import { useState } from 'react'

export function useGMMPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [showEllipses, setShowEllipses] = useState(true)
  const [showTrajectories, setShowTrajectories] = useState(false)
  const [isDebugMode, setIsDebugMode] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    showEllipses,
    setShowEllipses,
    showTrajectories,
    setShowTrajectories,
    isDebugMode,
    setIsDebugMode,
  }
}
