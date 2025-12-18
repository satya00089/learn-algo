import type { Point2D, LinearRegressionParams } from '../types'

/**
 * Pure algorithm functions for Linear Regression
 * NO UI, NO Canvas, NO side effects
 * Fully testable
 */

/**
 * Predicts y value given x and line parameters
 */
export function predict(x: number, params: LinearRegressionParams): number {
  return params.slope * x + params.intercept
}

/**
 * Calculates Mean Squared Error (cost function)
 */
export function calculateCost(points: Point2D[], params: LinearRegressionParams): number {
  const n = points.length
  if (n === 0) return 0

  let sumSquaredError = 0
  for (const point of points) {
    const predicted = predict(point.x, params)
    const error = predicted - point.y
    sumSquaredError += error * error
  }

  return sumSquaredError / (2 * n)
}

/**
 * Calculates gradient for slope (m)
 */
export function calculateSlopeGradient(points: Point2D[], params: LinearRegressionParams): number {
  const n = points.length
  if (n === 0) return 0

  let gradient = 0
  for (const point of points) {
    const predicted = predict(point.x, params)
    const error = predicted - point.y
    gradient += error * point.x
  }

  return gradient / n
}

/**
 * Calculates gradient for intercept (b)
 */
export function calculateInterceptGradient(
  points: Point2D[],
  params: LinearRegressionParams
): number {
  const n = points.length
  if (n === 0) return 0

  let gradient = 0
  for (const point of points) {
    const predicted = predict(point.x, params)
    const error = predicted - point.y
    gradient += error
  }

  return gradient / n
}

/**
 * Performs one step of gradient descent
 * Returns updated parameters
 */
export function gradientDescentStep(
  points: Point2D[],
  params: LinearRegressionParams,
  learningRate: number
): LinearRegressionParams {
  const slopeGradient = calculateSlopeGradient(points, params)
  const interceptGradient = calculateInterceptGradient(points, params)

  return {
    slope: params.slope - learningRate * slopeGradient,
    intercept: params.intercept - learningRate * interceptGradient,
  }
}

/**
 * Calculates the closed-form solution (analytical solution)
 */
export function closedFormSolution(points: Point2D[]): LinearRegressionParams {
  const n = points.length
  if (n === 0) return { slope: 0, intercept: 0 }

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  for (const point of points) {
    sumX += point.x
    sumY += point.y
    sumXY += point.x * point.y
    sumXX += point.x * point.x
  }

  const meanX = sumX / n
  const meanY = sumY / n

  const numerator = sumXY - n * meanX * meanY
  const denominator = sumXX - n * meanX * meanX

  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = meanY - slope * meanX

  return { slope, intercept }
}
