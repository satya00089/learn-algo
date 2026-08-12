import type { MinimaxNode, Cell, TreeNodeLayout } from '../types'

/**
 * Calculate tree layout positions for visualization
 */
export function calculateTreeLayout(
  nodes: MinimaxNode[],
  width: number,
  height: number
): Map<string, TreeNodeLayout> {
  const layout = new Map<string, TreeNodeLayout>()

  if (nodes.length === 0) return layout

  // Group nodes by depth
  const depths = new Map<number, MinimaxNode[]>()
  nodes.forEach((node) => {
    if (!depths.has(node.depth)) {
      depths.set(node.depth, [])
    }
    depths.get(node.depth)!.push(node)
  })

  const maxDepth = Math.max(...Array.from(depths.keys()))
  const verticalSpacing = height / (maxDepth + 2)

  // Layout each depth level
  depths.forEach((levelNodes, depth) => {
    const horizontalSpacing = width / (levelNodes.length + 1)

    levelNodes.forEach((node, index) => {
      layout.set(node.id, {
        x: horizontalSpacing * (index + 1),
        y: verticalSpacing * (depth + 1),
      })
    })
  })

  return layout
}

/**
 * Draw Tic-Tac-Toe board
 */
export function drawBoard(
  ctx: CanvasRenderingContext2D,
  board: Cell[],
  x: number,
  y: number,
  size: number,
  isDark: boolean,
  highlightMove?: number | null
): void {
  const cellSize = size / 3
  const lineColor = isDark ? '#4B5563' : '#D1D5DB'
  const xColor = '#EF4444'
  const oColor = '#3B82F6'
  const highlightColor = isDark ? '#FBBF24' : '#F59E0B'

  ctx.save()
  ctx.translate(x, y)

  // Draw grid
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 2

  // Vertical lines
  ctx.beginPath()
  ctx.moveTo(cellSize, 0)
  ctx.lineTo(cellSize, size)
  ctx.moveTo(cellSize * 2, 0)
  ctx.lineTo(cellSize * 2, size)
  ctx.stroke()

  // Horizontal lines
  ctx.beginPath()
  ctx.moveTo(0, cellSize)
  ctx.lineTo(size, cellSize)
  ctx.moveTo(0, cellSize * 2)
  ctx.lineTo(size, cellSize * 2)
  ctx.stroke()

  // Draw X and O
  board.forEach((cell, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const centerX = col * cellSize + cellSize / 2
    const centerY = row * cellSize + cellSize / 2
    const padding = cellSize * 0.25

    // Highlight best move
    if (highlightMove === index) {
      ctx.fillStyle = highlightColor + '40'
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }

    if (cell === 'X') {
      ctx.strokeStyle = xColor
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(centerX - padding, centerY - padding)
      ctx.lineTo(centerX + padding, centerY + padding)
      ctx.moveTo(centerX + padding, centerY - padding)
      ctx.lineTo(centerX - padding, centerY + padding)
      ctx.stroke()
    } else if (cell === 'O') {
      ctx.strokeStyle = oColor
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(centerX, centerY, padding, 0, Math.PI * 2)
      ctx.stroke()
    }
  })

  ctx.restore()
}

/**
 * Draw minimax tree
 */
export function drawTree(
  ctx: CanvasRenderingContext2D,
  nodes: MinimaxNode[],
  layout: Map<string, TreeNodeLayout>,
  isDark: boolean,
  currentNodeId?: string | null,
  selectedNodeId?: string | null,
  highlightIds?: Set<string> | null,
  showMoveSymbol: boolean = false
): void {
  const nodeRadius = 20
  const bgColor = isDark ? '#1F2937' : '#F3F4F6'
  const textColor = isDark ? '#F9FAFB' : '#111827'
  const lineColor = isDark ? '#6B7280' : '#9CA3AF'

  // Draw connections first
  nodes.forEach((node) => {
    // If highlightIds provided, only draw connections where both parent and child are highlighted
    if (
      highlightIds &&
      (!highlightIds.has(node.id) || !node.parent || !highlightIds.has(node.parent))
    )
      return

    const nodePos = layout.get(node.id)
    if (!nodePos || !node.parent) return

    const parentPos = layout.get(node.parent)
    if (!parentPos) return

    // Highlight path to selected node
    const isSelected =
      selectedNodeId && (node.id === selectedNodeId || isNodeInPath(node.id, selectedNodeId, nodes))

    ctx.strokeStyle =
      node.state === 'pruned'
        ? '#EF4444'
        : node.state === 'best-path'
          ? '#10B981'
          : isSelected
            ? '#F59E0B'
            : lineColor
    ctx.lineWidth = node.state === 'best-path' || isSelected ? 3 : 1
    ctx.beginPath()
    ctx.moveTo(parentPos.x, parentPos.y)
    ctx.lineTo(nodePos.x, nodePos.y)
    ctx.stroke()
  })

  // Draw nodes
  nodes.forEach((node) => {
    // If highlightIds provided, only draw highlighted nodes
    if (highlightIds && !highlightIds.has(node.id)) return

    const pos = layout.get(node.id)
    if (!pos) return

    const isCurrentNode = currentNodeId === node.id
    const isSelectedNode = selectedNodeId === node.id

    // Node circle with special highlight for current/selected
    const nodeColor = isCurrentNode
      ? '#FBBF24'
      : isSelectedNode
        ? '#F59E0B'
        : node.state === 'exploring'
          ? '#FBBF24'
          : node.state === 'evaluated'
            ? node.isMax
              ? '#3B82F6'
              : '#EF4444'
            : node.state === 'pruned'
              ? '#EF4444'
              : node.state === 'best-path'
                ? '#10B981'
                : lineColor

    ctx.fillStyle = nodeColor
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)
    ctx.fill()

    // Node outline (thicker for current/selected)
    ctx.strokeStyle = bgColor
    ctx.lineWidth = isCurrentNode || isSelectedNode ? 4 : 2
    ctx.stroke()

    // Pulse effect for current node
    if (isCurrentNode) {
      ctx.strokeStyle = '#FBBF24'
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius + 5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    // Score text
    if (node.score !== null && node.score !== undefined) {
      ctx.fillStyle = isDark ? '#000000' : '#FFFFFF'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.score.toString(), pos.x, pos.y)
    }

    // Show move position (Box 1-9) inferred from difference with parent board
    if (showMoveSymbol && node.parent) {
      const parentNode = nodes.find((n) => n.id === node.parent)
      if (parentNode) {
        const parentBoard = parentNode.board
        const childBoard = node.board
        let movePosition: number | null = null
        for (let i = 0; i < 9; i++) {
          if (parentBoard[i] !== childBoard[i]) {
            movePosition = i + 1 // Convert 0-indexed to 1-9
            break
          }
        }
        if (movePosition !== null) {
          ctx.fillStyle = isDark ? '#F9FAFB' : '#111827'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(`Box ${movePosition}`, pos.x, pos.y - nodeRadius - 6)
        }
      }
    }

    // Alpha-Beta values
    if (node.alpha !== undefined || node.beta !== undefined) {
      ctx.fillStyle = textColor
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'

      if (node.alpha !== undefined && node.alpha !== -Infinity) {
        ctx.fillText(`α:${node.alpha}`, pos.x, pos.y + nodeRadius + 12)
      }
      if (node.beta !== undefined && node.beta !== Infinity) {
        ctx.fillText(`β:${node.beta}`, pos.x, pos.y + nodeRadius + 24)
      }
    }
  })
}

/**
 * Helper function to check if a node is in the path to target
 */
function isNodeInPath(nodeId: string, targetId: string, nodes: MinimaxNode[]): boolean {
  let current = nodes.find((n) => n.id === targetId)
  while (current) {
    if (current.id === nodeId) return true
    current = current.parent ? nodes.find((n) => n.id === current!.parent) : undefined
  }
  return false
}

/**
 * Draw mini board for tree nodes (optional detail view)
 */
export function drawMiniBoard(
  ctx: CanvasRenderingContext2D,
  board: Cell[],
  x: number,
  y: number,
  size: number,
  isDark: boolean
): void {
  const cellSize = size / 3
  const lineColor = isDark ? '#6B7280' : '#D1D5DB'
  const xColor = '#EF4444'
  const oColor = '#3B82F6'

  ctx.save()
  ctx.translate(x, y)

  // Draw grid
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 1

  for (let i = 1; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellSize, 0)
    ctx.lineTo(i * cellSize, size)
    ctx.moveTo(0, i * cellSize)
    ctx.lineTo(size, i * cellSize)
    ctx.stroke()
  }

  // Draw simplified X and O
  board.forEach((cell, index) => {
    if (!cell) return

    const col = index % 3
    const row = Math.floor(index / 3)
    const centerX = col * cellSize + cellSize / 2
    const centerY = row * cellSize + cellSize / 2
    const padding = cellSize * 0.2

    ctx.strokeStyle = cell === 'X' ? xColor : oColor
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    if (cell === 'X') {
      ctx.beginPath()
      ctx.moveTo(centerX - padding, centerY - padding)
      ctx.lineTo(centerX + padding, centerY + padding)
      ctx.moveTo(centerX + padding, centerY - padding)
      ctx.lineTo(centerX - padding, centerY + padding)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(centerX, centerY, padding, 0, Math.PI * 2)
      ctx.stroke()
    }
  })

  ctx.restore()
}

/**
 * Draw statistics panel
 */
export function drawStatistics(
  ctx: CanvasRenderingContext2D,
  nodesEvaluated: number,
  nodesPruned: number,
  x: number,
  y: number,
  isDark: boolean
): void {
  const textColor = isDark ? '#F9FAFB' : '#111827'

  ctx.fillStyle = textColor
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'

  ctx.fillText(`Nodes Evaluated: ${nodesEvaluated}`, x, y)

  if (nodesPruned > 0) {
    ctx.fillText(`Nodes Pruned: ${nodesPruned}`, x, y + 20)
    const efficiency = ((nodesPruned / (nodesEvaluated + nodesPruned)) * 100).toFixed(1)
    ctx.fillText(`Pruning Efficiency: ${efficiency}%`, x, y + 40)
  }
}

/**
 * Draw selected node info panel
 */
export function drawSelectedNodeInfo(
  ctx: CanvasRenderingContext2D,
  node: MinimaxNode,
  x: number,
  y: number,
  isDark: boolean
): void {
  const textColor = isDark ? '#F9FAFB' : '#111827'
  const panelBg = isDark ? '#1F2937' : '#FFFFFF'
  const borderColor = isDark ? '#4B5563' : '#D1D5DB'

  // Draw panel background
  ctx.fillStyle = panelBg
  ctx.strokeStyle = borderColor
  ctx.lineWidth = 2
  ctx.fillRect(x, y, 200, 140)
  ctx.strokeRect(x, y, 200, 140)

  // Draw mini board
  drawMiniBoard(ctx, node.board, x + 10, y + 10, 60, isDark)

  // Draw node info
  ctx.fillStyle = textColor
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'left'

  let infoY = y + 80
  ctx.fillText(`Depth: ${node.depth}`, x + 10, infoY)
  infoY += 15
  ctx.fillText(`Score: ${node.score ?? 'N/A'}`, x + 10, infoY)
  infoY += 15
  ctx.fillText(`Type: ${node.isMax ? 'MAX' : 'MIN'}`, x + 10, infoY)
  infoY += 15

  if (node.alpha !== undefined && node.alpha !== -Infinity) {
    ctx.fillText(`Alpha: ${node.alpha}`, x + 10, infoY)
  }
  if (node.beta !== undefined && node.beta !== Infinity) {
    ctx.fillText(`Beta: ${node.beta}`, x + 110, infoY)
  }
}
