'use client'

import { useId, useRef, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export function FaqItem({ q, a }: Readonly<{ q: string; a: string }>) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  // Source of truth for "what the panel is currently animating toward" —
  // read and written synchronously so a rapid re-toggle mid-flight always
  // knows the live intent, instead of the stale `open` from the last render.
  const targetOpenRef = useRef(false)
  const revealRef = useScrollReveal()
  const bodyId = useId()

  const toggle = () => {
    const el = bodyRef.current
    if (!el) {
      setOpen((v) => !v)
      return
    }

    const nextOpen = !targetOpenRef.current
    targetOpenRef.current = nextOpen
    if (nextOpen) setOpen(true) // mount/reveal content before measuring scrollHeight below

    const prefersReducedMotion = globalThis.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      el.style.transition = 'none'
      el.style.height = nextOpen ? 'auto' : '0px'
      el.style.overflow = nextOpen ? '' : 'hidden'
      if (!nextOpen) setOpen(false)
      return
    }

    // Start from wherever the panel actually is right now — not an assumed
    // 0 or scrollHeight — so interrupting an in-flight animation continues
    // smoothly instead of snapping back to the old target first.
    const current = el.getBoundingClientRect().height
    el.style.transition = 'none'
    el.style.height = `${current}px`
    el.style.overflow = 'hidden'
    void el.offsetHeight // force layout so the transition below animates from `current`

    requestAnimationFrame(() => {
      const target = nextOpen ? el.scrollHeight : 0
      el.style.transition = 'height 0.32s cubic-bezier(0.22,1,0.36,1)'
      el.style.height = `${target}px`
    })

    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return
      el.removeEventListener('transitionend', onEnd)
      if (targetOpenRef.current !== nextOpen) return // superseded by a newer toggle meanwhile
      if (nextOpen) {
        el.style.height = 'auto'
        el.style.overflow = ''
      } else {
        setOpen(false)
      }
    }
    el.addEventListener('transitionend', onEnd)
  }

  return (
    <div
      ref={revealRef}
      className="reveal bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={toggle}
        className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-800/60 dark:active:bg-gray-800 transition-colors text-left"
      >
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Always mounted so bodyRef is available on the very first open — the
          height animation controls visibility, not conditional rendering. */}
      <div id={bodyId} ref={bodyRef} aria-hidden={!open} style={{ height: 0, overflow: 'hidden' }}>
        <div className="px-6 pb-5 text-gray-500 dark:text-gray-400 leading-relaxed">{a}</div>
      </div>
    </div>
  )
}
