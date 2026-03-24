'use client'

import { useRef, useState, useEffect } from 'react'
import type { TSNEState } from '../engines/TSNEEngine'
import { bitmapCache, getPosterBitmap, loadManifest, MovieDetailModal } from './PCA3DScene'
import type { MovieMetadata } from '../data/movieDataLoader'

// Eagerly kick off manifest + sheet loading — shares the PCA module-level promise
loadManifest()

/** Genre → accent colour for fallback dots while poster bitmaps are loading. */
const GENRE_COLORS: Record<string, string> = {
  Action: '#ef4444',
  Adventure: '#f97316',
  Animation: '#eab308',
  Comedy: '#84cc16',
  Crime: '#dc2626',
  Documentary: '#6b7280',
  Drama: '#8b5cf6',
  Family: '#06b6d4',
  Fantasy: '#a855f7',
  History: '#7c3aed',
  Horror: '#991b1b',
  Music: '#ec4899',
  Mystery: '#0891b2',
  Romance: '#f43f5e',
  'Science Fiction': '#3b82f6',
  Thriller: '#d97706',
  War: '#78716c',
  Western: '#92400e',
  Unknown: '#9ca3af',
}

export interface TSNE2DMovieSceneProps {
  readonly state: TSNEState
  readonly theme: 'light' | 'dark'
}

/**
 * Canvas-based 2D scatter for t-SNE + movies.
 *
 * Renders each movie as a poster thumbnail at its current (x, y) position
 * on **every** render — no gate on phase/completion.  This lets the user
 * watch genre clusters organically form as the algorithm iterates:
 *   • Early-exaggeration (0–250): posters spread dramatically apart
 *   • Optimization (250–1000): posters drift into thematic neighbourhoods
 *
 * While a poster's ImageBitmap is not yet cached a genre-coloured circle
 * is drawn as a placeholder; the canvas re-renders automatically once the
 * bitmap arrives via the forceRedraw trigger.
 */
export function TSNE2DMovieScene({ state, theme }: TSNE2DMovieSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedMovie, setSelectedMovie] = useState<MovieMetadata | null>(null)
  const viewRef = useRef({ scale: 1, panX: 0, panY: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [, forceRedraw] = useState(0)

  // Kick off bitmap loading for every point; re-render when each one arrives
  useEffect(() => {
    let alive = true
    for (const p of state.points) {
      const tmdbId = p.metadata?.tmdbId as number | undefined
      if (!tmdbId || bitmapCache.has(tmdbId)) continue
      getPosterBitmap(tmdbId).then(() => {
        if (alive) forceRedraw((n) => n + 1)
      })
    }
    return () => {
      alive = false
    }
  }, [state.points])

  // Draw on every render (state changes every ~50ms during play)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const { scale, panX, panY } = viewRef.current

    ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#ffffff'
    ctx.fillRect(0, 0, W, H)

    const pts = state.points
    if (pts.length === 0) {
      ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
      ctx.font = '16px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Initialising t-SNE…', W / 2, H / 2)
      return
    }

    // Compute data bounds via loop (avoids spread-operator stack issues on large arrays)
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity
    for (const p of pts) {
      if (p.x < xMin) xMin = p.x
      if (p.x > xMax) xMax = p.x
      if (p.y < yMin) yMin = p.y
      if (p.y > yMax) yMax = p.y
    }
    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    const xMid = (xMin + xMax) / 2
    const yMid = (yMin + yMax) / 2
    const pad = 64
    const K = Math.min((W - pad * 2) / xRange, (H - pad * 2) / yRange)

    const toCx = (dx: number) => W / 2 + panX + (dx - xMid) * K * scale
    const toCy = (dy: number) => H / 2 + panY - (dy - yMid) * K * scale

    const THUMB_W = 38
    const THUMB_H = 57 // ~2:3 poster ratio
    const DOT_R = 5

    for (const p of pts) {
      const cx = toCx(p.x)
      const cy = toCy(p.y)
      const tmdbId = p.metadata?.tmdbId as number | undefined
      const bitmap = tmdbId ? bitmapCache.get(tmdbId) : undefined

      if (bitmap) {
        const sx = cx - THUMB_W / 2
        const sy = cy - THUMB_H / 2
        ctx.drawImage(bitmap, sx, sy, THUMB_W, THUMB_H)
        ctx.strokeStyle =
          theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'
        ctx.lineWidth = 1
        ctx.strokeRect(sx, sy, THUMB_W, THUMB_H)
      } else {
        // Placeholder dot in genre colour while bitmap loads
        const genre = (p.category ?? 'Unknown') as string
        const color = GENRE_COLORS[genre] ?? '#9ca3af'
        ctx.beginPath()
        ctx.arc(cx, cy, DOT_R, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
    }

    // Phase overlay badge
    if (state.phase !== 'complete' && state.phase !== 'init') {
      const label =
        state.phase === 'early-exaggeration'
          ? `Early Exaggeration — iter ${state.iteration} / ${state.maxIterations}`
          : `Optimization — iter ${state.iteration} / ${state.maxIterations}`
      ctx.font = '11px Inter, sans-serif'
      const tw = ctx.measureText(label).width
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(W / 2 - tw / 2 - 10, 8, tw + 20, 24)
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText(label, W / 2, 24)
    }

    // Axis labels
    ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('t-SNE 1', W / 2, H - 8)
    ctx.save()
    ctx.translate(13, H / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('t-SNE 2', 0, 0)
    ctx.restore()
  })

  // ── Interaction helpers ────────────────────────────────────────────────────

  const getLayout = () => {
    const canvas = canvasRef.current
    if (!canvas || state.points.length === 0) return null
    const W = canvas.width
    const H = canvas.height
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity
    for (const p of state.points) {
      if (p.x < xMin) xMin = p.x
      if (p.x > xMax) xMax = p.x
      if (p.y < yMin) yMin = p.y
      if (p.y > yMax) yMax = p.y
    }
    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    const xMid = (xMin + xMax) / 2
    const yMid = (yMin + yMax) / 2
    const pad = 64
    const K = Math.min((W - pad * 2) / xRange, (H - pad * 2) / yRange)
    return { W, H, xMid, yMid, K }
  }

  const hitTest = (ex: number, ey: number): MovieMetadata | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const layout = getLayout()
    if (!layout) return null
    const { W, H, xMid, yMid, K } = layout
    const { scale, panX, panY } = viewRef.current
    const rect = canvas.getBoundingClientRect()
    const mx = (ex - rect.left) * (W / rect.width)
    const my = (ey - rect.top) * (H / rect.height)
    const THUMB_W = 38
    const THUMB_H = 57
    const DOT_R = 8

    for (let i = state.points.length - 1; i >= 0; i--) {
      const p = state.points[i]
      const cx = W / 2 + panX + (p.x - xMid) * K * scale
      const cy = H / 2 + panY - (p.y - yMid) * K * scale
      const tmdbId = p.metadata?.tmdbId as number | undefined
      const hasBitmap = tmdbId ? bitmapCache.has(tmdbId) : false
      const hit = hasBitmap
        ? mx >= cx - THUMB_W / 2 &&
          mx <= cx + THUMB_W / 2 &&
          my >= cy - THUMB_H / 2 &&
          my <= cy + THUMB_H / 2
        : Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2) <= DOT_R
      if (hit && p.metadata) return p.metadata as MovieMetadata
    }
    return null
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mcx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const mcy = (e.clientY - rect.top) * (canvas.height / rect.height)
    const { scale, panX, panY } = viewRef.current
    const factor = e.deltaY < 0 ? 1.1 : 0.91
    const newScale = Math.max(0.4, Math.min(20, scale * factor))
    const relX = mcx - canvas.width / 2
    const relY = mcy - canvas.height / 2
    viewRef.current.scale = newScale
    viewRef.current.panX = relX * (1 - newScale / scale) + panX * (newScale / scale)
    viewRef.current.panY = relY * (1 - newScale / scale) + panY * (newScale / scale)
    forceRedraw((n) => n + 1)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const sx = canvas.width / canvas.getBoundingClientRect().width
    const sy = canvas.height / canvas.getBoundingClientRect().height
    viewRef.current.panX += (e.clientX - dragRef.current.x) * sx
    viewRef.current.panY += (e.clientY - dragRef.current.y) * sy
    dragRef.current = { x: e.clientX, y: e.clientY }
    forceRedraw((n) => n + 1)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (dragRef.current) {
      const dx = Math.abs(e.clientX - dragRef.current.x)
      const dy = Math.abs(e.clientY - dragRef.current.y)
      if (dx < 5 && dy < 5) {
        const hit = hitTest(e.clientX, e.clientY)
        if (hit) setSelectedMovie(hit)
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
        Scroll to zoom · Drag to pan · Click poster for details
      </div>
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  )
}
