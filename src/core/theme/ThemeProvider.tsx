'use client'

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
    } else {
      const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // Apply theme to document, easing the color swap instead of snapping it
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      root.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('theme', theme)
      return
    }

    root.classList.add('theme-transition')
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)

    const timeout = setTimeout(() => root.classList.remove('theme-transition'), 300)
    return () => clearTimeout(timeout)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const setThemeCallback = useCallback((newTheme: Theme) => {
    setTheme(newTheme)
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme: setThemeCallback }),
    [theme, toggleTheme, setThemeCallback]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
