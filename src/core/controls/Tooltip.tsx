'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface TooltipProps {
  children: React.ReactNode
  text: string
}

export function Tooltip({ children, text }: TooltipProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })
  const buttonRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!show || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setPosition({ left: rect.left + buttonRef.current.offsetWidth / 2, top: rect.top - 8 })
  }, [show])

  return (
    <div
      ref={buttonRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            role="tooltip"
            className="fixed px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none"
            style={{
              zIndex: 9999,
              left: position.left,
              top: position.top,
              x: '-50%',
              y: '-100%',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
