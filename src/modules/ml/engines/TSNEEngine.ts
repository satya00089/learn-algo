/**
 * t-SNE (t-Distributed Stochastic Neighbor Embedding) Engine
 * Non-linear dimensionality reduction for visualization of high-dimensional data
 */

export interface TSNEPoint {
  x: number
  y: number
  z?: number
  originalIndex: number
  label?: string
  category?: string
  metadata?: Record<string, any>
}

export interface TSNEState {
  points: TSNEPoint[]
  iteration: number
  maxIterations: number
  isConverged: boolean
  cost: number // KL divergence
  phase: 'init' | 'early-exaggeration' | 'optimization' | 'complete'
  costHistory: number[]
  gradientNorm: number
  // Real-time simulation
  isLiveMode: boolean
  lastUpdate: number
  events: SimulatedEvent[]
}

export interface SimulatedEvent {
  timestamp: number
  type: 'cluster-shift' | 'new-data' | 'viral-content' | 'market-change'
  description: string
  affectedPoints: number[]
}

export interface TSNEConfig {
  inputDimensions: number
  outputDimensions: 2 | 3
  perplexity: number // 5-50, typical value is 30
  learningRate: number // 10-1000, typical value is 200
  maxIterations: number // 250-1000
  momentum: number // 0.2-0.8, increases after early exaggeration
  earlyExaggeration: number // 4-12, typical value is 4
  earlyExaggerationIter: number // 250 iterations
  // Dataset
  dataset: 'mnist-digits'
  enableLiveSimulation: boolean
}

/**
 * Simple t-SNE implementation optimized for web visualization
 * Uses gradient descent to minimize KL divergence between
 * high-dimensional and low-dimensional probability distributions
 */
export class TSNEEngine {
  private config: TSNEConfig
  private readonly state: TSNEState
  private readonly highDimData: number[][] // Original high-dimensional data
  private pairwiseAffinities: number[][] = [] // High-dimensional affinities (P)
  private gains: number[][] // Adaptive learning rate gains
  private velocity: number[][] // Momentum velocity

  constructor(config: TSNEConfig, data: TSNEPoint[], highDimData: number[][]) {
    this.config = config
    this.highDimData = highDimData

    // Initialize low-dimensional embedding randomly
    const initialPoints = data.map((point, i) => ({
      ...point,
      x: (Math.random() - 0.5) * 0.0001,
      y: (Math.random() - 0.5) * 0.0001,
      z: config.outputDimensions === 3 ? (Math.random() - 0.5) * 0.0001 : undefined,
      originalIndex: i,
    }))

    this.state = {
      points: initialPoints,
      iteration: 0,
      maxIterations: config.maxIterations,
      isConverged: false,
      cost: Infinity,
      phase: 'init',
      costHistory: [],
      gradientNorm: 0,
      isLiveMode: config.enableLiveSimulation,
      lastUpdate: Date.now(),
      events: [],
    }

    // Initialize momentum and gains
    this.velocity = new Array(data.length)
      .fill(0)
      .map(() => new Array(config.outputDimensions).fill(0))
    this.gains = new Array(data.length)
      .fill(0)
      .map(() => new Array(config.outputDimensions).fill(1))

    // Compute pairwise affinities in high-dimensional space
    this.computePairwiseAffinities()
  }

  /**
   * Compute pairwise affinities using Gaussian kernel
   * P_j|i = exp(-||x_i - x_j||^2 / 2σ_i^2) / Σ_k exp(-||x_i - x_k||^2 / 2σ_i^2)
   */
  // eslint-disable-next-line complexity
  private computePairwiseAffinities(): void {
    const n = this.highDimData.length
    this.pairwiseAffinities = new Array(n).fill(0).map(() => new Array(n).fill(0))

    // Find appropriate sigma for each point using perplexity
    const beta = new Array(n).fill(1) // 1 / (2 * sigma^2)
    const targetEntropy = Math.log(this.config.perplexity)

    for (let i = 0; i < n; i++) {
      // Binary search for beta[i]
      let betaMin = 0,
        betaMax = Infinity
      let iterations = 0
      const maxIterations = 50

      while (iterations < maxIterations) {
        // Compute P_j|i with current beta
        const pRow = new Array(n).fill(0)
        let sum = 0

        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const d = this.euclideanDistance(this.highDimData[i], this.highDimData[j])
            pRow[j] = Math.exp(-d * d * beta[i])
            sum += pRow[j]
          }
        }

        // Normalize
        for (let j = 0; j < n; j++) {
          pRow[j] /= sum || 1
        }

        // Compute entropy: H = -Σ p * log(p)
        let entropy = 0
        for (let j = 0; j < n; j++) {
          if (pRow[j] > 1e-7) {
            entropy -= pRow[j] * Math.log(pRow[j])
          }
        }

        // Check if entropy matches target
        const entropyDiff = entropy - targetEntropy
        if (Math.abs(entropyDiff) < 1e-5) {
          this.pairwiseAffinities[i] = pRow
          break
        }

        // Adjust beta
        if (entropyDiff > 0) {
          betaMin = beta[i]
          beta[i] = betaMax === Infinity ? beta[i] * 2 : (beta[i] + betaMax) / 2
        } else {
          betaMax = beta[i]
          beta[i] = (beta[i] + betaMin) / 2
        }

        iterations++
      }
    }

    // Symmetrize: P_ij = (P_j|i + P_i|j) / (2n)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pij = (this.pairwiseAffinities[i][j] + this.pairwiseAffinities[j][i]) / (2 * n)
        this.pairwiseAffinities[i][j] = Math.max(pij, 1e-12)
        this.pairwiseAffinities[j][i] = this.pairwiseAffinities[i][j]
      }
    }
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2
    }
    return Math.sqrt(sum)
  }

  /**
   * Perform one gradient descent step
   */
  // eslint-disable-next-line complexity
  step(): void {
    if (this.state.isConverged) return

    const n = this.state.points.length
    const outputDim = this.config.outputDimensions

    // Determine phase
    if (this.state.iteration < this.config.earlyExaggerationIter) {
      this.state.phase = 'early-exaggeration'
    } else if (this.state.iteration < this.config.maxIterations) {
      this.state.phase = 'optimization'
    } else {
      this.state.phase = 'complete'
      this.state.isConverged = true
      return
    }

    // Exaggeration factor
    const exaggeration =
      this.state.phase === 'early-exaggeration' ? this.config.earlyExaggeration : 1

    // Compute q_ij (low-dimensional affinities using Student's t-distribution)
    const qij: number[][] = new Array(n).fill(0).map(() => new Array(n).fill(0))
    let qSum = 0

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dy = this.state.points[i].y - this.state.points[j].y
        const dx = this.state.points[i].x - this.state.points[j].x
        const dz =
          outputDim === 3 &&
          this.state.points[i].z !== undefined &&
          this.state.points[j].z !== undefined
            ? this.state.points[i].z! - this.state.points[j].z!
            : 0
        const d = dx * dx + dy * dy + dz * dz
        const q = 1 / (1 + d) // Student's t-distribution with 1 degree of freedom
        qij[i][j] = q
        qij[j][i] = q
        qSum += 2 * q
      }
    }

    // Normalize q_ij
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        qij[i][j] = Math.max(qij[i][j] / qSum, 1e-12)
      }
    }

    // Compute gradient
    const grad: number[][] = new Array(n).fill(0).map(() => new Array(outputDim).fill(0))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue

        const pij = this.pairwiseAffinities[i][j] * exaggeration
        const qij_val = qij[i][j]
        const mult = (pij - qij_val) * qij_val * (1 + 0) // (1 + d_ij^2) from denominator

        grad[i][0] += 4 * mult * (this.state.points[i].x - this.state.points[j].x)
        grad[i][1] += 4 * mult * (this.state.points[i].y - this.state.points[j].y)
        if (
          outputDim === 3 &&
          this.state.points[i].z !== undefined &&
          this.state.points[j].z !== undefined
        ) {
          grad[i][2] += 4 * mult * (this.state.points[i].z! - this.state.points[j].z!)
        }
      }
    }

    // Update positions using momentum
    const momentum = this.state.phase === 'early-exaggeration' ? 0.5 : this.config.momentum
    let gradNorm = 0

    for (let i = 0; i < n; i++) {
      for (let d = 0; d < outputDim; d++) {
        // Adaptive learning rates
        const gainAdjust = grad[i][d] * this.velocity[i][d] < 0 ? 0.8 : 1.2
        this.gains[i][d] = Math.max(0.01, this.gains[i][d] * gainAdjust)

        // Update velocity
        this.velocity[i][d] =
          momentum * this.velocity[i][d] - this.config.learningRate * this.gains[i][d] * grad[i][d]

        // Update position
        if (d === 0) this.state.points[i].x += this.velocity[i][d]
        else if (d === 1) this.state.points[i].y += this.velocity[i][d]
        else if (d === 2 && this.state.points[i].z !== undefined)
          this.state.points[i].z! += this.velocity[i][d]

        gradNorm += grad[i][d] ** 2
      }
    }

    this.state.gradientNorm = Math.sqrt(gradNorm)

    // Compute cost (KL divergence)
    let cost = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const pij = this.pairwiseAffinities[i][j]
          const qij_val = qij[i][j]
          if (pij > 1e-12 && qij_val > 1e-12) {
            cost += pij * Math.log(pij / qij_val)
          }
        }
      }
    }
    this.state.cost = cost
    this.state.costHistory.push(cost)

    // Real-time simulation
    this.simulateLiveEvents()

    this.state.iteration++
  }

  /**
   * Simulate real-time events for interactive datasets (not applicable to MNIST)
   */
  public simulateLiveEvents(): void {
    if (!this.state.isLiveMode) return
    if (this.config.dataset === 'mnist-digits') return // MNIST is static dataset

    const now = Date.now()
    if (now - this.state.lastUpdate < 5000) return // Update every 5 seconds

    this.state.lastUpdate = now

    // Live events not implemented for MNIST dataset
    // Keep only last 10 events
    if (this.state.events.length > 10) {
      this.state.events = this.state.events.slice(-10)
    }
  }

  /**
   * Run algorithm to completion
   */
  run(): void {
    while (!this.state.isConverged && this.state.iteration < this.config.maxIterations) {
      this.step()
    }
  }

  /**
   * Reset the algorithm
   */
  reset(): void {
    const n = this.state.points.length
    const outputDim = this.config.outputDimensions

    // Re-initialize positions randomly
    this.state.points = this.state.points.map((point) => ({
      ...point,
      x: (Math.random() - 0.5) * 0.0001,
      y: (Math.random() - 0.5) * 0.0001,
      z: outputDim === 3 ? (Math.random() - 0.5) * 0.0001 : undefined,
    }))

    this.state.iteration = 0
    this.state.isConverged = false
    this.state.cost = Infinity
    this.state.phase = 'init'
    this.state.costHistory = []
    this.state.gradientNorm = 0
    this.state.events = []
    this.state.lastUpdate = Date.now()

    this.velocity = new Array(n).fill(0).map(() => new Array(outputDim).fill(0))
    this.gains = new Array(n).fill(0).map(() => new Array(outputDim).fill(1))
  }

  /**
   *Run multiple optimization steps
   */
  public runSteps(steps: number): boolean {
    for (let i = 0; i < steps; i++) {
      if (this.state.iteration >= this.config.maxIterations) {
        this.state.phase = 'complete'
        return true
      }
      this.step()
    }
    return this.state.iteration >= this.config.maxIterations
  }

  /**
   * Get current state
   */
  getState(): TSNEState {
    return { ...this.state }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TSNEConfig>): void {
    this.config = { ...this.config, ...newConfig }

    // Recompute affinities if perplexity changed
    if (newConfig.perplexity !== undefined) {
      this.computePairwiseAffinities()
    }

    // Toggle live mode
    if (newConfig.enableLiveSimulation !== undefined) {
      this.state.isLiveMode = newConfig.enableLiveSimulation
    }
  }
}
