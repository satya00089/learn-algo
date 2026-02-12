import type { DataPoint } from '../types'

/**
 * Hierarchical Clustering Engine with step-by-step visualization
 * Agglomerative (bottom-up) clustering algorithm
 */

export interface HierarchicalPoint extends DataPoint {
  clusterId: number
  originalIndex: number
}

export interface HierarchicalCluster {
  id: number
  points: number[] // Indices of points in this cluster
  centroid: DataPoint
  color: string
  children: number[] // IDs of child clusters (for dendrogram)
  mergeDistance: number // Distance at which this cluster was formed
  size: number // Number of points in cluster
}

export interface MergeStep {
  iteration: number
  cluster1Id: number
  cluster2Id: number
  newClusterId: number
  distance: number
  remainingClusters: number
}

export interface HierarchicalState {
  points: HierarchicalPoint[]
  clusters: HierarchicalCluster[]
  currentIteration: number
  isComplete: boolean
  phase: 'initializing' | 'merging' | 'splitting' | 'complete'
  mergeHistory: MergeStep[]
  distanceMatrix: number[][] // Pairwise distances between clusters
  linkageType: 'single' | 'complete' | 'average'
  targetClusters: number // Desired number of final clusters
  clusteringType: 'agglomerative' | 'divisive'
}

export interface HierarchicalConfig {
  points: DataPoint[]
  linkageType?: 'single' | 'complete' | 'average'
  targetClusters?: number // Stop when this many clusters remain
  clusteringType?: 'agglomerative' | 'divisive'
}

export class HierarchicalClusteringEngine {
  private config: HierarchicalConfig
  private state: HierarchicalState
  private clusterColors: readonly string[] = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ]

  constructor(config: HierarchicalConfig) {
    this.config = {
      linkageType: 'average',
      targetClusters: 3,
      clusteringType: 'agglomerative',
      ...config,
    }
    this.state = this.initializeState()
  }

  private initializeState(): HierarchicalState {
    const clusteringType = this.config.clusteringType!
    const points: HierarchicalPoint[] = this.config.points.map((p, idx) => ({
      ...p,
      clusterId: clusteringType === 'agglomerative' ? idx : 0,
      originalIndex: idx,
    }))

    let clusters: HierarchicalCluster[]

    if (clusteringType === 'agglomerative') {
      // Agglomerative: Start with each point as its own cluster
      clusters = points.map((p, idx) => ({
        id: idx,
        points: [idx],
        centroid: { x: p.x, y: p.y },
        color: this.clusterColors[idx % this.clusterColors.length],
        children: [],
        mergeDistance: 0,
        size: 1,
      }))
    } else {
      // Divisive: Start with all points in one cluster
      const allPointIndices = points.map((_, idx) => idx)
      // Calculate centroid manually for initialization
      let sumX = 0
      let sumY = 0
      for (const p of points) {
        sumX += p.x
        sumY += p.y
      }
      const centroid = {
        x: sumX / points.length,
        y: sumY / points.length,
      }

      clusters = [
        {
          id: 0,
          points: allPointIndices,
          centroid,
          color: this.clusterColors[0],
          children: [],
          mergeDistance: 0,
          size: points.length,
        },
      ]
    }

    // Calculate initial distance matrix
    const distanceMatrix = this.calculateDistanceMatrix(clusters, points)

    return {
      points,
      clusters,
      currentIteration: 0,
      isComplete: false,
      phase: 'initializing',
      mergeHistory: [],
      distanceMatrix,
      linkageType: this.config.linkageType!,
      targetClusters: this.config.targetClusters!,
      clusteringType,
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
   * Calculate distance matrix between all clusters
   */
  private calculateDistanceMatrix(
    clusters: HierarchicalCluster[],
    points: HierarchicalPoint[]
  ): number[][] {
    const n = clusters.length
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(Infinity))

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.clusterDistance(clusters[i], clusters[j], points)
        matrix[i][j] = dist
        matrix[j][i] = dist
      }
      matrix[i][i] = Infinity // Can't merge with itself
    }

    return matrix
  }

  /**
   * Calculate distance between two clusters based on linkage type
   */
  private clusterDistance(
    cluster1: HierarchicalCluster,
    cluster2: HierarchicalCluster,
    points: HierarchicalPoint[]
  ): number {
    const linkageType = this.state?.linkageType || this.config.linkageType || 'average'

    if (linkageType === 'single') {
      // Single linkage: minimum distance between any two points
      let minDist = Infinity
      for (const idx1 of cluster1.points) {
        for (const idx2 of cluster2.points) {
          const dist = this.distance(points[idx1], points[idx2])
          minDist = Math.min(minDist, dist)
        }
      }
      return minDist
    } else if (linkageType === 'complete') {
      // Complete linkage: maximum distance between any two points
      let maxDist = 0
      for (const idx1 of cluster1.points) {
        for (const idx2 of cluster2.points) {
          const dist = this.distance(points[idx1], points[idx2])
          maxDist = Math.max(maxDist, dist)
        }
      }
      return maxDist
    } else {
      // Average linkage: average distance between all pairs of points
      let totalDist = 0
      let count = 0
      for (const idx1 of cluster1.points) {
        for (const idx2 of cluster2.points) {
          totalDist += this.distance(points[idx1], points[idx2])
          count++
        }
      }
      return count > 0 ? totalDist / count : Infinity
    }
  }

  /**
   * Find the two closest clusters
   */
  private findClosestClusters(): { i: number; j: number; distance: number } | null {
    let minDist = Infinity
    let mini = -1
    let minj = -1

    const n = this.state.clusters.length
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (this.state.distanceMatrix[i][j] < minDist) {
          minDist = this.state.distanceMatrix[i][j]
          mini = i
          minj = j
        }
      }
    }

    if (mini === -1 || minj === -1) return null

    return { i: mini, j: minj, distance: minDist }
  }

  /**
   * Calculate centroid of a cluster
   */
  private calculateCentroid(pointIndices: number[]): DataPoint {
    if (pointIndices.length === 0) return { x: 0, y: 0 }

    let sumX = 0
    let sumY = 0
    for (const idx of pointIndices) {
      sumX += this.state.points[idx].x
      sumY += this.state.points[idx].y
    }

    return {
      x: sumX / pointIndices.length,
      y: sumY / pointIndices.length,
    }
  }

  /**
   * Merge two clusters
   */
  private mergeClusters(idx1: number, idx2: number): void {
    const cluster1 = this.state.clusters[idx1]
    const cluster2 = this.state.clusters[idx2]

    // Create new merged cluster
    const newClusterId = this.state.clusters.length
    const mergedPoints = [...cluster1.points, ...cluster2.points]
    const newCluster: HierarchicalCluster = {
      id: newClusterId,
      points: mergedPoints,
      centroid: this.calculateCentroid(mergedPoints),
      color: cluster1.color, // Keep color from first cluster
      children: [cluster1.id, cluster2.id],
      mergeDistance: this.state.distanceMatrix[idx1][idx2],
      size: mergedPoints.length,
    }

    // Update point cluster assignments
    for (const pointIdx of mergedPoints) {
      this.state.points[pointIdx].clusterId = newClusterId
    }

    // Record merge in history
    this.state.mergeHistory.push({
      iteration: this.state.currentIteration,
      cluster1Id: cluster1.id,
      cluster2Id: cluster2.id,
      newClusterId,
      distance: this.state.distanceMatrix[idx1][idx2],
      remainingClusters: this.state.clusters.length - 1,
    })

    // Remove old clusters and add new one
    const remainingClusters = this.state.clusters.filter((_, i) => i !== idx1 && i !== idx2)
    remainingClusters.push(newCluster)
    this.state.clusters = remainingClusters

    // Recalculate distance matrix
    this.state.distanceMatrix = this.calculateDistanceMatrix(this.state.clusters, this.state.points)
  }

  /**
   * Step through one iteration (merge for agglomerative, split for divisive)
   */
  step(): HierarchicalState {
    if (this.state.isComplete) {
      return this.getState()
    }

    if (this.state.phase === 'initializing') {
      this.state.phase = this.state.clusteringType === 'agglomerative' ? 'merging' : 'splitting'
      return this.getState()
    }

    if (this.state.clusteringType === 'agglomerative') {
      return this.stepAgglomerative()
    } else {
      return this.stepDivisive()
    }
  }

  /**
   * Step for agglomerative clustering (merge closest clusters)
   */
  private stepAgglomerative(): HierarchicalState {
    if (this.state.phase !== 'merging') {
      return this.getState()
    }

    // Check if we've reached target number of clusters
    if (this.state.clusters.length <= this.state.targetClusters) {
      this.state.phase = 'complete'
      this.state.isComplete = true
      return this.getState()
    }

    // Find and merge closest clusters
    const closest = this.findClosestClusters()
    if (!closest) {
      this.state.phase = 'complete'
      this.state.isComplete = true
      return this.getState()
    }

    this.mergeClusters(closest.i, closest.j)
    this.state.currentIteration++

    return this.getState()
  }

  /**
   * Step for divisive clustering (split largest or most spread cluster)
   */
  private stepDivisive(): HierarchicalState {
    if (this.state.phase !== 'splitting') {
      return this.getState()
    }

    // Check if we've reached target number of clusters
    if (this.state.clusters.length >= this.state.targetClusters) {
      this.state.phase = 'complete'
      this.state.isComplete = true
      return this.getState()
    }

    // Find cluster with highest variance to split
    const clusterToSplit = this.findClusterToSplit()
    if (!clusterToSplit) {
      this.state.phase = 'complete'
      this.state.isComplete = true
      return this.getState()
    }

    const cluster = this.state.clusters[clusterToSplit.index]
    if (cluster.points.length < 2) {
      this.state.phase = 'complete'
      this.state.isComplete = true
      return this.getState()
    }

    this.splitCluster(clusterToSplit.index)
    this.state.currentIteration++

    return this.getState()
  }

  /**
   * Find the cluster with highest variance (most spread) to split
   */
  private findClusterToSplit(): { index: number; variance: number } | null {
    let maxVariance = -1
    let maxIdx = -1

    for (let i = 0; i < this.state.clusters.length; i++) {
      const cluster = this.state.clusters[i]
      if (cluster.points.length < 2) continue

      // Calculate variance (sum of squared distances from centroid)
      let variance = 0
      for (const pidx of cluster.points) {
        const p = this.state.points[pidx]
        const dx = p.x - cluster.centroid.x
        const dy = p.y - cluster.centroid.y
        variance += dx * dx + dy * dy
      }
      variance /= cluster.points.length

      if (variance > maxVariance) {
        maxVariance = variance
        maxIdx = i
      }
    }

    if (maxIdx === -1) return null
    return { index: maxIdx, variance: maxVariance }
  }

  /**
   * Split a cluster into two using k-means with k=2
   */
  private splitCluster(clusterIdx: number): void {
    const cluster = this.state.clusters[clusterIdx]
    const points = cluster.points.map((idx) => this.state.points[idx])

    // Simple k-means with k=2 to split the cluster
    // Initialize two centroids at extreme points
    let centroid1: DataPoint = points[0]
    let centroid2: DataPoint = points.at(-1) || points[0]

    // Run a few iterations of k-means
    for (let iter = 0; iter < 5; iter++) {
      const group1: number[] = []
      const group2: number[] = []

      // Assign points to nearest centroid
      for (const pidx of cluster.points) {
        const p = this.state.points[pidx]
        const dist1 = this.distance(p, centroid1)
        const dist2 = this.distance(p, centroid2)

        if (dist1 < dist2) {
          group1.push(pidx)
        } else {
          group2.push(pidx)
        }
      }

      // Update centroids
      if (group1.length > 0) {
        centroid1 = this.calculateCentroid(group1)
      }
      if (group2.length > 0) {
        centroid2 = this.calculateCentroid(group2)
      }

      // Store final groups
      if (iter === 4) {
        const newId1 = this.state.clusters.length
        const newId2 = newId1 + 1

        const newCluster1: HierarchicalCluster = {
          id: newId1,
          points: group1,
          centroid: centroid1,
          color: this.clusterColors[newId1 % this.clusterColors.length],
          children: [cluster.id],
          mergeDistance: 0,
          size: group1.length,
        }

        const newCluster2: HierarchicalCluster = {
          id: newId2,
          points: group2,
          centroid: centroid2,
          color: this.clusterColors[newId2 % this.clusterColors.length],
          children: [cluster.id],
          mergeDistance: 0,
          size: group2.length,
        }

        // Update point cluster IDs
        for (const pidx of group1) {
          this.state.points[pidx].clusterId = newId1
        }
        for (const pidx of group2) {
          this.state.points[pidx].clusterId = newId2
        }

        // Remove old cluster and add two new ones
        this.state.clusters = this.state.clusters.filter((_, i) => i !== clusterIdx)
        this.state.clusters.push(newCluster1, newCluster2)

        // Recalculate distance matrix
        this.state.distanceMatrix = this.calculateDistanceMatrix(
          this.state.clusters,
          this.state.points
        )
      }
    }
  }

  /**
   * Run algorithm to completion
   */
  runToCompletion(): HierarchicalState {
    while (!this.state.isComplete) {
      this.step()
    }

    return this.getState()
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Update configuration and reset
   */
  updateConfig(newConfig: Partial<HierarchicalConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.reset()
  }

  /**
   * Get current state (deep copy)
   */
  getState(): HierarchicalState {
    return {
      points: this.state.points.map((p) => ({ ...p })),
      clusters: this.state.clusters.map((c) => ({
        ...c,
        points: [...c.points],
        children: [...c.children],
        centroid: { ...c.centroid },
      })),
      currentIteration: this.state.currentIteration,
      isComplete: this.state.isComplete,
      phase: this.state.phase,
      mergeHistory: this.state.mergeHistory.map((h) => ({ ...h })),
      distanceMatrix: this.state.distanceMatrix.map((row) => [...row]),
      linkageType: this.state.linkageType,
      targetClusters: this.state.targetClusters,
      clusteringType: this.state.clusteringType,
    }
  }
}
