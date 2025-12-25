import type { DataPoint, TreeNode } from '../algorithms/decisionTree'
import {
  buildTree,
  calculateAccuracy,
  predictPoint,
  countNodes,
  getTreeDepth,
  findBestSplit,
  getMajorityLabel,
  calculateGiniImpurity,
  calculateEntropy,
} from '../algorithms/decisionTree'

/**
 * Decision Tree Engine with step-by-step tree building capability
 */

export interface DecisionTreeState {
  tree: TreeNode | null
  accuracy: number
  totalNodes: number
  treeDepth: number
  isBuilt: boolean
  isRunning: boolean
  currentDepth: number
  nodesToExpand: Array<{ node: TreeNode; data: DataPoint[]; parentPath: string }>
}

export interface DecisionTreeConfig {
  data: DataPoint[]
  maxDepth: number
  minSamplesSplit: number
  criterion: 'entropy' | 'gini'
}

export class DecisionTreeEngine {
  private config: DecisionTreeConfig
  private state: DecisionTreeState

  constructor(config: DecisionTreeConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): DecisionTreeState {
    return {
      tree: null,
      accuracy: 0,
      totalNodes: 0,
      treeDepth: 0,
      isBuilt: false,
      isRunning: false,
      currentDepth: 0,
      nodesToExpand: [],
    }
  }

  /**
   * Build the complete tree
   */
  buildTree(): void {
    if (this.config.data.length === 0) {
      this.state = this.initializeState()
      return
    }

    const tree = buildTree(
      this.config.data,
      this.config.maxDepth,
      this.config.minSamplesSplit,
      this.config.criterion
    )

    const accuracy = calculateAccuracy(this.config.data, tree)
    const totalNodes = countNodes(tree)
    const treeDepth = getTreeDepth(tree)

    this.state = {
      tree,
      accuracy,
      totalNodes,
      treeDepth,
      isBuilt: true,
      isRunning: false,
      currentDepth: treeDepth,
      nodesToExpand: [],
    }
  }

  /**
   * Initialize step-by-step building
   */
  private initializeStepByStep(): void {
    if (this.config.data.length === 0) {
      return
    }

    // Create root node as a leaf initially
    const rootNode: TreeNode = {
      isLeaf: true,
      prediction: getMajorityLabel(this.config.data),
      depth: 0,
      samples: this.config.data.length,
      giniImpurity: calculateGiniImpurity(this.config.data),
      entropy: calculateEntropy(this.config.data),
    }

    this.state.tree = rootNode
    this.state.currentDepth = 0
    this.state.nodesToExpand = [{ node: rootNode, data: this.config.data, parentPath: 'root' }]
    this.state.isBuilt = false
    this.state.totalNodes = 1
    this.state.treeDepth = 0
  }

  /**
   * Expand one level of the tree
   */
  private expandOneLevel(): void {
    if (this.state.nodesToExpand.length === 0) {
      this.state.isBuilt = true
      this.state.isRunning = false
      this.updateMetrics()
      return
    }

    const currentLevelNodes = [...this.state.nodesToExpand]
    this.state.nodesToExpand = []

    for (const { node, data, parentPath } of currentLevelNodes) {
      // Check if we should expand this node
      const calculateImpurity =
        this.config.criterion === 'entropy' ? calculateEntropy : calculateGiniImpurity

      if (
        node.depth >= this.config.maxDepth ||
        data.length < this.config.minSamplesSplit ||
        calculateImpurity(data) === 0
      ) {
        // Keep as leaf
        continue
      }

      // Find best split
      const split = findBestSplit(data, this.config.criterion)

      if (!split || split.gain === 0) {
        // Keep as leaf
        continue
      }

      // Convert leaf to internal node
      node.isLeaf = false
      node.feature = split.feature
      node.threshold = split.threshold
      delete node.prediction

      // Create left child
      const leftNode: TreeNode = {
        isLeaf: true,
        prediction: getMajorityLabel(split.leftData),
        depth: node.depth + 1,
        samples: split.leftData.length,
        giniImpurity: calculateGiniImpurity(split.leftData),
        entropy: calculateEntropy(split.leftData),
      }
      node.left = leftNode
      this.state.nodesToExpand.push({
        node: leftNode,
        data: split.leftData,
        parentPath: `${parentPath}.left`,
      })

      // Create right child
      const rightNode: TreeNode = {
        isLeaf: true,
        prediction: getMajorityLabel(split.rightData),
        depth: node.depth + 1,
        samples: split.rightData.length,
        giniImpurity: calculateGiniImpurity(split.rightData),
        entropy: calculateEntropy(split.rightData),
      }
      node.right = rightNode
      this.state.nodesToExpand.push({
        node: rightNode,
        data: split.rightData,
        parentPath: `${parentPath}.right`,
      })

      this.state.totalNodes += 2
    }

    this.state.currentDepth++

    // Check if we're done
    if (this.state.nodesToExpand.length === 0 || this.state.currentDepth >= this.config.maxDepth) {
      this.state.isBuilt = true
      this.state.isRunning = false
    }

    this.updateMetrics()
  }

  /**
   * Update accuracy and tree depth
   */
  private updateMetrics(): void {
    if (this.state.tree) {
      this.state.accuracy = calculateAccuracy(this.config.data, this.state.tree)
      this.state.treeDepth = getTreeDepth(this.state.tree)
      this.state.totalNodes = countNodes(this.state.tree)
    }
  }

  /**
   * Perform one step (expand one level of the tree)
   */
  step(): void {
    if (!this.state.tree) {
      this.initializeStepByStep()
      return
    }

    if (this.state.isBuilt) {
      return
    }

    this.expandOneLevel()
  }

  /**
   * Run algorithm to completion
   */
  run(): void {
    this.buildTree()
  }

  /**
   * Predict class for a point
   */
  predict(point: { x: number; y: number }): 0 | 1 | null {
    if (!this.state.tree) return null
    return predictPoint(point, this.state.tree)
  }

  /**
   * Reset the tree
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DecisionTreeConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Get current state
   */
  getState(): DecisionTreeState {
    return { ...this.state }
  }

  /**
   * Get configuration
   */
  getConfig(): DecisionTreeConfig {
    return { ...this.config }
  }

  /**
   * Check if tree is built
   */
  isTreeBuilt(): boolean {
    return this.state.isBuilt
  }
}
