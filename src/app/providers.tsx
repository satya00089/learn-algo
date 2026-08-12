'use client'

import { ThemeProvider } from '@/core/theme'
import { TourProvider } from '@/components/tour/TourProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TourProvider>{children}</TourProvider>
    </ThemeProvider>
  )
}
