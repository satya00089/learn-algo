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
  textColor: string = '#1e293b',
  epsilon: number = 2.5
): void {
  const { width, height, padding } = config
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Transform functions
  const xToCanvas = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth
  const yToCanvas = (y: number) =>
    padding.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight

  ctx.clearRect(0, 0, width, height)

  // Draw grid
  drawGrid(ctx, config, xMin, xMax, yMin, yMax, xToCanvas, yToCanvas)

  // Draw neighborhood circles if enabled
  if (showNeighborhoods && state.currentPointIndex < state.points.length) {
    drawNeighborhoodCircle(ctx, state, xToCanvas, yToCanvas, xMin, xMax, epsilon)
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
 * Draw epsilon neighborhood circle around current point - prominent like reference
 */
function drawNeighborhoodCircle(
  ctx: CanvasRenderingContext2D,
  state: DBSCANState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number,
  xMin: number,
  xMax: number,
  epsilon: number
): void {
  if (state.isComplete) return

  // Show circle around current point or expanding seed
  let centerPoint = state.points[state.currentPointIndex]

  // If expanding cluster, show circle around the seed being examined
  if (state.phase === 'expanding-cluster' && state.currentSeedIndex < state.expandingSeeds.length) {
    centerPoint = state.points[state.expandingSeeds[state.currentSeedIndex]]
  }

  if (!centerPoint) return

  const centerX = xToCanvas(centerPoint.x)
  const centerY = yToCanvas(centerPoint.y)

  // Calculate epsilon radius in canvas space - USE ACTUAL EPSILON VALUE!
  const plotWidth = xToCanvas(xMax) - xToCanvas(xMin)
  const dataWidth = xMax - xMin
  const epsilonCanvas = (plotWidth / dataWidth) * epsilon

  // Draw multiple layers for prominence

  // Outer glow layer (widest)
  ctx.beginPath()
  ctx.arc(centerX, centerY, epsilonCanvas + 6, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
  ctx.lineWidth = 12
  ctx.stroke()

  // Middle glow
  ctx.beginPath()
  ctx.arc(centerX, centerY, epsilonCanvas + 2, 0, 2 * Math.PI)
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'
  ctx.lineWidth = 6
  ctx.stroke()

  // Main circle with dashed line
  ctx.beginPath()
  ctx.arc(centerX, centerY, epsilonCanvas, 0, 2 * Math.PI)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2.5
  ctx.setLineDash([10, 5])
  ctx.stroke()
  ctx.setLineDash([])

  // Fill with very subtle transparent blue
  ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'
  ctx.fill()

  // Draw epsilon label with background
  ctx.font = 'bold 12px Inter, system-ui, sans-serif'
  const labelText = 'ε radius'
  const labelX = centerX + epsilonCanvas * 0.7
  const labelY = centerY - epsilonCanvas * 0.7

  // Label background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillRect(labelX - 5, labelY - 14, 55, 18)

  // Label text
  ctx.fillStyle = '#3b82f6'
  ctx.textAlign = 'left'
  ctx.fillText(labelText, labelX, labelY)
  ctx.textAlign = 'left'
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
  // Check if we're expanding a cluster - show the seed being examined
  const expandingSeedIndex =
    state.phase === 'expanding-cluster' && state.currentSeedIndex < state.expandingSeeds.length
      ? state.expandingSeeds[state.currentSeedIndex]
      : -1

  // Draw all points
  state.points.forEach((point, index) => {
    const x = xToCanvas(point.x)
    const y = yToCanvas(point.y)

    // Highlight current point being processed OR the seed being expanded
    const isCurrentPoint =
      (index === state.currentPointIndex && state.phase === 'processing' && !state.isComplete) ||
      (index === expandingSeedIndex && state.phase === 'expanding-cluster' && !state.isComplete)

    const pointColor = getPointColor(point, isCurrentPoint, state.clusters, state, index)
    const pointRadius = getPointRadius(point, isCurrentPoint)

    // Draw point
    ctx.beginPath()
    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI)
    ctx.fillStyle = pointColor
    ctx.fill()

    // Draw borders and special markers
    drawPointBorder(ctx, x, y, point, pointRadius, isCurrentPoint, state, index)
  })
}

/**
 * Get point color based on state
 */
function getPointColor(
  point: any,
  isCurrentPoint: boolean,
  clusters: any[],
  state: DBSCANState,
  index: number
): string {
  // Current point being examined - highlighted
  if (isCurrentPoint) return '#ef4444' // Red for current examination

  // Assigned to a cluster - use cluster color (takes priority)
  if (point.clusterId >= 0) {
    const cluster = clusters.find((c) => c.id === point.clusterId)
    return cluster ? cluster.color : '#94a3b8'
  }

  // Only show final state if the point has been processed
  const hasBeenProcessed = index < state.currentPointIndex || state.isComplete

  if (!hasBeenProcessed) {
    // Unvisited points - Gray
    return '#9ca3af' // Gray-400
  }

  // Noise points - Black/very dark
  if (point.type === 'noise') return '#1f2937' // Gray-800 (almost black)

  // Processed but not yet assigned
  return '#9ca3af' // Gray-400
}

/**
 * Get point radius based on state
 */
function getPointRadius(point: any, isCurrentPoint: boolean): number {
  if (isCurrentPoint) return 9 // Larger for current point
  if (point.type === 'core') return 7
  return 5
}

/**
 * Draw point border and markers
 */
function drawPointBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  point: any,
  radius: number,
  isCurrentPoint: boolean,
  state: DBSCANState,
  index: number
): void {
  const hasBeenProcessed = index < state.currentPointIndex || state.isComplete

  if (isCurrentPoint) {
    // Current point - highlighted border
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // Outer glow
    ctx.beginPath()
    ctx.arc(x, y, radius + 3, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.lineWidth = 3
    ctx.stroke()
  } else if (point.type === 'core' && hasBeenProcessed && point.clusterId >= 0) {
    // Core points in cluster - white border with inner dot
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    // Inner white dot
    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, 2 * Math.PI)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  } else if (point.type === 'border' && hasBeenProcessed && point.clusterId >= 0) {
    // Border points - white border, no inner dot
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  } else if (point.type === 'noise' && hasBeenProcessed) {
    // Noise points - dark border
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 1
    ctx.stroke()
  } else if (hasBeenProcessed) {
    // Other processed points
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 1
    ctx.stroke()
  } else {
    // Unprocessed - subtle border
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
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

  // Calculate legend height dynamically
  const clusterCount = state.clusters.length
  const pointStatesCount = 6 // unvisited, examining, neighbor, core, border, noise
  const legendHeight =
    30 + (clusterCount > 0 ? clusterCount * 25 + 10 : 25) + pointStatesCount * 18 + 25

  // Use theme-aware background
  const backgroundColor =
    textColor === '#1e293b' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)'
  const borderColor = textColor === '#1e293b' ? '#cbd5e1' : '#475569'

  ctx.fillStyle = backgroundColor
  ctx.fillRect(legendX, legendY, 160, legendHeight)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1
  ctx.strokeRect(legendX, legendY, 160, legendHeight)

  let yOffset = legendY + 15

  // Draw clusters section only if clusters exist and have been discovered
  // Only show clusters that contain at least one point that has been processed
  const visibleClusters = state.clusters.filter((cluster) => {
    if (state.isComplete) return true
    // Check if any point in this cluster has been processed
    return cluster.points.some((pointIndex) => pointIndex < state.currentPointIndex)
  })

  if (visibleClusters.length > 0) {
    ctx.font = 'bold 12px Inter, system-ui, sans-serif'
    ctx.fillStyle = textColor
    ctx.fillText('Clusters Discovered', legendX + 10, yOffset)
    yOffset += 20

    visibleClusters.forEach((cluster) => {
      // Count only processed points in this cluster
      const processedPointsCount = state.isComplete
        ? cluster.points.length
        : cluster.points.filter((idx) => idx < state.currentPointIndex).length

      // Color indicator with cluster color
      ctx.fillStyle = cluster.color
      ctx.beginPath()
      ctx.arc(legendX + 20, yOffset - 3, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Label with point count
      ctx.fillStyle = textColor
      ctx.font = '12px Inter, system-ui, sans-serif'
      const label = state.isComplete
        ? `Cluster ${cluster.id + 1} (${cluster.points.length} pts)`
        : `Cluster ${cluster.id + 1} (${processedPointsCount} pts...)`
      ctx.fillText(label, legendX + 35, yOffset + 2)

      yOffset += 25
    })

    yOffset += 5
  } else {
    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillStyle = textColor + '99'
    ctx.fillText('No clusters yet...', legendX + 10, yOffset)
    yOffset += 25
  }

  // Draw point type indicators
  ctx.fillStyle = textColor
  ctx.font = 'bold 11px Inter, system-ui, sans-serif'
  ctx.fillText('Point States:', legendX + 10, yOffset)
  yOffset += 18

  // Unvisited (gray)
  ctx.beginPath()
  ctx.arc(legendX + 20, yOffset - 3, 5, 0, 2 * Math.PI)
  ctx.fillStyle = '#9ca3af'
  ctx.fill()
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 0.5
  ctx.stroke()
  ctx.fillStyle = textColor
  ctx.font = '11px Inter, system-ui, sans-serif'
  ctx.fillText('Unvisited', legendX + 35, yOffset)
  yOffset += 18

  // Core points (with white dot)
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

  // Noise points (black/very dark)
  ctx.beginPath()
  ctx.arc(legendX + 20, yOffset - 3, 5, 0, 2 * Math.PI)
  ctx.fillStyle = '#1f2937'
  ctx.fill()
  ctx.strokeStyle = '#4b5563'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = textColor
  ctx.fillText('Noise', legendX + 35, yOffset)
}

/**
 * Draw phase indicator - detailed status like reference visualization
 */
function drawPhaseIndicator(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: DBSCANState,
  textColor: string = '#1e293b'
): void {
  const backgroundColor =
    textColor === '#1e293b' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)'
  const borderColor = textColor === '#1e293b' ? '#cbd5e1' : '#475569'

  let phaseText = ''
  let detailText = ''
  let statusColor = '#3b82f6'

  if (state.phase === 'processing') {
    const currentPoint = state.points[state.currentPointIndex]

    if (currentPoint) {
      const neighborCount = currentPoint.neighbors.length

      if (currentPoint.type === 'core') {
        phaseText = `Point ${state.currentPointIndex + 1} - Core Point`
        detailText = `${neighborCount} neighbors - Starting cluster`
        statusColor = '#10b981' // Green
      } else if (currentPoint.type === 'noise') {
        phaseText = `Point ${state.currentPointIndex + 1} - Noise`
        detailText = `Only ${neighborCount} neighbors`
        statusColor = '#6b7280' // Gray
      } else {
        phaseText = `Processing Point ${state.currentPointIndex + 1}`
        detailText = 'Checking density...'
        statusColor = '#ef4444' // Red
      }
    }
  } else if (state.phase === 'expanding-cluster') {
    const seedIndex =
      state.currentSeedIndex < state.expandingSeeds.length
        ? state.expandingSeeds[state.currentSeedIndex]
        : -1

    if (seedIndex >= 0) {
      const seedPoint = state.points[seedIndex]
      const neighborCount = seedPoint.neighbors.length

      phaseText = `Expanding Cluster ${state.currentClusterId + 1} - Point ${seedIndex + 1}`
      detailText = `Checking point (${neighborCount} neighbors)...`
      statusColor = '#8b5cf6' // Purple
    } else {
      phaseText = 'Expanding Cluster'
      detailText = `Cluster ${state.clusters.length}`
      statusColor = '#10b981' // Green
    }
  } else {
    phaseText = 'Clustering Complete!'
    const clusterText = state.clusters.length === 1 ? 'cluster' : 'clusters'
    const noiseText = state.statistics.totalNoise === 1 ? 'point' : 'points'
    detailText = `Found ${state.clusters.length} ${clusterText} and ${state.statistics.totalNoise} noise ${noiseText}`
    statusColor = '#10b981' // Green
  }

  // Draw background box
  const boxWidth = 550
  const boxHeight = 55
  const boxX = config.padding.left
  const boxY = config.padding.top - 60

  ctx.fillStyle = backgroundColor
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1.5
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

  // Status indicator dot with glow
  ctx.beginPath()
  ctx.arc(boxX + 18, boxY + 20, 7, 0, 2 * Math.PI)
  ctx.fillStyle = statusColor
  ctx.fill()

  // Glow effect
  ctx.beginPath()
  ctx.arc(boxX + 18, boxY + 20, 10, 0, 2 * Math.PI)
  ctx.strokeStyle = statusColor + '40'
  ctx.lineWidth = 3
  ctx.stroke()

  // Phase text
  ctx.font = 'bold 15px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor
  ctx.fillText(phaseText, boxX + 38, boxY + 22)

  // Detail text
  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor + 'cc'
  ctx.fillText(detailText, boxX + 38, boxY + 40)

  // Progress indicator
  if (!state.isComplete) {
    const progressPercent = Math.round((state.currentPointIndex / state.points.length) * 100)
    const progressText = `${progressPercent}% (${state.currentPointIndex + 1}/${state.points.length})`
    ctx.font = 'bold 11px Inter, system-ui, sans-serif'
    ctx.fillStyle = textColor + '99'
    ctx.textAlign = 'right'
    ctx.fillText(progressText, boxX + boxWidth - 15, boxY + 30)
    ctx.textAlign = 'left'
  }
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
