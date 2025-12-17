import type { AxesConfig } from './types'

/**
 * Draws coordinate axes on the canvas
 * Pure function - only draws based on provided configuration
 */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: AxesConfig
): void {
  const { color, lineWidth, showLabels, labelFont, labelColor } = config

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  const centerX = width / 2
  const centerY = height / 2

  // Draw X axis
  ctx.beginPath()
  ctx.moveTo(0, centerY)
  ctx.lineTo(width, centerY)
  ctx.stroke()

  // Draw Y axis
  ctx.beginPath()
  ctx.moveTo(centerX, 0)
  ctx.lineTo(centerX, height)
  ctx.stroke()

  // Draw arrows for X axis
  const arrowSize = 10
  ctx.beginPath()
  ctx.moveTo(width - arrowSize, centerY - arrowSize / 2)
  ctx.lineTo(width, centerY)
  ctx.lineTo(width - arrowSize, centerY + arrowSize / 2)
  ctx.stroke()

  // Draw arrows for Y axis
  ctx.beginPath()
  ctx.moveTo(centerX - arrowSize / 2, arrowSize)
  ctx.lineTo(centerX, 0)
  ctx.lineTo(centerX + arrowSize / 2, arrowSize)
  ctx.stroke()

  if (showLabels) {
    ctx.fillStyle = labelColor
    ctx.font = labelFont
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Label X axis
    ctx.fillText('X', width - 20, centerY - 20)
    // Label Y axis
    ctx.fillText('Y', centerX + 20, 20)
  }

  ctx.restore()
}
