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

// Time Series Types
export type TimeSeriesFrequency = 'daily' | 'monthly'

export interface TimeSeriesPoint {
  timestamp: string
  value: number | null
  label?: string
  isHoliday?: boolean
  isWeekend?: boolean
}

export interface TimeSeriesDataset {
  id: string
  name: string
  description: string
  frequency: TimeSeriesFrequency
  defaultSeasonLength: number
  points: TimeSeriesPoint[]
}

export type TimeSeriesForecastModelId =
  | 'mean'
  | 'naive'
  | 'seasonal-naive'
  | 'moving-average'
  | 'simple-exponential-smoothing'
  | 'holt-linear'
  | 'holt-winters-additive'

export type TimeSeriesMissingValueStrategy = 'linear-interpolate' | 'forward-fill' | 'drop'

export interface TimeSeriesCleanConfig {
  missingValueStrategy: TimeSeriesMissingValueStrategy
  outlierClipPercent: number
  rollingWindow: number
  seasonalPeriod: number
  forecastHorizon: number
  alpha: number
  beta: number
  gamma: number
}

export interface TimeSeriesForecastMetrics {
  mae: number
  rmse: number
  mape: number
}

export interface TimeSeriesForecastResult {
  modelId: TimeSeriesForecastModelId
  predictions: number[]
  fitted: Array<number | null>
  lowerBand: Array<number | null>
  upperBand: Array<number | null>
  metrics: TimeSeriesForecastMetrics
  notes: string[]
}

export interface TimeSeriesEngineState {
  sourceSeries: TimeSeriesPoint[]
  cleanedSeries: TimeSeriesPoint[]
  trainSeries: TimeSeriesPoint[]
  testSeries: TimeSeriesPoint[]
  trendSeries: Array<number | null>
  seasonalSeries: Array<number | null>
  residualSeries: Array<number | null>
  forecast: TimeSeriesForecastResult
  config: TimeSeriesCleanConfig & { modelId: TimeSeriesForecastModelId }
  notes: string[]
}
