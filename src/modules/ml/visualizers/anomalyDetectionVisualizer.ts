import type { AnomalyPoint, AnomalyDetectionState } from '../engines/AnomalyDetectionEngine'

/**
 * Anomaly Detection Visualizer
 * Renders anomaly detection results with different visualization modes
 */

export function drawAnomalyDetection(
  ctx: CanvasRenderingContext2D,
  state: AnomalyDetectionState,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark',
  showScores: boolean = false,
  showDecisionBoundary: boolean = true
) {
  // Clear canvas
  ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
  ctx.fillRect(0, 0, width, height)

  if (state.points.length === 0) return

  // Find data bounds
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity

  state.points.forEach((point) => {
    xMin = Math.min(xMin, point.x)
    xMax = Math.max(xMax, point.x)
    yMin = Math.min(yMin, point.y)
    yMax = Math.max(yMax, point.y)
  })

  // Add padding to bounds
  const xRange = xMax - xMin
  const yRange = yMax - yMin
  xMin -= xRange * 0.1
  xMax += xRange * 0.1
  yMin -= yRange * 0.1
  yMax += yRange * 0.1

  // Draw grid
  drawGrid(ctx, xMin, xMax, yMin, yMax, width, height, padding, theme)

  // Draw axes
  drawAxes(ctx, width, height, padding, theme)

  // Draw decision boundary for applicable methods
  if (showDecisionBoundary) {
    switch (state.method) {
      case 'one-class-svm':
        if (state.svmCenter && state.svmRadius) {
          drawSVMDoundary(
            ctx,
            state.svmCenter,
            state.svmRadius,
            xMin,
            xMax,
            yMin,
            yMax,
            width,
            height,
            padding,
            theme
          )
        }
        break
      case 'z-score':
      case 'iqr':
        if (state.statisticalParams) {
          drawStatisticalBoundary(ctx, state, xMin, xMax, yMin, yMax, width, height, padding, theme)
        }
        break
    }
  }

  // Draw data points
  drawDataPoints(
    ctx,
    state.points,
    xMin,
    xMax,
    yMin,
    yMax,
    width,
    height,
    padding,
    theme,
    showScores
  )

  // Draw info panel
  drawInfoPanel(ctx, state, padding, theme)
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb'
  ctx.lineWidth = 0.5

  // Vertical grid lines
  const xStep = (xMax - xMin) / 10
  for (let x = xMin; x <= xMax; x += xStep) {
    const screenX = padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth
    ctx.beginPath()
    ctx.moveTo(screenX, padding.top)
    ctx.lineTo(screenX, height - padding.bottom)
    ctx.stroke()
  }

  // Horizontal grid lines
  const yStep = (yMax - yMin) / 10
  for (let y = yMin; y <= yMax; y += yStep) {
    const screenY = height - padding.bottom - ((y - yMin) / (yMax - yMin)) * plotHeight
    ctx.beginPath()
    ctx.moveTo(padding.left, screenY)
    ctx.lineTo(width - padding.right, screenY)
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
  ctx.strokeStyle = theme === 'dark' ? '#6b7280' : '#374151'
  ctx.lineWidth = 1

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

  // Axis labels
  ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#374151'
  ctx.font = '12px system-ui'
  ctx.textAlign = 'center'

  // X-axis label
  ctx.fillText('X', width / 2, height - 5)

  // Y-axis label
  ctx.save()
  ctx.translate(15, height / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('Y', 0, 0)
  ctx.restore()
}

function drawSVMDoundary(
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  radius: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Convert center to screen coordinates
  const screenCenterX = padding.left + ((center.x - xMin) / (xMax - xMin)) * plotWidth
  const screenCenterY = height - padding.bottom - ((center.y - yMin) / (yMax - yMin)) * plotHeight

  // Convert radius to screen coordinates (approximate)
  const screenRadiusX = (radius / (xMax - xMin)) * plotWidth
  const screenRadiusY = (radius / (yMax - yMin)) * plotHeight
  const screenRadius = Math.min(screenRadiusX, screenRadiusY)

  // Draw decision boundary circle
  ctx.strokeStyle = theme === 'dark' ? '#3b82f6' : '#2563eb'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.arc(screenCenterX, screenCenterY, screenRadius, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw center point
  ctx.fillStyle = theme === 'dark' ? '#3b82f6' : '#2563eb'
  ctx.beginPath()
  ctx.arc(screenCenterX, screenCenterY, 4, 0, 2 * Math.PI)
  ctx.fill()
}

function drawStatisticalBoundary(
  ctx: CanvasRenderingContext2D,
  state: AnomalyDetectionState,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  if (!state.statisticalParams) return

  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  ctx.strokeStyle = theme === 'dark' ? '#10b981' : '#059669'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])

  if (state.method === 'iqr') {
    const { q1, q3, iqr } = state.statisticalParams

    // Draw IQR boundaries as rectangles
    const leftX = padding.left + ((q1.x - 1.5 * iqr.x - xMin) / (xMax - xMin)) * plotWidth
    const rightX = padding.left + ((q3.x + 1.5 * iqr.x - xMin) / (xMax - xMin)) * plotWidth
    const bottomY =
      height - padding.bottom - ((q1.y - 1.5 * iqr.y - yMin) / (yMax - yMin)) * plotHeight
    const topY =
      height - padding.bottom - ((q3.y + 1.5 * iqr.y - yMin) / (yMax - yMin)) * plotHeight

    ctx.strokeRect(leftX, topY, rightX - leftX, bottomY - topY)
  }

  ctx.setLineDash([])
}

function drawDataPoints(
  ctx: CanvasRenderingContext2D,
  points: AnomalyPoint[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark',
  showScores: boolean
) {
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  points.forEach((point) => {
    const screenX = padding.left + ((point.x - xMin) / (xMax - xMin)) * plotWidth
    const screenY = height - padding.bottom - ((point.y - yMin) / (yMax - yMin)) * plotHeight

    // Color based on anomaly status
    let color: string
    let size: number

    if (point.isAnomaly) {
      color = theme === 'dark' ? '#ef4444' : '#dc2626' // Red for anomalies
      size = 8
    } else {
      color = theme === 'dark' ? '#10b981' : '#059669' // Green for normal points
      size = 6
    }

    // Draw point
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(screenX, screenY, size, 0, 2 * Math.PI)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Show anomaly score if requested
    if (showScores) {
      ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#374151'
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(point.anomalyScore.toFixed(2), screenX, screenY - size - 5)
    }
  })
}

function drawInfoPanel(
  ctx: CanvasRenderingContext2D,
  state: AnomalyDetectionState,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: 'light' | 'dark'
) {
  const panelX = padding.left + 10
  const panelY = padding.top + 10
  const panelWidth = 220
  const panelHeight = 140

  // Semi-transparent background
  ctx.fillStyle = theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)'
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight)

  // Border
  ctx.strokeStyle = theme === 'dark' ? '#374151' : '#d1d5db'
  ctx.lineWidth = 1
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

  // Text
  ctx.fillStyle = theme === 'dark' ? '#f9fafb' : '#111827'
  ctx.font = '12px system-ui'
  ctx.textAlign = 'left'

  let yOffset = panelY + 20

  // Method name
  const methodNames = {
    'isolation-forest': 'Isolation Forest',
    'one-class-svm': 'One-Class SVM',
    lof: 'Local Outlier Factor',
    'z-score': 'Z-Score',
    iqr: 'IQR Method',
  }

  ctx.fillText(`Method: ${methodNames[state.method]}`, panelX + 10, yOffset)
  yOffset += 18

  // Step progress
  ctx.fillStyle = theme === 'dark' ? '#60a5fa' : '#2563eb'
  ctx.font = 'bold 12px system-ui'
  ctx.fillText(`Step: ${state.currentStep}/${state.totalSteps}`, panelX + 10, yOffset)
  yOffset += 16

  // Step description
  ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
  ctx.font = '11px system-ui'
  ctx.fillText(state.stepDescription, panelX + 10, yOffset)
  yOffset += 20

  // Reset text style
  ctx.fillStyle = theme === 'dark' ? '#f9fafb' : '#111827'
  ctx.font = '12px system-ui'

  // Contamination rate
  ctx.fillText(`Contamination: ${(state.contamination * 100).toFixed(1)}%`, panelX + 10, yOffset)
  yOffset += 18

  // Number of anomalies
  const anomalyCount = state.points.filter((p) => p.isAnomaly).length
  ctx.fillText(`Anomalies: ${anomalyCount}/${state.points.length}`, panelX + 10, yOffset)
  yOffset += 18

  // Threshold (only show if computed)
  if (state.threshold > 0) {
    ctx.fillText(`Threshold: ${state.threshold.toFixed(3)}`, panelX + 10, yOffset)
  }
}
