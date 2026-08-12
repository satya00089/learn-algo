'use client'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

/**
 * Reusable Slider component
 * No algorithm-specific logic - pure UI
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled = false,
  className = '',
}: Readonly<SliderProps>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="themed-range w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}
