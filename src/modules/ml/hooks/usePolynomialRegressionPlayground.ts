import { useState } from 'react'

export interface PolynomialRegressionPlaygroundState {
  animationSpeed: number
  isDebugMode: boolean
  selectedDataset: string
  degree: number
  learningRate: number
  maxIterations: number
  showResiduals: boolean
}

export function usePolynomialRegressionPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState('simple')
  const [degree, setDegree] = useState(2)
  const [learningRate, setLearningRate] = useState(0.01)
  const [maxIterations, setMaxIterations] = useState(1000)
  const [showResiduals, setShowResiduals] = useState(false)

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    selectedDataset,
    setSelectedDataset,
    degree,
    setDegree,
    learningRate,
    setLearningRate,
    maxIterations,
    setMaxIterations,
    showResiduals,
    setShowResiduals,
  }
}