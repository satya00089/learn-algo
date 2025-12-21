import type { DataPoint } from '../types'
import { standardScale, type StandardScalerResult } from '../algorithms/standardScaler'

/**
 * Standard Scaler Engine with step-by-step debugging capability
 * Implements DebuggableAlgorithm interface
 */

export interface StandardScalerState {
  originalData: DataPoint[]
  scaledData: DataPoint[]
  currentStep: number
  totalSteps: number
  isComplete: boolean
  xMean: number
  xStd: number
  yMean: number
  yStd: number
  phase: 'calculating-mean' | 'calculating-std' | 'scaling' | 'complete'
}

export class StandardScalerEngine {
  private data: DataPoint[]
  private state: StandardScalerState
  private result: StandardScalerResult | null = null

  constructor(options: { data: DataPoint[] }) {
    this.data = [...options.data]

    this.state = {
      originalData: [...this.data],
      scaledData: [],
      currentStep: 0,
      totalSteps: 4, // 1. Calculate X mean, 2. Calculate Y mean, 3. Calculate std, 4. Scale
      isComplete: false,
      xMean: 0,
      xStd: 1,
      yMean: 0,
      yStd: 1,
      phase: 'calculating-mean',
    }
  }

  init(): void {
    this.state = {
      originalData: [...this.data],
      scaledData: [],
      currentStep: 0,
      totalSteps: 4,
      isComplete: false,
      xMean: 0,
      xStd: 1,
      yMean: 0,
      yStd: 1,
      phase: 'calculating-mean',
    }
    this.result = null
  }

  step(): void {
    if (this.state.isComplete) return

    this.state.currentStep++

    if (this.state.currentStep === 1) {
      // Calculate means
      const xValues = this.data.map((p) => p.x)
      const yValues = this.data.map((p) => p.y)

      this.state.xMean = xValues.reduce((sum, val) => sum + val, 0) / xValues.length
      this.state.yMean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length
    } else if (this.state.currentStep === 2) {
      // Calculate standard deviations
      const xValues = this.data.map((p) => p.x)
      const yValues = this.data.map((p) => p.y)

      const xSquaredDiffs = xValues.map((val) => Math.pow(val - this.state.xMean, 2))
      const ySquaredDiffs = yValues.map((val) => Math.pow(val - this.state.yMean, 2))

      const xVariance = xSquaredDiffs.reduce((sum, val) => sum + val, 0) / xValues.length
      const yVariance = ySquaredDiffs.reduce((sum, val) => sum + val, 0) / yValues.length

      this.state.xStd = Math.sqrt(xVariance)
      this.state.yStd = Math.sqrt(yVariance)
      this.state.phase = 'scaling'
    } else if (this.state.currentStep === 3) {
      // Scale X values
      this.state.scaledData = this.data.map((point) => {
        const scaledX = this.state.xStd === 0 ? 0 : (point.x - this.state.xMean) / this.state.xStd
        return { x: scaledX, y: point.y }
      })
    } else if (this.state.currentStep === 4) {
      // Scale Y values
      this.state.scaledData = this.state.scaledData.map((point, index) => {
        const originalY = this.data[index].y
        const scaledY = this.state.yStd === 0 ? 0 : (originalY - this.state.yMean) / this.state.yStd
        return { x: point.x, y: scaledY }
      })
      this.state.phase = 'complete'
      this.state.isComplete = true
    }
  }

  run(): void {
    this.result = standardScale(this.data)
    this.state = {
      originalData: this.result.originalData,
      scaledData: this.result.scaledData,
      currentStep: this.state.totalSteps,
      totalSteps: this.state.totalSteps,
      isComplete: true,
      xMean: this.result.xMean,
      xStd: this.result.xStd,
      yMean: this.result.yMean,
      yStd: this.result.yStd,
      phase: 'complete',
    }
  }

  reset(): void {
    this.init()
  }

  getState(): StandardScalerState {
    return { ...this.state }
  }

  getResult(): StandardScalerResult | null {
    return this.result
  }
}
