import type { DataPoint, TreeNode } from './decisionTree'
import { buildTree, predictPoint } from './decisionTree'

/**
 * Pure algorithm functions for Ensemble Models
 * Implements Random Forest and Bagging
 * NO UI, NO Canvas, NO side effects
 * Fully testable
 */

export interface EnsembleConfig {
  numTrees: number
  maxDepth: number
  minSamplesSplit: number
  criterion: 'entropy' | 'gini'
  sampleRatio: number // Fraction of data to sample for each tree
  featureSubsample: boolean // Whether to use feature subsampling
}

export interface RandomForest {
  trees: TreeNode[]
  config: EnsembleConfig
}

/**
 * Bootstrap sampling - sample with replacement
 */
export function bootstrapSample(data: DataPoint[], sampleRatio = 1): DataPoint[] {
  const sampleSize = Math.floor(data.length * sampleRatio)
  const sample: DataPoint[] = []

  for (let i = 0; i < sampleSize; i++) {
    const randomIndex = Math.floor(Math.random() * data.length)
    sample.push(data[randomIndex])
  }

  return sample
}

/**
 * Build a Random Forest ensemble
 */
export function buildRandomForest(
  data: DataPoint[],
  config: EnsembleConfig
): RandomForest {
  const trees: TreeNode[] = []

  for (let i = 0; i < config.numTrees; i++) {
    // Bootstrap sample the data
    const sample = bootstrapSample(data, config.sampleRatio)

    // Build tree on the sample
    const tree = buildTree(
      sample,
      config.maxDepth,
      config.minSamplesSplit,
      config.criterion
    )

    trees.push(tree)
  }

  return {
    trees,
    config,
  }
}

/**
 * Predict using ensemble (majority voting)
 */
export function predictEnsemble(
  point: { x: number; y: number },
  forest: RandomForest
): 0 | 1 {
  const votes = { 0: 0, 1: 0 }

  for (const tree of forest.trees) {
    const prediction = predictPoint(point, tree)
    votes[prediction]++
  }

  return votes[1] > votes[0] ? 1 : 0
}

/**
 * Calculate ensemble accuracy
 */
export function calculateEnsembleAccuracy(
  data: DataPoint[],
  forest: RandomForest
): number {
  if (data.length === 0) return 0

  let correct = 0
  for (const point of data) {
    const predicted = predictEnsemble(point, forest)
    if (predicted === point.label) {
      correct++
    }
  }

  return correct / data.length
}

/**
 * Get predictions from individual trees (for visualization)
 */
export function getTreePredictions(
  point: { x: number; y: number },
  forest: RandomForest
): (0 | 1)[] {
  return forest.trees.map((tree) => predictPoint(point, tree))
}

/**
 * Calculate Out-of-Bag (OOB) score
 * Evaluates each sample using only trees that didn't see it during training
 */
export function calculateOOBScore(
  data: DataPoint[],
  forest: RandomForest,
  bootstrapSamples: DataPoint[][]
): number {
  if (data.length === 0) return 0

  let totalPredictions = 0
  let correctPredictions = 0

  for (let i = 0; i < data.length; i++) {
    const point = data[i]
    const votes = { 0: 0, 1: 0 }
    let treeCount = 0

    // Use only trees that didn't see this sample
    for (let j = 0; j < forest.trees.length; j++) {
      const sample = bootstrapSamples[j]
      const wasInSample = sample.some(
        (p) => p.x === point.x && p.y === point.y && p.label === point.label
      )

      if (!wasInSample) {
        const prediction = predictPoint(point, forest.trees[j])
        votes[prediction]++
        treeCount++
      }
    }

    // Only count if at least one tree made a prediction
    if (treeCount > 0) {
      const prediction = votes[1] > votes[0] ? 1 : 0
      if (prediction === point.label) {
        correctPredictions++
      }
      totalPredictions++
    }
  }

  return totalPredictions > 0 ? correctPredictions / totalPredictions : 0
}

/**
 * Calculate feature importance (simplified version)
 * Based on how often each feature is used for splitting
 */
export function calculateFeatureImportance(forest: RandomForest): {
  x: number
  y: number
} {
  let xCount = 0
  let yCount = 0

  const countFeature = (node: TreeNode) => {
    if (node.isLeaf) return

    if (node.feature === 'x') xCount++
    else if (node.feature === 'y') yCount++

    if (node.left) countFeature(node.left)
    if (node.right) countFeature(node.right)
  }

  for (const tree of forest.trees) {
    countFeature(tree)
  }

  const total = xCount + yCount
  return {
    x: total > 0 ? xCount / total : 0,
    y: total > 0 ? yCount / total : 0,
  }
}

/**
 * Get diversity metric (disagreement rate among trees)
 */
export function calculateTreeDiversity(
  data: DataPoint[],
  forest: RandomForest
): number {
  if (data.length === 0 || forest.trees.length < 2) return 0

  let totalDisagreements = 0
  let totalComparisons = 0

  for (const point of data) {
    const predictions = getTreePredictions(point, forest)

    // Count pairwise disagreements
    for (let i = 0; i < predictions.length; i++) {
      for (let j = i + 1; j < predictions.length; j++) {
        if (predictions[i] !== predictions[j]) {
          totalDisagreements++
        }
        totalComparisons++
      }
    }
  }

  return totalComparisons > 0 ? totalDisagreements / totalComparisons : 0
}
