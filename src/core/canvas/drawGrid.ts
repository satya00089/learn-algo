import type { GridConfig } from './types'

/**
 * Draws a grid on the canvas
 * Pure function - only draws based on provided configuration
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GridConfig
): void {
  const { color, lineWidth, stepX, stepY } = config

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  // Vertical lines
  for (let x = 0; x <= width; x += stepX) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += stepY) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.restore()
}
