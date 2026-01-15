import { useState, useCallback } from 'react'

/**
 * Hook for managing Chance Events playground state (Basic Probability)
 */
export function useChanceEventsPlayground() {
  const [trueProbability, setTrueProbability] = useState(0.5) // Fair coin by default
  const [isAnimating, setIsAnimating] = useState(false)
  const [flipSpeed, setFlipSpeed] = useState(50) // ms between flips
  const [showTrueProbability, setShowTrueProbability] = useState(true)

  const updateTrueProbability = useCallback((value: number) => {
    setTrueProbability(Math.max(0, Math.min(1, value)))
  }, [])

  const toggleAnimation = useCallback(() => {
    setIsAnimating((prev) => !prev)
  }, [])

  const updateFlipSpeed = useCallback((speed: number) => {
    setFlipSpeed(Math.max(10, Math.min(500, speed)))
  }, [])

  const toggleShowTrueProbability = useCallback(() => {
    setShowTrueProbability((prev) => !prev)
  }, [])

  return {
    trueProbability,
    setTrueProbability: updateTrueProbability,
    isAnimating,
    setIsAnimating,
    toggleAnimation,
    flipSpeed,
    setFlipSpeed: updateFlipSpeed,
    showTrueProbability,
    toggleShowTrueProbability,
  }
}
