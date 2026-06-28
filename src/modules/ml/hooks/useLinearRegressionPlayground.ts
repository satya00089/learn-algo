'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'
import type { Point2D } from '../types'

/**
 * Hook for managing linear regression playground state
 * Handles user interactions and state management
 */
export function useLinearRegressionPlayground() {
  const [points, setPoints] = useState<Point2D[]>(generateRandomPoints(50))
  const [learningRate, setLearningRate] = useState(0.01)
  const [maxIterations, setMaxIterations] = useState(100)
  const [showErrorLines, setShowErrorLines] = useState(true)
  const [isDebugMode, setIsDebugMode] = useState(false)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'lr',
          value: learningRate,
          defaultValue: 0.01,
          setValue: setLearningRate,
          codec: createNumberCodec({ min: 0.001, max: 0.1, step: 0.001 }),
        },
        {
          key: 'iters',
          value: maxIterations,
          defaultValue: 100,
          setValue: setMaxIterations,
          codec: createNumberCodec({ min: 10, max: 500, step: 10 }),
        },
        {
          key: 'errors',
          value: showErrorLines,
          defaultValue: true,
          setValue: setShowErrorLines,
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
      [isDebugMode, learningRate, maxIterations, showErrorLines]
    )
  )

  const addPoint = useCallback((point: Point2D) => {
    setPoints((prev) => [...prev, point])
  }, [])

  const clearPoints = useCallback(() => {
    setPoints([])
  }, [])

  const generateNewPoints = useCallback((count: number) => {
    setPoints(generateRandomPoints(count))
  }, [])

  return {
    points,
    setPoints,
    addPoint,
    clearPoints,
    generateNewPoints,
    learningRate,
    setLearningRate,
    maxIterations,
    setMaxIterations,
    showErrorLines,
    setShowErrorLines,
    isDebugMode,
    setIsDebugMode,
  }
}

/**
 * Helper function to generate random points with some linear correlation
 */
function generateRandomPoints(count: number): Point2D[] {
  const points: Point2D[] = []
  const trueSlope = 2
  const trueIntercept = 1
  const noise = 5

  for (let i = 0; i < count; i++) {
    const x = Math.random() * 20 - 10 // -10 to 10
    const y = trueSlope * x + trueIntercept + (Math.random() - 0.5) * noise
    points.push({ x, y })
  }

  return points
}
