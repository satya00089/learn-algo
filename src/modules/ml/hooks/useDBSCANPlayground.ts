import { useState } from 'react'

export function useDBSCANPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [showNeighborhoods, setShowNeighborhoods] = useState(true)
  const [showConnections, setShowConnections] = useState(false)
  const [isDebugMode, setIsDebugMode] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    showNeighborhoods,
    setShowNeighborhoods,
    showConnections,
    setShowConnections,
    isDebugMode,
    setIsDebugMode,
  }
}
