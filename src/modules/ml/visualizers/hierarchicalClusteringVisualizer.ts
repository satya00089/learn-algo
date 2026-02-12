import type { CanvasConfig } from '@/core/canvas'
import type { HierarchicalState } from '../engines/HierarchicalClusteringEngine'

interface DrawOptions {
  showConnections?: boolean
  textColor?: string
}

/**
 * Draw Hierarchical Clustering visualization
 */
export function drawHierarchicalClustering(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: HierarchicalState,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  options: DrawOptions = {}
): void {
  const { xMin, xMax, yMin, yMax } = bounds
  const { showConnections = true, textColor = '#1e293b' } = options
  const { width, height, padding } = config
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Transform functions
  const xToCanvas = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth
  const yToCanvas = (y: number) =>
    padding.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight

  ctx.clearRect(0, 0, width, height)

  // Draw grid
  drawGrid(ctx, config, { xMin, xMax, yMin, yMax }, xToCanvas, yToCanvas)

  // Draw connections between points in the same cluster
  if (showConnections) {
    drawClusterConnections(ctx, state, xToCanvas, yToCanvas)
  }

  // Draw centroids
  drawCentroids(ctx, state, xToCanvas, yToCanvas)

  // Draw points
  drawPoints(ctx, state, xToCanvas, yToCanvas)

  // Draw info panel
  drawInfoPanel(ctx, config, state, textColor)
}

/**
 * Draw grid
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  const { xMin, xMax, yMin, yMax } = bounds
  const { padding } = config
  const plotWidth = config.width - padding.left - padding.right
  const plotHeight = config.height - padding.top - padding.bottom

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

  // Draw axes
  ctx.strokeStyle = '#64748b'
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
 * Draw connections between points in same cluster
 */
function drawClusterConnections(
  ctx: CanvasRenderingContext2D,
  state: HierarchicalState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.clusters.forEach((cluster) => {
    if (cluster.points.length < 2) return

    ctx.strokeStyle = cluster.color + '20'
    ctx.lineWidth = 1

    // Draw lines between all points in cluster
    for (let i = 0; i < cluster.points.length; i++) {
      for (let j = i + 1; j < cluster.points.length; j++) {
        const p1 = state.points[cluster.points[i]]
        const p2 = state.points[cluster.points[j]]

        ctx.beginPath()
        ctx.moveTo(xToCanvas(p1.x), yToCanvas(p1.y))
        ctx.lineTo(xToCanvas(p2.x), yToCanvas(p2.y))
        ctx.stroke()
      }
    }
  })
}

/**
 * Draw cluster centroids
 */
function drawCentroids(
  ctx: CanvasRenderingContext2D,
  state: HierarchicalState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.clusters.forEach((cluster) => {
    if (cluster.points.length === 0) return

    const x = xToCanvas(cluster.centroid.x)
    const y = yToCanvas(cluster.centroid.y)

    // Draw centroid as cross
    ctx.strokeStyle = cluster.color
    ctx.lineWidth = 3

    const size = 10
    ctx.beginPath()
    ctx.moveTo(x - size, y)
    ctx.lineTo(x + size, y)
    ctx.moveTo(x, y - size)
    ctx.lineTo(x, y + size)
    ctx.stroke()

    // Draw circle around centroid
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.strokeStyle = cluster.color
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

/**
 * Draw data points
 */
function drawPoints(
  ctx: CanvasRenderingContext2D,
  state: HierarchicalState,
  xToCanvas: (x: number) => number,
  yToCanvas: (y: number) => number
): void {
  state.points.forEach((point) => {
    const x = xToCanvas(point.x)
    const y = yToCanvas(point.y)

    // Find cluster for this point
    const cluster = state.clusters.find((c) => c.id === point.clusterId)
    const color = cluster?.color || '#94a3b8'

    // Draw point
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    // White border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  })
}

/**
 * Draw information panel
 */
function drawInfoPanel(
  ctx: CanvasRenderingContext2D,
  config: CanvasConfig,
  state: HierarchicalState,
  textColor: string
): void {
  const padding = 15
  const panelX = config.padding.left
  const panelY = config.padding.top - 65
  const panelWidth = 700
  const panelHeight = 55

  const backgroundColor =
    textColor === '#1e293b' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)'
  const borderColor = textColor === '#1e293b' ? '#cbd5e1' : '#475569'

  // Draw panel background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 1.5
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)

  // Status indicator
  const statusColor = state.isComplete ? '#10b981' : '#3b82f6'
  ctx.beginPath()
  ctx.arc(panelX + 18, panelY + 20, 6, 0, 2 * Math.PI)
  ctx.fillStyle = statusColor
  ctx.fill()

  // Glow effect
  ctx.beginPath()
  ctx.arc(panelX + 18, panelY + 20, 9, 0, 2 * Math.PI)
  ctx.strokeStyle = statusColor + '40'
  ctx.lineWidth = 3
  ctx.stroke()

  // Main text
  ctx.font = 'bold 14px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor
  const clusterSuffix = state.clusters.length === 1 ? '' : 's'
  const mainText = state.isComplete
    ? `Clustering Complete - ${state.clusters.length} Cluster${clusterSuffix}`
    : `Iteration ${state.currentIteration} - ${state.clusters.length} Cluster${clusterSuffix} Remaining`
  ctx.fillText(mainText, panelX + 38, panelY + 22)

  // Detail text
  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillStyle = textColor + 'cc'
  const linkageText = state.linkageType.charAt(0).toUpperCase() + state.linkageType.slice(1)
  const detailText = state.isComplete
    ? `${linkageText} linkage - ${state.mergeHistory.length} merges performed`
    : `${linkageText} linkage - Target: ${state.targetClusters} clusters`
  ctx.fillText(detailText, panelX + 38, panelY + 40)

  // Last merge info
  if (state.mergeHistory.length > 0 && !state.isComplete) {
    const lastMerge = state.mergeHistory[state.mergeHistory.length - 1]
    ctx.font = '11px Inter, system-ui, sans-serif'
    ctx.fillStyle = textColor + '99'
    ctx.textAlign = 'right'
    ctx.fillText(
      `Last merge distance: ${lastMerge.distance.toFixed(2)}`,
      panelX + panelWidth - padding,
      panelY + 30
    )
    ctx.textAlign = 'left'
  }
}
