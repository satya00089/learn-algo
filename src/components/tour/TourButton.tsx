'use client'

import { Button } from '@/core/controls'
import { useTour } from './TourProvider'

interface TourButtonProps {
  readonly className?: string
  readonly size?: 'sm' | 'md' | 'lg'
}

/**
 * Replay trigger for the guided tour. Styled to match ThemeToggle so the two
 * sit together in page headers instead of floating as a separate overlay.
 */
export function TourButton({ className, size = 'sm' }: TourButtonProps) {
  const { isActive, startTour } = useTour()

  if (isActive) return null

  return (
    <Button
      onClick={startTour}
      variant="outline"
      size={size}
      className={`flex items-center gap-2 ${className || ''}`}
      aria-label="Start the guided tour"
    >
      <span aria-hidden="true">?</span> Tour
    </Button>
  )
}
