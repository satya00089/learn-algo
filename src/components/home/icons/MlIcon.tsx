'use client'

import { useState, useEffect, useRef } from 'react'

type Pt = { x: number; y: number; cx: number; cy: number; color: string }

const ML_CLUSTERS = [
  { cx: 14, cy: 14, color: '#38bdf8' },
  { cx: 34, cy: 38, color: '#38bdf8' },
  { cx: 38, cy: 16, color: '#38bdf8' },
]

const ML_POINTS_INIT: Pt[] = [
  { x: 10, y: 10, cx: 14, cy: 14, color: '#38bdf8' },
  { x: 18, y: 8, cx: 14, cy: 14, color: '#38bdf8' },
  { x: 12, y: 18, cx: 14, cy: 14, color: '#38bdf8' },
  { x: 30, y: 36, cx: 34, cy: 38, color: '#38bdf8' },
  { x: 36, y: 40, cx: 34, cy: 38, color: '#38bdf8' },
  { x: 32, y: 42, cx: 34, cy: 38, color: '#38bdf8' },
  { x: 40, y: 12, cx: 38, cy: 16, color: '#38bdf8' },
  { x: 36, y: 20, cx: 38, cy: 16, color: '#38bdf8' },
  { x: 42, y: 18, cx: 38, cy: 16, color: '#38bdf8' },
]

export function MlIcon({ hovered }: Readonly<{ hovered: boolean }>) {
  const [phase, setPhase] = useState<'scatter' | 'cluster'>('scatter')
  const phaseRef = useRef<'scatter' | 'cluster'>('scatter')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scatter: Pt[] = [
    { x: 8, y: 24, cx: 14, cy: 14, color: '#94a3b8' },
    { x: 20, y: 6, cx: 14, cy: 14, color: '#94a3b8' },
    { x: 14, y: 38, cx: 14, cy: 14, color: '#94a3b8' },
    { x: 40, y: 28, cx: 34, cy: 38, color: '#94a3b8' },
    { x: 26, y: 42, cx: 34, cy: 38, color: '#94a3b8' },
    { x: 44, y: 40, cx: 34, cy: 38, color: '#94a3b8' },
    { x: 36, y: 6, cx: 38, cy: 16, color: '#94a3b8' },
    { x: 46, y: 10, cx: 38, cy: 16, color: '#94a3b8' },
    { x: 28, y: 14, cx: 38, cy: 16, color: '#94a3b8' },
  ]

  const clustered = ML_POINTS_INIT

  const cycle = () => {
    const next = phaseRef.current === 'scatter' ? 'cluster' : 'scatter'
    phaseRef.current = next
    setPhase(next)
    timerRef.current = setTimeout(cycle, next === 'cluster' ? 1800 : 900)
  }

  useEffect(() => {
    if (globalThis.window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timerRef.current = setTimeout(cycle, 600)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pts = phase === 'cluster' ? clustered : scatter
  const clusterColors = ['#38bdf8', '#818cf8', '#34d399']

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true">
      {hovered &&
        ML_CLUSTERS.map((c, clusterIdx) => (
          <circle
            key={`cluster-${c.cx}-${c.cy}`}
            cx={c.cx}
            cy={c.cy}
            r={phase === 'cluster' ? 11 : 4}
            fill={clusterColors[clusterIdx]}
            opacity={0.12}
            style={{ transition: 'r 0.6s ease, opacity 0.4s ease' }}
          />
        ))}
      {pts.map((p) => (
        <circle
          key={`pt-${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          r={2.5}
          fill={phase === 'cluster' ? clusterColors[pts.indexOf(p) % 3] : '#94a3b8'}
        >
          <animate
            attributeName="cx"
            to={phase === 'cluster' ? p.cx.toString() : p.x.toString()}
            dur="0.7s"
            fill="freeze"
          />
          <animate
            attributeName="cy"
            to={phase === 'cluster' ? p.cy.toString() : p.y.toString()}
            dur="0.7s"
            fill="freeze"
          />
        </circle>
      ))}
    </svg>
  )
}
