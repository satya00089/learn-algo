import type { GradientDescentConfig, GradientDescentState } from '../types'

/**
 * Gradient Descent Engine with step-by-step visualization
 * Demonstrates optimization of mathematical functions
 */
export class GradientDescentEngine {
  private config: GradientDescentConfig
  private state: GradientDescentState

  constructor(config: GradientDescentConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): GradientDescentState {
    return {
      currentX: this.config.initialX,
      iteration: 0,
      isConverged: false,
      history: [
        {
          iteration: 0,
          x: this.config.initialX,
          y: this.config.function.f(this.config.initialX),
          gradient: this.config.function.df(this.config.initialX),
          stepSize: 0,
        },
      ],
    }
  }

  /**
   * Perform one step of gradient descent
   */
  step(): void {
    if (this.state.isConverged || this.state.iteration >= this.config.maxIterations) {
      this.state.isConverged = true
      return
    }

    const currentGradient = this.config.function.df(this.state.currentX)
    const stepSize = this.config.learningRate * currentGradient
    const newX = this.state.currentX - stepSize

    // Check bounds
    const clampedX = Math.max(
      this.config.function.domain[0],
      Math.min(this.config.function.domain[1], newX)
    )

    this.state.currentX = clampedX
    this.state.iteration++

    // Record history
    this.state.history.push({
      iteration: this.state.iteration,
      x: clampedX,
      y: this.config.function.f(clampedX),
      gradient: this.config.function.df(clampedX),
      stepSize: Math.abs(stepSize),
    })

    // Check convergence
    if (Math.abs(currentGradient) < this.config.convergenceThreshold) {
      this.state.isConverged = true
    }
  }

  /**
   * Run to completion
   */
  run(): void {
    while (!this.state.isConverged && this.state.iteration < this.config.maxIterations) {
      this.step()
    }
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Get current state
   */
  getState(): GradientDescentState {
    return {
      currentX: this.state.currentX,
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      history: [...this.state.history],
    }
  }

  /**
   * Get function value at a point
   */
  getFunctionValue(x: number): number {
    return this.config.function.f(x)
  }

  /**
   * Get derivative value at a point
   */
  getDerivativeValue(x: number): number {
    return this.config.function.df(x)
  }
}
