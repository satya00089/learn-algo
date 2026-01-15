/**
 * Variance Visualizer
 * Canvas drawing functions for variance convergence visualization
 */

import type { VarianceState } from '../engines/VarianceEngine'

export interface CanvasConfig {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
}

/**
 * Draw convergence chart showing running variance converging to theoretical variance
 */
export function drawConvergenceChart(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: VarianceState,
  showTheoretical: boolean
): void {
  const { width, height, padding } = config
  const isDark = document.documentElement.classList.contains('dark')

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Calculate chart dimensions
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const chartX = padding.left
  const chartY = padding.top

  // Colors
  const bgColor = isDark ? '#1f2937' : '#ffffff'
  const gridColor = isDark ? '#374151' : '#e5e7eb'
  const textColor = isDark ? '#d1d5db' : '#374151'
  const runningColor = '#10b981' // Green for running variance
  const theoreticalColor = '#3b82f6' // Blue for theoretical variance

  // Fill background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  if (state.draws.length === 0) {
    // Show placeholder message
    ctx.fillStyle = textColor
    ctx.font = '16px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Draw cards to see variance convergence', width / 2, height / 2)
    return
  }

  // Calculate running variances for each draw
  const runningVariances: number[] = []
  const squaredDiffs: number[] = []

  for (let i = 0; i < state.draws.length; i++) {
    const draw = state.draws[i]
    const diff = draw.value - state.theoreticalExpectation
    squaredDiffs.push(diff * diff)

    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length
    runningVariances.push(avgSquaredDiff)
  }

  // Find max value for y-axis
  const maxVariance = Math.max(...runningVariances, state.theoreticalVariance * 1.2)
  const maxDraws = state.draws.length

  // Draw grid
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = chartY + (chartHeight * i) / 5
    ctx.beginPath()
    ctx.moveTo(chartX, y)
    ctx.lineTo(chartX + chartWidth, y)
    ctx.stroke()
  }

  // Vertical grid lines
  for (let i = 0; i <= 5; i++) {
    const x = chartX + (chartWidth * i) / 5
    ctx.beginPath()
    ctx.moveTo(x, chartY)
    ctx.lineTo(x, chartY + chartHeight)
    ctx.stroke()
  }

  // Draw axes
  ctx.strokeStyle = textColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(chartX, chartY + chartHeight)
  ctx.lineTo(chartX + chartWidth, chartY + chartHeight)
  ctx.lineTo(chartX + chartWidth, chartY)
  ctx.stroke()

  // Draw Y-axis labels
  ctx.fillStyle = textColor
  ctx.font = '12px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= 5; i++) {
    const value = maxVariance - (maxVariance * i) / 5
    const y = chartY + (chartHeight * i) / 5
    ctx.fillText(value.toFixed(2), chartX - 10, y)
  }

  // Draw X-axis labels
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  for (let i = 0; i <= 5; i++) {
    const value = Math.floor((maxDraws * i) / 5)
    const x = chartX + (chartWidth * i) / 5
    ctx.fillText(value.toString(), x, chartY + chartHeight + 10)
  }

  // Draw axis titles
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('Number of Draws', chartX + chartWidth / 2, height - 5)

  ctx.save()
  ctx.translate(15, chartY + chartHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('Variance', 0, 0)
  ctx.restore()

  // Helper function to convert data to canvas coordinates
  const toX = (drawIndex: number) => {
    return chartX + (drawIndex / maxDraws) * chartWidth
  }

  const toY = (variance: number) => {
    return chartY + chartHeight - (variance / maxVariance) * chartHeight
  }

  // Draw theoretical variance line (if enabled)
  if (showTheoretical) {
    ctx.strokeStyle = theoreticalColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    const theoreticalY = toY(state.theoreticalVariance)
    ctx.moveTo(chartX, theoreticalY)
    ctx.lineTo(chartX + chartWidth, theoreticalY)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Draw running variance line
  ctx.strokeStyle = runningColor
  ctx.lineWidth = 2
  ctx.beginPath()

  for (let i = 0; i < runningVariances.length; i++) {
    const x = toX(i)
    const y = toY(runningVariances[i])

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.stroke()

  // Draw legend
  const legendX = chartX + chartWidth - 200
  const legendY = chartY + 20

  // Running variance legend
  ctx.fillStyle = runningColor
  ctx.fillRect(legendX, legendY, 20, 3)
  ctx.fillStyle = textColor
  ctx.font = '12px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('Running Variance', legendX + 30, legendY + 1.5)

  // Theoretical variance legend (if enabled)
  if (showTheoretical) {
    ctx.strokeStyle = theoreticalColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(legendX, legendY + 25)
    ctx.lineTo(legendX + 20, legendY + 25)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = textColor
    ctx.fillText('Theoretical Variance', legendX + 30, legendY + 25)
  }
}

/**
 * Draw the current card
 */
export function drawCard(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  cardValue: number | null
): void {
  const { width, height } = config
  const isDark = document.documentElement.classList.contains('dark')

  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  const bgColor = isDark ? '#1f2937' : '#ffffff'
  const cardBg = isDark ? '#374151' : '#f3f4f6'
  const textColor = isDark ? '#d1d5db' : '#374151'
  const accentColor = '#ef4444' // Red for card suits

  // Fill background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)

  if (cardValue === null) {
    // Show placeholder
    ctx.strokeStyle = textColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(40, 40, width - 80, height - 80)
    ctx.setLineDash([])

    ctx.fillStyle = textColor
    ctx.font = '16px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', width / 2, height / 2)
    return
  }

  // Draw card background
  ctx.fillStyle = cardBg
  ctx.fillRect(30, 30, width - 60, height - 60)
  ctx.strokeStyle = textColor
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, width - 60, height - 60)

  // Draw card value
  ctx.fillStyle = accentColor
  ctx.font = 'bold 64px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Display card value (Ace = A, 10 = 10, others as numbers)
  const displayValue = cardValue === 1 ? 'A' : cardValue.toString()
  ctx.fillText(displayValue, width / 2, height / 2)
}
