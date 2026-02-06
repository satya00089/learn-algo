import type { PCAPoint, PCAState } from '../engines/PCAEngine'

/**
 * PCA Visualizer
 * Renders PCA results with original/transformed data and component vectors
 */

export function drawPCA(
  ctx: CanvasRenderingContext2D,
  state: PCAState,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark',
  showOriginal: boolean = true,
  showTransformed: boolean = true,
  showComponents: boolean = true,
  view3D: boolean = false
) {
  // Clear canvas
  ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
  ctx.fillRect(0, 0, width, height)

  if (state.points.length === 0) return

  // Use 3D visualization if enabled
  if (view3D) {
    // 3D view is handled by PCA3DScene component
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
    ctx.font = '16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('Switch to 2D view to see canvas visualization', width / 2, height / 2)
    return
  }

  // Find bounds for both original and transformed data
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity

  if (showOriginal) {
    state.points.forEach(point => {
      xMin = Math.min(xMin, point.original.x)
      xMax = Math.max(xMax, point.original.x)
      yMin = Math.min(yMin, point.original.y)
      yMax = Math.max(yMax, point.original.y)
    })
  }

  if (showTransformed) {
    state.points.forEach(point => {
      xMin = Math.min(xMin, point.transformed.x)
      xMax = Math.max(xMax, point.transformed.x)
      yMin = Math.min(yMin, point.transformed.y)
      yMax = Math.max(yMax, point.transformed.y)
    })
  }

  // Add padding to bounds
  const xRange = xMax - xMin || 1
  const yRange = yMax - yMin || 1
  xMin -= xRange * 0.1
  xMax += xRange * 0.1
  yMin -= yRange * 0.1
  yMax += yRange * 0.1

  // Draw grid
  drawGrid(ctx, width, height, padding, theme)

  // Draw axes
  drawAxes(ctx, width, height, padding, theme)

  // Draw component vectors if available
  if (showComponents && state.components.length > 0) {
    drawComponentVectors(ctx, state, xMin, xMax, yMin, yMax, width, height, padding, theme)
  }

  // Draw points
  if (showOriginal) {
    drawPoints(ctx, state.points, 'original', xMin, xMax, yMin, yMax, width, height, padding, '#3b82f6', 0.6)
  }

  if (showTransformed) {
    drawPoints(ctx, state.points, 'transformed', xMin, xMax, yMin, yMax, width, height, padding, '#ef4444', 1)
  }

  // Draw step information
  drawStepInfo(ctx, state, height, padding, theme)
}

function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: PCAPoint[],
  type: 'original' | 'transformed',
  xMin: number, xMax: number, yMin: number, yMax: number,
  width: number, height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  color: string,
  alpha: number
) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  points.forEach(point => {
    const dataPoint = type === 'original' ? point.original : point.transformed

    const x = padding.left + ((dataPoint.x - xMin) / (xMax - xMin)) * plotWidth
    const y = padding.top + ((yMax - dataPoint.y) / (yMax - yMin)) * plotHeight

    // Draw point
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()

    // Draw outline
    ctx.globalAlpha = 1
    ctx.stroke()
    ctx.globalAlpha = alpha
  })

  ctx.globalAlpha = 1
}

function drawComponentVectors(
  ctx: CanvasRenderingContext2D,
  state: PCAState,
  xMin: number, xMax: number, yMin: number, yMax: number,
  width: number, height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Draw from origin (mean)
  const originX = padding.left + ((0 - xMin) / (xMax - xMin)) * plotWidth
  const originY = padding.top + ((yMax - 0) / (yMax - yMin)) * plotHeight

  const scale = Math.min(plotWidth, plotHeight) * 0.3 // Scale for vector length

  state.components.forEach((component, index) => {
    const [vx, vy] = component.eigenvector
    const length = Math.sqrt(component.eigenvalue) * scale * 0.1 // Scale by eigenvalue

    const endX = originX + vx * length
    const endY = originY - vy * length // Flip Y for canvas

    // Draw arrow
    ctx.strokeStyle = index === 0 ? '#10b981' : '#f59e0b'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(originX, originY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Draw arrowhead
    const angle = Math.atan2(endY - originY, endX - originX)
    const arrowLength = 10
    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(endX, endY)
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()

    // Label
    ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
    ctx.font = '12px monospace'
    ctx.fillText(`PC${index + 1} (${(component.explainedVariance * 100).toFixed(1)}%)`, endX + 5, endY - 5)
  })
}

function drawStepInfo(
  ctx: CanvasRenderingContext2D,
  state: PCAState,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
  ctx.font = '14px monospace'
  ctx.fillText(`Step ${state.currentStep}/${state.totalSteps}: ${state.stepDescription}`, padding.left, height - padding.bottom + 20)
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb'
  ctx.lineWidth = 1

  // Vertical grid lines
  for (let i = 0; i <= 10; i++) {
    const x = padding.left + (i / 10) * plotWidth
    ctx.beginPath()
    ctx.moveTo(x, padding.top)
    ctx.lineTo(x, height - padding.bottom)
    ctx.stroke()
  }

  // Horizontal grid lines
  for (let i = 0; i <= 10; i++) {
    const y = padding.top + (i / 10) * plotHeight
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
  }
}

function drawAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  ctx.strokeStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
  ctx.lineWidth = 2

  // X-axis
  ctx.beginPath()
  ctx.moveTo(padding.left, height - padding.bottom)
  ctx.lineTo(width - padding.right, height - padding.bottom)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, height - padding.bottom)
  ctx.stroke()

  // Labels
  ctx.fillStyle = theme === 'dark' ? '#ffffff' : '#000000'
  ctx.font = '12px monospace'
  ctx.fillText('X', width - padding.right + 5, height - padding.bottom + 15)
  ctx.fillText('Y', padding.left - 15, padding.top - 5)
}