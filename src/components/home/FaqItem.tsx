'use client'

import { useState, useRef, type Dispatch, type SetStateAction } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

function animateFaqPanel(
  el: HTMLDivElement,
  isOpen: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
) {
  const closePanel = () => {
    el.style.height = `${el.scrollHeight}px`
    el.style.overflow = 'hidden'
    requestAnimationFrame(() => {
      el.style.transition = 'height 0.22s cubic-bezier(0.22,1,0.36,1)'
      el.style.height = '0px'
      el.addEventListener('transitionend', () => setOpen(false), { once: true })
    })
  }
  const openPanel = () => {
    el.style.height = '0px'
    el.style.overflow = 'hidden'
    setOpen(true)
    requestAnimationFrame(() => {
      el.style.transition = 'height 0.32s cubic-bezier(0.22,1,0.36,1)'
      el.style.height = `${el.scrollHeight}px`
      el.addEventListener(
        'transitionend',
        () => {
          el.style.height = 'auto'
          el.style.overflow = ''
        },
        { once: true }
      )
    })
  }
  return isOpen ? closePanel() : openPanel()
}

export function FaqItem({ q, a }: Readonly<{ q: string; a: string }>) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const revealRef = useScrollReveal()

  const toggle = () => {
    const el = bodyRef.current
    if (!el) {
      setOpen((v) => !v)
      return
    }
    animateFaqPanel(el, open, setOpen)
  }

  return (
    <div
      ref={revealRef}
      className="reveal bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <button
        type="button"
        aria-expanded={open}
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
      {open && (
        <div ref={bodyRef} className="px-6 pb-5 text-gray-500 dark:text-gray-400 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}
