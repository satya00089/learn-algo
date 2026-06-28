import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  createStringCodec,
  useShareableQueryState,
} from '@/core/share/query-state'

export interface GradientDescentPlaygroundState {
  animationSpeed: number
  isDebugMode: boolean
  selectedFunction: string
  learningRate: number
  maxIterations: number
  initialX: number
}

export function useGradientDescentPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState('quadratic')
  const [learningRate, setLearningRate] = useState(0.1)
  const [maxIterations, setMaxIterations] = useState(100)
  const [initialX, setInitialX] = useState(4)

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
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
        {
          key: 'fn',
          value: selectedFunction,
          defaultValue: 'quadratic',
          setValue: setSelectedFunction,
          codec: createStringCodec({
            allowedValues: ['quadratic', 'cubic', 'sine', 'abs'],
          }),
        },
        {
          key: 'lr',
          value: learningRate,
          defaultValue: 0.1,
          setValue: setLearningRate,
          codec: createNumberCodec({ min: 0.001, max: 1, step: 0.001 }),
        },
        {
          key: 'iters',
          value: maxIterations,
          defaultValue: 100,
          setValue: setMaxIterations,
          codec: createNumberCodec({ min: 10, max: 1000, step: 10 }),
        },
        {
          key: 'x',
          value: initialX,
          defaultValue: 4,
          setValue: setInitialX,
          codec: createNumberCodec({ min: -10, max: 10, step: 1 }),
        },
      ],
      [animationSpeed, initialX, isDebugMode, learningRate, maxIterations, selectedFunction]
    )
  )

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    selectedFunction,
    setSelectedFunction,
    learningRate,
    setLearningRate,
    maxIterations,
    setMaxIterations,
    initialX,
    setInitialX,
  }
}
