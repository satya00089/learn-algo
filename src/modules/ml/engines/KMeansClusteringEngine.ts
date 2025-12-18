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
  phase: 'assign' | 'update' | 'complete'
  currentPointIndex: number // For step-by-step assignment visualization
  history: KMeansStep[]
  inertia: number // Sum of squared distances (within-cluster sum of squares)
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
}

export class KMeansClusteringEngine {
  private config: KMeansConfig
  private state: KMeansState

  constructor(config: KMeansConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): KMeansState {
    // Initialize centroids
    const centroids = this.config.initialCentroids 
      ? this.config.initialCentroids 
      : this.initializeRandomCentroids()

    // Initialize points with no cluster assignment
    const points: ClusteredPoint[] = this.config.points.map(p => ({
      ...p,
      clusterId: -1,
      distance: 0,
    }))

    return {
      centroids,
      points,
      iteration: 0,
      isConverged: false,
      phase: 'assign',
      currentPointIndex: 0,
      history: [],
      inertia: 0,
    }
  }

  /**
   * Initialize centroids using K-Means++ algorithm for better initialization
   */
  private initializeRandomCentroids(): Centroid[] {
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
      const clusterPoints = this.state.points.filter(p => p.clusterId === clusterId)

      if (clusterPoints.length === 0) {
        // Keep old centroid if no points assigned
        newCentroids.push({ ...this.state.centroids[clusterId] })
        continue
      }

      // Calculate mean position
      const meanX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length
      const meanY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length

      const oldCentroid = this.state.centroids[clusterId]
      const moved = Math.abs(oldCentroid.x - meanX) > 0.001 || Math.abs(oldCentroid.y - meanY) > 0.001

      if (moved) {
        hasChanged = true
      }

      newCentroids.push({
        x: meanX,
        y: meanY,
        clusterId,
      })
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
   * Perform one step of the algorithm
   */
  step(): void {
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
        centroids: this.state.centroids.map(c => ({ ...c })),
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
      centroids: this.state.centroids.map(c => ({ ...c })),
      points: this.state.points.map(p => ({ ...p })),
      iteration: this.state.iteration,
      isConverged: this.state.isConverged,
      phase: this.state.phase,
      currentPointIndex: this.state.currentPointIndex,
      history: [...this.state.history],
      inertia: this.state.inertia,
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
      this.state.centroids = centroids.map(c => ({ ...c }))
      this.reset()
    }
  }
}
