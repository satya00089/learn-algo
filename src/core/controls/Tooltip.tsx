'use client'

import { useRef, useState } from 'react'

interface TooltipProps {
  children: React.ReactNode
  text: string
}

export function Tooltip({ children, text }: TooltipProps) {
  const [show, setShow] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={buttonRef}
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      role="tooltip"
      aria-label={text}
    >
      {children}
      {show && (
        <div
          ref={tooltipRef}
          className="fixed px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none"
          style={{
            zIndex: 9999,
            bottom: 'auto',
            left: buttonRef.current
              ? `${buttonRef.current.getBoundingClientRect().left + buttonRef.current.offsetWidth / 2}px`
              : '0',
            top: buttonRef.current
              ? `${buttonRef.current.getBoundingClientRect().top - 8}px`
              : '0',
            transform: 'translate(-50%, -100%)',
          }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
        </div>
      )}
    </div>
  )
}
