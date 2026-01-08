import type { DataPoint } from '../types'

/**
 * K-Means Clustering Engine with step-by-step visualization
 * Unsupervised learning algorithm for grouping similar data points
 */

export interface Centroid extends DataPoint {
  clusterId: number
}

export interface ClusteredPoint extends DataPoint {
  clusterId: number
  distance: number // Distance to assigned centroid
}

export interface KMeansState {
  centroids: Centroid[]
  points: ClusteredPoint[]
  iteration: number
  isConverged: boolean
  phase: 'init' | 'assign' | 'update' | 'complete'
  currentPointIndex: number // For step-by-step assignment visualization
  history: KMeansStep[]
  inertia: number // Sum of squared distances (within-cluster sum of squares)
  // K-Means++ initialization state
  isInitializing: boolean
  initializationStep: number // Which centroid we're selecting (0-indexed)
  candidateDistances: number[] // Distance to nearest centroid for each point
  selectedCentroidIndices: number[] // Indices of points selected as centroids
  // Centroid trajectory tracking
  centroidTrajectories: Map<number, DataPoint[]> // Maps clusterId to array of historical positions
}

export interface KMeansStep {
  iteration: number
  phase: 'assign' | 'update'
  centroids: Centroid[]
  inertia: number
}

export interface KMeansConfig {
  points: DataPoint[]
  k: number // Number of clusters
  maxIterations: number
  initialCentroids?: Centroid[]
  initMethod?: 'random' | 'kmeans++' // Initialization method
  visualizeInit?: boolean // Whether to visualize initialization step-by-step
}

export class KMeansClusteringEngine {
  private config: KMeansConfig
  private state: KMeansState

  constructor(config: KMeansConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): KMeansState {
    // Check if we should visualize initialization
    const shouldVisualizeInit =
      this.config.visualizeInit &&
      this.config.initMethod === 'kmeans++' &&
      !this.config.initialCentroids

    // Initialize centroids
    const centroids = this.config.initialCentroids
      ? this.config.initialCentroids
      : shouldVisualizeInit
        ? [] // Start empty for step-by-step visualization
        : this.initializeCentroids()

    // Initialize points with no cluster assignment
    const points: ClusteredPoint[] = this.config.points.map((p) => ({
      ...p,
      clusterId: -1,
      distance: 0,
    }))

    // Initialize trajectory tracking with initial centroid positions
    const centroidTrajectories = new Map<number, DataPoint[]>()
    centroids.forEach((centroid) => {
      centroidTrajectories.set(centroid.clusterId, [{ x: centroid.x, y: centroid.y }])
    })

    return {
      centroids,
      points,
      iteration: 0,
      isConverged: false,
      phase: shouldVisualizeInit ? 'init' : 'assign',
      currentPointIndex: 0,
      history: [],
      inertia: 0,
      isInitializing: shouldVisualizeInit || false,
      initializationStep: 0,
      candidateDistances: [],
      selectedCentroidIndices: [],
      centroidTrajectories,
    }
  }

  /**
   * Initialize centroids based on configured method
   */
  private initializeCentroids(): Centroid[] {
    const method = this.config.initMethod || 'kmeans++'
    if (method === 'random') {
      return this.initializeRandomCentroids()
    } else {
      return this.initializeKMeansPlusPlusCentroids()
    }
  }

  /**
   * Initialize centroids using simple random selection
   */
  private initializeRandomCentroids(): Centroid[] {
    const { points, k } = this.config
    const centroids: Centroid[] = []

    if (points.length === 0) return centroids

    // Randomly select k points as initial centroids
    const selectedIndices = new Set<number>()
    while (selectedIndices.size < k && selectedIndices.size < points.length) {
      const idx = Math.floor(Math.random() * points.length)
      selectedIndices.add(idx)
    }

    let clusterId = 0
    for (const idx of selectedIndices) {
      centroids.push({
        ...points[idx],
        clusterId: clusterId++,
      })
    }

    return centroids
  }

  /**
   * Initialize centroids using K-Means++ algorithm for better initialization
   */
  private initializeKMeansPlusPlusCentroids(): Centroid[] {
    const { points, k } = this.config
    const centroids: Centroid[] = []

    if (points.length === 0) return centroids

    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * points.length)
    centroids.push({
      ...points[firstIdx],
      clusterId: 0,
    })

    // Choose remaining centroids using K-Means++
    for (let i = 1; i < k; i++) {
      const distances: number[] = []
      let totalDistance = 0

      // Calculate distance to nearest centroid for each point
      for (const point of points) {
        let minDist = Infinity
        for (const centroid of centroids) {
          const dist = this.euclideanDistance(point, centroid)
          minDist = Math.min(minDist, dist)
        }
        distances.push(minDist * minDist) // Square the distance
        totalDistance += minDist * minDist
      }

      // Choose next centroid with probability proportional to distance squared
      let random = Math.random() * totalDistance
      let selectedIdx = 0
      for (let j = 0; j < distances.length; j++) {
        random -= distances[j]
        if (random <= 0) {
          selectedIdx = j
          break
        }
      }

      centroids.push({
        ...points[selectedIdx],
        clusterId: i,
      })
    }

    return centroids
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
   * Assign a single point to nearest centroid (for step-by-step visualization)
   */
  private assignPointToCluster(pointIndex: number): void {
    const point = this.state.points[pointIndex]
    let minDistance = Infinity
    let nearestCluster = 0

    for (const centroid of this.state.centroids) {
      const distance = this.euclideanDistance(point, centroid)
      if (distance < minDistance) {
        minDistance = distance
        nearestCluster = centroid.clusterId
      }
    }

    this.state.points[pointIndex].clusterId = nearestCluster
    this.state.points[pointIndex].distance = minDistance
  }

  /**
   * Assign all points to nearest centroids
   */
  private assignAllPointsToClusters(): void {
    for (let i = 0; i < this.state.points.length; i++) {
      this.assignPointToCluster(i)
    }
  }

  /**
   * Update centroids based on mean of assigned points
   */
  private updateCentroids(): boolean {
    const { k } = this.config
    const newCentroids: Centroid[] = []
    let hasChanged = false

    for (let clusterId = 0; clusterId < k; clusterId++) {
      const clusterPoints = this.state.points.filter((p) => p.clusterId === clusterId)

      if (clusterPoints.length === 0) {
        // Keep old centroid if no points assigned
        newCentroids.push({ ...this.state.centroids[clusterId] })
        continue
      }

      // Calculate mean position
      const meanX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length
      const meanY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length

      const oldCentroid = this.state.centroids[clusterId]
      const moved =
        Math.abs(oldCentroid.x - meanX) > 0.001 || Math.abs(oldCentroid.y - meanY) > 0.001

      if (moved) {
        hasChanged = true
      }

      newCentroids.push({
        x: meanX,
        y: meanY,
        clusterId,
      })

      // Record trajectory of centroid movement
      if (!this.state.centroidTrajectories.has(clusterId)) {
        this.state.centroidTrajectories.set(clusterId, [])
      }
      this.state.centroidTrajectories.get(clusterId)?.push({ x: meanX, y: meanY })
    }

    this.state.centroids = newCentroids
    return hasChanged
  }

  /**
   * Calculate inertia (within-cluster sum of squares)
   */
  private calculateInertia(): number {
    let inertia = 0
    for (const point of this.state.points) {
      inertia += point.distance * point.distance
    }
    return inertia
  }

  /**
   * Perform one step of K-Means++ initialization
   */
  private stepKMeansPlusPlusInit(): void {
    const { points, k } = this.config

    if (this.state.centroids.length === 0) {
      // Step 1: Choose first centroid randomly
      const firstIdx = Math.floor(Math.random() * points.length)
      this.state.centroids.push({
        ...points[firstIdx],
        clusterId: 0,
      })
      this.state.selectedCentroidIndices.push(firstIdx)
      this.state.initializationStep = 1
    } else if (this.state.centroids.length < k) {
      // Calculate distances to nearest centroid for all points
      const distances: number[] = []
      let totalDistance = 0

      for (const point of points) {
        let minDist = Infinity
        for (const centroid of this.state.centroids) {
          const dist = this.euclideanDistance(point, centroid)
          minDist = Math.min(minDist, dist)
        }
        distances.push(minDist * minDist) // Square the distance
        totalDistance += minDist * minDist
      }

      this.state.candidateDistances = distances

      // Choose next centroid with probability proportional to distance squared
      let random = Math.random() * totalDistance
      let selectedIdx = 0
      for (let j = 0; j < distances.length; j++) {
        random -= distances[j]
        if (random <= 0) {
          selectedIdx = j
          break
        }
      }

      this.state.centroids.push({
        ...points[selectedIdx],
        clusterId: this.state.centroids.length,
      })
      this.state.selectedCentroidIndices.push(selectedIdx)
      this.state.initializationStep++

      // Add to trajectory
      const clusterId = this.state.centroids.length - 1
      if (!this.state.centroidTrajectories.has(clusterId)) {
        this.state.centroidTrajectories.set(clusterId, [])
      }
      this.state.centroidTrajectories.get(clusterId)?.push({
        x: points[selectedIdx].x,
        y: points[selectedIdx].y,
      })
    }

    // Check if initialization is complete
    if (this.state.centroids.length === k) {
      this.state.isInitializing = false
      this.state.phase = 'assign'
      this.state.candidateDistances = []
    }
  }

  /**
   * Perform one step of the algorithm
   */
  step(): void {
    // Handle initialization phase
    if (this.state.isInitializing && this.state.phase === 'init') {
      this.stepKMeansPlusPlusInit()
      return
    }

    if (this.state.isConverged || this.state.iteration >= this.config.maxIterations) {
      this.state.isConverged = true
      this.state.phase = 'complete'
      return
    }

    if (this.state.phase === 'assign') {
      // Assign one point per step for visualization
      if (this.state.currentPointIndex < this.state.points.length) {
        this.assignPointToCluster(this.state.currentPointIndex)
        this.state.currentPointIndex++
      } else {
        // All points assigned, calculate inertia and move to update phase
        this.state.inertia = this.calculateInertia()
        this.state.phase = 'update'
        this.state.currentPointIndex = 0
      }
    } else if (this.state.phase === 'update') {
      // Record history before updating
      this.state.history.push({
        iteration: this.state.iteration,
        phase: 'update',
        centroids: this.state.centroids.map((c) => ({ ...c })),
        inertia: this.state.inertia,
      })

      // Update centroids
      const hasChanged = this.updateCentroids()

      if (!hasChanged) {
        this.state.isConverged = true
        this.state.phase = 'complete'
      } else {
        this.state.phase = 'assign'
        this.state.iteration++
      }
    }
  }

  /**
   * Run algorithm to completion
   */
  run(): void {
    // Complete initialization if needed
    while (this.state.isInitializing && this.state.phase === 'init') {
      this.stepKMeansPlusPlusInit()
    }

    // Run main algorithm
    while (!this.state.isConverged && this.state.iteration < this.config.maxIterations) {
      if (this.state.phase === 'assign') {
        this.assignAllPointsToClusters()
        this.state.inertia = this.calculateInertia()
        this.state.currentPointIndex = this.state.points.length
        this.state.phase = 'update'
      } else {
        this.step()
      }
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
  getState(): KMeansState {
    return {
      centroids: this.state.centroids.map((c) => ({ ...c })),
      points: this.state.points.map((p) => ({ ...p })),
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      phase: this.state.phase,
      currentPointIndex: this.state.currentPointIndex,
      history: [...this.state.history],
      inertia: this.state.inertia,
      isInitializing: this.state.isInitializing,
      initializationStep: this.state.initializationStep,
      candidateDistances: [...this.state.candidateDistances],
      selectedCentroidIndices: [...this.state.selectedCentroidIndices],
      centroidTrajectories: new Map(
        Array.from(this.state.centroidTrajectories.entries()).map(([id, trajectory]) => [
          id,
          trajectory.map((p) => ({ ...p })),
        ])
      ),
    }
  }

  /**
   * Update configuration and reset
   */
  updateConfig(config: Partial<KMeansConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Manually set centroids (for interactive placement)
   */
  setCentroids(centroids: Centroid[]): void {
    if (centroids.length === this.config.k) {
      this.state.centroids = centroids.map((c) => ({ ...c }))
      this.reset()
    }
  }
}
