import type { DataPoint } from '../types'

/**
 * Anomaly Detection Engine
 * Implements multiple anomaly detection algorithms for identifying outliers
 */

export interface AnomalyPoint extends DataPoint {
  anomalyScore: number // Higher score = more anomalous
  isAnomaly: boolean
  method: string // Which detection method was used
}

export interface IsolationTree {
  left?: IsolationTree
  right?: IsolationTree
  splitAttribute?: number // 0 for x, 1 for y
  splitValue?: number
  size: number // Number of points in this subtree
}

export interface AnomalyDetectionState {
  points: AnomalyPoint[]
  method: 'isolation-forest' | 'one-class-svm' | 'lof' | 'z-score' | 'iqr'
  contamination: number // Expected proportion of anomalies (0-1)
  threshold: number // Decision threshold
  isComplete: boolean
  // Method-specific state
  isolationTrees?: IsolationTree[]
  svmCenter?: DataPoint
  svmRadius?: number
  lofScores?: number[]
  statisticalParams?: {
    mean: DataPoint
    std: DataPoint
    q1: DataPoint
    q3: DataPoint
    iqr: DataPoint
  }
}

export interface AnomalyDetectionConfig {
  points: DataPoint[]
  method: 'isolation-forest' | 'one-class-svm' | 'lof' | 'z-score' | 'iqr'
  contamination: number
  // Method-specific parameters
  numTrees?: number // For Isolation Forest
  maxDepth?: number // For Isolation Forest
  kernel?: 'rbf' | 'linear' // For One-Class SVM
  nu?: number // For One-Class SVM (0-1)
  k?: number // For LOF (number of neighbors)
}

export class AnomalyDetectionEngine {
  private config: AnomalyDetectionConfig
  private state: AnomalyDetectionState

  constructor(config: AnomalyDetectionConfig) {
    this.config = config
    this.state = {
      points: [],
      method: config.method,
      contamination: config.contamination,
      threshold: 0,
      isComplete: false,
    }
    this.initialize()
  }

  private initialize() {
    // Convert DataPoints to AnomalyPoints
    this.state.points = this.config.points.map(point => ({
      ...point,
      anomalyScore: 0,
      isAnomaly: false,
      method: this.config.method,
    }))

    // Run the selected anomaly detection method
    switch (this.config.method) {
      case 'isolation-forest':
        this.runIsolationForest()
        break
      case 'one-class-svm':
        this.runOneClassSVM()
        break
      case 'lof':
        this.runLOF()
        break
      case 'z-score':
        this.runZScore()
        break
      case 'iqr':
        this.runIQR()
        break
    }

    this.state.isComplete = true
  }

  private runIsolationForest() {
    const numTrees = this.config.numTrees || 100
    const maxDepth = this.config.maxDepth || 8

    this.state.isolationTrees = []

    // Build isolation forest
    for (let i = 0; i < numTrees; i++) {
      const tree = this.buildIsolationTree([...this.state.points], 0, maxDepth)
      if (tree) {
        this.state.isolationTrees.push(tree)
      }
    }

    // Calculate anomaly scores
    this.state.points.forEach(point => {
      let avgPathLength = 0

      this.state.isolationTrees!.forEach(tree => {
        const pathLength = this.getPathLength(tree, point, 0)
        avgPathLength += pathLength
      })

      avgPathLength /= this.state.isolationTrees!.length

      // Normalize path length (shorter paths = more anomalous)
      const n = this.state.points.length
      const c = this.cFactor(n)
      const score = Math.pow(2, -avgPathLength / c)

      point.anomalyScore = score
    })

    this.setThreshold()
  }

  private buildIsolationTree(points: AnomalyPoint[], depth: number, maxDepth: number): IsolationTree | null {
    if (points.length <= 1 || depth >= maxDepth) {
      return { size: points.length }
    }

    // Randomly select split attribute (x or y)
    const splitAttribute = Math.random() < 0.5 ? 0 : 1

    // Find min and max values for the selected attribute
    let minVal = Infinity
    let maxVal = -Infinity

    points.forEach(point => {
      const val = splitAttribute === 0 ? point.x : point.y
      minVal = Math.min(minVal, val)
      maxVal = Math.max(maxVal, val)
    })

    if (minVal === maxVal) {
      return { size: points.length }
    }

    // Random split value
    const splitValue = minVal + Math.random() * (maxVal - minVal)

    const leftPoints: AnomalyPoint[] = []
    const rightPoints: AnomalyPoint[] = []

    points.forEach(point => {
      const val = splitAttribute === 0 ? point.x : point.y
      if (val < splitValue) {
        leftPoints.push(point)
      } else {
        rightPoints.push(point)
      }
    })

    const leftTree = this.buildIsolationTree(leftPoints, depth + 1, maxDepth)
    const rightTree = this.buildIsolationTree(rightPoints, depth + 1, maxDepth)

    return {
      left: leftTree || undefined,
      right: rightTree || undefined,
      splitAttribute,
      splitValue,
      size: points.length,
    }
  }

  private getPathLength(tree: IsolationTree, point: AnomalyPoint, depth: number): number {
    if (!tree.left && !tree.right) {
      return depth + this.cFactor(tree.size)
    }

    const val = tree.splitAttribute === 0 ? point.x : point.y

    if (val < (tree.splitValue || 0)) {
      return tree.left ? this.getPathLength(tree.left, point, depth + 1) : depth + 1
    } else {
      return tree.right ? this.getPathLength(tree.right, point, depth + 1) : depth + 1
    }
  }

  private cFactor(n: number): number {
    if (n <= 1) return 0
    if (n === 2) return 1
    return 2 * (Math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n
  }

  private runOneClassSVM() {
    const nu = this.config.nu || 0.1

    // Simplified One-Class SVM using distance-based approach
    // Find the center of the data
    let sumX = 0
    let sumY = 0

    this.state.points.forEach(point => {
      sumX += point.x
      sumY += point.y
    })

    this.state.svmCenter = {
      x: sumX / this.state.points.length,
      y: sumY / this.state.points.length,
    }

    // Calculate distances from center
    const distances: number[] = []
    this.state.points.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - this.state.svmCenter!.x, 2) +
        Math.pow(point.y - this.state.svmCenter!.y, 2)
      )
      distances.push(distance)
    })

    // Sort distances and find radius (nu-quantile)
    distances.sort((a, b) => a - b)
    const quantileIndex = Math.floor(nu * distances.length)
    this.state.svmRadius = distances[quantileIndex]

    // Calculate anomaly scores
    this.state.points.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - this.state.svmCenter!.x, 2) +
        Math.pow(point.y - this.state.svmCenter!.y, 2)
      )

      // Score based on distance from center relative to radius
      point.anomalyScore = Math.max(0, distance - this.state.svmRadius!) / this.state.svmRadius!
    })

    this.setThreshold()
  }

  private runLOF() {
    const k = this.config.k || 5

    this.state.lofScores = []

    this.state.points.forEach((point) => {
      // Find k nearest neighbors
      const neighbors = this.findKNearestNeighbors(point, k)

      // Calculate local reachability density
      const lrd = this.calculateLocalReachabilityDensity(point, neighbors, k)

      // Calculate LOF score
      let lofSum = 0
      neighbors.forEach(neighbor => {
        const neighborLrd = this.calculateLocalReachabilityDensity(neighbor, this.findKNearestNeighbors(neighbor, k), k)
        lofSum += neighborLrd / lrd
      })

      const lof = lofSum / k
      this.state.lofScores!.push(lof)
      point.anomalyScore = lof
    })

    this.setThreshold()
  }

  private findKNearestNeighbors(point: AnomalyPoint, k: number): AnomalyPoint[] {
    const distances: { point: AnomalyPoint; distance: number }[] = []

    this.state.points.forEach(otherPoint => {
      if (otherPoint !== point) {
        const distance = Math.sqrt(
          Math.pow(point.x - otherPoint.x, 2) +
          Math.pow(point.y - otherPoint.y, 2)
        )
        distances.push({ point: otherPoint, distance })
      }
    })

    distances.sort((a, b) => a.distance - b.distance)
    return distances.slice(0, k).map(d => d.point)
  }

  private calculateLocalReachabilityDensity(point: AnomalyPoint, neighbors: AnomalyPoint[], k: number): number {
    let reachabilitySum = 0

    neighbors.forEach(neighbor => {
      const distance = Math.sqrt(
        Math.pow(point.x - neighbor.x, 2) +
        Math.pow(point.y - neighbor.y, 2)
      )

      // k-distance of neighbor
      const kNeighbors = this.findKNearestNeighbors(neighbor, k)
      const kDistance = kNeighbors.length > 0 ?
        Math.sqrt(Math.pow(neighbor.x - kNeighbors[kNeighbors.length - 1].x, 2) +
                 Math.pow(neighbor.y - kNeighbors[kNeighbors.length - 1].y, 2)) : distance

      reachabilitySum += Math.max(kDistance, distance)
    })

    return k / reachabilitySum
  }

  private runZScore() {
    // Calculate mean and standard deviation
    let sumX = 0
    let sumY = 0

    this.state.points.forEach(point => {
      sumX += point.x
      sumY += point.y
    })

    const mean = {
      x: sumX / this.state.points.length,
      y: sumY / this.state.points.length,
    }

    let sumSqX = 0
    let sumSqY = 0

    this.state.points.forEach(point => {
      sumSqX += Math.pow(point.x - mean.x, 2)
      sumSqY += Math.pow(point.y - mean.y, 2)
    })

    const std = {
      x: Math.sqrt(sumSqX / this.state.points.length),
      y: Math.sqrt(sumSqY / this.state.points.length),
    }

    this.state.statisticalParams = {
      mean,
      std,
      q1: { x: 0, y: 0 }, // Not used for z-score
      q3: { x: 0, y: 0 },
      iqr: { x: 0, y: 0 },
    }

    // Calculate z-scores
    this.state.points.forEach(point => {
      const zX = Math.abs((point.x - mean.x) / std.x)
      const zY = Math.abs((point.y - mean.y) / std.y)
      const zScore = Math.max(zX, zY) // Use maximum z-score

      point.anomalyScore = zScore
    })

    this.setThreshold()
  }

  private runIQR() {
    // Calculate quartiles for x and y separately
    const xValues = this.state.points.map(p => p.x).sort((a, b) => a - b)
    const yValues = this.state.points.map(p => p.y).sort((a, b) => a - b)

    const q1 = {
      x: this.quantile(xValues, 0.25),
      y: this.quantile(yValues, 0.25),
    }

    const q3 = {
      x: this.quantile(xValues, 0.75),
      y: this.quantile(yValues, 0.75),
    }

    const iqr = {
      x: q3.x - q1.x,
      y: q3.y - q1.y,
    }

    this.state.statisticalParams = {
      mean: { x: 0, y: 0 }, // Not used for IQR
      std: { x: 0, y: 0 },
      q1,
      q3,
      iqr,
    }

    // Calculate IQR-based anomaly scores
    this.state.points.forEach(point => {
      const lowerBoundX = q1.x - 1.5 * iqr.x
      const upperBoundX = q3.x + 1.5 * iqr.x
      const lowerBoundY = q1.y - 1.5 * iqr.y
      const upperBoundY = q3.y + 1.5 * iqr.y

      const isOutlierX = point.x < lowerBoundX || point.x > upperBoundX
      const isOutlierY = point.y < lowerBoundY || point.y > upperBoundY

      // Score based on how far outside the bounds
      let score = 0
      if (isOutlierX) {
        const bound = point.x < lowerBoundX ? lowerBoundX : upperBoundX
        score = Math.max(score, Math.abs(point.x - bound) / iqr.x)
      }
      if (isOutlierY) {
        const bound = point.y < lowerBoundY ? lowerBoundY : upperBoundY
        score = Math.max(score, Math.abs(point.y - bound) / iqr.y)
      }

      point.anomalyScore = score
    })

    this.setThreshold()
  }

  private quantile(sortedArray: number[], p: number): number {
    const index = (sortedArray.length - 1) * p
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1]
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
  }

  private setThreshold() {
    // Sort anomaly scores
    const scores = this.state.points.map(p => p.anomalyScore).sort((a, b) => b - a)

    // Set threshold based on contamination rate
    const thresholdIndex = Math.floor(this.state.contamination * scores.length)
    this.state.threshold = scores[thresholdIndex] || 0

    // Mark anomalies
    this.state.points.forEach(point => {
      point.isAnomaly = point.anomalyScore >= this.state.threshold
    })
  }

  public getState(): AnomalyDetectionState {
    return { ...this.state }
  }

  public reset() {
    this.initialize()
  }

  public updateConfig(newConfig: Partial<AnomalyDetectionConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.reset()
  }
}