import type { DataPoint } from '../types'

/**
 * DBSCAN (Density-Based Spatial Clustering of Applications with Noise) Engine
 * Density-based clustering algorithm that groups points by density connectivity
 */

export type PointType = 'unvisited' | 'visited' | 'core' | 'border' | 'noise'

export interface DBSCANPoint extends DataPoint {
  id: number
  type: PointType
  clusterId: number // -1 for noise, 0+ for cluster id
  neighbors: number[] // Indices of neighboring points
  isProcessed: boolean
}

export interface DBSCANCluster {
  id: number
  points: number[] // Point indices in this cluster
  color: string
  corePoints: number[] // Indices of core points
  borderPoints: number[] // Indices of border points
}

export interface DBSCANState {
  points: DBSCANPoint[]
  clusters: DBSCANCluster[]
  currentPointIndex: number // For step-by-step visualization
  phase: 'finding-neighbors' | 'expanding-cluster' | 'complete'
  isComplete: boolean
  noisePoints: number[] // Indices of noise points
  statistics: {
    totalClusters: number
    totalNoise: number
    totalCore: number
    totalBorder: number
  }
}

export interface DBSCANConfig {
  points: DataPoint[]
  epsilon: number // Neighborhood radius
  minPts: number // Minimum points to form a dense region
}

export class DBSCANEngine {
  private config: DBSCANConfig
  private state: DBSCANState
  private clusterColors: string[] = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ]

  constructor(config: DBSCANConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): DBSCANState {
    // Initialize points
    const points: DBSCANPoint[] = this.config.points.map((p, index) => ({
      ...p,
      id: index,
      type: 'unvisited',
      clusterId: -1,
      neighbors: [],
      isProcessed: false,
    }))

    return {
      points,
      clusters: [],
      currentPointIndex: 0,
      phase: 'finding-neighbors',
      isComplete: false,
      noisePoints: [],
      statistics: {
        totalClusters: 0,
        totalNoise: 0,
        totalCore: 0,
        totalBorder: 0,
      },
    }
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private distance(p1: DataPoint, p2: DataPoint): number {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Find all neighbors within epsilon radius
   */
  private findNeighbors(pointIndex: number): number[] {
    const point = this.state.points[pointIndex]
    const neighbors: number[] = []

    for (let i = 0; i < this.state.points.length; i++) {
      if (i !== pointIndex) {
        const dist = this.distance(point, this.state.points[i])
        if (dist <= this.config.epsilon) {
          neighbors.push(i)
        }
      }
    }

    return neighbors
  }

  /**
   * Expand cluster from a core point
   */
  private expandCluster(pointIndex: number, neighbors: number[], clusterId: number): void {
    // Add point to cluster
    this.state.points[pointIndex].clusterId = clusterId
    this.state.points[pointIndex].type = 'core'

    // Process all neighbors
    const seeds = [...neighbors]
    let i = 0

    while (i < seeds.length) {
      const neighborIndex = seeds[i]
      const neighbor = this.state.points[neighborIndex]

      // Mark as visited if not already
      if (neighbor.type === 'unvisited') {
        neighbor.type = 'visited'

        // Find neighbors of this point
        const neighborNeighbors = this.findNeighbors(neighborIndex)
        neighbor.neighbors = neighborNeighbors

        // If it's a core point, add its neighbors to seeds
        if (neighborNeighbors.length >= this.config.minPts) {
          neighbor.type = 'core'
          neighborNeighbors.forEach((nn) => {
            if (!seeds.includes(nn)) {
              seeds.push(nn)
            }
          })
        }
      }

      // Add to cluster if not already assigned
      if (neighbor.clusterId === -1) {
        neighbor.clusterId = clusterId
        if (neighbor.type !== 'core') {
          neighbor.type = 'border'
        }
      }

      i++
    }
  }

  /**
   * Run DBSCAN algorithm to completion
   */
  runToCompletion(): DBSCANState {
    let clusterId = 0

    // Process each point
    for (let i = 0; i < this.state.points.length; i++) {
      const point = this.state.points[i]

      // Skip if already processed
      if (point.type !== 'unvisited') continue

      // Mark as visited
      point.type = 'visited'
      point.isProcessed = true

      // Find neighbors
      const neighbors = this.findNeighbors(i)
      point.neighbors = neighbors

      // Check if it's a core point
      if (neighbors.length >= this.config.minPts) {
        // Start new cluster
        this.expandCluster(i, neighbors, clusterId)
        clusterId++
      } else {
        // Mark as noise (may be changed to border later)
        point.type = 'noise'
      }
    }

    // Build cluster objects
    this.buildClusters()

    // Update statistics
    this.updateStatistics()

    this.state.phase = 'complete'
    this.state.isComplete = true
    this.state.currentPointIndex = this.state.points.length

    return this.getState()
  }

  /**
   * Step through one point
   */
  step(): DBSCANState {
    if (this.state.isComplete) {
      return this.getState()
    }

    const point = this.state.points[this.state.currentPointIndex]

    if (this.state.phase === 'finding-neighbors') {
      // Skip if already processed
      if (point.type !== 'unvisited') {
        this.state.currentPointIndex++
        if (this.state.currentPointIndex >= this.state.points.length) {
          this.buildClusters()
          this.updateStatistics()
          this.state.phase = 'complete'
          this.state.isComplete = true
        }
        return this.getState()
      }

      // Mark as visited
      point.type = 'visited'
      point.isProcessed = true

      // Find neighbors
      const neighbors = this.findNeighbors(this.state.currentPointIndex)
      point.neighbors = neighbors

      // Check if core point
      if (neighbors.length >= this.config.minPts) {
        const clusterId = this.state.clusters.length
        this.state.phase = 'expanding-cluster'
        this.expandCluster(this.state.currentPointIndex, neighbors, clusterId)
        this.buildClusters()
        this.state.phase = 'finding-neighbors'
      } else {
        point.type = 'noise'
      }

      this.state.currentPointIndex++
      if (this.state.currentPointIndex >= this.state.points.length) {
        this.buildClusters()
        this.updateStatistics()
        this.state.phase = 'complete'
        this.state.isComplete = true
      }
    }

    return this.getState()
  }

  /**
   * Build cluster objects from point assignments
   */
  private buildClusters(): void {
    const clusterMap = new Map<number, number[]>()

    // Group points by cluster
    this.state.points.forEach((point, index) => {
      if (point.clusterId >= 0) {
        if (!clusterMap.has(point.clusterId)) {
          clusterMap.set(point.clusterId, [])
        }
        clusterMap.get(point.clusterId)!.push(index)
      }
    })

    // Create cluster objects
    this.state.clusters = Array.from(clusterMap.entries()).map(([id, pointIndices]) => {
      const corePoints = pointIndices.filter(
        (idx) => this.state.points[idx].type === 'core'
      )
      const borderPoints = pointIndices.filter(
        (idx) => this.state.points[idx].type === 'border'
      )

      return {
        id,
        points: pointIndices,
        color: this.clusterColors[id % this.clusterColors.length],
        corePoints,
        borderPoints,
      }
    })

    // Update noise points
    this.state.noisePoints = this.state.points
      .map((p, idx) => (p.type === 'noise' ? idx : -1))
      .filter((idx) => idx >= 0)
  }

  /**
   * Update statistics
   */
  private updateStatistics(): void {
    this.state.statistics = {
      totalClusters: this.state.clusters.length,
      totalNoise: this.state.noisePoints.length,
      totalCore: this.state.points.filter((p) => p.type === 'core').length,
      totalBorder: this.state.points.filter((p) => p.type === 'border').length,
    }
  }

  /**
   * Reset algorithm
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DBSCANConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.reset()
  }

  /**
   * Get current state (deep copy for immutability)
   */
  getState(): DBSCANState {
    return {
      points: this.state.points.map((p) => ({
        ...p,
        neighbors: [...p.neighbors],
      })),
      clusters: this.state.clusters.map((c) => ({
        ...c,
        points: [...c.points],
        corePoints: [...c.corePoints],
        borderPoints: [...c.borderPoints],
      })),
      currentPointIndex: this.state.currentPointIndex,
      phase: this.state.phase,
      isComplete: this.state.isComplete,
      noisePoints: [...this.state.noisePoints],
      statistics: { ...this.state.statistics },
    }
  }
}
