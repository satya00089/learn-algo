'use client'

import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import type { PCAState } from '../engines/PCAEngine'

type SpriteRect = {
  width: number
  height: number
}

export interface PCA2DSpriteSceneProps<TMetadata> {
  readonly state: PCAState
  readonly theme: 'light' | 'dark'
  readonly spriteRect: SpriteRect
  readonly getMetadata: (point: PCAState['points'][number]) => TMetadata | undefined
  readonly getSpriteBitmap: (metadata: TMetadata) => ImageBitmap | null | undefined
  readonly loadSpriteBitmap: (metadata: TMetadata) => Promise<ImageBitmap | null>
  readonly getFallbackColor: (metadata: TMetadata | undefined) => string
  readonly DetailModal: ComponentType<{ item: TMetadata; onClose: () => void }>
  readonly emptyText?: string
  readonly clickHint?: string
  readonly axisLabel?: string
  readonly title?: string
}

export function PCA2DSpriteScene<TMetadata>({
  state,
  theme,
  spriteRect,
  getMetadata,
  getSpriteBitmap,
  loadSpriteBitmap,
  getFallbackColor,
  DetailModal,
  emptyText = 'Run PCA to see the dataset',
  clickHint = 'Scroll to zoom | Drag to pan | Click item for details',
  axisLabel = 'PC',
  title = 'PCA Sprite Showcase',
}: PCA2DSpriteSceneProps<TMetadata>) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedItem, setSelectedItem] = useState<TMetadata | null>(null)
  const viewRef = useRef({ scale: 1, panX: 0, panY: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [, forceRedraw] = useState(0)
  const animRef = useRef({ progress: 1, rafId: 0 })
  const prevCompleteRef = useRef(false)

  const points = useMemo(() => {
    if (!state.isComplete) return []
    return state.points
      .map((point) => {
        const metadata = getMetadata(point)
        if (!metadata) return null
        return {
          x: point.transformed.x,
          y: point.transformed.y,
          metadata,
        }
      })
      .filter(Boolean) as Array<{
      x: number
      y: number
      metadata: TMetadata
    }>
  }, [state, getMetadata])

  useEffect(() => {
    let alive = true
    for (const point of points) {
      if (getSpriteBitmap(point.metadata)) continue
      loadSpriteBitmap(point.metadata).then(() => {
        if (alive) forceRedraw((n) => n + 1)
      })
    }
    return () => {
      alive = false
    }
  }, [points, getSpriteBitmap, loadSpriteBitmap])

  useEffect(() => {
    const wasComplete = prevCompleteRef.current
    prevCompleteRef.current = state.isComplete
    if (state.isComplete && !wasComplete) {
      cancelAnimationFrame(animRef.current.rafId)
      animRef.current.progress = 0
      const startTime = performance.now()
      const duration = 1000
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1)
        animRef.current.progress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        forceRedraw((n) => n + 1)
        if (t < 1) animRef.current.rafId = requestAnimationFrame(tick)
      }
      animRef.current.rafId = requestAnimationFrame(tick)
    } else if (!state.isComplete) {
      cancelAnimationFrame(animRef.current.rafId)
      animRef.current.progress = 1
    }
    return () => cancelAnimationFrame(animRef.current.rafId)
  }, [state.isComplete])

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

    if (points.length === 0) {
      ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(state.isComplete ? emptyText : 'Running PCA...', width / 2, height / 2)
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
    const prog = animRef.current.progress

    for (const point of points) {
      const metadata = point.metadata
      const canvasX = toCanvasX(point.x * prog)
      const canvasY = toCanvasY(point.y * prog)
      const bitmap = getSpriteBitmap(metadata)

      if (bitmap) {
        const startX = canvasX - thumbWidth / 2
        const startY = canvasY - thumbHeight / 2
        ctx.drawImage(bitmap, startX, startY, thumbWidth, thumbHeight)
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
        ctx.lineWidth = 1
        ctx.strokeRect(startX, startY, thumbWidth, thumbHeight)
      } else {
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2)
        ctx.fillStyle = getFallbackColor(metadata)
        ctx.fill()
      }
    }

    ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${axisLabel} 1`, width / 2, height - 8)
    ctx.save()
    ctx.translate(13, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(`${axisLabel} 2`, 0, 0)
    ctx.restore()

    ctx.fillStyle = theme === 'dark' ? '#cbd5e1' : '#475569'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(title, 14, 22)
  })

  const layout = () => {
    const canvas = canvasRef.current
    if (!canvas || points.length === 0) return null

    const width = canvas.width
    const height = canvas.height
    const xValues = points.map((point) => point.x)
    const yValues = points.map((point) => point.y)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
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
    const currentLayout = layout()
    if (!currentLayout) return null

    const { width, height, xMid, yMid, scaleFactor } = currentLayout
    const { scale, panX, panY } = viewRef.current
    const rect = canvas.getBoundingClientRect()
    const mouseX = (eventX - rect.left) * (width / rect.width)
    const mouseY = (eventY - rect.top) * (height / rect.height)
    const thumbWidth = spriteRect.width
    const thumbHeight = spriteRect.height

    for (let index = points.length - 1; index >= 0; index--) {
      const point = points[index]
      const canvasX = width / 2 + panX + (point.x - xMid) * scaleFactor * scale
      const canvasY = height / 2 + panY - (point.y - yMid) * scaleFactor * scale
      const bitmap = getSpriteBitmap(point.metadata)
      const hit = bitmap
        ? mouseX >= canvasX - thumbWidth / 2 &&
          mouseX <= canvasX + thumbWidth / 2 &&
          mouseY >= canvasY - thumbHeight / 2 &&
          mouseY <= canvasY + thumbHeight / 2
        : Math.sqrt((mouseX - canvasX) ** 2 + (mouseY - canvasY) ** 2) <= 8
      if (hit) return point.metadata
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
    <div className="relative w-full h-full select-none">
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ objectFit: 'contain' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          dragRef.current = null
        }}
      />
      <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
        {clickHint}
      </div>
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}
