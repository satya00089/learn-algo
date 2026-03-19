'use client'

import { useState, useEffect, useRef } from 'react'

type TreeNode = { id: number; x: number; y: number; parent: number | null }

const TREE_NODES: TreeNode[] = [
  { id: 0, x: 24, y: 6, parent: null },
  { id: 1, x: 12, y: 20, parent: 0 },
  { id: 2, x: 36, y: 20, parent: 0 },
  { id: 3, x: 6, y: 36, parent: 1 },
  { id: 4, x: 18, y: 36, parent: 1 },
  { id: 5, x: 30, y: 36, parent: 2 },
  { id: 6, x: 42, y: 36, parent: 2 },
]

const BFS_ORDER = [0, 1, 2, 3, 4, 5, 6]

export function AiIcon({ hovered }: Readonly<{ hovered: boolean }>) {
  const [litSet, setLitSet] = useState<Set<number>>(new Set())
  const stepRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runWave = () => {
    stepRef.current = 0
    setLitSet(new Set())
    const fire = () => {
      if (stepRef.current >= BFS_ORDER.length) {
        timerRef.current = setTimeout(runWave, hovered ? 600 : 1800)
        return
      }
      const id = BFS_ORDER[stepRef.current]
      stepRef.current++
      setLitSet((prev) => new Set([...prev, id]))
      timerRef.current = setTimeout(fire, hovered ? 80 : 180)
    }
    fire()
  }

  useEffect(() => {
    if (globalThis.window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timerRef.current = setTimeout(runWave, 400)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hovered]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true">
      {/* edges */}
      {TREE_NODES.filter((n) => n.parent !== null).map((n) => {
        const parent = TREE_NODES.find((p) => p.id === n.parent)
        if (!parent) return null
        const lit = litSet.has(n.id) && n.parent !== null && litSet.has(n.parent)
        return (
          <line
            key={n.id}
            x1={parent.x}
            y1={parent.y}
            x2={n.x}
            y2={n.y}
            stroke={lit ? '#6ee7b7' : '#d1d5db'}
            strokeWidth={1.5}
            style={{ transition: 'stroke 0.2s ease' }}
          />
        )
      })}
      {/* nodes */}
      {TREE_NODES.map((n) => {
        const lit = litSet.has(n.id)
        return (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={n.id === 0 ? 5 : 3.5}
            fill={lit ? '#10b981' : '#e5e7eb'}
            stroke={lit ? '#059669' : '#9ca3af'}
            strokeWidth={1}
            style={{ transition: 'fill 0.18s ease, stroke 0.18s ease' }}
          />
        )
      })}
    </svg>
  )
}
