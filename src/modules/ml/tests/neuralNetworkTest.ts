/**
 * Manual verification script for NeuralNetworkEngine — backprop correctness
 * (hand-computed forward pass + numerical gradient check), training sanity
 * across all four toy datasets, and a regularization sanity check.
 *
 * Run with: npx tsx src/modules/ml/tests/neuralNetworkTest.ts
 */

import { NeuralNetworkEngine, type NeuralNetworkConfig } from '../engines/NeuralNetworkEngine'
import { generateNeuralNetworkDataset } from '../algorithms/neuralNetworkDatasets'
import type { DataPoint } from '../types'
import type { NeuralNetworkDatasetType } from '../algorithms/neuralNetworkDatasets'

let failures = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`)
  } else {
    console.log(`  ❌ ${message}`)
    failures++
  }
}

console.log('=== Neural Network Engine Tests ===\n')

// ---------------------------------------------------------------------------
// Test 1: Hand-computed forward pass
// 2 inputs -> 1 ReLU hidden neuron -> 1 sigmoid output, fixed weights.
// ---------------------------------------------------------------------------
console.log('Test 1: Hand-computed forward pass')
{
  const point: DataPoint = { x: 1, y: 2, label: 1 }
  const initialWeights = [
    [[0.5, -0.25]], // hidden neuron: w1=0.5, w2=-0.25
    [[2]], // output neuron: w=2 (single input from hidden neuron)
  ]
  const initialBiases = [[0.1], [-0.3]]

  const config: NeuralNetworkConfig = {
    points: [point],
    hiddenLayers: [1],
    activation: 'relu',
    learningRate: 0.1,
    regularization: 'none',
    regularizationRate: 0,
    maxEpochs: 1000,
    convergenceThreshold: 1e-9,
    initialWeights,
    initialBiases,
  }

  const engine = new NeuralNetworkEngine(config)

  // Hand calculation:
  // hidden z = 0.5*1 + (-0.25)*2 + 0.1 = 0.5 - 0.5 + 0.1 = 0.1 -> ReLU(0.1) = 0.1
  // output z = 2*0.1 + (-0.3) = 0.2 - 0.3 = -0.1 -> sigmoid(-0.1)
  const expectedHidden = Math.max(0, 0.5 * 1 + -0.25 * 2 + 0.1)
  const expectedOutputZ = 2 * expectedHidden - 0.3
  const expectedProb = 1 / (1 + Math.exp(-expectedOutputZ))

  const actualProb = engine.getProbabilityAt(point.x, point.y)
  console.log(`  Expected probability: ${expectedProb.toFixed(9)}`)
  console.log(`  Actual probability:   ${actualProb.toFixed(9)}`)
  assert(Math.abs(actualProb - expectedProb) < 1e-9, 'Forward pass matches hand calculation')
}
console.log()

// ---------------------------------------------------------------------------
// Test 2: Numerical gradient check
// XOR corners, [2, 3, 1] network, tanh hidden activation (smooth everywhere).
// ---------------------------------------------------------------------------
console.log('Test 2: Numerical gradient check (backprop vs finite differences)')
{
  const points: DataPoint[] = [
    { x: 1, y: 1, label: 0 },
    { x: -1, y: -1, label: 0 },
    { x: 1, y: -1, label: 1 },
    { x: -1, y: 1, label: 1 },
  ]

  const initialWeights = [
    [
      [0.5, -0.3],
      [0.2, 0.4],
      [-0.6, 0.1],
    ],
    [[0.3, -0.2, 0.5]],
  ]
  const initialBiases = [[0.1, -0.1, 0.05], [0]]

  const baseConfig: NeuralNetworkConfig = {
    points,
    hiddenLayers: [3],
    activation: 'tanh',
    learningRate: 0.1,
    regularization: 'none',
    regularizationRate: 0,
    maxEpochs: 1000,
    convergenceThreshold: 1e-9,
    initialWeights,
    initialBiases,
  }

  const engine = new NeuralNetworkEngine(baseConfig)
  const { dW: analyticDW, dB: analyticDB } = engine._debugGetGradients()

  const eps = 1e-5
  let maxRelError = 0
  let checkedCount = 0

  const lossAt = (weights: number[][][], biases: number[][]): number => {
    const probeEngine = new NeuralNetworkEngine({
      ...baseConfig,
      initialWeights: weights,
      initialBiases: biases,
    })
    return probeEngine.getState().loss
  }

  const cloneWeights = () => initialWeights.map((layer) => layer.map((row) => [...row]))
  const cloneBiases = () => initialBiases.map((layer) => [...layer])

  for (let l = 0; l < initialWeights.length; l++) {
    for (let j = 0; j < initialWeights[l].length; j++) {
      for (let i = 0; i < initialWeights[l][j].length; i++) {
        const plusW = cloneWeights()
        plusW[l][j][i] += eps
        const minusW = cloneWeights()
        minusW[l][j][i] -= eps

        const lossPlus = lossAt(plusW, initialBiases)
        const lossMinus = lossAt(minusW, initialBiases)
        const numericGrad = (lossPlus - lossMinus) / (2 * eps)
        const analyticGrad = analyticDW[l][j][i]

        const relError =
          Math.abs(numericGrad - analyticGrad) / Math.max(1e-8, Math.abs(numericGrad) + Math.abs(analyticGrad))
        maxRelError = Math.max(maxRelError, relError)
        checkedCount++
      }
    }
  }

  for (let l = 0; l < initialBiases.length; l++) {
    for (let j = 0; j < initialBiases[l].length; j++) {
      const plusB = cloneBiases()
      plusB[l][j] += eps
      const minusB = cloneBiases()
      minusB[l][j] -= eps

      const lossPlus = lossAt(initialWeights, plusB)
      const lossMinus = lossAt(initialWeights, minusB)
      const numericGrad = (lossPlus - lossMinus) / (2 * eps)
      const analyticGrad = analyticDB[l][j]

      const relError =
        Math.abs(numericGrad - analyticGrad) / Math.max(1e-8, Math.abs(numericGrad) + Math.abs(analyticGrad))
      maxRelError = Math.max(maxRelError, relError)
      checkedCount++
    }
  }

  console.log(`  Checked ${checkedCount} parameters, max relative error: ${maxRelError.toExponential(4)}`)
  assert(maxRelError < 1e-4, 'All analytic gradients match numerical gradients within 1e-4')
}
console.log()

// ---------------------------------------------------------------------------
// Test 3: Monotonic loss decrease + accuracy sanity across all 4 datasets
// ---------------------------------------------------------------------------
console.log('Test 3: Training sanity across datasets')
{
  const datasetTypes: NeuralNetworkDatasetType[] = ['circle', 'xor', 'gaussian', 'spiral']

  for (const type of datasetTypes) {
    const points = generateNeuralNetworkDataset(type, { noise: 0.1, seed: 777 })
    const engine = new NeuralNetworkEngine({
      points,
      hiddenLayers: [4, 2],
      activation: 'tanh',
      learningRate: 0.5,
      regularization: 'none',
      regularizationRate: 0,
      maxEpochs: 200,
      convergenceThreshold: 1e-9,
    })

    const initialLoss = engine.getState().loss
    for (let i = 0; i < 200; i++) engine.step()
    const finalState = engine.getState()

    console.log(
      `  [${type}] loss ${initialLoss.toFixed(4)} -> ${finalState.loss.toFixed(4)}, accuracy ${(finalState.accuracy * 100).toFixed(1)}%`
    )
    assert(finalState.loss < initialLoss, `[${type}] loss decreased after 200 epochs`)
    if (type !== 'spiral') {
      assert(finalState.accuracy > 0.85, `[${type}] accuracy > 85% after 200 epochs`)
    }
  }
}
console.log()

// ---------------------------------------------------------------------------
// Test 4: Regularization sanity — L2 should shrink weights vs no regularization
// ---------------------------------------------------------------------------
console.log('Test 4: Regularization sanity (L2 shrinks weights)')
{
  const points = generateNeuralNetworkDataset('circle', { noise: 0.1, seed: 777 })

  const meanAbsWeight = (engine: NeuralNetworkEngine): number => {
    const { layers } = engine.getState()
    let sum = 0
    let count = 0
    for (const layer of layers) {
      for (const row of layer.weights) {
        for (const w of row) {
          sum += Math.abs(w)
          count++
        }
      }
    }
    return count > 0 ? sum / count : 0
  }

  const baseConfig = {
    points,
    hiddenLayers: [4, 2] as number[],
    activation: 'tanh' as const,
    learningRate: 0.5,
    maxEpochs: 200,
    convergenceThreshold: 1e-9,
  }

  const engineNone = new NeuralNetworkEngine({
    ...baseConfig,
    regularization: 'none',
    regularizationRate: 0,
  })
  for (let i = 0; i < 200; i++) engineNone.step()

  const engineL2 = new NeuralNetworkEngine({
    ...baseConfig,
    regularization: 'l2',
    regularizationRate: 0.1,
  })
  for (let i = 0; i < 200; i++) engineL2.step()

  const meanNone = meanAbsWeight(engineNone)
  const meanL2 = meanAbsWeight(engineL2)

  console.log(`  Mean |weight| (no regularization): ${meanNone.toFixed(4)}`)
  console.log(`  Mean |weight| (L2 regularization): ${meanL2.toFixed(4)}`)
  assert(meanL2 < meanNone, 'L2 regularization produces smaller mean |weight|')
}
console.log()

console.log(failures === 0 ? '=== All tests passed ===' : `=== ${failures} test(s) FAILED ===`)
process.exit(failures === 0 ? 0 : 1)
