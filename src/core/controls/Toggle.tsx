'use client'

import { motion } from 'framer-motion'

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

/**
 * Reusable Toggle component
 * No algorithm-specific logic - pure UI
 */
export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}: Readonly<ToggleProps>) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
        `}
      >
        <motion.span
          className="inline-block h-4 w-4 rounded-full bg-white shadow"
          initial={false}
          animate={{ x: checked ? 24 : 4 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.35 }}
        />
      </button>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
  )
}
