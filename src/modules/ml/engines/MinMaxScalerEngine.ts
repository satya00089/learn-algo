import type { DataPoint } from '../types'
import { minMaxScale, type MinMaxScalerResult } from '../algorithms/minMaxScaler'

/**
 * MinMax Scaler Engine with step-by-step debugging capability
 * Implements DebuggableAlgorithm interface
 */

export interface MinMaxScalerState {
  originalData: DataPoint[]
  scaledData: DataPoint[]
  currentStep: number
  totalSteps: number
  isComplete: boolean
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  featureRange: [number, number]
  phase: 'finding-min-max' | 'scaling' | 'complete'
}

export class MinMaxScalerEngine {
  private data: DataPoint[]
  private featureRange: [number, number]
  private state: MinMaxScalerState
  private result: MinMaxScalerResult | null = null

  constructor(options: { data: DataPoint[]; featureRange?: [number, number] }) {
    this.data = [...options.data]
    this.featureRange = options.featureRange || [0, 1]

    this.state = {
      originalData: [...this.data],
      scaledData: [],
      currentStep: 0,
      totalSteps: 3, // 1. Find min/max, 2. Scale X, 3. Scale Y
      isComplete: false,
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
      featureRange: this.featureRange,
      phase: 'finding-min-max',
    }
  }

  init(): void {
    this.state = {
      originalData: [...this.data],
      scaledData: [],
      currentStep: 0,
      totalSteps: 3,
      isComplete: false,
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
      featureRange: this.featureRange,
      phase: 'finding-min-max',
    }
    this.result = null
  }

  step(): void {
    if (this.state.isComplete) return

    this.state.currentStep++

    if (this.state.currentStep === 1) {
      // Find min/max values
      const xValues = this.data.map((p) => p.x)
      const yValues = this.data.map((p) => p.y)

      this.state.xMin = Math.min(...xValues)
      this.state.xMax = Math.max(...xValues)
      this.state.yMin = Math.min(...yValues)
      this.state.yMax = Math.max(...yValues)
      this.state.phase = 'scaling'
    } else if (this.state.currentStep === 2) {
      // Scale X values
      this.state.scaledData = this.data.map((point) => {
        const scaledX =
          this.state.xMin === this.state.xMax
            ? this.featureRange[0] + (this.featureRange[1] - this.featureRange[0]) / 2
            : this.featureRange[0] +
              ((this.featureRange[1] - this.featureRange[0]) * (point.x - this.state.xMin)) /
                (this.state.xMax - this.state.xMin)

        return { x: scaledX, y: point.y }
      })
    } else if (this.state.currentStep === 3) {
      // Scale Y values
      this.state.scaledData = this.state.scaledData.map((point, index) => {
        const originalY = this.data[index].y
        const scaledY =
          this.state.yMin === this.state.yMax
            ? this.featureRange[0] + (this.featureRange[1] - this.featureRange[0]) / 2
            : this.featureRange[0] +
              ((this.featureRange[1] - this.featureRange[0]) * (originalY - this.state.yMin)) /
                (this.state.yMax - this.state.yMin)

        return { x: point.x, y: scaledY }
      })
      this.state.phase = 'complete'
      this.state.isComplete = true
    }
  }

  run(): void {
    this.result = minMaxScale(this.data, this.featureRange)
    this.state = {
      originalData: this.result.originalData,
      scaledData: this.result.scaledData,
      currentStep: this.state.totalSteps,
      totalSteps: this.state.totalSteps,
      isComplete: true,
      xMin: this.result.xMin,
      xMax: this.result.xMax,
      yMin: this.result.yMin,
      yMax: this.result.yMax,
      featureRange: this.result.featureRange,
      phase: 'complete',
    }
  }

  reset(): void {
    this.init()
  }

  getState(): MinMaxScalerState {
    return { ...this.state }
  }

  getResult(): MinMaxScalerResult | null {
    return this.result
  }
}
