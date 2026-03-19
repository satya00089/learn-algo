import { useRef, useEffect, type RefObject } from 'react'

export function useScrollReveal(options?: IntersectionObserverInit): RefObject<any> {
  const ref = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          obs.unobserve(el)
        }
      },
      { threshold: 0.12, ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [options])
  return ref as RefObject<any>
}
