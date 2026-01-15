/**
 * Visualization functions for Expectation (Dice Rolling)
 */

import type { DiceDistribution } from '../engines/ExpectationEngine'

interface ConvergenceChartConfig {
  canvasWidth: number
  canvasHeight: number
  rolls: Array<{ value: number; rollNumber: number }>
  theoreticalExpectation: number
  showTheoretical: boolean
  textColor: string
}

interface DiceConfig {
  canvasWidth: number
  canvasHeight: number
  currentValue: number | null
  isRolling: boolean
}

interface DistributionBarsConfig {
  canvasWidth: number
  canvasHeight: number
  distribution: DiceDistribution
  faceCounts: Record<number, number>
  totalRolls: number
  theoreticalProbabilities: Record<number, number>
  observedProbabilities: Record<number, number>
  showTheoretical: boolean
  textColor: string
}

/**
 * Draw convergence chart showing running mean converging to expectation
 */
export function drawConvergenceChart(
  ctx: CanvasRenderingContext2D,
  config: ConvergenceChartConfig
): void {
  const { canvasWidth, canvasHeight, rolls, theoreticalExpectation, showTheoretical, textColor } = config

  if (rolls.length === 0) {
    ctx.fillStyle = textColor
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Roll the die to see convergence', canvasWidth / 2, canvasHeight / 2)
    return
  }

  const chartPadding = { top: 40, right: 40, bottom: 40, left: 60 }
  const chartWidth = canvasWidth - chartPadding.left - chartPadding.right
  const chartHeight = canvasHeight - chartPadding.top - chartPadding.bottom

  // Calculate running means
  const runningMeans: number[] = []
  let sum = 0
  for (let i = 0; i < rolls.length; i++) {
    sum += rolls[i].value
    runningMeans.push(sum / (i + 1))
  }

  // Find min/max for y-axis
  const yMin = Math.min(1, ...runningMeans, theoreticalExpectation) - 0.5
  const yMax = Math.max(6, ...runningMeans, theoreticalExpectation) + 0.5

  const xScale = chartWidth / Math.max(rolls.length - 1, 1)
  const yScale = chartHeight / (yMax - yMin)

  const toX = (index: number) => chartPadding.left + index * xScale
  const toY = (value: number) => chartPadding.top + chartHeight - (value - yMin) * yScale

  // Draw axes
  ctx.strokeStyle = textColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(chartPadding.left, chartPadding.top)
  ctx.lineTo(chartPadding.left, chartPadding.top + chartHeight)
  ctx.lineTo(chartPadding.left + chartWidth, chartPadding.top + chartHeight)
  ctx.stroke()

  // Draw y-axis labels
  ctx.fillStyle = textColor
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 1; i <= 6; i++) {
    const y = toY(i)
    ctx.fillText(i.toString(), chartPadding.left - 10, y)
    // Grid line
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(chartPadding.left, y)
    ctx.lineTo(chartPadding.left + chartWidth, y)
    ctx.stroke()
  }

  // Draw x-axis label
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = textColor
  ctx.fillText('Number of Rolls', canvasWidth / 2, chartPadding.top + chartHeight + 20)

  // Draw y-axis label
  ctx.save()
  ctx.translate(20, canvasHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('Running Mean', 0, 0)
  ctx.restore()

  // Draw theoretical expectation line (dashed)
  if (showTheoretical) {
    ctx.strokeStyle = '#10b981' // Green
    ctx.lineWidth = 2
    ctx.setLineDash([10, 5])
    ctx.beginPath()
    ctx.moveTo(chartPadding.left, toY(theoreticalExpectation))
    ctx.lineTo(chartPadding.left + chartWidth, toY(theoreticalExpectation))
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Draw running mean line
  ctx.strokeStyle = '#3b82f6' // Blue
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < runningMeans.length; i++) {
    const x = toX(i)
    const y = toY(runningMeans[i])
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  // Draw title
  ctx.fillStyle = textColor
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('Convergence to Expected Value', canvasWidth / 2, 10)

  // Draw legend
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'left'
  
  // Running mean (blue line)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(canvasWidth - 200, 15)
  ctx.lineTo(canvasWidth - 170, 15)
  ctx.stroke()
  ctx.fillStyle = textColor
  ctx.fillText(`Running Mean: ${runningMeans[runningMeans.length - 1].toFixed(3)}`, canvasWidth - 165, 10)

  if (showTheoretical) {
    // Theoretical expectation (green dashed line)
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(canvasWidth - 200, 35)
    ctx.lineTo(canvasWidth - 170, 35)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = textColor
    ctx.fillText(`E[X]: ${theoreticalExpectation.toFixed(3)}`, canvasWidth - 165, 30)
  }
}

/**
 * Draw animated dice
 */
export function drawDice(
  ctx: CanvasRenderingContext2D,
  config: DiceConfig
): void {
  const { canvasWidth, canvasHeight, currentValue, isRolling } = config

  const diceSize = 80
  const x = canvasWidth / 2
  const y = canvasHeight / 2

  // Draw dice background
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(x - diceSize / 2, y - diceSize / 2, diceSize, diceSize, 10)
  ctx.fill()
  ctx.stroke()

  if (currentValue === null || isRolling) {
    // Show "?" when rolling
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('?', x, y)
  } else {
    // Draw dots based on dice value
    ctx.fillStyle = '#000000'
    const dotRadius = 6
    const offset = 20

    const drawDot = (dx: number, dy: number) => {
      ctx.beginPath()
      ctx.arc(x + dx, y + dy, dotRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    switch (currentValue) {
      case 1:
        drawDot(0, 0)
        break
      case 2:
        drawDot(-offset, -offset)
        drawDot(offset, offset)
        break
      case 3:
        drawDot(-offset, -offset)
        drawDot(0, 0)
        drawDot(offset, offset)
        break
      case 4:
        drawDot(-offset, -offset)
        drawDot(offset, -offset)
        drawDot(-offset, offset)
        drawDot(offset, offset)
        break
      case 5:
        drawDot(-offset, -offset)
        drawDot(offset, -offset)
        drawDot(0, 0)
        drawDot(-offset, offset)
        drawDot(offset, offset)
        break
      case 6:
        drawDot(-offset, -offset)
        drawDot(offset, -offset)
        drawDot(-offset, 0)
        drawDot(offset, 0)
        drawDot(-offset, offset)
        drawDot(offset, offset)
        break
    }
  }
}

/**
 * Draw distribution bars (adjustable probabilities)
 */
export function drawDistributionBars(
  ctx: CanvasRenderingContext2D,
  config: DistributionBarsConfig
): void {
  const {
    canvasWidth,
    canvasHeight,
    theoreticalProbabilities,
    observedProbabilities,
    totalRolls,
    showTheoretical,
    textColor,
  } = config

  const barWidth = 60
  const maxBarHeight = canvasHeight - 100
  const spacing = (canvasWidth - 6 * barWidth) / 7
  const baseY = canvasHeight - 50

  for (let face = 1; face <= 6; face++) {
    const x = spacing + (face - 1) * (barWidth + spacing)
    const theoreticalProb = theoreticalProbabilities[face]
    const observedProb = observedProbabilities[face]

    // Draw theoretical probability bar (background - semi-transparent)
    if (showTheoretical) {
      const theoreticalHeight = theoreticalProb * maxBarHeight
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)' // Green transparent
      ctx.fillRect(x, baseY - theoreticalHeight, barWidth, theoreticalHeight)
      
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.strokeRect(x, baseY - theoreticalHeight, barWidth, theoreticalHeight)
    }

    // Draw observed probability bar (foreground)
    if (totalRolls > 0) {
      const observedHeight = observedProb * maxBarHeight
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)' // Blue semi-transparent
      ctx.fillRect(x, baseY - observedHeight, barWidth, observedHeight)
    }

    // Draw face number
    ctx.fillStyle = textColor
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(face.toString(), x + barWidth / 2, baseY + 25)

    // Draw probability values
    ctx.font = '11px sans-serif'
    if (showTheoretical) {
      ctx.fillStyle = '#10b981'
      ctx.fillText(`${(theoreticalProb * 100).toFixed(1)}%`, x + barWidth / 2, baseY + 40)
    }
    if (totalRolls > 0) {
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${(observedProb * 100).toFixed(1)}%`, x + barWidth / 2, baseY + (showTheoretical ? 55 : 40))
    }
  }

  // Draw title
  ctx.fillStyle = textColor
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Probability Distribution', canvasWidth / 2, 15)

  // Draw legend
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  
  if (showTheoretical) {
    ctx.fillStyle = '#10b981'
    ctx.fillRect(20, 25, 15, 15)
    ctx.fillStyle = textColor
    ctx.fillText('Theoretical', 40, 35)
  }
  
  if (totalRolls > 0) {
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(showTheoretical ? 140 : 20, 25, 15, 15)
    ctx.fillStyle = textColor
    ctx.fillText('Observed', showTheoretical ? 160 : 40, 35)
  }
}

/**
 * Draw combined chart with convergence (70%) and distribution bars (30%) side by side
 */
export function drawCombinedChart(
  ctx: CanvasRenderingContext2D,
  config: ConvergenceChartConfig & DistributionBarsConfig
): void {
  const { canvasWidth, canvasHeight } = config

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Calculate split areas (70-30)
  const convergenceWidth = canvasWidth * 0.7
  const distributionWidth = canvasWidth * 0.3

  // Draw convergence chart on the left (70%)
  ctx.save()
  drawConvergenceChartInternal(ctx, {
    ...config,
    canvasWidth: convergenceWidth,
    canvasHeight,
    offsetX: 0,
  })
  ctx.restore()

  // Draw distribution bars on the right (30%)
  ctx.save()
  ctx.translate(convergenceWidth, 0)
  drawDistributionBarsInternal(ctx, {
    ...config,
    canvasWidth: distributionWidth,
    canvasHeight,
  })
  ctx.restore()

  // Draw vertical separator line
  ctx.strokeStyle = config.textColor === '#1f2937' ? '#e5e7eb' : '#374151'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(convergenceWidth, 0)
  ctx.lineTo(convergenceWidth, canvasHeight)
  ctx.stroke()
}

/**
 * Internal convergence chart drawing (reusable)
 */
function drawConvergenceChartInternal(
  ctx: CanvasRenderingContext2D,
  config: ConvergenceChartConfig & { offsetX?: number }
): void {
  const { canvasWidth, canvasHeight, rolls, theoreticalExpectation, showTheoretical, textColor } = config

  if (rolls.length === 0) {
    ctx.fillStyle = textColor
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Roll the die to see convergence', canvasWidth / 2, canvasHeight / 2)
    return
  }

  // Calculate running means
  const runningMeans: number[] = []
  let sum = 0
  for (let i = 0; i < rolls.length; i++) {
    sum += rolls[i].value
    runningMeans.push(sum / (i + 1))
  }

  // Chart dimensions
  const padding = { top: 50, right: 40, bottom: 60, left: 60 }
  const chartWidth = canvasWidth - padding.left - padding.right
  const chartHeight = canvasHeight - padding.top - padding.bottom

  // Y-axis range (1 to 6 for dice)
  const yMin = 1
  const yMax = 6
  const yRange = yMax - yMin

  // Draw grid lines
  ctx.strokeStyle = textColor === '#1f2937' ? '#e5e7eb' : '#374151'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])

  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (i / 5) * chartHeight
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.stroke()
  }
  ctx.setLineDash([])

  // Draw axes
  ctx.strokeStyle = textColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, padding.top + chartHeight)
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
  ctx.stroke()

  // Y-axis labels
  ctx.fillStyle = textColor
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= 5; i++) {
    const value = yMax - (i / 5) * yRange
    const y = padding.top + (i / 5) * chartHeight
    ctx.fillText(value.toFixed(1), padding.left - 10, y)
  }

  // X-axis label
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('Number of Rolls', padding.left + chartWidth / 2, padding.top + chartHeight + 20)

  // Y-axis label
  ctx.save()
  ctx.translate(15, padding.top + chartHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('Running Mean', 0, 0)
  ctx.restore()

  // Draw theoretical expectation line (horizontal dashed line)
  if (showTheoretical) {
    const expectationY = padding.top + ((yMax - theoreticalExpectation) / yRange) * chartHeight
    ctx.strokeStyle = '#10b981' // Green
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(padding.left, expectationY)
    ctx.lineTo(padding.left + chartWidth, expectationY)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Draw running mean line
  ctx.strokeStyle = '#3b82f6' // Blue
  ctx.lineWidth = 2
  ctx.beginPath()

  for (let i = 0; i < runningMeans.length; i++) {
    const x = padding.left + (i / Math.max(runningMeans.length - 1, 1)) * chartWidth
    const y = padding.top + ((yMax - runningMeans[i]) / yRange) * chartHeight
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.stroke()

  // Draw title
  ctx.fillStyle = textColor
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('Running Mean Convergence', padding.left + chartWidth / 2, 15)

  // Draw legend
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding.left + chartWidth - 160, 35)
  ctx.lineTo(padding.left + chartWidth - 140, 35)
  ctx.stroke()
  ctx.fillStyle = textColor
  ctx.fillText('Running Mean', padding.left + chartWidth - 135, 38)

  if (showTheoretical) {
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(padding.left + chartWidth - 160, 50)
    ctx.lineTo(padding.left + chartWidth - 140, 50)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = textColor
    ctx.fillText(`E[X] = ${theoreticalExpectation.toFixed(2)}`, padding.left + chartWidth - 135, 53)
  }
}

/**
 * Internal distribution bars drawing (reusable)
 */
function drawDistributionBarsInternal(
  ctx: CanvasRenderingContext2D,
  config: DistributionBarsConfig
): void {
  const {
    canvasWidth,
    canvasHeight,
    theoreticalProbabilities,
    observedProbabilities,
    totalRolls,
    showTheoretical,
    textColor,
  } = config

  const barWidth = Math.min(40, (canvasWidth - 40) / 6)
  const maxBarHeight = canvasHeight - 120
  const spacing = (canvasWidth - 6 * barWidth) / 7
  const baseY = canvasHeight - 70

  for (let face = 1; face <= 6; face++) {
    const x = spacing + (face - 1) * (barWidth + spacing)
    const theoreticalProb = theoreticalProbabilities[face]
    const observedProb = observedProbabilities[face]

    // Draw theoretical probability bar (background - semi-transparent)
    if (showTheoretical) {
      const theoreticalHeight = theoreticalProb * maxBarHeight
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)' // Green transparent
      ctx.fillRect(x, baseY - theoreticalHeight, barWidth, theoreticalHeight)
      
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.strokeRect(x, baseY - theoreticalHeight, barWidth, theoreticalHeight)
    }

    // Draw observed probability bar (foreground)
    if (totalRolls > 0) {
      const observedHeight = observedProb * maxBarHeight
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)' // Blue semi-transparent
      ctx.fillRect(x, baseY - observedHeight, barWidth, observedHeight)
    }

    // Draw face number
    ctx.fillStyle = textColor
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(face.toString(), x + barWidth / 2, baseY + 20)

    // Draw probability values
    ctx.font = '9px sans-serif'
    if (showTheoretical && totalRolls > 0) {
      ctx.fillStyle = '#10b981'
      ctx.fillText(`${(theoreticalProb * 100).toFixed(0)}%`, x + barWidth / 2, baseY + 35)
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${(observedProb * 100).toFixed(0)}%`, x + barWidth / 2, baseY + 47)
    } else if (showTheoretical) {
      ctx.fillStyle = '#10b981'
      ctx.fillText(`${(theoreticalProb * 100).toFixed(0)}%`, x + barWidth / 2, baseY + 35)
    } else if (totalRolls > 0) {
      ctx.fillStyle = '#3b82f6'
      ctx.fillText(`${(observedProb * 100).toFixed(0)}%`, x + barWidth / 2, baseY + 35)
    }
  }

  // Draw title
  ctx.fillStyle = textColor
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Distribution', canvasWidth / 2, 15)

  // Draw compact legend
  ctx.font = '9px sans-serif'
  
  if (showTheoretical) {
    ctx.fillStyle = '#10b981'
    ctx.fillRect(canvasWidth / 2 - 40, 28, 10, 10)
    ctx.fillStyle = textColor
    ctx.textAlign = 'left'
    ctx.fillText('Theo', canvasWidth / 2 - 27, 36)
  }
  
  if (totalRolls > 0) {
    ctx.fillStyle = '#3b82f6'
    const xOffset = showTheoretical ? 10 : -40
    ctx.fillRect(canvasWidth / 2 + xOffset, 28, 10, 10)
    ctx.fillStyle = textColor
    ctx.textAlign = 'left'
    ctx.fillText('Obs', canvasWidth / 2 + xOffset + 13, 36)
  }
}
