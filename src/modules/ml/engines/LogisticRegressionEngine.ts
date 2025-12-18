import type { DataPoint } from '../types'

/**
 * Logistic Regression Engine with step-by-step gradient descent
 * Binary classification using sigmoid activation
 */

export interface LogisticRegressionParams {
  weights: number[] // [w1, w2, ..., wn]
  bias: number
}

export interface LogisticRegressionState {
  params: LogisticRegressionParams
  cost: number
  accuracy: number
  iteration: number
  isConverged: boolean
  history: LogisticRegressionStep[]
  predictions: number[] // Predicted classes for each point
  probabilities: number[] // Predicted probabilities for each point
}

export interface LogisticRegressionStep {
  iteration: number
  cost: number
  accuracy: number
  weights: number[]
  bias: number
}

export interface LogisticRegressionConfig {
  points: DataPoint[]
  learningRate: number
  maxIterations: number
  convergenceThreshold: number
  initialWeights?: number[]
  initialBias?: number
  polynomialDegree?: number // 1 for linear, 2 for quadratic, etc.
}

export class LogisticRegressionEngine {
  private config: LogisticRegressionConfig
  private state: LogisticRegressionState

  constructor(config: LogisticRegressionConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  /**
   * Generate polynomial features from point coordinates
   * Degree 1: [x, y]
   * Degree 2: [x, y, x², xy, y²]
   * Degree 3: [x, y, x², xy, y², x³, x²y, xy², y³]
   */
  private getFeatures(point: DataPoint): number[] {
    const { x, y } = point
    const degree = this.config.polynomialDegree ?? 1
    const features: number[] = []

    for (let d = 1; d <= degree; d++) {
      for (let i = 0; i <= d; i++) {
        const xPower = d - i
        const yPower = i
        features.push(Math.pow(x, xPower) * Math.pow(y, yPower))
      }
    }

    return features
  }

  /**
   * Get number of features based on polynomial degree
   */
  private getNumFeatures(): number {
    const degree = this.config.polynomialDegree ?? 1
    return ((degree + 1) * (degree + 2)) / 2
  }

  private initializeState(): LogisticRegressionState {
    const numFeatures = this.getNumFeatures()
    const params: LogisticRegressionParams = {
      weights: this.config.initialWeights ?? Array(numFeatures).fill(0),
      bias: this.config.initialBias ?? 0,
    }

    const { predictions, probabilities } = this.predict(params)
    const cost = this.calculateCost(probabilities)
    const accuracy = this.calculateAccuracy(predictions)

    return {
      params,
      cost,
      accuracy,
      iteration: 0,
      isConverged: false,
      history: [],
      predictions,
      probabilities,
    }
  }

  /**
   * Sigmoid activation function
   */
  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z))
  }

  /**
   * Calculate linear combination z = w·x + b (with polynomial features)
   */
  private calculateZ(point: DataPoint, params: LogisticRegressionParams): number {
    const features = this.getFeatures(point)
    const { weights, bias } = params
    
    let z = bias
    for (let i = 0; i < features.length; i++) {
      z += weights[i] * features[i]
    }
    
    return z
  }

  /**
   * Public method to get probability for a point (for visualization)
   */
  public getProbabilityAt(x: number, y: number): number {
    const z = this.calculateZ({ x, y, label: 0 }, this.state.params)
    return this.sigmoid(z)
  }

  /**
   * Predict probabilities and classes for all points
   */
  private predict(params: LogisticRegressionParams): {
    predictions: number[]
    probabilities: number[]
  } {
    const predictions: number[] = []
    const probabilities: number[] = []

    for (const point of this.config.points) {
      const z = this.calculateZ(point, params)
      const prob = this.sigmoid(z)
      probabilities.push(prob)
      predictions.push(prob >= 0.5 ? 1 : 0)
    }

    return { predictions, probabilities }
  }

  /**
   * Calculate binary cross-entropy cost
   */
  private calculateCost(probabilities: number[]): number {
    const { points } = this.config
    const m = points.length
    let cost = 0

    for (let i = 0; i < m; i++) {
      const y = points[i].label ?? 0
      const h = probabilities[i]
      
      // Binary cross-entropy: -[y*log(h) + (1-y)*log(1-h)]
      // Add epsilon to avoid log(0)
      const epsilon = 1e-15
      cost += -y * Math.log(h + epsilon) - (1 - y) * Math.log(1 - h + epsilon)
    }

    return cost / m
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(predictions: number[]): number {
    const { points } = this.config
    let correct = 0

    for (let i = 0; i < points.length; i++) {
      if (predictions[i] === (points[i].label ?? 0)) {
        correct++
      }
    }

    return correct / points.length
  }

  /**
   * Perform one step of gradient descent
   */
  step(): void {
    if (this.state.isConverged || this.state.iteration >= this.config.maxIterations) {
      this.state.isConverged = true
      return
    }

    const { points, learningRate, convergenceThreshold } = this.config
    const { params } = this.state
    const m = points.length

    // Calculate predictions
    const { probabilities } = this.predict(params)

    // Calculate gradients
    const numFeatures = this.getNumFeatures()
    const gradWeights = Array(numFeatures).fill(0)
    let gradBias = 0

    for (let i = 0; i < m; i++) {
      const y = points[i].label ?? 0
      const h = probabilities[i]
      const error = h - y
      const features = this.getFeatures(points[i])

      for (let j = 0; j < numFeatures; j++) {
        gradWeights[j] += error * features[j]
      }
      gradBias += error
    }

    // Average gradients
    for (let j = 0; j < numFeatures; j++) {
      gradWeights[j] /= m
    }
    gradBias /= m

    // Update parameters
    const newParams: LogisticRegressionParams = {
      weights: params.weights.map((w, i) => w - learningRate * gradWeights[i]),
      bias: params.bias - learningRate * gradBias,
    }

    // Calculate new predictions and cost
    const newPredictions = this.predict(newParams)
    const newCost = this.calculateCost(newPredictions.probabilities)
    const newAccuracy = this.calculateAccuracy(newPredictions.predictions)

    // Record history
    this.state.history.push({
      iteration: this.state.iteration,
      cost: this.state.cost,
      accuracy: this.state.accuracy,
      weights: [...params.weights],
      bias: params.bias,
    })

    // Update state
    const costDifference = Math.abs(this.state.cost - newCost)
    this.state.params = newParams
    this.state.cost = newCost
    this.state.accuracy = newAccuracy
    this.state.predictions = newPredictions.predictions
    this.state.probabilities = newPredictions.probabilities
    this.state.iteration++

    // Check convergence
    if (costDifference < convergenceThreshold) {
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
  getState(): LogisticRegressionState {
    return {
      params: {
        weights: [...this.state.params.weights],
        bias: this.state.params.bias,
      },
      cost: this.state.cost,
      accuracy: this.state.accuracy,
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      history: [...this.state.history],
      predictions: [...this.state.predictions],
      probabilities: [...this.state.probabilities],
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LogisticRegressionConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Get decision boundary points (for 2D visualization)
   * For linear: returns a straight line
   * For polynomial: returns contour points where probability = 0.5
   */
  getDecisionBoundary(xRange: [number, number], yRange: [number, number], resolution: number = 100): 
    { points: Array<{ x: number; y: number }> } {
    const degree = this.config.polynomialDegree ?? 1
    const boundaryPoints: Array<{ x: number; y: number }> = []

    if (degree === 1) {
      // Linear case: return a line
      const { weights, bias } = this.state.params
      const [w1, w2] = weights

      if (Math.abs(w2) > 0.001) {
        const x1 = xRange[0]
        const y1 = -(w1 * x1 + bias) / w2
        const x2 = xRange[1]
        const y2 = -(w1 * x2 + bias) / w2
        
        boundaryPoints.push({ x: x1, y: y1 })
        boundaryPoints.push({ x: x2, y: y2 })
      }
    } else {
      // Polynomial case: use marching squares-like algorithm for better contour
      const xStep = (xRange[1] - xRange[0]) / resolution
      const yStep = (yRange[1] - yRange[0]) / resolution

      // Create probability grid
      const probGrid: number[][] = []
      for (let xi = 0; xi <= resolution; xi++) {
        probGrid[xi] = []
        for (let yi = 0; yi <= resolution; yi++) {
          const x = xRange[0] + xi * xStep
          const y = yRange[0] + yi * yStep
          const z = this.calculateZ({ x, y, label: 0 }, this.state.params)
          probGrid[xi][yi] = this.sigmoid(z)
        }
      }

      // Find contour using edge detection
      for (let xi = 0; xi < resolution; xi++) {
        for (let yi = 0; yi < resolution; yi++) {
          const x = xRange[0] + xi * xStep
          const y = yRange[0] + yi * yStep
          
          const p00 = probGrid[xi][yi]
          const p10 = probGrid[xi + 1][yi]
          const p01 = probGrid[xi][yi + 1]
          const p11 = probGrid[xi + 1][yi + 1]

          // Check if this cell contains the 0.5 contour
          const threshold = 0.5
          const hasContour = 
            (p00 < threshold && (p10 >= threshold || p01 >= threshold || p11 >= threshold)) ||
            (p00 >= threshold && (p10 < threshold || p01 < threshold || p11 < threshold))

          if (hasContour) {
            // Use linear interpolation to find more precise boundary point
            let boundaryX = x + xStep / 2
            let boundaryY = y + yStep / 2

            // Interpolate along edges
            if ((p00 < threshold) !== (p10 < threshold)) {
              // Boundary crosses horizontal edge
              const t = (threshold - p00) / (p10 - p00)
              boundaryX = x + t * xStep
              boundaryY = y
            } else if ((p00 < threshold) !== (p01 < threshold)) {
              // Boundary crosses vertical edge
              const t = (threshold - p00) / (p01 - p00)
              boundaryX = x
              boundaryY = y + t * yStep
            }

            boundaryPoints.push({ x: boundaryX, y: boundaryY })
          }
        }
      }
    }

    return { points: boundaryPoints }
  }

  /**
   * Get decision boundary line for linear case (backward compatibility)
   */
  getDecisionBoundaryLine(xRange: [number, number]): { x1: number; y1: number; x2: number; y2: number } | null {
    const degree = this.config.polynomialDegree ?? 1
    if (degree !== 1) return null

    const { weights, bias } = this.state.params
    const [w1, w2] = weights

    if (Math.abs(w2) < 0.001) {
      return null
    }

    const x1 = xRange[0]
    const y1 = -(w1 * x1 + bias) / w2

    const x2 = xRange[1]
    const y2 = -(w1 * x2 + bias) / w2

    return { x1, y1, x2, y2 }
  }
}
