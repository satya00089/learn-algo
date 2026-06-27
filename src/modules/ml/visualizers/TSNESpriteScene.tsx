'use client'

import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import type { TSNEPoint, TSNEState } from '../engines/TSNEEngine'

type SpriteRect = {
  width: number
  height: number
}

export interface TSNESpriteSceneProps<TMetadata> {
  readonly state: TSNEState
  readonly theme: 'light' | 'dark'
  readonly spriteRect: SpriteRect
  readonly getMetadata: (point: TSNEPoint) => TMetadata | undefined
  readonly getSpriteBitmap: (metadata: TMetadata) => ImageBitmap | null | undefined
  readonly loadSpriteBitmap: (metadata: TMetadata) => Promise<ImageBitmap | null>
  readonly getFallbackColor: (metadata: TMetadata | undefined) => string
  readonly DetailModal: ComponentType<{ item: TMetadata; onClose: () => void }>
  readonly emptyText?: string
  readonly clickHint?: string
  readonly axisLabel?: string
  readonly title?: string
}

export function TSNESpriteScene<TMetadata>({
  state,
  theme,
  spriteRect,
  getMetadata,
  getSpriteBitmap,
  loadSpriteBitmap,
  getFallbackColor,
  DetailModal,
  emptyText = 'Initializing t-SNE...',
  clickHint = 'Scroll to zoom | Drag to pan | Click item for details',
  axisLabel = 't-SNE',
  title = 't-SNE Sprite Showcase',
}: TSNESpriteSceneProps<TMetadata>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedItem, setSelectedItem] = useState<TMetadata | null>(null)
  const viewRef = useRef({ scale: 1, panX: 0, panY: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [, forceRedraw] = useState(0)

  useEffect(() => {
    let alive = true
    for (const point of state.points) {
      const metadata = getMetadata(point)
      if (!metadata || getSpriteBitmap(metadata)) continue
      loadSpriteBitmap(metadata).then(() => {
        if (alive) forceRedraw((n) => n + 1)
      })
    }
    return () => {
      alive = false
    }
  }, [state.points, getMetadata, getSpriteBitmap, loadSpriteBitmap])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const { scale, panX, panY } = viewRef.current

    ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const points = state.points
    if (points.length === 0) {
      ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
      ctx.font = '16px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(emptyText, width / 2, height / 2)
      return
    }

    let xMin = Infinity
    let xMax = -Infinity
    let yMin = Infinity
    let yMax = -Infinity
    for (const point of points) {
      if (point.x < xMin) xMin = point.x
      if (point.x > xMax) xMax = point.x
      if (point.y < yMin) yMin = point.y
      if (point.y > yMax) yMax = point.y
    }

    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    const xMid = (xMin + xMax) / 2
    const yMid = (yMin + yMax) / 2
    const pad = 64
    const scaleFactor = Math.min((width - pad * 2) / xRange, (height - pad * 2) / yRange)

    const toCanvasX = (x: number) => width / 2 + panX + (x - xMid) * scaleFactor * scale
    const toCanvasY = (y: number) => height / 2 + panY - (y - yMid) * scaleFactor * scale

    const thumbWidth = spriteRect.width
    const thumbHeight = spriteRect.height
    const dotRadius = 5

    for (const point of points) {
      const metadata = getMetadata(point)
      const canvasX = toCanvasX(point.x)
      const canvasY = toCanvasY(point.y)
      const bitmap = metadata ? getSpriteBitmap(metadata) : undefined

      if (bitmap) {
        const startX = canvasX - thumbWidth / 2
        const startY = canvasY - thumbHeight / 2
        ctx.drawImage(bitmap, startX, startY, thumbWidth, thumbHeight)
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
        ctx.lineWidth = 1
        ctx.strokeRect(startX, startY, thumbWidth, thumbHeight)
      } else {
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, dotRadius, 0, Math.PI * 2)
        ctx.fillStyle = getFallbackColor(metadata)
        ctx.fill()
      }
    }

    if (state.phase !== 'complete' && state.phase !== 'init') {
      const phaseLabel =
        state.phase === 'early-exaggeration'
          ? `Early Exaggeration - iter ${state.iteration} / ${state.maxIterations}`
          : `Optimization - iter ${state.iteration} / ${state.maxIterations}`
      ctx.font = '11px Inter, sans-serif'
      const textWidth = ctx.measureText(phaseLabel).width
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(width / 2 - textWidth / 2 - 10, 8, textWidth + 20, 24)
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(phaseLabel, width / 2, 24)
    }

    ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${axisLabel} 1`, width / 2, height - 8)
    ctx.save()
    ctx.translate(13, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`${axisLabel} 2`, 0, 0)
    ctx.restore()
  })

  const getLayout = () => {
    const canvas = canvasRef.current
    if (!canvas || state.points.length === 0) return null

    const width = canvas.width
    const height = canvas.height
    let xMin = Infinity
    let xMax = -Infinity
    let yMin = Infinity
    let yMax = -Infinity
    for (const point of state.points) {
      if (point.x < xMin) xMin = point.x
      if (point.x > xMax) xMax = point.x
      if (point.y < yMin) yMin = point.y
      if (point.y > yMax) yMax = point.y
    }

    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    const xMid = (xMin + xMax) / 2
    const yMid = (yMin + yMax) / 2
    const pad = 64
    const scaleFactor = Math.min((width - pad * 2) / xRange, (height - pad * 2) / yRange)

    return { width, height, xMid, yMid, scaleFactor }
  }

  const hitTest = (eventX: number, eventY: number): TMetadata | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const layout = getLayout()
    if (!layout) return null

    const { width, height, xMid, yMid, scaleFactor } = layout
    const { scale, panX, panY } = viewRef.current
    const rect = canvas.getBoundingClientRect()
    const mouseX = (eventX - rect.left) * (width / rect.width)
    const mouseY = (eventY - rect.top) * (height / rect.height)
    const thumbWidth = spriteRect.width
    const thumbHeight = spriteRect.height
    const dotRadius = 8

    for (let index = state.points.length - 1; index >= 0; index--) {
      const point = state.points[index]
      const metadata = getMetadata(point)
      const canvasX = width / 2 + panX + (point.x - xMid) * scaleFactor * scale
      const canvasY = height / 2 + panY - (point.y - yMid) * scaleFactor * scale
      const hasBitmap = metadata ? !!getSpriteBitmap(metadata) : false
      const hit = hasBitmap
        ? mouseX >= canvasX - thumbWidth / 2 &&
          mouseX <= canvasX + thumbWidth / 2 &&
          mouseY >= canvasY - thumbHeight / 2 &&
          mouseY <= canvasY + thumbHeight / 2
        : Math.sqrt((mouseX - canvasX) ** 2 + (mouseY - canvasY) ** 2) <= dotRadius
      if (hit && metadata) return metadata
    }

    return null
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseCanvasX = (e.clientX - rect.left) * (canvas.width / rect.width)
    const mouseCanvasY = (e.clientY - rect.top) * (canvas.height / rect.height)
    const { scale, panX, panY } = viewRef.current
    const factor = e.deltaY < 0 ? 1.1 : 0.91
    const newScale = Math.max(0.4, Math.min(20, scale * factor))
    const relativeX = mouseCanvasX - canvas.width / 2
    const relativeY = mouseCanvasY - canvas.height / 2

    viewRef.current.scale = newScale
    viewRef.current.panX = relativeX * (1 - newScale / scale) + panX * (newScale / scale)
    viewRef.current.panY = relativeY * (1 - newScale / scale) + panY * (newScale / scale)
    forceRedraw((n) => n + 1)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return

    const scaleX = canvas.width / canvas.getBoundingClientRect().width
    const scaleY = canvas.height / canvas.getBoundingClientRect().height
    viewRef.current.panX += (e.clientX - dragRef.current.x) * scaleX
    viewRef.current.panY += (e.clientY - dragRef.current.y) * scaleY
    dragRef.current = { x: e.clientX, y: e.clientY }
    forceRedraw((n) => n + 1)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragRef.current) {
      const dx = Math.abs(e.clientX - dragRef.current.x)
      const dy = Math.abs(e.clientY - dragRef.current.y)
      if (dx < 5 && dy < 5) {
        const hit = hitTest(e.clientX, e.clientY)
        if (hit) setSelectedItem(hit)
      }
    }
    dragRef.current = null
  }

  return (
    <div className="relative h-full w-full select-none">
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        style={{ objectFit: 'contain' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragRef.current = null
        }}
      />
      <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-gray-400">
        {clickHint}
      </div>
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      <div className="pointer-events-none absolute left-3 top-2 text-xs text-gray-400">
        {title}
      </div>
    </div>
  )
}
