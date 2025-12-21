import type { DataPoint } from '../types'

/**
 * Pure algorithm functions for MinMax Scaling
 * NO UI, NO Canvas, NO side effects
 * Fully testable
 */

/**
 * MinMax Scaler result interface
 */
export interface MinMaxScalerResult {
  originalData: DataPoint[]
  scaledData: DataPoint[]
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  featureRange: [number, number]
}

/**
 * Apply MinMax scaling to data points
 * Scales features to a specified range (default [0, 1])
 */
export function minMaxScale(
  data: DataPoint[],
  featureRange: [number, number] = [0, 1]
): MinMaxScalerResult {
  if (data.length === 0) {
    return {
      originalData: [],
      scaledData: [],
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
      featureRange,
    }
  }

  // Find min and max values for each feature
  const xValues = data.map((p) => p.x)
  const yValues = data.map((p) => p.y)

  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Scale the data
  const scaledData: DataPoint[] = data.map((point) => {
    const scaledX =
      xMin === xMax
        ? featureRange[0] + (featureRange[1] - featureRange[0]) / 2
        : featureRange[0] + ((featureRange[1] - featureRange[0]) * (point.x - xMin)) / (xMax - xMin)

    const scaledY =
      yMin === yMax
        ? featureRange[0] + (featureRange[1] - featureRange[0]) / 2
        : featureRange[0] + ((featureRange[1] - featureRange[0]) * (point.y - yMin)) / (yMax - yMin)

    return { x: scaledX, y: scaledY }
  })

  return {
    originalData: [...data],
    scaledData,
    xMin,
    xMax,
    yMin,
    yMax,
    featureRange,
  }
}

/**
 * Calculate the inverse transformation (unscale the data)
 */
export function inverseMinMaxScale(
  scaledData: DataPoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  featureRange: [number, number] = [0, 1]
): DataPoint[] {
  return scaledData.map((point) => {
    const originalX =
      xMin === xMax
        ? xMin
        : xMin + ((point.x - featureRange[0]) * (xMax - xMin)) / (featureRange[1] - featureRange[0])

    const originalY =
      yMin === yMax
        ? yMin
        : yMin + ((point.y - featureRange[0]) * (yMax - yMin)) / (featureRange[1] - featureRange[0])

    return { x: originalX, y: originalY }
  })
}
