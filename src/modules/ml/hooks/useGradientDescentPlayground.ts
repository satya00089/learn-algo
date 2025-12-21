import { useState } from 'react'

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
