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
  isShowingNeighbors?: boolean // New: to show neighbors being found
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
  phase: 'processing' | 'expanding-cluster' | 'complete'
  isComplete: boolean
  noisePoints: number[] // Indices of noise points
  expandingSeeds: number[] // Points to check for expansion
  currentSeedIndex: number // Current point being expanded in the cluster
  currentClusterId: number // Cluster being built
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
      phase: 'processing',
      isComplete: false,
      noisePoints: [],
      expandingSeeds: [],
      currentSeedIndex: 0,
      currentClusterId: -1,
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
   * Step through one point - showing recursive cluster expansion
   */
  step(): DBSCANState {
    if (this.state.isComplete) {
      return this.getState()
    }

    // If we're expanding a cluster, continue with expansion steps
    if (this.state.phase === 'expanding-cluster') {
      return this.expandClusterStep()
    }

    const point = this.state.points[this.state.currentPointIndex]

    // Skip if already processed (already in a cluster or marked as noise)
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

    // Find neighbors
    const neighbors = this.findNeighbors(this.state.currentPointIndex)
    point.neighbors = neighbors
    point.type = 'visited'
    point.isProcessed = true

    // Check if it's a core point
    if (point.neighbors.length >= this.config.minPts) {
      // Core point - start a new cluster and ALL neighbors join immediately
      const clusterId = this.state.clusters.length
      this.state.currentClusterId = clusterId
      
      // Mark this point as core and assign to cluster
      point.type = 'core'
      point.clusterId = clusterId
      
      // ALL neighbors immediately join the cluster
      point.neighbors.forEach((neighborIndex) => {
        const neighbor = this.state.points[neighborIndex]
        if (neighbor.clusterId === -1) {
          neighbor.clusterId = clusterId
          if (neighbor.type === 'noise') {
            neighbor.type = 'border' // Was noise, now border
          }
        }
      })
      
      // Set up seeds for recursive expansion - check each neighbor
      this.state.expandingSeeds = [...point.neighbors]
      this.state.currentSeedIndex = 0
      this.state.phase = 'expanding-cluster'
      this.buildClusters()
      return this.getState()
    } else {
      // Noise point (may be added to cluster later if a neighbor is core)
      point.type = 'noise'
    }

    // Move to next point
    this.state.currentPointIndex++
    if (this.state.currentPointIndex >= this.state.points.length) {
      this.buildClusters()
      this.updateStatistics()
      this.state.phase = 'complete'
      this.state.isComplete = true
    }
    
    return this.getState()
  }

  /**
   * Expand cluster - called during step when in expanding phase
   */
  private expandClusterStep(): DBSCANState {
    // Recursively check each seed point
    if (this.state.currentSeedIndex < this.state.expandingSeeds.length) {
      const seedIndex = this.state.expandingSeeds[this.state.currentSeedIndex]
      const seedPoint = this.state.points[seedIndex]
      
      // If this seed hasn't been visited, check if it's also a core point
      if (seedPoint.type === 'unvisited' || seedPoint.type === 'visited') {
        seedPoint.type = 'visited'
        
        // Find its neighbors
        const seedNeighbors = this.findNeighbors(seedIndex)
        seedPoint.neighbors = seedNeighbors
        
        // If it's also a core point, add its neighbors to cluster and seeds
        if (seedNeighbors.length >= this.config.minPts) {
          seedPoint.type = 'core'
          
          // Add all its neighbors to the cluster
          seedNeighbors.forEach((neighborIndex) => {
            const neighbor = this.state.points[neighborIndex]
            if (neighbor.clusterId === -1) {
              neighbor.clusterId = this.state.currentClusterId
              if (neighbor.type === 'noise') {
                neighbor.type = 'border'
              }
            }
            
            // Add to seeds if not already there
            if (!this.state.expandingSeeds.includes(neighborIndex)) {
              this.state.expandingSeeds.push(neighborIndex)
            }
          })
        } else if (seedPoint.clusterId === this.state.currentClusterId) {
          // It's in the cluster but not a core point - border point
          seedPoint.type = 'border'
        }
      }
      
      this.state.currentSeedIndex++
      this.buildClusters()
      return this.getState()
    }
    
    // Done expanding this cluster - move to next point
    this.state.expandingSeeds = []
    this.state.currentSeedIndex = 0
    this.state.currentClusterId = -1
    this.state.currentPointIndex++
    this.state.phase = 'processing' // Go back to processing mode
    
    if (this.state.currentPointIndex >= this.state.points.length) {
      this.buildClusters()
      this.updateStatistics()
      this.state.phase = 'complete'
      this.state.isComplete = true
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
      expandingSeeds: [...this.state.expandingSeeds],
      currentSeedIndex: this.state.currentSeedIndex,
      currentClusterId: this.state.currentClusterId,
      statistics: { ...this.state.statistics },
    }
  }
}
