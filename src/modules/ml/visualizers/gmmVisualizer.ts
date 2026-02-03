import type { CanvasConfig } from '@/core/canvas'
import type { GMMState, GaussianComponent } from '../engines/GMMEngine'

/**
 * Draw GMM clustering visualization
 */
export function drawGMMClustering(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: GMMState,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  showEllipses: boolean = true,
  showTrajectories: boolean = false,
  textColor: string = '#1e293b'
): void {
  const { width, height, padding } = config
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Transform functions
  const xToCanvas = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth
  const yToCanvas = (y: number) => padding.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight

  ctx.clearRect(0, 0, width, height)

  // Draw grid
  drawGrid(ctx, config, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas)

  // Draw component trajectories if enabled
  if (showTrajectories) {
    drawComponentTrajectories(ctx, state, xToCanvas, yToCanvas)
  }

  // Draw Gaussian ellipses if enabled
  if (showEllipses) {
    drawGaussianEllipses(ctx, state.components, xToCanvas, yToCanvas)
  }

  // Draw points with soft coloring based on responsibilities
  drawPoints(ctx, state, xToCanvas, yToCanvas)

  // Draw component means
  drawComponentMeans(ctx, state.components, xToCanvas, yToCanvas)

  // Draw legend
  drawLegend(ctx, config, state.components, textColor)

  // Draw phase indicator
  drawPhaseIndicator(ctx, config, state, textColor)
}

/**
 * Draw grid
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  const { width, height, padding } = config
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1

  // Vertical grid lines
  const xStep = (xMax - xMin) / 10
  for (let x = xMin; x <= xMax; x += xStep) {
    const canvasX = xToCanvas(x)
    ctx.beginPath()
    ctx.moveTo(canvasX, padding.top)
    ctx.lineTo(canvasX, padding.top + plotHeight)
    ctx.stroke()
  }

  // Horizontal grid lines
  const yStep = (yMax - yMin) / 10
  for (let y = yMin; y <= yMax; y += yStep) {
    const canvasY = yToCanvas(y)
    ctx.beginPath()
    ctx.moveTo(padding.left, canvasY)
    ctx.lineTo(padding.left + plotWidth, canvasY)
    ctx.stroke()
  }

  // Axes
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  const zeroX = xToCanvas(0)
  const zeroY = yToCanvas(0)

  // X-axis
  if (yMin <= 0 && yMax >= 0) {
    ctx.beginPath()
    ctx.moveTo(padding.left, zeroY)
    ctx.lineTo(padding.left + plotWidth, zeroY)
    ctx.stroke()
  }

  // Y-axis
  if (xMin <= 0 && xMax >= 0) {
    ctx.beginPath()
    ctx.moveTo(zeroX, padding.top)
    ctx.lineTo(zeroX, padding.top + plotHeight)
    ctx.stroke()
  }
}

/**
 * Draw Gaussian ellipses representing covariance
 */
function drawGaussianEllipses(
  ctx: CanvasRenderingContext2D,
  components: GaussianComponent[],
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  components.forEach((comp) => {
    const { mean, covariance, color } = comp

    // Calculate eigenvalues and eigenvectors
    const a = covariance[0][0]
    const b = covariance[0][1]
    const c = covariance[1][1]

    const trace = a + c
    const det = a * c - b * b
    const discriminant = Math.sqrt(trace * trace - 4 * det)

    const lambda1 = (trace + discriminant) / 2
    const lambda2 = (trace - discriminant) / 2

    // Eigenvector for lambda1
    let angle = 0
    if (Math.abs(b) > 1e-10) {
      angle = Math.atan2(lambda1 - a, b)
    } else if (a >= c) {
      angle = 0
    } else {
      angle = Math.PI / 2
    }

    // Draw ellipse at 2 standard deviations (95% confidence)
    const scale = 2
    const radiusX = scale * Math.sqrt(Math.max(lambda1, 0))
    const radiusY = scale * Math.sqrt(Math.max(lambda2, 0))

    const centerX = xToCanvas(mean.x)
    const centerY = yToCanvas(mean.y)

    // Approximate radius in canvas space
    const canvasRadiusX = Math.abs(xToCanvas(mean.x + radiusX) - centerX)
    const canvasRadiusY = Math.abs(yToCanvas(mean.y + radiusY) - centerY)

    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(-angle) // Negative because canvas Y is inverted

    ctx.beginPath()
    ctx.ellipse(0, 0, canvasRadiusX, canvasRadiusY, 0, 0, 2 * Math.PI)

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = color + '1A' // 10% opacity
    ctx.fill()

    ctx.restore()
  })
}

/**
 * Draw points with soft coloring
 */
function drawPoints(
  ctx: CanvasRenderingContext2D,
  state: GMMState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.points.forEach((point, index) => {
    const x = xToCanvas(point.x)
    const y = yToCanvas(point.y)

    // Highlight current point being processed in E-step
    const isCurrentPoint = state.phase === 'e-step' && index === state.currentPointIndex
    const radius = isCurrentPoint ? 7 : 5

    // Draw point with mixed color based on responsibilities
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)

    // Mix colors based on responsibilities
    if (point.responsibilities.length > 0) {
      const color = mixColors(
        state.components.map((c) => c.color),
        point.responsibilities
      )
      ctx.fillStyle = color
    } else {
      ctx.fillStyle = '#94a3b8'
    }

    ctx.fill()

    // Draw border - thicker for current point
    ctx.strokeStyle = isCurrentPoint ? '#fbbf24' : '#ffffff'
    ctx.lineWidth = isCurrentPoint ? 3 : 1.5
    ctx.stroke()
  })
}

/**
 * Mix colors based on weights
 */
function mixColors(colors: string[], weights: number[]): string {
  let r = 0,
    g = 0,
    b = 0

  colors.forEach((color, i) => {
    const weight = weights[i] || 0
    const rgb = hexToRgb(color)
    r += rgb.r * weight
    g += rgb.g * weight
    b += rgb.b * weight
  })

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Draw component means as large markers
 */
function drawComponentMeans(
  ctx: CanvasRenderingContext2D,
  components: GaussianComponent[],
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  components.forEach((comp) => {
    const x = xToCanvas(comp.mean.x)
    const y = yToCanvas(comp.mean.y)

    // Draw cross
    ctx.strokeStyle = comp.color
    ctx.lineWidth = 3

    // Horizontal line
    ctx.beginPath()
    ctx.moveTo(x - 10, y)
    ctx.lineTo(x + 10, y)
    ctx.stroke()

    // Vertical line
    ctx.beginPath()
    ctx.moveTo(x, y - 10)
    ctx.lineTo(x, y + 10)
    ctx.stroke()

    // Draw circle
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.strokeStyle = comp.color
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  })
}

/**
 * Draw component trajectories
 */
function drawComponentTrajectories(
  ctx: CanvasRenderingContext2D,
  state: GMMState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.components.forEach((comp) => {
    const trajectory = state.componentTrajectories.get(comp.id)
    if (!trajectory || trajectory.length < 2) return

    ctx.strokeStyle = comp.color + '80' // 50% opacity
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    ctx.beginPath()
    const start = trajectory[0]
    ctx.moveTo(xToCanvas(start.x), yToCanvas(start.y))

    for (let i = 1; i < trajectory.length; i++) {
      const point = trajectory[i]
      ctx.lineTo(xToCanvas(point.x), yToCanvas(point.y))
    }

    ctx.stroke()
    ctx.setLineDash([])
  })
}

/**
 * Draw legend
 */
function drawLegend(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  components: GaussianComponent[],
  textColor: string = '#1e293b'
): void {
  const legendX = config.width - 150
  const legendY = 20

  // Use theme-aware background: light in light mode, dark in dark mode
  const backgroundColor = textColor === '#1e293b' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)'
  const borderColor = textColor === '#1e293b' ? '#cbd5e1' : '#475569'
  
  ctx.fillStyle = backgroundColor
  ctx.fillRect(legendX, legendY, 130, components.length * 25 + 20)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  ctx.strokeRect(legendX, legendY, 130, components.length * 25 + 20)

  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor
  ctx.fillText('Components', legendX + 10, legendY + 15)

  components.forEach((comp, i) => {
    const y = legendY + 30 + i * 25

    // Color indicator
    ctx.fillStyle = comp.color
    ctx.fillRect(legendX + 10, y - 8, 20, 12)
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.strokeRect(legendX + 10, y - 8, 20, 12)

    // Label
    ctx.fillStyle = textColor
    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillText(`C${comp.id + 1} (π=${comp.weight.toFixed(2)})`, legendX + 35, y + 2)
  })
}

/**
 * Draw phase indicator
 */
function drawPhaseIndicator(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: GMMState,
  textColor: string = '#1e293b'
): void {
  ctx.font = 'bold 14px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor

  let phaseText = ''
  if (state.phase === 'e-step') {
    phaseText = 'E-Step: Computing Responsibilities'
  } else if (state.phase === 'm-step') {
    phaseText = 'M-Step: Updating Parameters'
  } else {
    phaseText = 'Complete'
  }

  ctx.fillText(phaseText, config.padding.left, config.padding.top - 15)
}

/**
 * Draw log-likelihood convergence chart
 */
export function drawLogLikelihoodChart(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: GMMState,
  textColor: string = '#1e293b'
): void {
  const { width, height, padding } = config
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  ctx.clearRect(0, 0, width, height)

  // Get history data
  const history = state.history

  if (history.length === 0) {
    // Show initial log-likelihood if available
    if (state.logLikelihood !== -Infinity && isFinite(state.logLikelihood)) {
      ctx.font = '12px Inter, system-ui, sans-serif'
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.fillText(`Initial Log-Likelihood: ${state.logLikelihood.toFixed(2)}`, width / 2, height / 2 - 10)
      ctx.fillStyle = textColor + '99' // 60% opacity
      ctx.fillText('Run iterations to see convergence chart', width / 2, height / 2 + 10)
    } else {
      ctx.font = '14px Inter, system-ui, sans-serif'
      ctx.fillStyle = textColor + '99' // 60% opacity
      ctx.textAlign = 'center'
      ctx.fillText('No data yet', width / 2, height / 2)
    }
    return
  }

  // Find min and max log-likelihood
  const logLikelihoods = history.map((h) => h.logLikelihood)
  const maxLL = Math.max(...logLikelihoods)
  const minLL = Math.min(...logLikelihoods)
  const llRange = maxLL - minLL || 1

  const maxIter = history[history.length - 1].iteration

  // Transform functions
  const xToCanvas = (iter: number) => padding.left + (iter / maxIter) * plotWidth
  const yToCanvas = (ll: number) => padding.top + plotHeight - ((ll - minLL) / llRange) * plotHeight

  // Draw axes
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + plotHeight)
  ctx.lineTo(padding.left + plotWidth, padding.top + plotHeight)
  ctx.lineTo(padding.left + plotWidth, padding.top)
  ctx.stroke()

  // Draw grid
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (i * plotHeight) / 5
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + plotWidth, y)
    ctx.stroke()
  }

  // Draw log-likelihood line
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.beginPath()

  history.forEach((step, i) => {
    const x = xToCanvas(step.iteration)
    const y = yToCanvas(step.logLikelihood)

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()

  // Draw points
  history.forEach((step) => {
    const x = xToCanvas(step.iteration)
    const y = yToCanvas(step.logLikelihood)

    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fillStyle = '#3b82f6'
    ctx.fill()
  })

  // Draw labels
  ctx.fillStyle = textColor
  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Iteration', padding.left + plotWidth / 2, height - 5)

  ctx.save()
  ctx.translate(15, padding.top + plotHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('Log-Likelihood', 0, 0)
  ctx.restore()

  // Draw title
  ctx.font = 'bold 14px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('EM Algorithm Convergence', width / 2, padding.top - 10)
}
