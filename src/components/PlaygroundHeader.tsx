'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GiBookCover } from 'react-icons/gi'
import { FaArrowLeft } from 'react-icons/fa'
import { Button, Tooltip } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { TourButton } from '@/components/tour/TourButton'

const SECTION_LABELS: Record<string, string> = {
  dsa: 'DSA',
  ml: 'ML',
  ai: 'AI',
}

interface PlaygroundHeaderProps {
  /** Algorithm/topic title, e.g. "Bubble Sort" */
  readonly title: string
  /** Opens the TheoryModal. Omit on pages that don't have one. */
  readonly onOpenTheory?: () => void
  /** Extra actions rendered before the theory button, e.g. <ShareButton /> */
  readonly children?: ReactNode
}

/**
 * Shared chrome for every DSA/ML/AI playground page: breadcrumbs, a clear
 * "back to catalog" affordance, the theory trigger, and the theme toggle.
 * Rendered as a translucent material so it reads as a floating layer of
 * chrome above the workspace rather than another flat panel.
 */
export function PlaygroundHeader({ title, onOpenTheory, children }: PlaygroundHeaderProps) {
  const pathname = usePathname()
  const section = pathname.split('/').filter(Boolean)[0] ?? ''
  const catalogHref = section ? `/${section}` : '/'
  const catalogLabel = SECTION_LABELS[section] ?? 'Home'

  return (
    <div className="glass-surface mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200/70 bg-white/70 px-3 py-2 backdrop-blur-xl dark:border-gray-700/70 dark:bg-gray-900/70">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <Tooltip text={`Back to ${catalogLabel} catalog`}>
          <Link
            href={catalogHref}
            aria-label={`Back to ${catalogLabel} catalog`}
            className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 active:scale-90 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <FaArrowLeft size={14} />
          </Link>
        </Tooltip>
        <div className="flex min-w-0 flex-wrap items-center">
          <Breadcrumbs />
          <h1 className="truncate text-xl font-bold text-gray-800 dark:text-white sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        {children}
        {onOpenTheory && (
          <Button
            onClick={onOpenTheory}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <GiBookCover size={14} />
            <span className="hidden sm:inline">How It Works</span>
          </Button>
        )}
        <TourButton />
        <ThemeToggle />
      </div>
    </div>
  )
}
