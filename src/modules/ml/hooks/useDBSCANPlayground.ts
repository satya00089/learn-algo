import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

export function useDBSCANPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [showNeighborhoods, setShowNeighborhoods] = useState(true)
  const [showConnections, setShowConnections] = useState(false)
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
          key: 'neighborhoods',
          value: showNeighborhoods,
          defaultValue: true,
          setValue: setShowNeighborhoods,
          codec: createBooleanCodec(),
        },
        {
          key: 'connections',
          value: showConnections,
          defaultValue: false,
          setValue: setShowConnections,
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
      [animationSpeed, isDebugMode, showConnections, showNeighborhoods]
    )
  )

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
