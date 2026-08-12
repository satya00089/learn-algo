'use client'

import React, { createContext, useContext, useId, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/core/utils'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
  groupId: string
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  readonly defaultValue?: string
  readonly value?: string
  readonly onValueChange?: (value: string) => void
  readonly children: React.ReactNode
  readonly className?: string
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const groupId = useId()

  const value = controlledValue ?? internalValue
  const handleValueChange = onValueChange ?? setInternalValue

  const contextValue = useMemo(
    () => ({ value, onValueChange: handleValueChange, groupId }),
    [value, handleValueChange, groupId]
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  readonly children: React.ReactNode
  readonly className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsList must be used within Tabs')

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const tabs = Array.from(event.currentTarget.querySelectorAll('[role="tab"]'))
    const currentTab = document.activeElement as HTMLElement
    const currentIndex = tabs.indexOf(currentTab)
    if (currentIndex === -1) return

    let nextIndex: number
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
        break
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabs.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    const nextTab = tabs[nextIndex] as HTMLElement
    nextTab.focus()
    const nextValue = nextTab.dataset.value
    if (nextValue) {
      context.onValueChange(nextValue)
    }
  }

  return (
    <div
      role="tablist"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-center justify-start border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  readonly value: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.value === value

  return (
    <button
      id={`tab-${value}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      data-value={value}
      tabIndex={isActive ? 0 : -1}
      onClick={() => context.onValueChange(value)}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
        className
      )}
    >
      {children}
      {isActive && (
        <motion.span
          layoutId={`${context.groupId}-active-tab-indicator`}
          className="absolute inset-x-0 -bottom-[2px] h-0.5 bg-indigo-600 dark:bg-indigo-400"
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        />
      )}
    </button>
  )
}

interface TabsContentProps {
  readonly value: string
  readonly children: React.ReactNode
  readonly className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.value !== value) return null

  return (
    <div
      id={`tabpanel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={cn('p-4 bg-white dark:bg-gray-900 rounded-b-lg', className)}
    >
      {children}
    </div>
  )
}
