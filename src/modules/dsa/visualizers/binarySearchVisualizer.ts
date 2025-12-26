import type { ArrayElement } from '../engines/BinarySearchEngine'

/**
 * Visualization functions for Binary Search
 * Pure functions - only draw based on provided state
 */

export function drawBinarySearchArray(
  ctx: CanvasRenderingContext2D,
  elements: ArrayElement[],
  target: number,
  config: {
    canvasWidth: number
    canvasHeight: number
    padding: number
  }
): void {
  const { canvasWidth, canvasHeight, padding } = config
  const n = elements.length
  if (n === 0) return

  const availableWidth = canvasWidth - padding * 2
  const barWidth = availableWidth / n
  const barHeight = 50
  const barY = canvasHeight / 2 - barHeight / 2

  ctx.save()

  elements.forEach((element, index) => {
    const x = padding + index * barWidth

    // Determine color based on state
    let fillColor = '#94a3b8' // gray-400 (default)
    let borderColor = '#64748b' // gray-500
    let textColor = '#1f2937' // gray-800

    if (element.state === 'excluded') {
      fillColor = '#e5e7eb' // gray-200 (excluded)
      textColor = '#9ca3af' // gray-400
    } else if (element.state === 'searching') {
      fillColor = '#60a5fa' // blue-400 (search range)
      textColor = '#1e3a8a' // blue-900
      borderColor = '#3b82f6' // blue-500
    } else if (element.state === 'current') {
      fillColor = '#a78bfa' // purple-400 (current mid)
      textColor = '#ffffff' // white
      borderColor = '#7c3aed' // purple-600
    } else if (element.state === 'found') {
      fillColor = '#34d399' // green-400 (found)
      textColor = '#ffffff' // white
      borderColor = '#10b981' // green-500
    }

    // Draw bar
    ctx.fillStyle = fillColor
    ctx.fillRect(x + 2, barY, barWidth - 4, barHeight)

    // Draw border
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.strokeRect(x + 2, barY, barWidth - 4, barHeight)

    // Draw value inside bar
    ctx.fillStyle = textColor
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(element.value.toString(), x + barWidth / 2, barY + barHeight / 2)

    // Draw index below bar
    ctx.fillStyle = '#6b7280' // gray-500
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(index.toString(), x + barWidth / 2, barY + barHeight + 8)
  })

  ctx.restore()
}

/**
 * Draws legend explaining colors
 */
export function drawBinarySearchLegend(
  ctx: CanvasRenderingContext2D,
  config: {
    x: number
    y: number
  }
): void {
  const legends = [
    { color: '#a78bfa', label: 'Current Mid' },
    { color: '#60a5fa', label: 'Search Range' },
    { color: '#e5e7eb', label: 'Excluded' },
    { color: '#34d399', label: 'Found' },
  ]

  ctx.save()
  ctx.font = '12px sans-serif'

  legends.forEach((legend, index) => {
    const x = config.x + index * 120
    const y = config.y

    // Draw color box
    ctx.fillStyle = legend.color
    ctx.fillRect(x, y, 20, 20)

    // Draw border
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, 20, 20)

    // Draw label
    ctx.fillStyle = '#1e293b'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(legend.label, x + 25, y + 10)
  })

  ctx.restore()
}
