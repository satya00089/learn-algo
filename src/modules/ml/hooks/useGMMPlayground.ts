import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

export function useGMMPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [showEllipses, setShowEllipses] = useState(true)
  const [showTrajectories, setShowTrajectories] = useState(false)
  const [isDebugMode, setIsDebugMode] = useState(false)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'speed',
          value: animationSpeed,
          defaultValue: 500,
          setValue: setAnimationSpeed,
          codec: createNumberCodec({ min: 50, max: 2000, step: 50 }),
        },
        {
          key: 'ellipses',
          value: showEllipses,
          defaultValue: true,
          setValue: setShowEllipses,
          codec: createBooleanCodec(),
        },
        {
          key: 'trajectories',
          value: showTrajectories,
          defaultValue: false,
          setValue: setShowTrajectories,
          codec: createBooleanCodec(),
        },
        {
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
      ],
      [animationSpeed, isDebugMode, showEllipses, showTrajectories]
    )
  )

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
