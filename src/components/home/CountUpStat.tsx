'use client'

import { useState, useEffect, useRef } from 'react'

export function CountUpStat({ target, suffix = '' }: Readonly<{ target: number; suffix?: string }>) {
  const [value, setValue] = useState(0)
  const [triggered, setTriggered] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          obs.disconnect()
        }
      },
      { threshold: 0.8 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!triggered) return
    const duration = 900
    let startTime: number | null = null
    const tick = (ts: number) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [triggered, target])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}
