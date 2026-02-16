import type { TSNEState } from '../engines/TSNEEngine'

export interface TSNEVisualizerOptions {
  theme: 'light' | 'dark'
  showLabels?: boolean
  highlightCategories?: boolean
  showCost?: boolean
  pointSize?: number
}

/**
 * Draw t-SNE visualization on a 2D canvas
 */
// eslint-disable-next-line complexity
export function drawTSNEVisualization(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: TSNEState,
  options: TSNEVisualizerOptions
) {
  const {
    theme,
    showLabels = true,
    highlightCategories = true,
    showCost = true,
    pointSize = 6,
  } = options

  // Clear canvas
  ctx.fillStyle = theme === 'dark' ? '#111827' : '#f9fafb'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Calculate bounds with padding
  const padding = 80
  const drawWidth = canvas.width - padding * 2
  const drawHeight = canvas.height - padding * 2

  // Find data bounds
  const xValues = state.points.map((p) => p.x)
  const yValues = state.points.map((p) => p.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Add some margin
  const xRange = xMax - xMin || 1
  const yRange = yMax - yMin || 1
  const xMargin = xRange * 0.1
  const yMargin = yRange * 0.1

  // Scale functions
  const scaleX = (x: number) =>
    padding + ((x - xMin + xMargin) / (xRange + 2 * xMargin)) * drawWidth

  const scaleY = (y: number) =>
    padding + ((y - yMin + yMargin) / (yRange + 2 * yMargin)) * drawHeight

  // Define category colors for MNIST digits (0-9)
  const categoryColors: Record<string, string> = {
    '0': '#ef4444', // red
    '1': '#f59e0b', // orange
    '2': '#eab308', // yellow
    '3': '#84cc16', // lime
    '4': '#10b981', // green
    '5': '#06b6d4', // cyan
    '6': '#3b82f6', // blue
    '7': '#8b5cf6', // purple
    '8': '#ec4899', // pink
    '9': '#f43f5e', // rose
  }

  // Get unique categories
  const categories = Array.from(new Set(state.points.map((p) => p.category).filter(Boolean)))

  // Draw legend if highlighting categories
  if (highlightCategories && categories.length > 0) {
    const legendX = canvas.width - padding + 10
    let legendY = padding

    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#4b5563'
    ctx.fillText('Categories', legendX, legendY)
    legendY += 20

    categories.forEach((category) => {
      if (!category) return
      const color = categoryColors[category] || '#6b7280'

      // Draw color circle
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(legendX + 6, legendY, 5, 0, Math.PI * 2)
      ctx.fill()

      // Draw label
      ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#374151'
      ctx.font = '11px Inter, sans-serif'
      ctx.fillText(category, legendX + 15, legendY + 4)

      legendY += 18
    })
  }

  // Draw title and iteration info
  ctx.font = 'bold 18px Inter, sans-serif'
  ctx.fillStyle = theme === 'dark' ? '#f3f4f6' : '#111827'
  ctx.fillText('t-SNE Embedding', padding, padding - 45)

  ctx.font = '13px Inter, sans-serif'
  ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
  ctx.fillText(`Iteration: ${state.iteration} / ${state.maxIterations}`, padding, padding - 25)

  if (showCost) {
    ctx.fillText(`Cost: ${state.cost.toFixed(4)}`, padding, padding - 10)
  }

  // Draw phase indicator
  if (state.phase === 'early-exaggeration') {
    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = '#f59e0b'
    ctx.fillText('(Early Exaggeration)', padding + 180, padding - 25)
  } else if (state.phase === 'complete') {
    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = '#10b981'
    ctx.fillText('✓ Complete', padding + 180, padding - 25)
  }

  // Draw axes
  const axisColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  ctx.strokeStyle = axisColor
  ctx.lineWidth = 1

  // X-axis
  ctx.beginPath()
  ctx.moveTo(padding, canvas.height - padding)
  ctx.lineTo(canvas.width - padding, canvas.height - padding)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, canvas.height - padding)
  ctx.stroke()

  // Draw axis labels
  ctx.font = '13px Inter, sans-serif'
  ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
  ctx.textAlign = 'center'
  ctx.fillText('t-SNE Dimension 1', canvas.width / 2, canvas.height - padding + 35)

  ctx.save()
  ctx.translate(padding - 45, canvas.height / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('t-SNE Dimension 2', 0, 0)
  ctx.restore()

  // Draw points
  state.points.forEach((point) => {
    const x = scaleX(point.x)
    const y = scaleY(point.y)

    // Determine color
    let color = '#6b7280'
    if (highlightCategories && point.category) {
      color = categoryColors[point.category] || '#6b7280'
    }

    // Draw point with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 4
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, pointSize, 0, Math.PI * 2)
    ctx.fill()

    // Reset shadow
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    // Draw border
    ctx.strokeStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  })

  // Draw labels for selected points
  if (showLabels) {
    ctx.font = '10px Inter, sans-serif'
    ctx.textAlign = 'center'

    // Only show labels for first few points or named points
    const labeledPoints = state.points.filter(
      (p) => p.label && (p.originalIndex < 50 || p.metadata?.verified)
    )

    labeledPoints.forEach((point) => {
      const x = scaleX(point.x)
      const y = scaleY(point.y)

      // Draw label background
      const label = point.label || `P${point.originalIndex}`
      const metrics = ctx.measureText(label)
      const labelWidth = metrics.width + 8
      const labelHeight = 16

      ctx.fillStyle = theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      ctx.fillRect(x - labelWidth / 2, y - pointSize - labelHeight - 2, labelWidth, labelHeight)

      // Draw label text
      ctx.fillStyle = theme === 'dark' ? '#f3f4f6' : '#111827'
      ctx.fillText(label, x, y - pointSize - 7)
    })
  }

  // Draw cost history graph (mini chart in corner)
  if (state.costHistory.length > 1) {
    const chartX = padding
    const chartY = canvas.height - padding - 120
    const chartWidth = 200
    const chartHeight = 80

    // Background
    ctx.fillStyle = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'
    ctx.fillRect(chartX, chartY, chartWidth, chartHeight)

    // Border
    ctx.strokeStyle = theme === 'dark' ? '#4b5563' : '#d1d5db'
    ctx.lineWidth = 1
    ctx.strokeRect(chartX, chartY, chartWidth, chartHeight)

    // Title
    ctx.font = '11px Inter, sans-serif'
    ctx.fillStyle = theme === 'dark' ? '#d1d5db' : '#4b5563'
    ctx.textAlign = 'left'
    ctx.fillText('Cost History', chartX + 5, chartY + 12)

    // Draw cost line
    const costs = state.costHistory
    const maxCost = Math.max(...costs)
    const minCost = Math.min(...costs)
    const costRange = maxCost - minCost || 1

    ctx.beginPath()
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2

    costs.forEach((cost, i) => {
      const x = chartX + (i / (costs.length - 1)) * chartWidth
      const y = chartY + chartHeight - ((cost - minCost) / costRange) * (chartHeight - 20) - 10

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }

  ctx.textAlign = 'left'
}
