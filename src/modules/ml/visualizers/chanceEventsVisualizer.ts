/**
 * Visualization functions for Chance Events (Basic Probability)
 */

interface BarChartConfig {
  canvasWidth: number
  canvasHeight: number
  headsCount: number
  tailsCount: number
  totalFlips: number
  trueProbability: number
  showTrueProbability: boolean
  barColor: string
  trueBarColor: string
  textColor: string
}

/**
 * Draw bar chart showing heads and tails counts with percentages
 */
export function drawProbabilityBars(
  ctx: CanvasRenderingContext2D,
  config: BarChartConfig
): void {
  const {
    canvasWidth,
    canvasHeight,
    headsCount,
    tailsCount,
    totalFlips,
    trueProbability,
    showTrueProbability,
    trueBarColor,
    textColor,
  } = config

  // Calculate percentages
  const headsPercentage = totalFlips > 0 ? (headsCount / totalFlips) * 100 : 0
  const tailsPercentage = totalFlips > 0 ? (tailsCount / totalFlips) * 100 : 0

  // Bar dimensions
  const barWidth = 120
  const maxBarHeight = canvasHeight - 150
  const centerX = canvasWidth / 2
  const spacing = 200

  // Draw Heads Bar (Left)
  const headsX = centerX - spacing
  const headsHeight = totalFlips > 0 ? (headsCount / totalFlips) * maxBarHeight : 0

  // Observed bar
  ctx.fillStyle = '#3b82f6' // Blue for observed
  ctx.fillRect(headsX - barWidth / 2, canvasHeight - 100 - headsHeight, barWidth, headsHeight)

  // True probability bar (dashed outline) if enabled
  if (showTrueProbability) {
    const trueHeadsHeight = trueProbability * maxBarHeight
    ctx.strokeStyle = trueBarColor
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.strokeRect(
      headsX - barWidth / 2,
      canvasHeight - 100 - trueHeadsHeight,
      barWidth,
      trueHeadsHeight
    )
    ctx.setLineDash([])
  }

  // Draw Tails Bar (Right)
  const tailsX = centerX + spacing
  const tailsHeight = totalFlips > 0 ? (tailsCount / totalFlips) * maxBarHeight : 0

  // Observed bar
  ctx.fillStyle = '#ef4444' // Red for observed
  ctx.fillRect(tailsX - barWidth / 2, canvasHeight - 100 - tailsHeight, barWidth, tailsHeight)

  // True probability bar (dashed outline) if enabled
  if (showTrueProbability) {
    const trueTailsHeight = (1 - trueProbability) * maxBarHeight
    ctx.strokeStyle = trueBarColor
    ctx.lineWidth = 3
    ctx.setLineDash([10, 5])
    ctx.strokeRect(
      tailsX - barWidth / 2,
      canvasHeight - 100 - trueTailsHeight,
      barWidth,
      trueTailsHeight
    )
    ctx.setLineDash([])
  }

  // Draw labels and counts
  ctx.fillStyle = textColor
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'

  // Heads label
  ctx.fillText('Heads', headsX, canvasHeight - 60)
  ctx.font = '20px sans-serif'
  ctx.fillText(`${headsCount} (${headsPercentage.toFixed(1)}%)`, headsX, canvasHeight - 35)

  // Tails label
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('Tails', tailsX, canvasHeight - 60)
  ctx.font = '20px sans-serif'
  ctx.fillText(`${tailsCount} (${tailsPercentage.toFixed(1)}%)`, tailsX, canvasHeight - 35)

  // Draw baseline
  ctx.strokeStyle = textColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(50, canvasHeight - 100)
  ctx.lineTo(canvasWidth - 50, canvasHeight - 100)
  ctx.stroke()

  // Draw title
  ctx.fillStyle = textColor
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Total Flips: ${totalFlips}`, canvasWidth / 2, 40)

  // Draw legend if showing true probability
  if (showTrueProbability) {
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'left'
    
    // Observed (solid)
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(50, 60, 30, 20)
    ctx.fillStyle = textColor
    ctx.fillText('Observed Frequency', 90, 75)

    // True (dashed)
    ctx.strokeStyle = trueBarColor
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.strokeRect(50, 90, 30, 20)
    ctx.setLineDash([])
    ctx.fillStyle = textColor
    ctx.fillText(`True Probability (${(trueProbability * 100).toFixed(0)}% heads)`, 90, 105)
  }
}

/**
 * Draw coin animation
 */
export function drawCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  outcome: 'heads' | 'tails' | 'flipping',
  rotation: number = 0
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // Draw coin circle
  ctx.fillStyle = outcome === 'heads' ? '#fbbf24' : outcome === 'tails' ? '#9ca3af' : '#d1d5db'
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()

  // Draw coin outline
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = 3
  ctx.stroke()

  // Draw outcome text
  ctx.fillStyle = '#1f2937'
  ctx.font = `bold ${radius * 0.8}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  if (outcome === 'heads') {
    ctx.fillText('H', 0, 0)
  } else if (outcome === 'tails') {
    ctx.fillText('T', 0, 0)
  } else {
    ctx.fillText('?', 0, 0)
  }

  ctx.restore()
}
