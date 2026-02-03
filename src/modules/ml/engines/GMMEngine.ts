import type { DataPoint } from '../types'

/**
 * Gaussian Mixture Model (GMM) Engine with EM Algorithm
 * Unsupervised learning algorithm for soft clustering with probabilistic assignments
 */

export interface GaussianComponent {
  id: number
  mean: DataPoint
  covariance: number[][] // 2x2 covariance matrix
  weight: number // Mixture coefficient (π)
  color: string
}

export interface GMMPoint extends DataPoint {
  responsibilities: number[] // Probability of belonging to each component
  primaryComponent: number // Component with highest responsibility
}

export interface GMMState {
  components: GaussianComponent[]
  points: GMMPoint[]
  iteration: number
  isConverged: boolean
  phase: 'e-step' | 'm-step' | 'complete'
  currentPointIndex: number // For step-by-step E-step visualization
  logLikelihood: number // Log-likelihood of the data
  previousLogLikelihood: number // Previous iteration's log-likelihood
  history: GMMStep[]
  // Component trajectory tracking
  componentTrajectories: Map<number, DataPoint[]> // Maps component id to array of historical mean positions
}

export interface GMMStep {
  iteration: number
  phase: 'e-step' | 'm-step'
  components: GaussianComponent[]
  logLikelihood: number
}

export interface GMMConfig {
  points: DataPoint[]
  k: number // Number of components
  maxIterations: number
  convergenceThreshold: number // Threshold for log-likelihood change
  initialComponents?: GaussianComponent[]
  initMethod?: 'kmeans' | 'random' // Initialization method
}

export class GMMEngine {
  private config: GMMConfig
  private state: GMMState
  private readonly epsilon = 1e-10 // Small value to prevent numerical issues

  constructor(config: GMMConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): GMMState {
    // Initialize components
    const components = this.config.initialComponents
      ? this.config.initialComponents
      : this.initializeComponents()

    // Initialize points with uniform responsibilities
    const points: GMMPoint[] = this.config.points.map((p) => ({
      ...p,
      responsibilities: new Array(this.config.k).fill(1 / this.config.k),
      primaryComponent: 0,
    }))

    // Initialize trajectory tracking
    const componentTrajectories = new Map<number, DataPoint[]>()
    components.forEach((comp) => {
      componentTrajectories.set(comp.id, [{ x: comp.mean.x, y: comp.mean.y }])
    })

    const state: GMMState = {
      components,
      points,
      iteration: 0,
      isConverged: false,
      phase: 'e-step',
      currentPointIndex: 0,
      logLikelihood: -Infinity,
      previousLogLikelihood: -Infinity,
      history: [],
      componentTrajectories,
    }

    // Perform initial E-step to compute proper responsibilities
    this.performEStep(state)
    
    // Calculate initial log-likelihood
    state.logLikelihood = this.calculateLogLikelihoodFromState(state)

    // Add initial state to history for convergence chart
    state.history.push({
      iteration: 0,
      phase: 'e-step',
      components: JSON.parse(JSON.stringify(state.components)),
      logLikelihood: state.logLikelihood,
    })

    return state
  }

  /**
   * Initialize components based on configured method
   */
  private initializeComponents(): GaussianComponent[] {
    const method = this.config.initMethod || 'kmeans'
    if (method === 'random') {
      return this.initializeRandomComponents()
    } else {
      return this.initializeKMeansComponents()
    }
  }

  /**
   * Initialize components using simple random selection
   */
  private initializeRandomComponents(): GaussianComponent[] {
    const { points, k } = this.config
    const components: GaussianComponent[] = []

    if (points.length === 0) return components

    // Randomly select k points as initial means
    const selectedIndices = new Set<number>()
    while (selectedIndices.size < k && selectedIndices.size < points.length) {
      const idx = Math.floor(Math.random() * points.length)
      selectedIndices.add(idx)
    }

    const colors = this.getComponentColors(k)
    let id = 0
    for (const idx of selectedIndices) {
      components.push({
        id: id,
        mean: { ...points[idx] },
        covariance: this.computeGlobalCovariance(),
        weight: 1 / k,
        color: colors[id],
      })
      id++
    }

    return components
  }

  /**
   * Initialize components using K-Means for better starting points
   */
  private initializeKMeansComponents(): GaussianComponent[] {
    const { points, k } = this.config
    const components: GaussianComponent[] = []

    if (points.length === 0) return components

    // Simple K-Means initialization (one iteration)
    const centroids = this.kMeansInit(points, k)
    const colors = this.getComponentColors(k)

    centroids.forEach((centroid, i) => {
      components.push({
        id: i,
        mean: centroid,
        covariance: this.computeGlobalCovariance(),
        weight: 1 / k,
        color: colors[i],
      })
    })

    return components
  }

  /**
   * Simple K-Means initialization helper
   */
  private kMeansInit(points: DataPoint[], k: number): DataPoint[] {
    // Use K-Means++ initialization
    const centroids: DataPoint[] = []

    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * points.length)
    centroids.push({ ...points[firstIdx] })

    // Choose remaining centroids
    for (let i = 1; i < k; i++) {
      const distances: number[] = []
      let totalDistance = 0

      for (const point of points) {
        let minDist = Infinity
        for (const centroid of centroids) {
          const dist = this.euclideanDistance(point, centroid)
          minDist = Math.min(minDist, dist)
        }
        distances.push(minDist * minDist)
        totalDistance += minDist * minDist
      }

      let random = Math.random() * totalDistance
      let selectedIdx = 0
      for (let j = 0; j < distances.length; j++) {
        random -= distances[j]
        if (random <= 0) {
          selectedIdx = j
          break
        }
      }

      centroids.push({ ...points[selectedIdx] })
    }

    return centroids
  }

  /**
   * Compute global covariance matrix for initialization
   */
  private computeGlobalCovariance(): number[][] {
    const points = this.config.points
    if (points.length === 0) {
      return [
        [1, 0],
        [0, 1],
      ]
    }

    const mean = this.computeMean(points)
    let sumXX = 0,
      sumYY = 0,
      sumXY = 0

    for (const point of points) {
      const dx = point.x - mean.x
      const dy = point.y - mean.y
      sumXX += dx * dx
      sumYY += dy * dy
      sumXY += dx * dy
    }

    const n = points.length
    const minVar = 0.1 // Minimum variance for stability
    
    return [
      [Math.max(sumXX / n, minVar), sumXY / n],
      [sumXY / n, Math.max(sumYY / n, minVar)],
    ]
  }

  /**
   * Get component colors
   */
  private getComponentColors(k: number): string[] {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ]
    return colors.slice(0, k)
  }

  /**
   * Compute mean of points
   */
  private computeMean(points: DataPoint[]): DataPoint {
    if (points.length === 0) return { x: 0, y: 0 }

    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 })
    return { x: sum.x / points.length, y: sum.y / points.length }
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private euclideanDistance(p1: DataPoint, p2: DataPoint): number {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate multivariate Gaussian probability density
   */
  private gaussianPDF(point: DataPoint, mean: DataPoint, covariance: number[][]): number {
    const dx = point.x - mean.x
    const dy = point.y - mean.y

    // Calculate determinant
    const det = covariance[0][0] * covariance[1][1] - covariance[0][1] * covariance[1][0]
    if (det <= this.epsilon) {
      // Return a small probability for singular covariance
      return this.epsilon
    }

    // Calculate inverse
    const invCov = [
      [covariance[1][1] / det, -covariance[0][1] / det],
      [-covariance[1][0] / det, covariance[0][0] / det],
    ]

    // Calculate Mahalanobis distance
    const mahalanobis =
      dx * (invCov[0][0] * dx + invCov[0][1] * dy) + dy * (invCov[1][0] * dx + invCov[1][1] * dy)

    // Prevent numerical overflow in exp
    if (mahalanobis > 50) {
      return this.epsilon
    }

    // Calculate PDF
    const normalization = 1 / (2 * Math.PI * Math.sqrt(Math.abs(det)))
    const pdf = normalization * Math.exp(-0.5 * mahalanobis)
    
    // Return a minimum probability to avoid zeros
    return Math.max(pdf, this.epsilon)
  }

  /**
   * Assign responsibilities for a single point (for step-by-step visualization)
   */
  private assignPointResponsibilities(pointIndex: number): void {
    const point = this.state.points[pointIndex]
    const { components } = this.state
    const responsibilities: number[] = []
    let sum = 0

    // Calculate weighted probability for each component
    for (const comp of components) {
      const prob = comp.weight * this.gaussianPDF(point, comp.mean, comp.covariance)
      responsibilities.push(prob)
      sum += prob
    }

    // Normalize responsibilities
    if (sum > this.epsilon) {
      for (let i = 0; i < responsibilities.length; i++) {
        responsibilities[i] /= sum
      }
    } else {
      // Uniform distribution if sum is zero
      responsibilities.fill(1 / components.length)
    }

    // Find primary component
    const primaryComponent = responsibilities.indexOf(Math.max(...responsibilities))

    this.state.points[pointIndex] = {
      ...point,
      responsibilities,
      primaryComponent,
    }
  }

  /**
   * E-Step: Calculate responsibilities for all points
   */
  private eStep(): void {
    // Assign all points at once
    for (let i = 0; i < this.state.points.length; i++) {
      this.assignPointResponsibilities(i)
    }
  }

  /**
   * Perform E-step on a given state (helper for initialization and normal operation)
   */
  private performEStep(state: GMMState): void {
    const { components } = state
    const newPoints = state.points.map((point) => {
      const responsibilities: number[] = []
      let sum = 0

      // Calculate weighted probability for each component
      for (const comp of components) {
        const prob = comp.weight * this.gaussianPDF(point, comp.mean, comp.covariance)
        responsibilities.push(prob)
        sum += prob
      }

      // Normalize responsibilities
      if (sum > this.epsilon) {
        for (let i = 0; i < responsibilities.length; i++) {
          responsibilities[i] /= sum
        }
      } else {
        // Uniform distribution if sum is zero
        responsibilities.fill(1 / components.length)
      }

      // Find primary component
      const primaryComponent = responsibilities.indexOf(Math.max(...responsibilities))

      return {
        ...point,
        responsibilities,
        primaryComponent,
      }
    })

    state.points = newPoints
  }

  /**
   * M-Step: Update component parameters
   */
  private mStep(): void {
    const { points } = this.state
    const n = points.length
    const minCovariance = 0.1 // Minimum variance to prevent singular matrices

    const newComponents = this.state.components.map((comp, compIdx) => {
      // Calculate effective number of points for this component
      let nk = 0
      for (const point of points) {
        nk += point.responsibilities[compIdx]
      }

      // Prevent division by zero
      nk = Math.max(nk, this.epsilon)

      // Update mean
      let meanX = 0,
        meanY = 0
      for (const point of points) {
        const resp = point.responsibilities[compIdx]
        meanX += resp * point.x
        meanY += resp * point.y
      }
      const newMean = { x: meanX / nk, y: meanY / nk }

      // Update covariance with regularization
      let covXX = 0,
        covYY = 0,
        covXY = 0
      for (const point of points) {
        const resp = point.responsibilities[compIdx]
        const dx = point.x - newMean.x
        const dy = point.y - newMean.y
        covXX += resp * dx * dx
        covYY += resp * dy * dy
        covXY += resp * dx * dy
      }
      
      // Add regularization to prevent singular matrices
      const newCovariance = [
        [Math.max(covXX / nk, minCovariance), covXY / nk],
        [covXY / nk, Math.max(covYY / nk, minCovariance)],
      ]

      // Update weight
      const newWeight = nk / n

      // Update trajectory
      const trajectory = this.state.componentTrajectories.get(comp.id) || []
      trajectory.push({ x: newMean.x, y: newMean.y })
      this.state.componentTrajectories.set(comp.id, trajectory)

      return {
        ...comp,
        mean: newMean,
        covariance: newCovariance,
        weight: newWeight,
      }
    })

    this.state.components = newComponents
  }

  /**
   * Calculate log-likelihood of the data
   */
  private calculateLogLikelihood(): number {
    return this.calculateLogLikelihoodFromState(this.state)
  }

  /**
   * Calculate log-likelihood from a given state (helper for initialization)
   */
  private calculateLogLikelihoodFromState(state: GMMState): number {
    const { points, components } = state
    let logLikelihood = 0

    for (const point of points) {
      let likelihood = 0
      for (const comp of components) {
        likelihood += comp.weight * this.gaussianPDF(point, comp.mean, comp.covariance)
      }
      logLikelihood += Math.log(likelihood + this.epsilon)
    }

    return logLikelihood
  }

  /**
   * Check convergence based on log-likelihood change
   */
  private checkConvergence(oldLogLikelihood: number, newLogLikelihood: number): boolean {
    // Don't check convergence on first iteration
    if (!isFinite(oldLogLikelihood) || oldLogLikelihood === -Infinity) {
      return false
    }
    
    const threshold = this.config.convergenceThreshold
    const change = Math.abs(newLogLikelihood - oldLogLikelihood)
    
    // Also check if log-likelihood is decreasing significantly (shouldn't happen but can indicate numerical issues)
    if (newLogLikelihood < oldLogLikelihood - threshold) {
      console.warn('Log-likelihood decreased, possible numerical instability')
    }
    
    return change < threshold
  }

  /**
   * Run one complete iteration of EM algorithm
   */
  step(): void {
    if (this.state.isConverged) return

    if (this.state.phase === 'e-step') {
      // Perform E-step point by point for visualization
      if (this.state.currentPointIndex < this.state.points.length) {
        this.assignPointResponsibilities(this.state.currentPointIndex)
        this.state.currentPointIndex++
      } else {
        // All points processed, move to M-step
        this.state.phase = 'm-step'
        this.state.currentPointIndex = 0
      }
    } else if (this.state.phase === 'm-step') {
      // Store previous log-likelihood
      this.state.previousLogLikelihood = this.state.logLikelihood

      // Perform M-step
      this.mStep()
      this.state.iteration++

      // Calculate new log-likelihood
      const newLogLikelihood = this.calculateLogLikelihood()
      this.state.logLikelihood = newLogLikelihood

      // Record history
      this.state.history.push({
        iteration: this.state.iteration,
        phase: 'm-step',
        components: JSON.parse(JSON.stringify(this.state.components)),
        logLikelihood: newLogLikelihood,
      })

      // Check convergence
      if (
        this.state.iteration >= this.config.maxIterations ||
        this.checkConvergence(this.state.previousLogLikelihood, newLogLikelihood)
      ) {
        this.state.isConverged = true
        this.state.phase = 'complete'
      } else {
        this.state.phase = 'e-step'
      }
    }
  }

  /**
   * Run multiple steps
   */
  stepMultiple(count: number): void {
    for (let i = 0; i < count && !this.state.isConverged; i++) {
      this.step()
    }
  }

  /**
   * Run until convergence
   */
  runToCompletion(): void {
    while (!this.state.isConverged) {
      // Use batch E-step for faster completion
      if (this.state.phase === 'e-step') {
        this.eStep()
        this.state.currentPointIndex = this.state.points.length
        this.state.phase = 'm-step'
      } else {
        this.step()
      }
    }
  }

  /**
   * Reset the algorithm
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Get current state
   */
  getState(): GMMState {
    return {
      components: this.state.components.map((c) => ({ 
        ...c,
        mean: { ...c.mean },
        covariance: [
          [...c.covariance[0]],
          [...c.covariance[1]]
        ]
      })),
      points: this.state.points.map((p) => ({ 
        ...p, 
        responsibilities: [...p.responsibilities] 
      })),
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      phase: this.state.phase,
      currentPointIndex: this.state.currentPointIndex,
      logLikelihood: this.state.logLikelihood,
      previousLogLikelihood: this.state.previousLogLikelihood,
      history: this.state.history.map((h) => ({
        ...h,
        components: h.components.map((c) => ({ ...c }))
      })),
      componentTrajectories: new Map(
        Array.from(this.state.componentTrajectories.entries()).map(([id, trajectory]) => [
          id,
          trajectory.map((p) => ({ ...p }))
        ])
      ),
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GMMConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Get BIC (Bayesian Information Criterion)
   */
  getBIC(): number {
    const n = this.config.points.length
    const k = this.config.k
    // Number of parameters: k means (2D) + k covariances (3 params each: σx², σy², σxy) + k weights
    const numParams = k * 2 + k * 3 + k - 1 // -1 because weights sum to 1
    return -2 * this.state.logLikelihood + numParams * Math.log(n)
  }

  /**
   * Get AIC (Akaike Information Criterion)
   */
  getAIC(): number {
    const k = this.config.k
    const numParams = k * 2 + k * 3 + k - 1
    return -2 * this.state.logLikelihood + 2 * numParams
  }
}
