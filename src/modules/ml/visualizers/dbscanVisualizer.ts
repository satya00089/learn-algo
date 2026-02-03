import type { CanvasConfig } from '@/core/canvas'
import type { DBSCANState } from '../engines/DBSCANEngine'

/**
 * Draw DBSCAN clustering visualization
 */
export function drawDBSCANClustering(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: DBSCANState,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  showNeighborhoods: boolean = false,
  showConnections: boolean = false,
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

  // Draw neighborhood circles if enabled
  if (showNeighborhoods && state.currentPointIndex < state.points.length) {
    drawNeighborhoodCircle(ctx, state, xToCanvas, yToCanvas, xMin, xMax)
  }

  // Draw connections between core points and their neighbors if enabled
  if (showConnections) {
    drawConnections(ctx, state, xToCanvas, yToCanvas)
  }

  // Draw points
  drawPoints(ctx, state, xToCanvas, yToCanvas)

  // Draw legend
  drawLegend(ctx, config, state, textColor)

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
 * Draw epsilon neighborhood circle around current point
 */
function drawNeighborhoodCircle(
  ctx: CanvasRenderingContext2D,
  state: DBSCANState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number,
  xMin: number,
  _xMax: number
): void {
  if (state.isComplete) return

  const currentPoint = state.points[state.currentPointIndex]
  if (!currentPoint) return

  const centerX = xToCanvas(currentPoint.x)
  const centerY = yToCanvas(currentPoint.y)

  // Calculate epsilon radius in canvas space (approximate)
  const epsilonCanvas = Math.abs(xToCanvas(xMin + 0.5) - xToCanvas(xMin))

  // Draw circle
  ctx.beginPath()
  ctx.arc(centerX, centerY, epsilonCanvas, 0, 2 * Math.PI)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.stroke()
  ctx.setLineDash([])

  // Fill with transparent blue
  ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
  ctx.fill()
}

/**
 * Draw connections between neighboring points
 */
function drawConnections(
  ctx: CanvasRenderingContext2D,
  state: DBSCANState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.points.forEach((point) => {
    if (point.type === 'core' && point.neighbors.length > 0) {
      const x1 = xToCanvas(point.x)
      const y1 = yToCanvas(point.y)

      point.neighbors.forEach((neighborIndex) => {
        const neighbor = state.points[neighborIndex]
        if (neighbor.clusterId === point.clusterId) {
          const x2 = xToCanvas(neighbor.x)
          const y2 = yToCanvas(neighbor.y)

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)

          // Get cluster color
          const cluster = state.clusters.find((c) => c.id === point.clusterId)
          ctx.strokeStyle = cluster ? cluster.color + '30' : '#94a3b850'
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })
    }
  })
}

/**
 * Draw points with clustering coloring
 */
function drawPoints(
  ctx: CanvasRenderingContext2D,
  state: DBSCANState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.points.forEach((point, index) => {
    const x = xToCanvas(point.x)
    const y = yToCanvas(point.y)

    // Highlight current point being processed
    const isCurrentPoint = index === state.currentPointIndex && !state.isComplete
    const radius = isCurrentPoint ? 8 : point.type === 'core' ? 6 : 5

    // Draw point
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)

    // Color based on cluster or point type
    if (point.clusterId >= 0) {
      const cluster = state.clusters.find((c) => c.id === point.clusterId)
      ctx.fillStyle = cluster ? cluster.color : '#94a3b8'
    } else if (point.type === 'noise') {
      ctx.fillStyle = '#6b7280' // Gray for noise
    } else {
      ctx.fillStyle = '#94a3b8' // Unvisited
    }

    ctx.fill()

    // Draw border
    if (isCurrentPoint) {
      ctx.strokeStyle = '#fbbf24' // Yellow for current
      ctx.lineWidth = 3
    } else if (point.type === 'core') {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
    } else {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
    }
    ctx.stroke()

    // Draw special marker for core points
    if (point.type === 'core' && !isCurrentPoint) {
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }
  })
}

/**
 * Draw legend
 */
function drawLegend(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: DBSCANState,
  textColor: string = '#1e293b'
): void {
  const legendX = config.width - 180
  const legendY = 20

  // Calculate legend height
  const legendHeight = 30 + state.clusters.length * 25 + 70

  // Use theme-aware background
  const backgroundColor = textColor === '#1e293b' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)'
  const borderColor = textColor === '#1e293b' ? '#cbd5e1' : '#475569'

  ctx.fillStyle = backgroundColor
  ctx.fillRect(legendX, legendY, 160, legendHeight)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  ctx.strokeRect(legendX, legendY, 160, legendHeight)

  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor
  ctx.fillText('Clusters', legendX + 10, legendY + 15)

  // Draw clusters
  let yOffset = legendY + 35
  state.clusters.forEach((cluster) => {
    // Color indicator
    ctx.fillStyle = cluster.color
    ctx.fillRect(legendX + 10, yOffset - 8, 20, 12)
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.strokeRect(legendX + 10, yOffset - 8, 20, 12)

    // Label
    ctx.fillStyle = textColor
    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillText(`C${cluster.id + 1} (${cluster.points.length})`, legendX + 35, yOffset + 2)

    yOffset += 25
  })

  // Draw point type indicators
  yOffset += 10
  ctx.fillStyle = textColor
  ctx.font = 'bold 11px Inter, system-ui, sans-serif'
  ctx.fillText('Point Types:', legendX + 10, yOffset)
  yOffset += 20

  // Core points
  ctx.beginPath()
  ctx.arc(legendX + 20, yOffset - 3, 5, 0, 2 * Math.PI)
  ctx.fillStyle = '#94a3b8'
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(legendX + 20, yOffset - 3, 2, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.fillStyle = textColor
  ctx.font = '11px Inter, system-ui, sans-serif'
  ctx.fillText('Core', legendX + 35, yOffset)
  yOffset += 18

  // Border points
  ctx.beginPath()
  ctx.arc(legendX + 20, yOffset - 3, 5, 0, 2 * Math.PI)
  ctx.fillStyle = '#94a3b8'
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = textColor
  ctx.fillText('Border', legendX + 35, yOffset)
  yOffset += 18

  // Noise points
  ctx.beginPath()
  ctx.arc(legendX + 20, yOffset - 3, 5, 0, 2 * Math.PI)
  ctx.fillStyle = '#6b7280'
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = textColor
  ctx.fillText('Noise', legendX + 35, yOffset)
}

/**
 * Draw phase indicator
 */
function drawPhaseIndicator(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: DBSCANState,
  textColor: string = '#1e293b'
): void {
  ctx.font = 'bold 14px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor

  let phaseText = ''
  if (state.phase === 'finding-neighbors') {
    phaseText = 'Finding Neighbors'
  } else if (state.phase === 'expanding-cluster') {
    phaseText = 'Expanding Cluster'
  } else {
    phaseText = 'Complete'
  }

  ctx.fillText(phaseText, config.padding.left, config.padding.top - 15)
}

/**
 * Draw statistics chart
 */
export function drawStatisticsChart(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: DBSCANState,
  textColor: string = '#1e293b'
): void {
  const { width, height, padding } = config

  ctx.clearRect(0, 0, width, height)

  const stats = state.statistics

  if (stats.totalClusters === 0 && stats.totalNoise === 0) {
    ctx.font = '14px Inter, system-ui, sans-serif'
    ctx.fillStyle = textColor + '99'
    ctx.textAlign = 'center'
    ctx.fillText('No statistics yet', width / 2, height / 2)
    return
  }

  // Draw statistics
  const startY = padding.top + 20
  const lineHeight = 30

  ctx.font = 'bold 14px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor
  ctx.textAlign = 'left'
  ctx.fillText('Clustering Statistics', padding.left, startY)

  ctx.font = '13px Inter, system-ui, sans-serif'
  let y = startY + lineHeight

  ctx.fillText(`Clusters: ${stats.totalClusters}`, padding.left, y)
  y += lineHeight

  ctx.fillText(`Core Points: ${stats.totalCore}`, padding.left, y)
  y += lineHeight

  ctx.fillText(`Border Points: ${stats.totalBorder}`, padding.left, y)
  y += lineHeight

  ctx.fillText(`Noise Points: ${stats.totalNoise}`, padding.left, y)
  y += lineHeight

  const totalPoints = stats.totalCore + stats.totalBorder + stats.totalNoise
  ctx.fillText(`Total Points: ${totalPoints}`, padding.left, y)
}
