import type { DataPoint } from '../types'

/**
 * Toy dataset generators for the Neural Network Playground — the classic
 * TensorFlow Playground datasets, scaled to a [-6, 6] domain.
 */

export type NeuralNetworkDatasetType = 'circle' | 'xor' | 'gaussian' | 'spiral'

export interface GenerateDatasetOptions {
  numPoints?: number
  noise?: number // 0-0.5
  seed?: number
}

const DEFAULT_NUM_POINTS = 200
const DEFAULT_NOISE = 0.1
const DEFAULT_SEED = 12345
const DOMAIN = 6 // domain is [-DOMAIN, DOMAIN] on both axes

/**
 * Small seeded LCG (same style as TSNEEngine's PCA-init RNG) so datasets are
 * reproducible across resets given the same seed — no shared RNG module.
 */
function createRng(seed: number) {
  let state = seed >>> 0
  return () => {
    state = Math.trunc(state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

/** Box-Muller transform for Gaussian-distributed samples from a uniform RNG. */
function gaussianSample(rng: () => number, mean: number, stdDev: number): number {
  const u1 = Math.max(rng(), 1e-12)
  const u2 = rng()
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z0 * stdDev
}

export function generateCircleData(options: GenerateDatasetOptions = {}): DataPoint[] {
  const { numPoints = DEFAULT_NUM_POINTS, noise = DEFAULT_NOISE, seed = DEFAULT_SEED } = options
  const rng = createRng(seed)
  const points: DataPoint[] = []
  const half = Math.floor(numPoints / 2)

  for (let i = 0; i < half; i++) {
    // Inner disk -> class 1
    const r = rng() * 2.5
    const angle = rng() * Math.PI * 2
    const jitter = (rng() - 0.5) * noise * 4
    points.push({
      x: r * Math.cos(angle) + jitter,
      y: r * Math.sin(angle) + jitter,
      label: 1,
    })

    // Outer ring -> class 0
    const r2 = 4 + rng() * 2
    const angle2 = rng() * Math.PI * 2
    const jitter2 = (rng() - 0.5) * noise * 4
    points.push({
      x: r2 * Math.cos(angle2) + jitter2,
      y: r2 * Math.sin(angle2) + jitter2,
      label: 0,
    })
  }

  return points
}

export function generateXORData(options: GenerateDatasetOptions = {}): DataPoint[] {
  const { numPoints = DEFAULT_NUM_POINTS, noise = DEFAULT_NOISE, seed = DEFAULT_SEED } = options
  const rng = createRng(seed)
  const points: DataPoint[] = []
  const gap = 0.3 // small dead-zone around the axes so the boundary is learnable
  const jitterScale = noise * 3

  for (let i = 0; i < numPoints; i++) {
    const quadrant = i % 4
    const sx = quadrant === 0 || quadrant === 3 ? 1 : -1
    const sy = quadrant === 0 || quadrant === 1 ? 1 : -1
    const x = sx * (gap + rng() * (DOMAIN - gap)) + (rng() - 0.5) * jitterScale
    const y = sy * (gap + rng() * (DOMAIN - gap)) + (rng() - 0.5) * jitterScale
    // XOR: same-sign quadrants (Q1/Q3) are class 0, opposite-sign (Q2/Q4) are class 1
    const label = Math.sign(x) === Math.sign(y) ? 0 : 1
    points.push({ x, y, label })
  }

  return points
}

export function generateGaussianData(options: GenerateDatasetOptions = {}): DataPoint[] {
  const { numPoints = DEFAULT_NUM_POINTS, noise = DEFAULT_NOISE, seed = DEFAULT_SEED } = options
  const rng = createRng(seed)
  const points: DataPoint[] = []
  const half = Math.floor(numPoints / 2)
  const stdDev = 0.5 + noise * 3

  for (let i = 0; i < half; i++) {
    points.push({
      x: gaussianSample(rng, -2, stdDev),
      y: gaussianSample(rng, -2, stdDev),
      label: 0,
    })
    points.push({
      x: gaussianSample(rng, 2, stdDev),
      y: gaussianSample(rng, 2, stdDev),
      label: 1,
    })
  }

  return points
}

export function generateSpiralData(options: GenerateDatasetOptions = {}): DataPoint[] {
  const { numPoints = DEFAULT_NUM_POINTS, noise = DEFAULT_NOISE, seed = DEFAULT_SEED } = options
  const rng = createRng(seed)
  const points: DataPoint[] = []
  const half = Math.floor(numPoints / 2)
  const jitterScale = noise * 1.5

  const spiralArm = (t: number, armOffset: number, label: number) => {
    const radius = t * DOMAIN
    const angle = t * 4 * Math.PI + armOffset
    const jitterX = (rng() - 0.5) * jitterScale
    const jitterY = (rng() - 0.5) * jitterScale
    points.push({
      x: radius * Math.cos(angle) + jitterX,
      y: radius * Math.sin(angle) + jitterY,
      label,
    })
  }

  for (let i = 0; i < half; i++) {
    const t = i / half
    spiralArm(t, 0, 0)
    spiralArm(t, Math.PI, 1)
  }

  return points
}

export function generateNeuralNetworkDataset(
  type: NeuralNetworkDatasetType,
  options?: GenerateDatasetOptions
): DataPoint[] {
  switch (type) {
    case 'circle':
      return generateCircleData(options)
    case 'xor':
      return generateXORData(options)
    case 'gaussian':
      return generateGaussianData(options)
    case 'spiral':
      return generateSpiralData(options)
    default:
      return generateCircleData(options)
  }
}

/**
 * Shuffle-then-split a dataset into train/test subsets, matching TensorFlow
 * Playground's "ratio of training to test data" control. Uses the same seeded
 * LCG convention as the generators so the split is reproducible.
 */
export function splitTrainTest(
  points: DataPoint[],
  testRatio: number,
  seed: number = DEFAULT_SEED
): { train: DataPoint[]; test: DataPoint[] } {
  const rng = createRng(seed)
  const shuffled = [...points]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const clampedRatio = Math.min(0.9, Math.max(0.1, testRatio))
  const testCount = Math.round(shuffled.length * clampedRatio)

  return {
    test: shuffled.slice(0, testCount),
    train: shuffled.slice(testCount),
  }
}
