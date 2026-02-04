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
  currentStep: number // Current step in the algorithm
  totalSteps: number // Total steps needed
  stepDescription: string // Description of current step
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
      currentStep: 0,
      totalSteps: this.getTotalSteps(config.method),
      stepDescription: 'Initializing...',
    }
    this.initialize()
  }

  private getTotalSteps(method: string): number {
    switch (method) {
      case 'isolation-forest':
        return (this.config.numTrees || 100) + 2 // Trees + scoring + threshold
      case 'one-class-svm':
        return 3 // Center + boundary + threshold
      case 'lof':
        return this.config.points.length + 2 // Per-point computation + normalization + threshold
      case 'z-score':
        return 3 // Statistics + scoring + threshold
      case 'iqr':
        return 3 // Quartiles + scoring + threshold
      default:
        return 1
    }
  }

  private initialize() {
    // Convert DataPoints to AnomalyPoints
    this.state.points = this.config.points.map(point => ({
      ...point,
      anomalyScore: 0,
      isAnomaly: false,
      method: this.config.method,
    }))

    // Reset step tracking
    this.state.currentStep = 0
    this.state.isComplete = false
    this.state.stepDescription = 'Ready to start anomaly detection'
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

  private updateAnomaliesFromScores() {
    // For intermediate visualization, use a dynamic threshold based on current scores
    const scores = this.state.points.map(p => p.anomalyScore).filter(s => s > 0).sort((a, b) => b - a)

    if (scores.length > 0) {
      // Use contamination rate to determine how many points to mark as anomalies
      const anomalyCount = Math.max(1, Math.floor(this.state.contamination * this.state.points.length))
      const threshold = scores[Math.min(anomalyCount - 1, scores.length - 1)] || 0

      this.state.points.forEach(point => {
        point.isAnomaly = point.anomalyScore >= threshold
      })
    }
  }

  // Helper methods for Isolation Forest
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

  // Helper method for IQR
  private quantile(sortedArray: number[], p: number): number {
    const index = (sortedArray.length - 1) * p
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    if (upper >= sortedArray.length) return sortedArray.at(-1)!
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight
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

  /**
   * Perform one step of anomaly detection
   */
  public step(): void {
    if (this.state.isComplete) return

    switch (this.config.method) {
      case 'isolation-forest':
        this.stepIsolationForest()
        break
      case 'one-class-svm':
        this.stepOneClassSVM()
        break
      case 'lof':
        this.stepLOF()
        break
      case 'z-score':
        this.stepZScore()
        break
      case 'iqr':
        this.stepIQR()
        break
    }
  }

  /**
   * Run anomaly detection to completion
   */
  public run(): void {
    while (!this.state.isComplete) {
      this.step()
    }
  }

  private stepIsolationForest(): void {
    const numTrees = this.config.numTrees || 100

    this.state.isolationTrees ??= []

    if (this.state.currentStep < numTrees) {
      // Build next tree
      const tree = this.buildIsolationTree([...this.state.points], 0, this.config.maxDepth || 8)
      if (tree) {
        this.state.isolationTrees.push(tree)
      }
      this.state.currentStep++
      this.state.stepDescription = `Building isolation tree ${this.state.currentStep}/${numTrees}`
    } else if (this.state.currentStep === numTrees) {
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

      this.state.currentStep++
      this.state.stepDescription = 'Calculating anomaly scores'
      this.updateAnomaliesFromScores()
    } else {
      // Set final threshold and mark anomalies
      this.setThreshold()
      this.state.isComplete = true
      this.state.stepDescription = 'Detection complete'
    }
  }

  private stepOneClassSVM(): void {
    if (this.state.currentStep === 0) {
      // Compute center (mean of all points)
      const sum = this.state.points.reduce(
        (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
        { x: 0, y: 0 }
      )
      this.state.svmCenter = {
        x: sum.x / this.state.points.length,
        y: sum.y / this.state.points.length,
      }
      this.state.currentStep++
      this.state.stepDescription = 'Computing data center'
    } else if (this.state.currentStep === 1) {
      // Compute radius (distance to farthest point)
      let maxDistance = 0
      this.state.points.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - (this.state.svmCenter?.x || 0), 2) +
          Math.pow(point.y - (this.state.svmCenter?.y || 0), 2)
        )
        maxDistance = Math.max(maxDistance, distance)
      })
      this.state.svmRadius = maxDistance * (1 - (this.config.nu || 0.1))

      // Calculate anomaly scores
      this.state.points.forEach(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - (this.state.svmCenter?.x || 0), 2) +
          Math.pow(point.y - (this.state.svmCenter?.y || 0), 2)
        )
        point.anomalyScore = distance / (this.state.svmRadius || 1)
      })

      this.state.currentStep++
      this.state.stepDescription = 'Computing decision boundary'
      this.updateAnomaliesFromScores()
    } else {
      // Set final threshold and mark anomalies
      this.setThreshold()
      this.state.isComplete = true
      this.state.stepDescription = 'Detection complete'
    }
  }

  private stepLOF(): void {
    const k = this.config.k || 5

    if (this.state.currentStep < this.state.points.length) {
      // Compute LOF for next point
      const point = this.state.points[this.state.currentStep]
      const distances = this.state.points.map(other => ({
        point: other,
        distance: Math.sqrt(
          Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)
        ),
      })).sort((a, b) => a.distance - b.distance)

      // Get k nearest neighbors (excluding self)
      const kNeighbors = distances.slice(1, k + 1)

      if (kNeighbors.length >= k) {
        // Compute local reachability density
        const reachabilityDistances = kNeighbors.map(neighbor => {
          const neighborDistances = this.state.points.map(other => ({
            point: other,
            distance: Math.sqrt(
              Math.pow(neighbor.point.x - other.x, 2) +
              Math.pow(neighbor.point.y - other.y, 2)
            ),
          })).sort((a, b) => a.distance - b.distance)

          const neighborKNeighbors = neighborDistances.slice(1, k + 1)
          const kDistance = neighborKNeighbors.at(-1)?.distance || 1

          return Math.max(kDistance, neighbor.distance)
        })

        const lrd = k / reachabilityDistances.reduce((sum, dist) => sum + dist, 0)

        // Compute LOF
        const neighborLRDs = kNeighbors.map(neighbor => {
          const neighborDistances = this.state.points.map(other => ({
            point: other,
            distance: Math.sqrt(
              Math.pow(neighbor.point.x - other.x, 2) +
              Math.pow(neighbor.point.y - other.y, 2)
            ),
          })).sort((a, b) => a.distance - b.distance)

          const neighborKNeighbors = neighborDistances.slice(1, k + 1)
          const reachabilityDists = neighborKNeighbors.map(n => {
            const kDist = neighborKNeighbors.at(-1)?.distance || 1
            return Math.max(kDist, n.distance)
          })

          return k / reachabilityDists.reduce((sum, dist) => sum + dist, 0)
        })

        const lof = neighborLRDs.reduce((sum, neighborLRD) => sum + neighborLRD, 0) / neighborLRDs.length / lrd
        point.anomalyScore = lof
      }

      this.state.currentStep++
      this.state.stepDescription = `Computing LOF for point ${this.state.currentStep}/${this.state.points.length}`
      this.updateAnomaliesFromScores()
    } else if (this.state.currentStep === this.state.points.length) {
      // Normalize scores
      const maxScore = Math.max(...this.state.points.map(p => p.anomalyScore))
      this.state.points.forEach(point => {
        point.anomalyScore = point.anomalyScore / maxScore
      })
      this.state.currentStep++
      this.state.stepDescription = 'Normalizing anomaly scores'
      this.updateAnomaliesFromScores()
    } else {
      // Set final threshold and mark anomalies
      this.setThreshold()
      this.state.isComplete = true
      this.state.stepDescription = 'Detection complete'
    }
  }

  private stepZScore(): void {
    if (this.state.currentStep === 0) {
      // Compute mean and standard deviation
      const sum = this.state.points.reduce(
        (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
        { x: 0, y: 0 }
      )
      const mean = {
        x: sum.x / this.state.points.length,
        y: sum.y / this.state.points.length,
      }

      const variance = this.state.points.reduce(
        (acc, point) => ({
          x: acc.x + Math.pow(point.x - mean.x, 2),
          y: acc.y + Math.pow(point.y - mean.y, 2),
        }),
        { x: 0, y: 0 }
      )

      const std = {
        x: Math.sqrt(variance.x / this.state.points.length),
        y: Math.sqrt(variance.y / this.state.points.length),
      }

      this.state.statisticalParams = { mean, std } as any
      this.state.currentStep++
      this.state.stepDescription = 'Computing statistical parameters'
    } else if (this.state.currentStep === 1) {
      // Calculate z-scores
      this.state.points.forEach(point => {
        const zX = Math.abs(point.x - (this.state.statisticalParams?.mean.x || 0)) / Math.max(this.state.statisticalParams?.std.x || 1, 0.001)
        const zY = Math.abs(point.y - (this.state.statisticalParams?.mean.y || 0)) / Math.max(this.state.statisticalParams?.std.y || 1, 0.001)
        point.anomalyScore = Math.max(zX, zY)
      })
      this.state.currentStep++
      this.state.stepDescription = 'Calculating z-scores'
      this.updateAnomaliesFromScores()
    } else {
      // Set final threshold and mark anomalies
      this.setThreshold()
      this.state.isComplete = true
      this.state.stepDescription = 'Detection complete'
    }
  }

  private stepIQR(): void {
    if (this.state.currentStep === 0) {
      // Sort coordinates
      const xValues = this.state.points.map(p => p.x).sort((a, b) => a - b)
      const yValues = this.state.points.map(p => p.y).sort((a, b) => a - b)

      // Compute quartiles
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

      this.state.statisticalParams = { q1, q3, iqr } as any
      this.state.currentStep++
      this.state.stepDescription = 'Computing quartiles and IQR'
    } else if (this.state.currentStep === 1) {
      // Calculate IQR-based anomaly scores for all points
      const q1 = this.state.statisticalParams?.q1!
      const q3 = this.state.statisticalParams?.q3!
      const iqr = this.state.statisticalParams?.iqr!

      this.state.points.forEach(point => {
        // Calculate bounds using 1.5 * IQR rule
        const lowerBoundX = q1.x - 1.5 * iqr.x
        const upperBoundX = q3.x + 1.5 * iqr.x
        const lowerBoundY = q1.y - 1.5 * iqr.y
        const upperBoundY = q3.y + 1.5 * iqr.y

        // Calculate normalized distance from bounds for each dimension
        let scoreX = 0
        let scoreY = 0

        if (point.x < lowerBoundX) {
          scoreX = (lowerBoundX - point.x) / Math.max(iqr.x, 0.001)
        } else if (point.x > upperBoundX) {
          scoreX = (point.x - upperBoundX) / Math.max(iqr.x, 0.001)
        } else {
          // Point is within bounds, calculate distance from median
          const median = (q1.x + q3.x) / 2
          scoreX = Math.abs(point.x - median) / Math.max(iqr.x, 0.001) * 0.5
        }

        if (point.y < lowerBoundY) {
          scoreY = (lowerBoundY - point.y) / Math.max(iqr.y, 0.001)
        } else if (point.y > upperBoundY) {
          scoreY = (point.y - upperBoundY) / Math.max(iqr.y, 0.001)
        } else {
          // Point is within bounds, calculate distance from median
          const median = (q1.y + q3.y) / 2
          scoreY = Math.abs(point.y - median) / Math.max(iqr.y, 0.001) * 0.5
        }

        // Use the maximum score across dimensions
        point.anomalyScore = Math.max(scoreX, scoreY)
      })
      
      this.state.currentStep++
      this.state.stepDescription = 'Calculating IQR-based scores'
      this.updateAnomaliesFromScores()
    } else {
      // Set final threshold and mark anomalies
      this.setThreshold()
      this.state.isComplete = true
      this.state.stepDescription = 'Detection complete'
    }
  }
}