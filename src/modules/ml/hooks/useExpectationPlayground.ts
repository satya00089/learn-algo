import { useState, useCallback, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
  type QueryCodec,
} from '@/core/share/query-state'
import type { DiceDistribution } from '../engines/ExpectationEngine'

/**
 * Hook for managing Expectation playground state
 */
export function useExpectationPlayground() {
  const defaultDistribution = useMemo<DiceDistribution>(
    () => ({
      face1: 1,
      face2: 1,
      face3: 1,
      face4: 1,
      face5: 1,
      face6: 1,
    }),
    []
  )

  const [distribution, setDistribution] = useState<DiceDistribution>(defaultDistribution)
  const [rollSpeed, setRollSpeed] = useState(50) // ms between rolls
  const [showTheoretical, setShowTheoretical] = useState(true)

  const distributionCodec = useMemo<QueryCodec<DiceDistribution>>(
    () => ({
      parse(rawValue) {
        if (!rawValue) return undefined
        const values = rawValue
          .split(',')
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
        if (values.length !== 6) return undefined
        return {
          face1: values[0],
          face2: values[1],
          face3: values[2],
          face4: values[3],
          face5: values[4],
          face6: values[5],
        }
      },
      serialize(value) {
        return [value.face1, value.face2, value.face3, value.face4, value.face5, value.face6].join(
          ','
        )
      },
    }),
    []
  )

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'dist',
          value: distribution,
          defaultValue: defaultDistribution,
          setValue: setDistribution,
          codec: distributionCodec,
        },
        {
          key: 'speed',
          value: rollSpeed,
          defaultValue: 50,
          setValue: setRollSpeed,
          codec: createNumberCodec({ min: 10, max: 500, step: 10 }),
        },
        {
          key: 'show',
          value: showTheoretical,
          defaultValue: true,
          setValue: setShowTheoretical,
          codec: createBooleanCodec(),
        },
      ],
      [defaultDistribution, distribution, distributionCodec, rollSpeed, showTheoretical]
    )
  )

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
    setDistribution(defaultDistribution)
  }, [defaultDistribution])

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
