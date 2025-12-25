import type { DataPoint } from '../algorithms/decisionTree'
import type { RandomForest, EnsembleConfig } from '../algorithms/ensembleModels'
import {
  buildRandomForest,
  calculateEnsembleAccuracy,
  predictEnsemble,
  calculateFeatureImportance,
  calculateTreeDiversity,
} from '../algorithms/ensembleModels'

/**
 * Ensemble Models Engine for Random Forest
 */

export interface EnsembleState {
  forest: RandomForest | null
  accuracy: number
  featureImportance: { x: number; y: number }
  treeDiversity: number
  isBuilt: boolean
  isRunning: boolean
  currentTreeIndex: number
}

export interface EnsembleEngineConfig {
  data: DataPoint[]
  numTrees: number
  maxDepth: number
  minSamplesSplit: number
  criterion: 'entropy' | 'gini'
  sampleRatio: number
}

export class EnsembleModelsEngine {
  private config: EnsembleEngineConfig
  private state: EnsembleState

  constructor(config: EnsembleEngineConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): EnsembleState {
    return {
      forest: null,
      accuracy: 0,
      featureImportance: { x: 0, y: 0 },
      treeDiversity: 0,
      isBuilt: false,
      isRunning: false,
      currentTreeIndex: 0,
    }
  }

  /**
   * Build the random forest
   */
  buildForest(): void {
    if (this.config.data.length === 0) {
      this.state = this.initializeState()
      return
    }

    const ensembleConfig: EnsembleConfig = {
      numTrees: this.config.numTrees,
      maxDepth: this.config.maxDepth,
      minSamplesSplit: this.config.minSamplesSplit,
      criterion: this.config.criterion,
      sampleRatio: this.config.sampleRatio,
      featureSubsample: false,
    }

    const forest = buildRandomForest(this.config.data, ensembleConfig)
    const accuracy = calculateEnsembleAccuracy(this.config.data, forest)
    const featureImportance = calculateFeatureImportance(forest)
    const treeDiversity = calculateTreeDiversity(this.config.data, forest)

    this.state = {
      forest,
      accuracy,
      featureImportance,
      treeDiversity,
      isBuilt: true,
      isRunning: false,
      currentTreeIndex: this.config.numTrees,
    }
  }

  /**
   * Perform one step (build one tree at a time)
   */
  step(): void {
    if (this.config.data.length === 0) {
      return
    }

    const ensembleConfig: EnsembleConfig = {
      numTrees: this.config.numTrees,
      maxDepth: this.config.maxDepth,
      minSamplesSplit: this.config.minSamplesSplit,
      criterion: this.config.criterion,
      sampleRatio: this.config.sampleRatio,
      featureSubsample: false,
    }

    // If not started, initialize with empty forest
    if (!this.state.forest) {
      this.state.forest = {
        trees: [],
        config: ensembleConfig,
      }
      this.state.currentTreeIndex = 0
      this.state.isRunning = true
    }

    // If all trees are built, stop
    if (this.state.currentTreeIndex >= this.config.numTrees) {
      this.state.isBuilt = true
      this.state.isRunning = false
      return
    }

    // Build one tree
    const singleTreeConfig: EnsembleConfig = {
      ...ensembleConfig,
      numTrees: 1,
    }

    const newForest = buildRandomForest(this.config.data, singleTreeConfig)
    this.state.forest.trees.push(...newForest.trees)
    this.state.currentTreeIndex++

    // Update metrics
    this.state.accuracy = calculateEnsembleAccuracy(this.config.data, this.state.forest)
    this.state.featureImportance = calculateFeatureImportance(this.state.forest)
    this.state.treeDiversity = calculateTreeDiversity(this.config.data, this.state.forest)

    // Check if complete
    if (this.state.currentTreeIndex >= this.config.numTrees) {
      this.state.isBuilt = true
      this.state.isRunning = false
    }
  }

  /**
   * Run algorithm to completion
   */
  run(): void {
    this.buildForest()
  }

  /**
   * Predict class for a point
   */
  predict(point: { x: number; y: number }): 0 | 1 | null {
    if (!this.state.forest) return null
    return predictEnsemble(point, this.state.forest)
  }

  /**
   * Reset the forest
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EnsembleEngineConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Get current state
   */
  getState(): EnsembleState {
    return { ...this.state }
  }

  /**
   * Get configuration
   */
  getConfig(): EnsembleEngineConfig {
    return { ...this.config }
  }

  /**
   * Check if forest is built
   */
  isForestBuilt(): boolean {
    return this.state.isBuilt
  }
}
