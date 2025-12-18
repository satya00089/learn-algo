import type { TreeNode } from '../engines/BinarySearchTreeEngine'

/**
 * Draw a binary search tree on canvas
 */
export function drawTree(
  ctx: CanvasRenderingContext2D,
  root: TreeNode | null,
  options: {
    canvasWidth: number
    canvasHeight: number
  }
): void {
  if (!root) {
    // Draw empty tree message
    ctx.save()
    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      'Tree is empty. Insert nodes to get started!',
      options.canvasWidth / 2,
      options.canvasHeight / 2
    )
    ctx.restore()
    return
  }

  // Calculate bounding box of the tree
  const bounds = getTreeBounds(root)

  // Calculate padding
  const padding = 40

  // Calculate tree dimensions
  const treeWidth = bounds.maxX - bounds.minX
  const treeHeight = bounds.maxY - bounds.minY

  // Calculate available space (canvas minus padding)
  const availableWidth = options.canvasWidth - padding * 2
  const availableHeight = options.canvasHeight - padding * 2

  // Calculate scale factor if tree is too large
  let scale = 1
  if (treeWidth > availableWidth || treeHeight > availableHeight) {
    const scaleX = availableWidth / treeWidth
    const scaleY = availableHeight / treeHeight
    scale = Math.min(scaleX, scaleY, 1) * 0.95 // Use 95% to add a small margin
  }

  // Apply scaling transformation if needed
  if (scale < 1) {
    ctx.save()
    ctx.translate(options.canvasWidth / 2, options.canvasHeight / 2)
    ctx.scale(scale, scale)
    ctx.translate(-options.canvasWidth / 2, -options.canvasHeight / 2)
  }

  // Calculate offsets to center the tree
  const offsetX = options.canvasWidth / 2 - (bounds.minX + bounds.maxX) / 2
  const offsetY = padding + 20 - bounds.minY

  // Draw edges first (so they appear behind nodes)
  drawEdges(ctx, root, offsetX, offsetY)

  // Draw nodes
  drawNodes(ctx, root, offsetX, offsetY)

  // Restore context if we applied scaling
  if (scale < 1) {
    ctx.restore()
  }
}

function getTreeBounds(node: TreeNode | null): {
  minX: number
  maxX: number
  minY: number
  maxY: number
} {
  if (!node || node.x === undefined || node.y === undefined) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
  }

  let minX = node.x
  let maxX = node.x
  let minY = node.y
  let maxY = node.y

  const checkNode = (n: TreeNode | null) => {
    if (!n || n.x === undefined || n.y === undefined) return
    minX = Math.min(minX, n.x)
    maxX = Math.max(maxX, n.x)
    minY = Math.min(minY, n.y)
    maxY = Math.max(maxY, n.y)
    checkNode(n.left)
    checkNode(n.right)
  }

  checkNode(node.left)
  checkNode(node.right)

  return { minX, maxX, minY, maxY }
}

function drawEdges(
  ctx: CanvasRenderingContext2D,
  node: TreeNode,
  offsetX: number,
  offsetY: number
): void {
  if (!node || node.x === undefined || node.y === undefined) return

  ctx.save()
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 2

  const x = node.x + offsetX
  const y = node.y + offsetY

  // Draw edge to left child
  if (node.left && node.left.x !== undefined && node.left.y !== undefined) {
    ctx.beginPath()
    ctx.moveTo(x, y + 20) // Start from bottom of parent circle
    ctx.lineTo(node.left.x + offsetX, node.left.y + offsetY - 20) // End at top of child circle
    ctx.stroke()
    drawEdges(ctx, node.left, offsetX, offsetY)
  }

  // Draw edge to right child
  if (node.right && node.right.x !== undefined && node.right.y !== undefined) {
    ctx.beginPath()
    ctx.moveTo(x, y + 20)
    ctx.lineTo(node.right.x + offsetX, node.right.y + offsetY - 20)
    ctx.stroke()
    drawEdges(ctx, node.right, offsetX, offsetY)
  }

  ctx.restore()
}

function drawNodes(
  ctx: CanvasRenderingContext2D,
  node: TreeNode,
  offsetX: number,
  offsetY: number
): void {
  if (!node || node.x === undefined || node.y === undefined) return

  // Draw left subtree first
  if (node.left) drawNodes(ctx, node.left, offsetX, offsetY)

  // Draw current node
  const radius = 20
  const x = node.x + offsetX
  const y = node.y + offsetY

  // Determine colors based on state
  let fillColor = '#3b82f6' // blue - default
  let strokeColor = '#2563eb'
  let textColor = '#ffffff'

  switch (node.state) {
    case 'comparing':
      fillColor = '#fbbf24' // yellow
      strokeColor = '#f59e0b'
      textColor = '#1e293b'
      break
    case 'inserting':
      fillColor = '#10b981' // green
      strokeColor = '#059669'
      break
    case 'found':
      fillColor = '#10b981' // green
      strokeColor = '#059669'
      break
    case 'notfound':
      fillColor = '#ef4444' // red
      strokeColor = '#dc2626'
      break
    case 'deleting':
      fillColor = '#ef4444' // red
      strokeColor = '#dc2626'
      break
  }

  // Draw circle
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw value
  ctx.fillStyle = textColor
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(node.value.toString(), x, y)

  ctx.restore()

  // Draw right subtree
  if (node.right) drawNodes(ctx, node.right, offsetX, offsetY)
}

/**
 * Draw legend for tree visualization
 */
export function drawTreeLegend(
  ctx: CanvasRenderingContext2D,
  options: { x: number; y: number }
): void {
  const { x, y } = options
  const circleRadius = 10
  const spacing = 120

  ctx.save()
  ctx.font = '12px sans-serif'
  ctx.textBaseline = 'middle'

  const items = [
    { color: '#3b82f6', label: 'Default', stroke: '#2563eb' },
    { color: '#fbbf24', label: 'Comparing', stroke: '#f59e0b' },
    { color: '#10b981', label: 'Found/Inserted', stroke: '#059669' },
    { color: '#ef4444', label: 'Not Found', stroke: '#dc2626' },
  ]

  items.forEach((item, index) => {
    const itemX = x + index * spacing

    // Draw circle
    ctx.beginPath()
    ctx.arc(itemX, y, circleRadius, 0, Math.PI * 2)
    ctx.fillStyle = item.color
    ctx.fill()
    ctx.strokeStyle = item.stroke
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw label
    ctx.fillStyle = '#1e293b'
    ctx.textAlign = 'left'
    ctx.fillText(item.label, itemX + circleRadius + 8, y)
  })

  ctx.restore()
}
