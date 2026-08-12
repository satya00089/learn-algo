import { useState, useCallback, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

/**
 * Hook for managing Chance Events playground state (Basic Probability)
 */
export function useChanceEventsPlayground() {
  const [trueProbability, setTrueProbability] = useState(0.5) // Fair coin by default
  const [isAnimating, setIsAnimating] = useState(false)
  const [flipSpeed, setFlipSpeed] = useState(50) // ms between flips
  const [showTrueProbability, setShowTrueProbability] = useState(true)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'p',
          value: trueProbability,
          defaultValue: 0.5,
          setValue: setTrueProbability,
          codec: createNumberCodec({ min: 0, max: 1, step: 0.05 }),
        },
        {
          key: 'speed',
          value: flipSpeed,
          defaultValue: 50,
          setValue: setFlipSpeed,
          codec: createNumberCodec({ min: 10, max: 500, step: 10 }),
        },
        {
          key: 'show',
          value: showTrueProbability,
          defaultValue: true,
          setValue: setShowTrueProbability,
          codec: createBooleanCodec(),
        },
      ],
      [flipSpeed, showTrueProbability, trueProbability]
    )
  )

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
