'use client'

import { useState, useEffect, useRef } from 'react'

export function DsaIcon({ hovered }: Readonly<{ hovered: boolean }>) {
  const barsRef = useRef<number[]>([4, 2, 7, 1, 5])
  const [bars, setBars] = useState([4, 2, 7, 1, 5])
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const sortStateRef = useRef<{ arr: number[]; i: number; j: number; sorted: number[] }>({
    arr: [4, 2, 7, 1, 5],
    i: 0,
    j: 0,
    sorted: [],
  })

  useEffect(() => {
    if (globalThis.window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = hovered ? 80 : 340
    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick)
      if (ts - lastRef.current < interval) return
      lastRef.current = ts
      const s = sortStateRef.current
      const n = s.arr.length
      if (s.i >= n - 1) {
        // reset
        const next = [4, 2, 7, 1, 5]
        sortStateRef.current = { arr: next, i: 0, j: 0, sorted: [] }
        barsRef.current = [...next]
        setBars([...next])
        return
      }
      const j = s.j
      if (s.arr[j] > s.arr[j + 1]) {
        const a = [...s.arr]
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        s.arr = a
        barsRef.current = [...a]
        setBars([...a])
      }
      if (s.j < n - 2 - s.i) {
        s.j++
      } else {
        s.sorted = [...s.sorted, n - 1 - s.i]
        s.i++
        s.j = 0
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovered])

  const max = 7
  const n = 5
  const W = 48
  const barW = 6
  const gap = 2
  const totalW = n * barW + (n - 1) * gap
  const offsetX = (W - totalW) / 2

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-hidden="true">
      {bars.map((v, i) => {
        const h = Math.round((v / max) * 34)
        const x = offsetX + i * (barW + gap)
        const isSorted = sortStateRef.current.sorted.includes(i)
        const barKey = `bar-pos-${x}`
        return (
          <rect
            key={barKey}
            x={x}
            y={48 - 7 - h}
            width={barW}
            height={h}
            rx="1.5"
            fill={isSorted ? '#a855f7' : '#c084fc'}
            style={{ transition: 'height 0.12s ease, y 0.12s ease, fill 0.2s ease' }}
          />
        )
      })}
    </svg>
  )
}
