'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { driver, type DriveStep, type Driver } from 'driver.js'
import { getTourSteps, type TourStepDefinition } from './tour-steps'
import {
  TOUR_CONTINUATION_KEY,
  TOUR_STORAGE_KEY,
  classifyTourRoute,
  createTourContinuation,
  getTourStatus,
  parseTourContinuation,
  parseTourSeenState,
  type TourMode,
  type TourStatus,
  updateTourStatus,
} from './tour-state'

type TourSource = 'auto' | 'replay' | 'continuation'
type TourOutcome = 'idle' | 'active' | 'complete' | 'transition' | 'cleanup'

interface TourContextValue {
  isActive: boolean
  startTour: () => void
}

const TourContext = createContext<TourContextValue>({
  isActive: false,
  startTour: () => undefined,
})

function withBrowserStorage<T>(callback: (storage: Storage) => T, fallback: T, session = false) {
  try {
    return callback(session ? window.sessionStorage : window.localStorage)
  } catch {
    return fallback
  }
}

function saveStatus(pathname: string, status: TourStatus) {
  withBrowserStorage((storage) => {
    const state = parseTourSeenState(storage.getItem(TOUR_STORAGE_KEY))
    storage.setItem(TOUR_STORAGE_KEY, JSON.stringify(updateTourStatus(state, pathname, status)))
  }, undefined)
}

function trackTourEvent(
  name: 'tour_started' | 'tour_replayed' | 'tour_completed' | 'tour_dismissed',
  pathname: string,
  mode: TourMode
) {
  const analyticsWindow = window as typeof window & {
    gtag?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
  }

  analyticsWindow.gtag?.('event', name, {
    tour_mode: mode,
    tour_entry_route: pathname,
  })
  analyticsWindow.clarity?.('set', 'tour_mode', mode)
  analyticsWindow.clarity?.('set', 'tour_entry_route', pathname)
  analyticsWindow.clarity?.('set', 'tour_outcome', name.replace('tour_', ''))
  analyticsWindow.clarity?.('event', name)
}

function resolveStep(step: TourStepDefinition): DriveStep | null {
  let element: Element | undefined

  if (typeof step.element === 'string') {
    element = document.querySelector(step.element) ?? undefined
  } else if (typeof step.element === 'function') {
    element = step.element() ?? undefined
  }

  if (step.element && (!element || element.getClientRects().length === 0)) return null

  return {
    element,
    data: { id: step.id, nextPath: step.nextPath },
    popover: {
      title: step.title,
      description: step.description,
      side: step.side,
      align: step.align,
    },
  }
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const route = useMemo(() => classifyTourRoute(pathname), [pathname])
  const driverRef = useRef<Driver | null>(null)
  const outcomeRef = useRef<TourOutcome>('idle')
  const modeRef = useRef<TourMode>('contextual')
  const entryPathRef = useRef(pathname)
  const attemptedPathsRef = useRef(new Set<string>())
  const [isActive, setIsActive] = useState(false)

  const continueTour = useCallback(
    (targetPath: '/ml' | '/ml/linear-regression') => {
      saveStatus(entryPathRef.current, 'completed')
      const continuation = createTourContinuation(targetPath)
      withBrowserStorage(
        (storage) => storage.setItem(TOUR_CONTINUATION_KEY, JSON.stringify(continuation)),
        undefined,
        true
      )

      outcomeRef.current = 'transition'
      driverRef.current?.destroy()
      driverRef.current = null
      setIsActive(false)
      router.push(targetPath)
    },
    [router]
  )

  const launchTour = useCallback(
    (mode: TourMode, source: TourSource) => {
      if (driverRef.current?.isActive()) return

      const currentRoute = classifyTourRoute(pathname)
      if (currentRoute.kind === 'unsupported') {
        const continuation = createTourContinuation('/')
        withBrowserStorage(
          (storage) => storage.setItem(TOUR_CONTINUATION_KEY, JSON.stringify(continuation)),
          undefined,
          true
        )
        if (source === 'replay') trackTourEvent('tour_replayed', pathname, 'full')
        router.push('/')
        return
      }

      const definitions = getTourSteps(currentRoute, mode)
      const resolvedSteps = definitions
        .map((definition) => ({ definition, step: resolveStep(definition) }))
        .filter((item): item is { definition: TourStepDefinition; step: DriveStep } => !!item.step)

      if (resolvedSteps.length === 0) return

      modeRef.current = mode
      entryPathRef.current = pathname
      outcomeRef.current = 'active'
      setIsActive(true)

      if (source === 'auto') trackTourEvent('tour_started', pathname, mode)
      if (source === 'replay') trackTourEvent('tour_replayed', pathname, mode)

      const steps = resolvedSteps.map(({ definition, step }) => {
        if (!definition.nextPath) return step

        return {
          ...step,
          popover: {
            ...step.popover,
            onNextClick: () => continueTour(definition.nextPath!),
          },
        }
      })

      const tourDriver = driver({
        steps,
        animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        smoothScroll: true,
        allowClose: true,
        allowScroll: true,
        overlayClickBehavior: 'close',
        overlayOpacity: 0.68,
        stagePadding: 8,
        stageRadius: 10,
        popoverOffset: 12,
        popoverClass: 'learn-algo-tour',
        disableActiveInteraction: true,
        allowKeyboardControl: true,
        showProgress: true,
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Start exploring',
        onDoneClick: () => {
          outcomeRef.current = 'complete'
          tourDriver.destroy()
        },
        onDestroyed: () => {
          const outcome = outcomeRef.current
          driverRef.current = null
          setIsActive(false)

          if (outcome === 'transition' || outcome === 'cleanup') return

          if (outcome === 'complete') {
            saveStatus(entryPathRef.current, 'completed')
            trackTourEvent('tour_completed', entryPathRef.current, modeRef.current)
          } else {
            saveStatus(entryPathRef.current, 'dismissed')
            trackTourEvent('tour_dismissed', entryPathRef.current, modeRef.current)
          }

          outcomeRef.current = 'idle'
        },
      })

      driverRef.current = tourDriver
      tourDriver.drive()
    },
    [continueTour, pathname, router]
  )

  const startTour = useCallback(() => {
    const mode = route.kind === 'catalog' || route.kind === 'playground' ? 'contextual' : 'full'
    launchTour(mode, 'replay')
  }, [launchTour, route.kind])

  useEffect(() => {
    if (isActive) return

    const continuation = withBrowserStorage(
      (storage) => parseTourContinuation(storage.getItem(TOUR_CONTINUATION_KEY)),
      null,
      true
    )

    if (continuation?.targetPath === pathname) {
      attemptedPathsRef.current.add(pathname)
      withBrowserStorage((storage) => storage.removeItem(TOUR_CONTINUATION_KEY), undefined, true)
      const timer = window.setTimeout(() => launchTour('full', 'continuation'), 500)
      return () => window.clearTimeout(timer)
    }

    if (attemptedPathsRef.current.has(pathname)) return

    if (route.kind === 'unsupported') return

    const status = withBrowserStorage((storage) => {
      const state = parseTourSeenState(storage.getItem(TOUR_STORAGE_KEY))
      return getTourStatus(state, pathname)
    }, null)
    if (status) return

    attemptedPathsRef.current.add(pathname)
    const mode = route.kind === 'home' ? 'full' : 'contextual'
    const timer = window.setTimeout(() => launchTour(mode, 'auto'), 700)
    return () => window.clearTimeout(timer)
  }, [isActive, launchTour, pathname, route.kind])

  useEffect(
    () => () => {
      if (driverRef.current) {
        outcomeRef.current = 'cleanup'
        driverRef.current.destroy()
        driverRef.current = null
      }
    },
    []
  )

  const contextValue = useMemo(() => ({ isActive, startTour }), [isActive, startTour])

  return (
    <TourContext.Provider value={contextValue}>
      {children}
      {!isActive && (
        <button
          type="button"
          onClick={startTour}
          className="fixed bottom-4 left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900/95 dark:text-white"
          aria-label="Start the guided tour"
        >
          <span aria-hidden="true" className="text-base">
            ?
          </span>
          Tour
        </button>
      )}
    </TourContext.Provider>
  )
}

export function useTour() {
  return useContext(TourContext)
}
