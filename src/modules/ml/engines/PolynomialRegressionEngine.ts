import type { PolynomialRegressionConfig, PolynomialRegressionState } from '../types'

/**
 * Polynomial Regression Engine with gradient descent optimization
 */
export class PolynomialRegressionEngine {
  private config: PolynomialRegressionConfig
  private state: PolynomialRegressionState
  private xMin: number = 0
  private xMax: number = 0

  constructor(config: PolynomialRegressionConfig) {
    this.config = config
    this.computeNormalizationStats()
    this.state = this.initializeState()
  }

  /**
   * Compute normalization statistics for feature scaling
   */
  private computeNormalizationStats(): void {
    const xValues = this.config.points.map(p => p.x)
    this.xMin = Math.min(...xValues)
    this.xMax = Math.max(...xValues)
  }

  /**
   * Normalize x value to [-1, 1] range
   */
  private normalizeX(x: number): number {
    return (x - this.xMin) / (this.xMax - this.xMin) * 2 - 1
  }

  private initializeState(): PolynomialRegressionState {
    const numCoeffs = this.config.degree + 1
    // Use smaller initial coefficients for higher degrees to improve stability
    const coeffScale = Math.max(0.1, 1 / Math.sqrt(this.config.degree + 1))
    const coefficients = this.config.initialCoefficients ??
      new Array(numCoeffs).fill(0).map(() => (Math.random() * 2 - 1) * coeffScale)

    const params = { coefficients }
    const predictions = this.predict(params)
    const cost = this.calculateCost(predictions)

    return {
      params,
      cost,
      iteration: 0,
      isConverged: false,
      history: [{
        iteration: 0,
        params: { coefficients: [...coefficients] },
        cost,
        gradients: []
      }],
      predictions
    }
  }

  /**
   * Evaluate polynomial at x (normalized)
   */
  private evaluatePolynomial(coefficients: number[], x: number): number {
    const normalizedX = this.normalizeX(x)
    return coefficients.reduce((sum, coeff, power) => sum + coeff * Math.pow(normalizedX, power), 0)
  }

  /**
   * Calculate predictions for all points
   */
  private predict(params: { coefficients: number[] }): number[] {
    return this.config.points.map(point => this.evaluatePolynomial(params.coefficients, point.x))
  }

  /**
   * Calculate mean squared error cost
   */
  private calculateCost(predictions: number[]): number {
    const m = this.config.points.length
    let cost = 0

    for (let i = 0; i < m; i++) {
      const error = predictions[i] - this.config.points[i].y
      cost += error * error
    }

    return cost / (2 * m)
  }

  /**
   * Calculate gradients for all coefficients
   */
  private calculateGradients(predictions: number[]): number[] {
    const m = this.config.points.length
    const gradients = new Array(this.config.degree + 1).fill(0)

    for (let i = 0; i < m; i++) {
      const error = predictions[i] - this.config.points[i].y
      const normalizedX = this.normalizeX(this.config.points[i].x)

      for (let power = 0; power <= this.config.degree; power++) {
        gradients[power] += error * Math.pow(normalizedX, power)
      }
    }

    // Average the gradients
    return gradients.map(g => g / m)
  }

  /**
   * Perform one step of gradient descent
   */
  step(): void {
    if (this.state.isConverged || this.state.iteration >= this.config.maxIterations) {
      this.state.isConverged = true
      return
    }

    const gradients = this.calculateGradients(this.state.predictions)
    // Adjust learning rate based on degree for better stability
    const degreeAdjustedLearningRate = this.config.learningRate / Math.sqrt(this.config.degree + 1)

    const newCoefficients = this.state.params.coefficients.map(
      (coeff, i) => coeff - degreeAdjustedLearningRate * gradients[i]
    )

    const newParams = { coefficients: newCoefficients }
    const newPredictions = this.predict(newParams)
    const newCost = this.calculateCost(newPredictions)

    this.state.params = newParams
    this.state.predictions = newPredictions
    this.state.cost = newCost
    this.state.iteration++

    // Record history
    this.state.history.push({
      iteration: this.state.iteration,
      params: { coefficients: [...newCoefficients] },
      cost: newCost,
      gradients: [...gradients]
    })

    // Check convergence
    const maxGradient = Math.max(...gradients.map(Math.abs))
    if (maxGradient < this.config.convergenceThreshold) {
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
  getState(): PolynomialRegressionState {
    return {
      params: { coefficients: [...this.state.params.coefficients] },
      cost: this.state.cost,
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      history: [...this.state.history],
      predictions: [...this.state.predictions]
    }
  }

  /**
   * Get prediction at a specific x value
   */
  getPredictionAt(x: number): number {
    return this.evaluatePolynomial(this.state.params.coefficients, x)
  }
}