import type { Point2D, LinearRegressionParams } from '../types'

/**
 * Visualization functions for Linear Regression
 * Pure functions - only draw based on provided state
 * NO business logic, NO algorithm mutations
 */

/**
 * Draws data points on canvas
 */
export function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  config: {
    canvasWidth: number
    canvasHeight: number
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    pointRadius: number
    pointColor: string
  }
): void {
  ctx.save()
  ctx.fillStyle = config.pointColor

  for (const point of points) {
    const canvasX = mapToCanvas(point.x, config.xMin, config.xMax, 0, config.canvasWidth)
    const canvasY = mapToCanvas(point.y, config.yMin, config.yMax, config.canvasHeight, 0)

    ctx.beginPath()
    ctx.arc(canvasX, canvasY, config.pointRadius, 0, 2 * Math.PI)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Draws regression line
 */
export function drawRegressionLine(
  ctx: CanvasRenderingContext2D,
  params: LinearRegressionParams,
  config: {
    canvasWidth: number
    canvasHeight: number
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    lineWidth: number
    lineColor: string
  }
): void {
  ctx.save()
  ctx.strokeStyle = config.lineColor
  ctx.lineWidth = config.lineWidth

  // Calculate line endpoints
  const x1 = config.xMin
  const y1 = params.slope * x1 + params.intercept
  const x2 = config.xMax
  const y2 = params.slope * x2 + params.intercept

  const canvasX1 = mapToCanvas(x1, config.xMin, config.xMax, 0, config.canvasWidth)
  const canvasY1 = mapToCanvas(y1, config.yMin, config.yMax, config.canvasHeight, 0)
  const canvasX2 = mapToCanvas(x2, config.xMin, config.xMax, 0, config.canvasWidth)
  const canvasY2 = mapToCanvas(y2, config.yMin, config.yMax, config.canvasHeight, 0)

  ctx.beginPath()
  ctx.moveTo(canvasX1, canvasY1)
  ctx.lineTo(canvasX2, canvasY2)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draws error lines from points to regression line
 */
export function drawErrorLines(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  params: LinearRegressionParams,
  config: {
    canvasWidth: number
    canvasHeight: number
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    lineWidth: number
    lineColor: string
  }
): void {
  ctx.save()
  ctx.strokeStyle = config.lineColor
  ctx.lineWidth = config.lineWidth
  ctx.setLineDash([5, 5])

  for (const point of points) {
    const predictedY = params.slope * point.x + params.intercept

    const canvasX = mapToCanvas(point.x, config.xMin, config.xMax, 0, config.canvasWidth)
    const canvasY1 = mapToCanvas(point.y, config.yMin, config.yMax, config.canvasHeight, 0)
    const canvasY2 = mapToCanvas(predictedY, config.yMin, config.yMax, config.canvasHeight, 0)

    ctx.beginPath()
    ctx.moveTo(canvasX, canvasY1)
    ctx.lineTo(canvasX, canvasY2)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Draws coordinate axes
 */
export function drawCoordinateAxes(
  ctx: CanvasRenderingContext2D,
  config: {
    canvasWidth: number
    canvasHeight: number
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    axisColor: string
    axisWidth: number
  }
): void {
  ctx.save()
  ctx.strokeStyle = config.axisColor
  ctx.lineWidth = config.axisWidth

  const zeroX = mapToCanvas(0, config.xMin, config.xMax, 0, config.canvasWidth)
  const zeroY = mapToCanvas(0, config.yMin, config.yMax, config.canvasHeight, 0)

  // X axis
  ctx.beginPath()
  ctx.moveTo(0, zeroY)
  ctx.lineTo(config.canvasWidth, zeroY)
  ctx.stroke()

  // Y axis
  ctx.beginPath()
  ctx.moveTo(zeroX, 0)
  ctx.lineTo(zeroX, config.canvasHeight)
  ctx.stroke()

  ctx.restore()
}

/**
 * Helper function to map value from one range to another
 */
function mapToCanvas(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin
}
