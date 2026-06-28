'use client'

import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

export const useMinimaxPlayground = () => {
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
      ],
      [isDebugMode]
    )
  )

  return {
    isDebugMode,
    setIsDebugMode,
  }
}
