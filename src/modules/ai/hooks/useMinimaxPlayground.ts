'use client'

import { useState } from 'react'

export const useMinimaxPlayground = () => {
  const [animationSpeed, setAnimationSpeed] = useState<number>(1000)
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false)
  const [showTree, setShowTree] = useState<boolean>(true)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    showTree,
    setShowTree,
  }
}
