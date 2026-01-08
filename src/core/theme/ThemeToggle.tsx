'use client'

import { useTheme } from '@/core/theme'
import { Button } from '@/core/controls'

interface ThemeToggleProps {
  readonly className?: string
  readonly size?: 'sm' | 'md' | 'lg'
}

export function ThemeToggle({ className, size = 'sm' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size={size}
      className={`flex items-center gap-2 ${className || ''}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </Button>
  )
}
