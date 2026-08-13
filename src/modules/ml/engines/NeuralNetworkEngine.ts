import type { DataPoint } from '../types'

/**
 * Neural Network (Multi-Layer Perceptron) Engine
 * Configurable hidden layers, binary classification via a single sigmoid output neuron.
 * Manual forward pass + backpropagation, full-batch gradient descent per step().
 */

export type ActivationFunction = 'relu' | 'tanh' | 'sigmoid' | 'linear'
export type RegularizationType = 'none' | 'l1' | 'l2'

export interface NeuralNetworkConfig {
  points: DataPoint[] // training points
  testPoints?: DataPoint[] // held-out points, evaluated but never trained on
  hiddenLayers: number[] // neuron count per hidden layer, e.g. [4, 2]
  activation: ActivationFunction // applied uniformly to all hidden layers
  learningRate: number
  regularization: RegularizationType
  regularizationRate: number
  maxEpochs: number
  convergenceThreshold: number
  seed?: number
  initialWeights?: number[][][] // [transition][neuronIndex][inputIndex] — override for tests
  initialBiases?: number[][] // [transition][neuronIndex]
}

export interface NeuralNetworkLayerState {
  neuronCount: number
  activation: ActivationFunction | 'sigmoid' // output pseudo-layer is always 'sigmoid'
  weights: number[][] // [neuronIndex][inputIndex]; [] for the input pseudo-layer
  biases: number[] // []  for the input pseudo-layer
}

export interface NeuralNetworkState {
  layers: NeuralNetworkLayerState[] // input + hidden* + output
  epoch: number
  loss: number // training BCE (no regularization penalty — that only shapes gradients)
  accuracy: number
  testLoss: number
  testAccuracy: number
  isConverged: boolean
  lossHistory: number[]
  accuracyHistory: number[]
  testLossHistory: number[]
  predictions: number[]
  probabilities: number[]
}

export interface NeuralNetworkSnapshot {
  config: NeuralNetworkConfig
  weights: number[][][]
  biases: number[][]
  rngState: number
  state: NeuralNetworkState
}

export class NeuralNetworkEngine {
  private config: NeuralNetworkConfig
  private weights: number[][][] = [] // [transition][neuronIndex][inputIndex]
  private biases: number[][] = [] // [transition][neuronIndex]
  private rngState: number
  private state: NeuralNetworkState

  constructor(config: NeuralNetworkConfig) {
    this.config = config
    this.rngState = (config.seed ?? 42) >>> 0
    this.initializeParams()
    this.state = this.initializeState()
  }

  /**
   * Layer sizes including the 2D input and the single sigmoid output neuron.
   */
  private getLayerSizes(): number[] {
    return [2, ...this.config.hiddenLayers, 1]
  }

  /**
   * Small seeded LCG, same style as TSNEEngine's PCA-init RNG — deterministic,
   * reproducible across reset()/tests without a shared RNG module.
   */
  private nextRandom(): number {
    this.rngState = Math.trunc(this.rngState * 1664525 + 1013904223) >>> 0
    return this.rngState / 0x100000000
  }

  private initializeParams(): void {
    if (this.config.initialWeights && this.config.initialBiases) {
      this.weights = this.config.initialWeights.map((layer) => layer.map((row) => [...row]))
      this.biases = this.config.initialBiases.map((layer) => [...layer])
      return
    }

    const layerSizes = this.getLayerSizes()
    const weights: number[][][] = []
    const biases: number[][] = []

    for (let l = 0; l < layerSizes.length - 1; l++) {
      const fanIn = layerSizes[l]
      const fanOut = layerSizes[l + 1]
      const isOutputTransition = l === layerSizes.length - 2
      const targetActivation = isOutputTransition ? 'sigmoid' : this.config.activation
      // He init for ReLU hidden layers (breaks symmetry, accounts for the "dead" negative half);
      // Xavier/Glorot otherwise (tanh/sigmoid/linear, incl. the forced-sigmoid output layer).
      const limit =
        targetActivation === 'relu' ? Math.sqrt(6 / fanIn) : Math.sqrt(6 / (fanIn + fanOut))

      const layerWeights: number[][] = []
      for (let j = 0; j < fanOut; j++) {
        const row: number[] = []
        for (let i = 0; i < fanIn; i++) {
          row.push((this.nextRandom() * 2 - 1) * limit)
        }
        layerWeights.push(row)
      }
      weights.push(layerWeights)
      biases.push(new Array(fanOut).fill(0))
    }

    this.weights = weights
    this.biases = biases
  }

  private activate(fn: ActivationFunction | 'sigmoid', z: number): number {
    switch (fn) {
      case 'relu':
        return Math.max(0, z)
      case 'tanh':
        return Math.tanh(z)
      case 'sigmoid':
        return 1 / (1 + Math.exp(-z))
      case 'linear':
      default:
        return z
    }
  }

  private activateDerivative(fn: ActivationFunction | 'sigmoid', z: number, a: number): number {
    switch (fn) {
      case 'relu':
        return z > 0 ? 1 : 0
      case 'tanh':
        return 1 - a * a
      case 'sigmoid':
        return a * (1 - a)
      case 'linear':
      default:
        return 1
    }
  }

  /**
   * Forward pass for a single point. Returns per-layer activations (index 0 = input,
   * last index = output) and pre-activations (zs; zs[0] is unused/empty).
   */
  private forwardPass(x: number, y: number): { activations: number[][]; zs: number[][] } {
    const activations: number[][] = [[x, y]]
    const zs: number[][] = [[]]
    const numTransitions = this.weights.length

    for (let l = 0; l < numTransitions; l++) {
      const prevA = activations[l]
      const fn = l === numTransitions - 1 ? 'sigmoid' : this.config.activation
      const w = this.weights[l]
      const b = this.biases[l]
      const z: number[] = []
      const a: number[] = []

      for (let j = 0; j < w.length; j++) {
        let sum = b[j]
        for (let i = 0; i < prevA.length; i++) {
          sum += w[j][i] * prevA[i]
        }
        z.push(sum)
        a.push(this.activate(fn, sum))
      }

      zs.push(z)
      activations.push(a)
    }

    return { activations, zs }
  }

  /**
   * Public method to get the predicted probability at any (x, y) — used for
   * the output decision-boundary heatmap.
   */
  public getProbabilityAt(x: number, y: number): number {
    const { activations } = this.forwardPass(x, y)
    return activations[activations.length - 1][0]
  }

  /**
   * Public method exposing every layer's activations at (x, y) — used to render
   * each hidden neuron's own mini decision-pattern tile in the network diagram.
   * activations[0] is the raw [x, y] input; activations[last] is the same value
   * getProbabilityAt returns.
   */
  public getActivationsAt(x: number, y: number): number[][] {
    return this.forwardPass(x, y).activations
  }

  private predictForPoints(points: DataPoint[]): { predictions: number[]; probabilities: number[] } {
    const predictions: number[] = []
    const probabilities: number[] = []

    for (const point of points) {
      const prob = this.getProbabilityAt(point.x, point.y)
      probabilities.push(prob)
      predictions.push(prob >= 0.5 ? 1 : 0)
    }

    return { predictions, probabilities }
  }

  /**
   * Binary cross-entropy averaged over the given points. Deliberately excludes
   * the regularization penalty — regularization only shapes gradients (weight
   * decay), so train/test loss stay directly comparable, plain data-loss numbers.
   */
  private calculateLossForPoints(points: DataPoint[], probabilities: number[]): number {
    const m = points.length
    if (m === 0) return 0
    const epsilon = 1e-15
    let cost = 0

    for (let i = 0; i < m; i++) {
      const label = points[i].label ?? 0
      const h = probabilities[i]
      cost += -label * Math.log(h + epsilon) - (1 - label) * Math.log(1 - h + epsilon)
    }

    return cost / m
  }

  private calculateAccuracyForPoints(points: DataPoint[], predictions: number[]): number {
    if (points.length === 0) return 0
    let correct = 0
    for (let i = 0; i < points.length; i++) {
      if (predictions[i] === (points[i].label ?? 0)) correct++
    }
    return correct / points.length
  }

  private evaluate(points: DataPoint[]): { loss: number; accuracy: number } {
    const { predictions, probabilities } = this.predictForPoints(points)
    return {
      loss: this.calculateLossForPoints(points, probabilities),
      accuracy: this.calculateAccuracyForPoints(points, predictions),
    }
  }

  /**
   * Compute full-batch gradients (average over all training points) via manual
   * backprop. Exposed separately from step() so a numerical gradient check can
   * compare against these analytic gradients without mutating the engine's weights.
   */
  private computeGradients(): { dW: number[][][]; dB: number[][] } {
    const { points, regularization, regularizationRate } = this.config
    const numTransitions = this.weights.length
    const m = points.length

    const dW: number[][][] = this.weights.map((layer) => layer.map((row) => row.map(() => 0)))
    const dB: number[][] = this.biases.map((layer) => layer.map(() => 0))

    for (const point of points) {
      const { activations, zs } = this.forwardPass(point.x, point.y)
      const label = point.label ?? 0

      // Combined sigmoid+BCE output-layer derivative: error = h - y (same identity
      // LogisticRegressionEngine relies on).
      let delta: number[] = [activations[numTransitions][0] - label]

      for (let l = numTransitions - 1; l >= 0; l--) {
        const prevA = activations[l]
        const w = this.weights[l]

        for (let j = 0; j < w.length; j++) {
          for (let i = 0; i < prevA.length; i++) {
            dW[l][j][i] += delta[j] * prevA[i]
          }
          dB[l][j] += delta[j]
        }

        if (l > 0) {
          const nextDelta: number[] = new Array(prevA.length).fill(0)
          for (let i = 0; i < prevA.length; i++) {
            let sum = 0
            for (let j = 0; j < w.length; j++) {
              sum += w[j][i] * delta[j]
            }
            nextDelta[i] = sum * this.activateDerivative(this.config.activation, zs[l][i], prevA[i])
          }
          delta = nextDelta
        }
      }
    }

    for (let l = 0; l < numTransitions; l++) {
      for (let j = 0; j < dW[l].length; j++) {
        for (let i = 0; i < dW[l][j].length; i++) {
          dW[l][j][i] /= m
          if (regularization === 'l2') {
            dW[l][j][i] += regularizationRate * this.weights[l][j][i]
          } else if (regularization === 'l1') {
            dW[l][j][i] += regularizationRate * Math.sign(this.weights[l][j][i])
          }
        }
        dB[l][j] /= m
      }
    }

    return { dW, dB }
  }

  private initializeState(): NeuralNetworkState {
    const { predictions, probabilities } = this.predictForPoints(this.config.points)
    const loss = this.calculateLossForPoints(this.config.points, probabilities)
    const accuracy = this.calculateAccuracyForPoints(this.config.points, predictions)
    const testPoints = this.config.testPoints ?? []
    const testEval = testPoints.length > 0 ? this.evaluate(testPoints) : { loss, accuracy }

    return {
      layers: this.buildLayerStates(),
      epoch: 0,
      loss,
      accuracy,
      testLoss: testEval.loss,
      testAccuracy: testEval.accuracy,
      isConverged: false,
      lossHistory: [],
      accuracyHistory: [],
      testLossHistory: [],
      predictions,
      probabilities,
    }
  }

  private buildLayerStates(): NeuralNetworkLayerState[] {
    const layerSizes = this.getLayerSizes()
    const layers: NeuralNetworkLayerState[] = [
      { neuronCount: layerSizes[0], activation: 'linear', weights: [], biases: [] },
    ]

    for (let l = 0; l < this.weights.length; l++) {
      const isOutput = l === this.weights.length - 1
      layers.push({
        neuronCount: layerSizes[l + 1],
        activation: isOutput ? 'sigmoid' : this.config.activation,
        weights: this.weights[l].map((row) => [...row]),
        biases: [...this.biases[l]],
      })
    }

    return layers
  }

  /**
   * Perform one full-batch gradient descent step (one epoch over the whole training set).
   */
  step(): void {
    if (this.state.isConverged || this.state.epoch >= this.config.maxEpochs) {
      this.state.isConverged = true
      return
    }

    const { learningRate } = this.config
    const { dW, dB } = this.computeGradients()

    for (let l = 0; l < this.weights.length; l++) {
      for (let j = 0; j < this.weights[l].length; j++) {
        for (let i = 0; i < this.weights[l][j].length; i++) {
          this.weights[l][j][i] -= learningRate * dW[l][j][i]
        }
        this.biases[l][j] -= learningRate * dB[l][j]
      }
    }

    const { predictions, probabilities } = this.predictForPoints(this.config.points)
    const newLoss = this.calculateLossForPoints(this.config.points, probabilities)
    const newAccuracy = this.calculateAccuracyForPoints(this.config.points, predictions)
    const testPoints = this.config.testPoints ?? []
    const testEval = testPoints.length > 0 ? this.evaluate(testPoints) : { loss: newLoss, accuracy: newAccuracy }
    const lossDifference = Math.abs(this.state.loss - newLoss)

    this.state.layers = this.buildLayerStates()
    this.state.loss = newLoss
    this.state.accuracy = newAccuracy
    this.state.testLoss = testEval.loss
    this.state.testAccuracy = testEval.accuracy
    this.state.predictions = predictions
    this.state.probabilities = probabilities
    this.state.lossHistory.push(newLoss)
    this.state.accuracyHistory.push(newAccuracy)
    this.state.testLossHistory.push(testEval.loss)
    this.state.epoch++

    if (lossDifference < this.config.convergenceThreshold) {
      this.state.isConverged = true
    }
  }

  run(): void {
    while (!this.state.isConverged && this.state.epoch < this.config.maxEpochs) {
      this.step()
    }
    this.state.isConverged = true
  }

  reset(): void {
    this.rngState = (this.config.seed ?? 42) >>> 0
    this.initializeParams()
    this.state = this.initializeState()
  }

  getState(): NeuralNetworkState {
    return {
      layers: this.state.layers.map((layer) => ({
        ...layer,
        weights: layer.weights.map((row) => [...row]),
        biases: [...layer.biases],
      })),
      epoch: this.state.epoch,
      loss: this.state.loss,
      accuracy: this.state.accuracy,
      testLoss: this.state.testLoss,
      testAccuracy: this.state.testAccuracy,
      isConverged: this.state.isConverged,
      lossHistory: [...this.state.lossHistory],
      accuracyHistory: [...this.state.accuracyHistory],
      testLossHistory: [...this.state.testLossHistory],
      predictions: [...this.state.predictions],
      probabilities: [...this.state.probabilities],
    }
  }

  updateConfig(config: Partial<NeuralNetworkConfig>): void {
    this.config = { ...this.config, ...config }
    this.reset()
  }

  /**
   * Decision boundary via marching squares, reused verbatim from
   * LogisticRegressionEngine.getDecisionBoundary — generalizes unchanged since it
   * only depends on a scalar probability field, here produced by the full MLP
   * forward pass instead of a single sigmoid(z).
   */
  getDecisionBoundary(
    xRange: [number, number],
    yRange: [number, number],
    resolution: number = 50
  ): { grid: number[][]; points: Array<{ x: number; y: number }> } {
    const boundaryPoints: Array<{ x: number; y: number }> = []
    const xStep = (xRange[1] - xRange[0]) / resolution
    const yStep = (yRange[1] - yRange[0]) / resolution

    const grid: number[][] = []
    for (let xi = 0; xi <= resolution; xi++) {
      grid[xi] = []
      for (let yi = 0; yi <= resolution; yi++) {
        const x = xRange[0] + xi * xStep
        const y = yRange[0] + yi * yStep
        grid[xi][yi] = this.getProbabilityAt(x, y)
      }
    }

    const threshold = 0.5
    for (let xi = 0; xi < resolution; xi++) {
      for (let yi = 0; yi < resolution; yi++) {
        const x = xRange[0] + xi * xStep
        const y = yRange[0] + yi * yStep

        const p00 = grid[xi][yi]
        const p10 = grid[xi + 1][yi]
        const p01 = grid[xi][yi + 1]
        const p11 = grid[xi + 1][yi + 1]

        const hasContour =
          (p00 < threshold && (p10 >= threshold || p01 >= threshold || p11 >= threshold)) ||
          (p00 >= threshold && (p10 < threshold || p01 < threshold || p11 < threshold))

        if (hasContour) {
          let boundaryX = x + xStep / 2
          let boundaryY = y + yStep / 2

          if (p00 < threshold !== p10 < threshold) {
            const t = (threshold - p00) / (p10 - p00)
            boundaryX = x + t * xStep
            boundaryY = y
          } else if (p00 < threshold !== p01 < threshold) {
            const t = (threshold - p00) / (p01 - p00)
            boundaryX = x
            boundaryY = y + t * yStep
          }

          boundaryPoints.push({ x: boundaryX, y: boundaryY })
        }
      }
    }

    return { grid, points: boundaryPoints }
  }

  /**
   * Capture a serializable snapshot so training can resume in a Web Worker
   * (used only for the "Run to Convergence" fast-forward action).
   */
  createSnapshot(): NeuralNetworkSnapshot {
    return {
      config: {
        ...this.config,
        points: this.config.points.map((p) => ({ ...p })),
        testPoints: this.config.testPoints?.map((p) => ({ ...p })),
      },
      weights: this.weights.map((layer) => layer.map((row) => [...row])),
      biases: this.biases.map((layer) => [...layer]),
      rngState: this.rngState,
      state: this.getState(),
    }
  }

  static fromSnapshot(snapshot: NeuralNetworkSnapshot): NeuralNetworkEngine {
    const engine = new NeuralNetworkEngine({
      ...snapshot.config,
      initialWeights: snapshot.weights,
      initialBiases: snapshot.biases,
    })
    const mutableEngine = engine as unknown as {
      rngState: number
      state: NeuralNetworkState
    }
    mutableEngine.rngState = snapshot.rngState
    mutableEngine.state = {
      ...snapshot.state,
      layers: snapshot.state.layers.map((layer) => ({
        ...layer,
        weights: layer.weights.map((row) => [...row]),
        biases: [...layer.biases],
      })),
      lossHistory: [...snapshot.state.lossHistory],
      accuracyHistory: [...snapshot.state.accuracyHistory],
      testLossHistory: [...snapshot.state.testLossHistory],
      predictions: [...snapshot.state.predictions],
      probabilities: [...snapshot.state.probabilities],
    }
    return engine
  }

  /**
   * Debug-only accessor for the numerical-gradient-check test — returns the
   * analytic gradients computed by one backprop pass without applying them.
   */
  _debugGetGradients(): { dW: number[][][]; dB: number[][] } {
    return this.computeGradients()
  }
}
