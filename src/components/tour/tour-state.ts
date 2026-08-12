export const TOUR_STORAGE_KEY = 'learn-algo:onboarding:v2'
export const TOUR_CONTINUATION_KEY = `${TOUR_STORAGE_KEY}:continuation`

export type TourStatus = 'completed' | 'dismissed'
export type TourSeenState = Record<string, TourStatus>
export type TourMode = 'full' | 'contextual'
export type TourRouteKind = 'home' | 'catalog' | 'playground' | 'unsupported'
export type TourDomain = 'ml' | 'dsa' | 'ai'

export interface TourRoute {
  kind: TourRouteKind
  domain?: TourDomain
}

export interface TourContinuation {
  mode: 'full'
  targetPath: '/ml' | '/ml/linear-regression' | '/'
  createdAt: number
}

const DOMAINS = new Set<TourDomain>(['ml', 'dsa', 'ai'])

export function classifyTourRoute(pathname: string): TourRoute {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')

  if (normalized === '/') return { kind: 'home' }

  const segments = normalized.split('/').filter(Boolean)
  const domain = segments[0] as TourDomain | undefined

  if (!domain || !DOMAINS.has(domain)) return { kind: 'unsupported' }
  if (segments.length === 1) return { kind: 'catalog', domain }
  if (segments.length === 2) return { kind: 'playground', domain }

  return { kind: 'unsupported' }
}

export function normalizeTourPath(pathname: string) {
  return pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
}

export function parseTourSeenState(value: string | null): TourSeenState {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, TourStatus] =>
          entry[1] === 'completed' || entry[1] === 'dismissed'
      )
    )
  } catch {
    return {}
  }
}

export function getTourStatus(state: TourSeenState, pathname: string): TourStatus | null {
  return state[normalizeTourPath(pathname)] ?? null
}

export function updateTourStatus(
  state: TourSeenState,
  pathname: string,
  status: TourStatus
): TourSeenState {
  return { ...state, [normalizeTourPath(pathname)]: status }
}

export function parseTourContinuation(value: string | null): TourContinuation | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<TourContinuation>
    const validPath =
      parsed.targetPath === '/' ||
      parsed.targetPath === '/ml' ||
      parsed.targetPath === '/ml/linear-regression'

    if (parsed.mode !== 'full' || !validPath || typeof parsed.createdAt !== 'number') return null

    return parsed as TourContinuation
  } catch {
    return null
  }
}

export function createTourContinuation(
  targetPath: TourContinuation['targetPath'],
  createdAt = Date.now()
): TourContinuation {
  return { mode: 'full', targetPath, createdAt }
}
