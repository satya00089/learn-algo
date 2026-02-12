'use client'

import React from 'react'

interface ControlGroupProps {
  readonly title?: string
  readonly children: React.ReactNode
  readonly className?: string
}

/**
 * Reusable ControlGroup component for organizing controls
 * No algorithm-specific logic - pure UI
 */
export function ControlGroup({ title, children, className = '' }: ControlGroupProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b">{title}</h3>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  )
}
