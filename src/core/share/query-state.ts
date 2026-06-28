'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface QueryCodec<T> {
  parse: (rawValue: string | null) => T | undefined
  serialize: (value: T) => string
}

export interface ShareableParamDefinition<T> {
  key: string
  value: T
  defaultValue: T
  setValue: (value: T) => void
  codec: QueryCodec<T>
  includeDefaultInUrl?: boolean
}

export function createStringCodec(options?: {
  allowedValues?: readonly string[]
}): QueryCodec<string> {
  return {
    parse(rawValue) {
      if (rawValue === null) return undefined
      if (options?.allowedValues && !options.allowedValues.includes(rawValue)) return undefined
      return rawValue
    },
    serialize(value) {
      return value
    },
  }
}

export function createBooleanCodec(): QueryCodec<boolean> {
  return {
    parse(rawValue) {
      if (rawValue === null) return undefined
      const normalized = rawValue.toLowerCase()
      if (normalized === '1' || normalized === 'true' || normalized === 'yes') return true
      if (normalized === '0' || normalized === 'false' || normalized === 'no') return false
      return undefined
    },
    serialize(value) {
      return value ? '1' : '0'
    },
  }
}

export function createNumberCodec(options: {
  min?: number
  max?: number
  step?: number
} = {}): QueryCodec<number> {
  const { min, max, step } = options

  return {
    parse(rawValue) {
      if (rawValue === null) return undefined
      const parsed = Number(rawValue)
      if (!Number.isFinite(parsed)) return undefined

      let normalized = parsed
      if (typeof min === 'number') normalized = Math.max(min, normalized)
      if (typeof max === 'number') normalized = Math.min(max, normalized)
      if (typeof step === 'number' && step > 0) {
        normalized = Math.round(normalized / step) * step
      }

      return normalized
    },
    serialize(value) {
      return Number.isInteger(value) ? String(value) : String(value)
    },
  }
}

export function useShareableQueryState(definitions: readonly ShareableParamDefinition<any>[]) {
  const [isReady, setIsReady] = useState(false)
  const lastSearchParamsRef = useRef('')
  const definitionsRef = useRef(definitions)

  const definitionKey = useMemo(
    () => definitions.map((definition) => definition.key).join('|'),
    [definitions]
  )

  useEffect(() => {
    definitionsRef.current = definitions
  }, [definitions])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyFromLocation = () => {
      const searchParams = new URLSearchParams(window.location.search)
      lastSearchParamsRef.current = searchParams.toString()
      const hasManagedParams = definitionsRef.current.some((definition) =>
        searchParams.has(definition.key)
      )

      for (const definition of definitionsRef.current) {
        if (!hasManagedParams) {
          if (!Object.is(definition.value, definition.defaultValue)) {
            definition.setValue(definition.defaultValue)
          }
          continue
        }

        if (!searchParams.has(definition.key)) {
          continue
        }

        const parsed = definition.codec.parse(searchParams.get(definition.key))
        if (parsed !== undefined) {
          if (!Object.is(parsed, definition.value)) {
            definition.setValue(parsed)
          }
          continue
        }

        if (!Object.is(definition.value, definition.defaultValue)) {
          definition.setValue(definition.defaultValue)
        }
      }
    }

    applyFromLocation()
    setIsReady(true)

    const handlePopState = () => {
      applyFromLocation()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // Intentionally run when the browser URL changes so back/forward navigation restores state.
  }, [definitionKey])

  useEffect(() => {
    if (!isReady) return
    if (typeof window === 'undefined') return

    const nextParams = new URLSearchParams(window.location.search)

    for (const definition of definitionsRef.current) {
      const value = definition.value
      const isDefault = Object.is(value, definition.defaultValue)
      if (isDefault && definition.includeDefaultInUrl !== true) {
        nextParams.delete(definition.key)
        continue
      }

      nextParams.set(definition.key, definition.codec.serialize(value))
    }

    nextParams.sort()
    const nextSearch = nextParams.toString()
    const currentSearch = new URLSearchParams(window.location.search).toString()

    if (nextSearch === currentSearch || nextSearch === lastSearchParamsRef.current) {
      return
    }

    lastSearchParamsRef.current = nextSearch
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${
      window.location.hash
    }`
    window.history.replaceState(window.history.state, '', nextUrl)
  }, [definitions, isReady])

  return isReady
}
