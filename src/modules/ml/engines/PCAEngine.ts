import type { DataPoint } from '../types'

/**
 * PCA Engine
 * Implements Principal Component Analysis for dimensionality reduction
 */

export interface PCAPoint extends DataPoint {
  original: DataPoint // Original high-dimensional point
  transformed: DataPoint // Transformed low-dimensional point
  reconstructionError?: number // Distance from original after reconstruction
}

export interface PCAComponent {
  eigenvector: number[] // Direction vector
  eigenvalue: number // Amount of variance explained
  explainedVariance: number // Percentage of total variance
  cumulativeVariance: number // Cumulative percentage
}

export interface PCAState {
  points: PCAPoint[]
  originalPoints: DataPoint[] // Original data
  centeredPoints: DataPoint[] // Mean-centered data
  components: PCAComponent[]
  numComponents: number // Number of components to use
  isComplete: boolean
  currentStep: number
  totalSteps: number
  stepDescription: string
  // Computed values
  mean: DataPoint
  covarianceMatrix: number[][]
  eigenvalues: number[]
  eigenvectors: number[][]
  explainedVariance: number[]
  cumulativeVariance: number[]
  totalVariance: number
}

export interface PCAConfig {
  points: DataPoint[]
  numComponents: number
}

export class PCAEngine {
  private state: PCAState

  constructor(config: PCAConfig) {
    this.state = this.initializeState(config)
  }

  private initializeState(config: PCAConfig): PCAState {
    const points = config.points.map(p => ({
      ...p,
      original: { ...p },
      transformed: { x: 0, y: 0 } // Will be updated
    }))

    return {
      points,
      originalPoints: config.points,
      centeredPoints: [],
      components: [],
      numComponents: config.numComponents,
      isComplete: false,
      currentStep: 0,
      totalSteps: 5, // Center, Covariance, Eigen, Select, Transform
      stepDescription: 'Ready to start PCA',
      mean: { x: 0, y: 0 },
      covarianceMatrix: [],
      eigenvalues: [],
      eigenvectors: [],
      explainedVariance: [],
      cumulativeVariance: [],
      totalVariance: 0
    }
  }

  getState(): PCAState {
    return { ...this.state }
  }

  reset(): void {
    this.state.currentStep = 0
    this.state.isComplete = false
    this.state.stepDescription = 'Ready to start PCA'
    this.state.points.forEach(p => {
      p.transformed = { x: 0, y: 0 }
    })
  }

  step(): boolean {
    if (this.state.isComplete) return false

    this.state.currentStep++

    switch (this.state.currentStep) {
      case 1:
        this.centerData()
        break
      case 2:
        this.computeCovariance()
        break
      case 3:
        this.computeEigen()
        break
      case 4:
        this.selectComponents()
        break
      case 5:
        this.transformData()
        this.state.isComplete = true
        break
    }

    return !this.state.isComplete
  }

  run(): void {
    while (this.step()) {
      // Continue until complete
    }
  }

  private centerData(): void {
    this.state.stepDescription = 'Centering data by subtracting mean'

    // Calculate mean
    const sum = this.state.originalPoints.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    )
    this.state.mean = {
      x: sum.x / this.state.originalPoints.length,
      y: sum.y / this.state.originalPoints.length
    }

    // Center the data
    this.state.centeredPoints = this.state.originalPoints.map(p => ({
      x: p.x - this.state.mean.x,
      y: p.y - this.state.mean.y
    }))
  }

  private computeCovariance(): void {
    this.state.stepDescription = 'Computing covariance matrix'

    const n = this.state.centeredPoints.length
    let sumXX = 0, sumXY = 0, sumYY = 0

    for (const p of this.state.centeredPoints) {
      sumXX += p.x * p.x
      sumXY += p.x * p.y
      sumYY += p.y * p.y
    }

    this.state.covarianceMatrix = [
      [sumXX / n, sumXY / n],
      [sumXY / n, sumYY / n]
    ]
  }

  private computeEigen(): void {
    this.state.stepDescription = 'Finding eigenvalues and eigenvectors'

    // For 2D case, compute eigenvalues analytically
    const [[a, b], [c, d]] = this.state.covarianceMatrix

    // Characteristic equation: det(A - λI) = 0
    // (a-λ)(d-λ) - b*c = 0
    // λ² - (a+d)λ + (ad-bc) = 0
    const trace = a + d
    const det = a * d - b * c

    const discriminant = trace * trace - 4 * det
    const sqrtD = Math.sqrt(Math.max(0, discriminant))

    const lambda1 = (trace + sqrtD) / 2
    const lambda2 = (trace - sqrtD) / 2

    this.state.eigenvalues = [lambda1, lambda2]
    this.state.totalVariance = lambda1 + lambda2

    // Compute eigenvectors
    this.state.eigenvectors = []

    // For each eigenvalue, solve (A - λI)v = 0
    for (const lambda of this.state.eigenvalues) {
      const matrix = [
        [a - lambda, b],
        [c, d - lambda]
      ]

      // Find eigenvector (solve for v where matrix * v = 0)
      // For simplicity, assume first component is 1, solve for second
      let v1 = 1, v2 = 0
      if (Math.abs(matrix[0][0]) > 1e-10) {
        v2 = -matrix[0][1] / matrix[0][0]
      } else if (Math.abs(matrix[1][0]) > 1e-10) {
        v2 = -matrix[1][1] / matrix[1][0]
        v1 = 1
      }

      // Normalize
      const norm = Math.sqrt(v1 * v1 + v2 * v2)
      this.state.eigenvectors.push([v1 / norm, v2 / norm])
    }
  }

  private selectComponents(): void {
    this.state.stepDescription = `Selecting top ${this.state.numComponents} components`

    // Sort by eigenvalue (descending)
    const indices = this.state.eigenvalues
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .map(item => item.idx)

    this.state.components = []
    let cumulative = 0

    for (let i = 0; i < this.state.numComponents; i++) {
      const idx = indices[i]
      const eigenvalue = this.state.eigenvalues[idx]
      const eigenvector = this.state.eigenvectors[idx]
      const explained = eigenvalue / this.state.totalVariance
      cumulative += explained

      this.state.components.push({
        eigenvector: eigenvector,
        eigenvalue: eigenvalue,
        explainedVariance: explained,
        cumulativeVariance: cumulative
      })
    }

    this.state.explainedVariance = this.state.components.map(c => c.explainedVariance)
    this.state.cumulativeVariance = this.state.components.map(c => c.cumulativeVariance)
  }

  private transformData(): void {
    this.state.stepDescription = 'Transforming data to lower dimensions'

    for (const point of this.state.points) {
      const centered = {
        x: point.original.x - this.state.mean.x,
        y: point.original.y - this.state.mean.y
      }

      // Project onto principal components
      let transformedX = 0, transformedY = 0

      if (this.state.components.length > 0) {
        const pc1 = this.state.components[0]
        transformedX = centered.x * pc1.eigenvector[0] + centered.y * pc1.eigenvector[1]
      }

      if (this.state.components.length > 1) {
        const pc2 = this.state.components[1]
        transformedY = centered.x * pc2.eigenvector[0] + centered.y * pc2.eigenvector[1]
      }

      point.transformed = { x: transformedX, y: transformedY }

      // Calculate reconstruction error (optional)
      if (this.state.numComponents === 2) {
        // Reconstruct using both components
        const reconstructed = {
          x: this.state.mean.x + transformedX * this.state.components[0].eigenvector[0] + transformedY * this.state.components[1].eigenvector[0],
          y: this.state.mean.y + transformedX * this.state.components[0].eigenvector[1] + transformedY * this.state.components[1].eigenvector[1]
        }
        point.reconstructionError = Math.sqrt(
          Math.pow(point.original.x - reconstructed.x, 2) +
          Math.pow(point.original.y - reconstructed.y, 2)
        )
      }
    }
  }

  updateConfig(config: Partial<PCAConfig>): void {
    if (config.numComponents !== undefined) {
      this.state.numComponents = config.numComponents
    }
    if (config.points !== undefined) {
      this.state = this.initializeState({
        points: config.points,
        numComponents: this.state.numComponents
      })
    }
  }
}