import type { KNNConfig, KNNResult, KNNNeighbor, Point2D } from '../types'

/**
 * K-Nearest Neighbors Classification Engine
 */
export class KNNEngine {
  private config: KNNConfig

  constructor(config: KNNConfig) {
    this.config = config
  }

  /**
   * Calculate Euclidean distance between two points with improved numerical stability
   */
  private euclideanDistance(p1: Point2D, p2: Point2D): number {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y

    // Handle exact equality case
    if (dx === 0 && dy === 0) {
      return 0
    }

    // Use more numerically stable calculation
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Handle potential NaN from invalid operations
    return isNaN(distance) ? 0 : distance
  }

  /**
   * Classify a test point using KNN
   */
  classify(testPoint: Point2D): KNNResult {
    if (this.config.points.length === 0) {
      return {
        predictedLabel: -1,
        neighbors: [],
        distances: [],
      }
    }

    // Calculate distances to all training points
    const distances: KNNNeighbor[] = this.config.points.map((point, index) => ({
      point,
      distance: this.euclideanDistance(testPoint, point),
      index,
    }))

    // Sort by distance (ascending)
    distances.sort((a, b) => a.distance - b.distance)

    // Take k nearest neighbors
    const k = Math.min(this.config.k, distances.length)
    const neighbors = distances.slice(0, k)

    // Count votes for each class
    const votes = new Map<number, number>()
    neighbors.forEach((neighbor) => {
      const label = neighbor.point.label
      votes.set(label, (votes.get(label) || 0) + 1)
    })

    // Find the class with most votes
    let maxVotes = 0
    let predictedLabel = -1
    for (const [label, count] of votes) {
      if (count > maxVotes) {
        maxVotes = count
        predictedLabel = label
      }
    }

    return {
      predictedLabel,
      neighbors,
      distances: neighbors.map((n) => n.distance),
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<KNNConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): KNNConfig {
    return { ...this.config }
  }

  /**
   * Get decision boundary points for visualization
   */
  getDecisionBoundaryPoints(gridSize: number = 20): { point: Point2D; label: number }[] {
    const points: { point: Point2D; label: number }[] = []

    // Find bounds
    const xValues = this.config.points.map((p) => p.x)
    const yValues = this.config.points.map((p) => p.y)
    const xMin = Math.min(...xValues) - 1
    const xMax = Math.max(...xValues) + 1
    const yMin = Math.min(...yValues) - 1
    const yMax = Math.max(...yValues) + 1

    // Create grid
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const x = xMin + (i / gridSize) * (xMax - xMin)
        const y = yMin + (j / gridSize) * (yMax - yMin)

        const result = this.classify({ x, y })
        points.push({
          point: { x, y },
          label: result.predictedLabel,
        })
      }
    }

    return points
  }
}
