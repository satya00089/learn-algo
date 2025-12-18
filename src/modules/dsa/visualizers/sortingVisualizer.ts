import type { ArrayElement } from '../types'

/**
 * Visualization functions for sorting algorithms
 * Pure functions - only draw based on provided state
 */

export function drawArray(
  ctx: CanvasRenderingContext2D,
  elements: ArrayElement[],
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
  const availableHeight = canvasHeight - padding * 2
  const barWidth = availableWidth / n
  const maxValue = Math.max(...elements.map((el) => el.value))

  ctx.save()

  elements.forEach((element, index) => {
    const barHeight = (element.value / maxValue) * availableHeight
    const x = padding + index * barWidth
    const y = canvasHeight - padding - barHeight

    // Determine color based on state
    let color = '#3b82f6' // default blue
    let textColor = '#ffffff' // white text for bars
    if (element.state === 'comparing') {
      color = '#fbbf24' // yellow
      textColor = '#1e293b' // dark text for yellow (better contrast)
    } else if (element.state === 'swapping') {
      color = '#ef4444' // red
    } else if (element.state === 'sorted') {
      color = '#10b981' // green
    }

    // Draw bar
    ctx.fillStyle = color
    ctx.fillRect(x + 2, y, barWidth - 4, barHeight)

    // Draw border
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.strokeRect(x + 2, y, barWidth - 4, barHeight)

    // Draw value on top of bar
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(element.value.toString(), x + barWidth / 2, y - 5)

    // Draw value inside bar (if bar is tall enough)
    if (barHeight > 30) {
      ctx.fillStyle = textColor
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(element.value.toString(), x + barWidth / 2, y + barHeight / 2)
    }
  })

  ctx.restore()
}

/**
 * Draws legend explaining colors
 */
export function drawLegend(
  ctx: CanvasRenderingContext2D,
  config: {
    x: number
    y: number
  }
): void {
  const legends = [
    { color: '#3b82f6', label: 'Unsorted' },
    { color: '#fbbf24', label: 'Comparing' },
    { color: '#ef4444', label: 'Swapping' },
    { color: '#10b981', label: 'Sorted' },
  ]

  ctx.save()
  ctx.font = '14px sans-serif'

  legends.forEach((legend, index) => {
    const x = config.x + index * 120
    const y = config.y

    // Draw color box
    ctx.fillStyle = legend.color
    ctx.fillRect(x, y, 20, 20)
    ctx.strokeStyle = '#1e293b'
    ctx.strokeRect(x, y, 20, 20)

    // Draw label
    ctx.fillStyle = '#1e293b'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(legend.label, x + 25, y + 10)
  })

  ctx.restore()
}
