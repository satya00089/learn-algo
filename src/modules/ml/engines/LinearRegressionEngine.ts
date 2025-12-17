import type { Point2D, LinearRegressionParams, GradientDescentStep } from '../types'
import {
  calculateCost,
  gradientDescentStep,
  calculateSlopeGradient,
  calculateInterceptGradient,
} from '../algorithms/linearRegression'

/**
 * Linear Regression Engine with step-by-step debugging capability
 * Implements DebuggableAlgorithm interface
 */

export interface LinearRegressionState {
  params: LinearRegressionParams
  cost: number
  iteration: number
  isConverged: boolean
  history: GradientDescentStep[]
}

export interface LinearRegressionConfig {
  points: Point2D[]
  learningRate: number
  maxIterations: number
  convergenceThreshold: number
  initialSlope?: number
  initialIntercept?: number
}

export class LinearRegressionEngine {
  private config: LinearRegressionConfig
  private state: LinearRegressionState
  private isRunning: boolean = false

  constructor(config: LinearRegressionConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): LinearRegressionState {
    const params: LinearRegressionParams = {
      slope: this.config.initialSlope ?? 0,
      intercept: this.config.initialIntercept ?? 0,
    }

    const cost = calculateCost(this.config.points, params)

    return {
      params,
      cost,
      iteration: 0,
      isConverged: false,
      history: [],
    }
  }

  /**
   * Initialize/reset the engine
   */
  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  /**
   * Perform one step of gradient descent
   */
  step(): void {
    if (this.state.isConverged || this.state.iteration >= this.config.maxIterations) {
      this.state.isConverged = true
      this.isRunning = false
      return
    }

    const { points, learningRate, convergenceThreshold } = this.config
    const currentParams = this.state.params
    const currentCost = this.state.cost

    // Calculate gradients
    const slopeGradient = calculateSlopeGradient(points, currentParams)
    const interceptGradient = calculateInterceptGradient(points, currentParams)

    // Perform gradient descent step
    const newParams = gradientDescentStep(points, currentParams, learningRate)
    const newCost = calculateCost(points, newParams)

    // Record history
    const historyStep: GradientDescentStep = {
      iteration: this.state.iteration,
      slope: currentParams.slope,
      intercept: currentParams.intercept,
      cost: currentCost,
      gradientSlope: slopeGradient,
      gradientIntercept: interceptGradient,
    }

    this.state.history.push(historyStep)

    // Update state BEFORE checking convergence
    this.state.params = newParams
    this.state.cost = newCost
    this.state.iteration++

    // Check convergence - compare current cost with new cost
    const costDifference = Math.abs(currentCost - newCost)
    if (costDifference < convergenceThreshold) {
      this.state.isConverged = true
      this.isRunning = false
    }
  }

  /**
   * Run algorithm to completion
   */
  run(): void {
    this.isRunning = true
    while (!this.state.isConverged && this.state.iteration < this.config.maxIterations) {
      this.step()
    }
    this.isRunning = false
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.init()
  }

  /**
   * Get current state
   */
  getState(): LinearRegressionState {
    return {
      params: { ...this.state.params },
      cost: this.state.cost,
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      history: [...this.state.history],
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LinearRegressionConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Check if engine is currently running
   */
  getIsRunning(): boolean {
    return this.isRunning
  }
}
