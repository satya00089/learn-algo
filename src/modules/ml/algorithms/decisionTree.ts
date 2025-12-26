import type { Point2D } from '../types'

/**
 * Pure algorithm functions for Decision Tree
 * NO UI, NO Canvas, NO side effects
 * Fully testable
 */

export interface DataPoint {
  x: number
  y: number
  label: 0 | 1 // Binary classification
}

export interface TreeNode {
  feature?: 'x' | 'y'
  threshold?: number
  left?: TreeNode
  right?: TreeNode
  prediction?: 0 | 1
  isLeaf: boolean
  depth: number
  samples: number
  giniImpurity?: number
  entropy?: number
}

export interface SplitResult {
  feature: 'x' | 'y'
  threshold: number
  gain: number
  leftData: DataPoint[]
  rightData: DataPoint[]
}

/**
 * Calculate entropy for a dataset
 */
export function calculateEntropy(data: DataPoint[]): number {
  if (data.length === 0) return 0

  const counts = { 0: 0, 1: 0 }
  for (const point of data) {
    counts[point.label]++
  }

  let entropy = 0
  for (const label of [0, 1] as const) {
    const probability = counts[label] / data.length
    if (probability > 0) {
      entropy -= probability * Math.log2(probability)
    }
  }

  return entropy
}

/**
 * Calculate Gini impurity for a dataset
 */
export function calculateGiniImpurity(data: DataPoint[]): number {
  if (data.length === 0) return 0

  const counts = { 0: 0, 1: 0 }
  for (const point of data) {
    counts[point.label]++
  }

  let gini = 1
  for (const label of [0, 1] as const) {
    const probability = counts[label] / data.length
    gini -= probability * probability
  }

  return gini
}

/**
 * Get majority class label
 */
export function getMajorityLabel(data: DataPoint[]): 0 | 1 {
  const counts = { 0: 0, 1: 0 }
  for (const point of data) {
    counts[point.label]++
  }
  return counts[1] > counts[0] ? 1 : 0
}

/**
 * Find best split for a dataset
 */
export function findBestSplit(
  data: DataPoint[],
  criterion: 'entropy' | 'gini' = 'gini'
): SplitResult | null {
  if (data.length === 0) return null

  const calculateImpurity = criterion === 'entropy' ? calculateEntropy : calculateGiniImpurity

  const parentImpurity = calculateImpurity(data)
  let bestGain = 0
  let bestSplit: SplitResult | null = null

  // Try splitting on x and y features
  for (const feature of ['x', 'y'] as const) {
    // Get unique values for this feature
    const values = data.map((d) => d[feature]).sort((a, b) => a - b)
    const uniqueValues = [...new Set(values)]

    // Try split points between consecutive unique values
    for (let i = 0; i < uniqueValues.length - 1; i++) {
      const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2

      // Split data
      const leftData = data.filter((d) => d[feature] <= threshold)
      const rightData = data.filter((d) => d[feature] > threshold)

      if (leftData.length === 0 || rightData.length === 0) continue

      // Calculate weighted impurity after split
      const leftImpurity = calculateImpurity(leftData)
      const rightImpurity = calculateImpurity(rightData)
      const weightedImpurity =
        (leftData.length / data.length) * leftImpurity +
        (rightData.length / data.length) * rightImpurity

      // Calculate information gain
      const gain = parentImpurity - weightedImpurity

      if (gain > bestGain) {
        bestGain = gain
        bestSplit = {
          feature,
          threshold,
          gain,
          leftData,
          rightData,
        }
      }
    }
  }

  return bestSplit
}

/**
 * Build decision tree recursively
 */
export function buildTree(
  data: DataPoint[],
  maxDepth: number = 5,
  minSamplesSplit: number = 2,
  criterion: 'entropy' | 'gini' = 'gini',
  currentDepth: number = 0
): TreeNode {
  const calculateImpurity = criterion === 'entropy' ? calculateEntropy : calculateGiniImpurity

  // Base cases for leaf node
  if (currentDepth >= maxDepth || data.length < minSamplesSplit || calculateImpurity(data) === 0) {
    return {
      isLeaf: true,
      prediction: getMajorityLabel(data),
      depth: currentDepth,
      samples: data.length,
      giniImpurity: calculateGiniImpurity(data),
      entropy: calculateEntropy(data),
    }
  }

  // Find best split
  const split = findBestSplit(data, criterion)

  // If no good split found, make leaf
  if (!split || split.gain === 0) {
    return {
      isLeaf: true,
      prediction: getMajorityLabel(data),
      depth: currentDepth,
      samples: data.length,
      giniImpurity: calculateGiniImpurity(data),
      entropy: calculateEntropy(data),
    }
  }

  // Recursively build left and right subtrees
  const left = buildTree(split.leftData, maxDepth, minSamplesSplit, criterion, currentDepth + 1)
  const right = buildTree(split.rightData, maxDepth, minSamplesSplit, criterion, currentDepth + 1)

  return {
    feature: split.feature,
    threshold: split.threshold,
    left,
    right,
    isLeaf: false,
    depth: currentDepth,
    samples: data.length,
    giniImpurity: calculateGiniImpurity(data),
    entropy: calculateEntropy(data),
  }
}

/**
 * Predict class for a single point
 */
export function predictPoint(point: Point2D, tree: TreeNode): 0 | 1 {
  if (tree.isLeaf) {
    return tree.prediction!
  }

  const featureValue = point[tree.feature!]
  if (featureValue <= tree.threshold!) {
    return predictPoint(point, tree.left!)
  } else {
    return predictPoint(point, tree.right!)
  }
}

/**
 * Calculate accuracy on a test set
 */
export function calculateAccuracy(data: DataPoint[], tree: TreeNode): number {
  if (data.length === 0) return 0

  let correct = 0
  for (const point of data) {
    const predicted = predictPoint(point, tree)
    if (predicted === point.label) {
      correct++
    }
  }

  return correct / data.length
}

/**
 * Get all nodes at a specific depth (for visualization)
 */
export function getNodesAtDepth(tree: TreeNode, targetDepth: number): TreeNode[] {
  if (tree.depth === targetDepth) {
    return [tree]
  }

  const nodes: TreeNode[] = []
  if (tree.left && !tree.isLeaf) {
    nodes.push(...getNodesAtDepth(tree.left, targetDepth))
  }
  if (tree.right && !tree.isLeaf) {
    nodes.push(...getNodesAtDepth(tree.right, targetDepth))
  }

  return nodes
}

/**
 * Count total nodes in tree
 */
export function countNodes(tree: TreeNode): number {
  if (tree.isLeaf) return 1
  return 1 + countNodes(tree.left!) + countNodes(tree.right!)
}

/**
 * Get maximum depth of tree
 */
export function getTreeDepth(tree: TreeNode): number {
  if (tree.isLeaf) return tree.depth
  return Math.max(getTreeDepth(tree.left!), getTreeDepth(tree.right!))
}
