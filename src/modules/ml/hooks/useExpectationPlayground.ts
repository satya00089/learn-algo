import { useState, useCallback } from 'react'
import type { DiceDistribution } from '../engines/ExpectationEngine'

/**
 * Hook for managing Expectation playground state
 */
export function useExpectationPlayground() {
  const [distribution, setDistribution] = useState<DiceDistribution>({
    face1: 1,
    face2: 1,
    face3: 1,
    face4: 1,
    face5: 1,
    face6: 1,
  })
  const [rollSpeed, setRollSpeed] = useState(50) // ms between rolls
  const [showTheoretical, setShowTheoretical] = useState(true)

  const updateDistribution = useCallback((newDistribution: DiceDistribution) => {
    setDistribution({ ...newDistribution })
  }, [])

  const updateRollSpeed = useCallback((speed: number) => {
    setRollSpeed(Math.max(10, Math.min(500, speed)))
  }, [])

  const toggleShowTheoretical = useCallback(() => {
    setShowTheoretical((prev) => !prev)
  }, [])

  const resetToFairDie = useCallback(() => {
    setDistribution({
      face1: 1,
      face2: 1,
      face3: 1,
      face4: 1,
      face5: 1,
      face6: 1,
    })
  }, [])

  return {
    distribution,
    setDistribution: updateDistribution,
    rollSpeed,
    setRollSpeed: updateRollSpeed,
    showTheoretical,
    toggleShowTheoretical,
    resetToFairDie,
  }
}
