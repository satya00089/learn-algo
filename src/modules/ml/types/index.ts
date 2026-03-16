// Machine Learning types

export interface Point2D {
  x: number
  y: number
}

export interface Point3D extends Point2D {
  z: number
}

export interface DataPoint extends Point2D {
  label?: number
  z?: number // Optional third dimension for 3D visualization
  embeddings?: number[] // Full embedding vector for high-dimensional data
  metadata?: Record<string, any> // Optional metadata (e.g., movie info, image data)
  std?: number[] // Standard deviation vector (for PCA standardization)
}

export interface LinearRegressionParams {
  slope: number
  intercept: number
}

export interface GradientDescentStep {
  iteration: number
  slope: number
  intercept: number
  cost: number
  gradientSlope: number
  gradientIntercept: number
}

// Gradient Descent Types
export interface GradientDescentFunction {
  f: (x: number) => number
  df: (x: number) => number
  name: string
  domain: [number, number]
}

export interface GradientDescentState {
  currentX: number
  iteration: number
  isConverged: boolean
  history: GradientDescentHistoryPoint[]
}

export interface GradientDescentHistoryPoint {
  iteration: number
  x: number
  y: number
  gradient: number
  stepSize: number
}

export interface GradientDescentConfig {
  function: GradientDescentFunction
  learningRate: number
  maxIterations: number
  convergenceThreshold: number
  initialX: number
}

// Polynomial Regression Types
export interface PolynomialParams {
  coefficients: number[] // [a0, a1, a2, ...] for a0 + a1*x + a2*x^2 + ...
}

export interface PolynomialRegressionState {
  params: PolynomialParams
  cost: number
  iteration: number
  isConverged: boolean
  history: PolynomialRegressionStep[]
  predictions: number[]
}

export interface PolynomialRegressionStep {
  iteration: number
  params: PolynomialParams
  cost: number
  gradients: number[]
}

export interface PolynomialRegressionConfig {
  points: Point2D[]
  degree: number
  learningRate: number
  maxIterations: number
  convergenceThreshold: number
  initialCoefficients?: number[]
}

// KNN Types
export interface KNNDataPoint extends Point2D {
  label: number // class label (0, 1, 2, etc.)
  predictedLabel?: number
}

export interface KNNConfig {
  points: KNNDataPoint[]
  k: number
  testPoint?: Point2D
}

export interface KNNResult {
  predictedLabel: number
  neighbors: KNNNeighbor[]
  distances: number[]
}

export interface KNNNeighbor {
  point: KNNDataPoint
  distance: number
  index: number
}
