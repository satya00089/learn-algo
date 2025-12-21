import type { DataPoint } from '../types'

/**
 * Pure algorithm functions for Standard Scaling
 * NO UI, NO Canvas, NO side effects
 * Fully testable
 */

/**
 * Standard Scaler result interface
 */
export interface StandardScalerResult {
  originalData: DataPoint[]
  scaledData: DataPoint[]
  xMean: number
  xStd: number
  yMean: number
  yStd: number
}

/**
 * Calculate mean of an array
 */
function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculate standard deviation of an array
 */
function calculateStd(values: number[], mean: number): number {
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Apply Standard scaling to data points
 * Standardizes features by removing the mean and scaling to unit variance
 */
export function standardScale(data: DataPoint[]): StandardScalerResult {
  if (data.length === 0) {
    return {
      originalData: [],
      scaledData: [],
      xMean: 0,
      xStd: 1,
      yMean: 0,
      yStd: 1,
    }
  }

  // Extract feature values
  const xValues = data.map((p) => p.x)
  const yValues = data.map((p) => p.y)

  // Calculate mean and standard deviation for each feature
  const xMean = calculateMean(xValues)
  const yMean = calculateMean(yValues)
  const xStd = calculateStd(xValues, xMean)
  const yStd = calculateStd(yValues, yMean)

  // Scale the data
  const scaledData: DataPoint[] = data.map((point) => {
    const scaledX = xStd === 0 ? 0 : (point.x - xMean) / xStd
    const scaledY = yStd === 0 ? 0 : (point.y - yMean) / yStd

    return { x: scaledX, y: scaledY }
  })

  return {
    originalData: [...data],
    scaledData,
    xMean,
    xStd,
    yMean,
    yStd,
  }
}

/**
 * Calculate the inverse transformation (unscale the data)
 */
export function inverseStandardScale(
  scaledData: DataPoint[],
  xMean: number,
  xStd: number,
  yMean: number,
  yStd: number
): DataPoint[] {
  return scaledData.map((point) => {
    const originalX = point.x * xStd + xMean
    const originalY = point.y * yStd + yMean

    return { x: originalX, y: originalY }
  })
}
