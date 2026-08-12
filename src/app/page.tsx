'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'
import { HomepageStructuredData } from '@/components/HomepageStructuredData'

import { BubbleSortViz } from '@/components/home/BubbleSortViz'
import { CountUpStat } from '@/components/home/CountUpStat'
import { FaqItem } from '@/components/home/FaqItem'
import { ViewTransitionLink } from '@/components/home/ViewTransitionLink'
import { DsaCardBody } from '@/components/home/cards/DsaCardBody'
import { MlCardBody } from '@/components/home/cards/MlCardBody'
import { AiCardBody } from '@/components/home/cards/AiCardBody'

export default function Home() {
  const size1Ref = useRef(25)
  const size2Ref = useRef(28)
  const mainIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)
  const [patternValues, setPatternValues] = useState({ size1: 25, size2: 28 })
  const [dsaHov, setDsaHov] = useState(false)
  const [mlHov, setMlHov] = useState(false)
  const [aiHov, setAiHov] = useState(false)

  const updatePattern = useCallback((s1: number, s2: number) => {
    size1Ref.current = s1
    size2Ref.current = s2
    setPatternValues({ size1: s1, size2: s2 })
  }, [])

  useEffect(() => {
    const getRandomSize = () => Math.floor(Math.random() * (36 - 16 + 1)) + 16
    updatePattern(getRandomSize(), getRandomSize())

    const animateToNewValues = () => {
      const startSize1 = size1Ref.current
      const startSize2 = size2Ref.current
      const targetSize1 = getRandomSize()
      const targetSize2 = getRandomSize()
      const diff1 = (targetSize1 - startSize1) / 60
      const diff2 = (targetSize2 - startSize2) / 60
      let step = 0

      if (animationRef.current) clearInterval(animationRef.current)

      animationRef.current = setInterval(() => {
        step++
        if (step >= 60) {
          updatePattern(targetSize1, targetSize2)
          clearInterval(animationRef.current!)
          animationRef.current = null
        } else {
          updatePattern(startSize1 + diff1 * step, startSize2 + diff2 * step)
        }
      }, 16)
    }

    mainIntervalRef.current = setInterval(animateToNewValues, 10000)

    return () => {
      if (mainIntervalRef.current) clearInterval(mainIntervalRef.current)
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [updatePattern])

  // Scroll progress bar
  useEffect(() => {
    const bar = document.getElementById('scroll-progress')
    if (!bar) return
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = Math.min(window.scrollY / total, 1)
      bar.style.opacity = pct > 0.005 ? '1' : '0'
      bar.style.transform = `scaleX(${pct})`
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  // Observe all .reveal elements for scroll-triggered entrance
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    if (!els.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    console.log(
      '%c LEARN ALGO ',
      'background:#f97316;color:#fff;font-size:16px;font-weight:900;padding:2px 8px;border-radius:4px'
    )
    console.log(
      '%cYou opened DevTools. Respect.\n%cThis site is open-source · Visualize algorithms · PRs welcome.',
      'color:#f97316;font-weight:700',
      'color:#94a3b8;font-size:11px'
    )
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Scroll progress bar */}
      <div
        id="scroll-progress"
        className="fixed top-0 left-0 right-0 h-[2px] bg-orange-500 pointer-events-none z-[9999] opacity-0"
        style={{ transform: 'scaleX(0)', transformOrigin: '0 0' }}
        aria-hidden="true"
      />
      <HomepageStructuredData />
      <div className="relative">
        {/* Left Decorative Pattern Column */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-16 border-r border-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]" />

        {/* Right Decorative Pattern Column */}
        <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-16 border-l border-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]" />

        {/* Content Container */}
        <div className="relative lg:mx-16">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(156,163,175,0.25) ${patternValues.size1}px, rgba(156,163,175,0.25) ${patternValues.size2}px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Header */}
          <header className="relative max-w-7xl mx-auto z-10 flex justify-between items-center py-6 px-6 lg:px-8">
            <div className="flex items-center space-x-3 animate-fade-in">
              <Image
                src="/logo/logo.png"
                alt="Learn Algo Logo"
                width={48}
                height={48}
                className="rounded-lg dark:invert"
              />
              <div className="space-y-0.5">
                <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  LEARN <span className="text-orange-500">ALGO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">
                    DSA
                  </span>
                  <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded text-xs font-bold">
                    ML
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold">
                    AI
                  </span>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* Hero Section */}
          <section className="relative max-w-7xl mx-auto z-10 py-12 px-6 lg:px-8 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
              <Image
                src="/icons/tree-bg.png"
                alt=""
                fill
                priority={false}
                sizes="100vw"
                loading="lazy"
                className="object-contain -rotate-90 opacity-15 dark:opacity-10 object -translate-x-24"
              />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-8" aria-label="hero-text" data-tour="home-hero">
                {/* Trust indicators – above the ask */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 animate-fade-slide-up stagger-1">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Free &amp; open-source</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>30+ algorithms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>100% interactive</span>
                  </div>
                </div>

                <div className="space-y-4 animate-fade-slide-up stagger-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.08]">
                    Understand algorithms{' '}
                    <span className="block text-orange-500">by seeing why each step happens.</span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                    Step-by-step visualizations of sorting, searching, and ML algorithms. Play,
                    pause, step forward — see every decision as it&apos;s made.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 animate-fade-slide-up stagger-3">
                  <Link
                    href="/dsa"
                    aria-label="Start learning with bubble sort"
                    className="group inline-flex items-center justify-center px-6 py-3.5 min-h-11 text-base font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.97] active:shadow-sm"
                    onClick={() => {
                      if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                        ;(globalThis.window as any).gtag('event', 'click', {
                          event_category: 'CTA',
                          event_label: 'Start Learning - Hero',
                        })
                      }
                    }}
                  >
                    Start with bubble sort
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="#modules"
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 transition-colors active:scale-[0.97] active:shadow-sm"
                  >
                    Browse all modules
                  </Link>
                </div>
              </div>

              {/* Right Column – Real visualization */}
              <div className="lg:col-span-6 animate-scale-in stagger-2" data-tour="home-demo">
                <BubbleSortViz />
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* Stats strip */}
          <section className="relative z-10 py-7 px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-x-12 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">
                  <CountUpStat target={30} suffix="+" />
                </span>{' '}
                algorithms
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">
                  <CountUpStat target={3} />
                </span>{' '}
                domains
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">
                  <CountUpStat target={100} suffix="%" />
                </span>{' '}
                interactive
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">
                  Free
                </span>{' '}
                &amp; open-source
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* Module Cards */}
          <section
            id="modules"
            className="relative max-w-7xl mx-auto z-10 py-12 px-6 lg:px-8"
            data-tour="home-modules"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl tracking-widest text-orange-500">
                Choose your learning path
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Three domains, each with step-by-step interactive visualizations
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
              {/* DSA Card */}
              <ViewTransitionLink
                href="/dsa"
                className="group reveal stagger-1"
                onMouseEnter={() => setDsaHov(true)}
                onMouseLeave={() => setDsaHov(false)}
                onClick={() => {
                  if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                    ;(globalThis.window as any).gtag('event', 'click', {
                      event_category: 'Module Card',
                      event_label: 'DSA',
                    })
                  }
                }}
              >
                <DsaCardBody hovered={dsaHov} />
              </ViewTransitionLink>

              {/* ML Card */}
              <ViewTransitionLink
                href="/ml"
                className="group reveal stagger-2"
                onMouseEnter={() => setMlHov(true)}
                onMouseLeave={() => setMlHov(false)}
                onClick={() => {
                  if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                    ;(globalThis.window as any).gtag('event', 'click', {
                      event_category: 'Module Card',
                      event_label: 'ML',
                    })
                  }
                }}
              >
                <MlCardBody hovered={mlHov} />
              </ViewTransitionLink>

              {/* AI Card */}
              <ViewTransitionLink
                href="/ai"
                className="group reveal stagger-3"
                onMouseEnter={() => setAiHov(true)}
                onMouseLeave={() => setAiHov(false)}
                onClick={() => {
                  if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                    ;(globalThis.window as any).gtag('event', 'click', {
                      event_category: 'Module Card',
                      event_label: 'AI',
                    })
                  }
                }}
              >
                <AiCardBody hovered={aiHov} />
              </ViewTransitionLink>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* Diagrammatic integration */}
          <section className="relative max-w-7xl mx-auto z-10 py-12 px-6 lg:px-8">
            <div className="reveal stagger-4 relative mx-auto flex w-full max-w-5xl flex-col justify-between gap-y-6 border-y border-gray-300 bg-[radial-gradient(35%_80%_at_25%_0%,rgba(0,0,0,0.05),transparent)] px-6 py-10 dark:border-gray-800 dark:bg-[radial-gradient(35%_80%_at_25%_0%,rgba(255,255,255,0.04),transparent)]">
              {[
                'top-[-12px] left-[-11px]',
                'top-[-12px] right-[-11px]',
                'bottom-[-12px] left-[-11px]',
                'bottom-[-12px] right-[-11px]',
              ].map((pos) => (
                <span
                  key={pos}
                  className={`pointer-events-none absolute ${pos} z-10 grid h-6 w-6 place-items-center text-gray-800 dark:text-gray-500`}
                  aria-hidden="true"
                >
                  <span className="absolute h-[2px] w-4 bg-current" />
                  <span className="absolute h-4 w-[2px] bg-current" />
                </span>
              ))}

              <div className="pointer-events-none absolute -inset-y-6 left-0 w-px border-l border-gray-300 dark:border-gray-800" />
              <div className="pointer-events-none absolute -inset-y-6 right-0 w-px border-r border-gray-300 dark:border-gray-800" />
              <div className="space-y-2">
                <h3 className="text-center text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Learn system design with{' '}
                  <span className="text-orange-500 uppercase tracking-wide">Diagrammatic</span>.
                </h3>
                <p className="text-center text-base text-gray-500 dark:text-gray-400">
                  Interactive playground for system design, ER diagrams, and UML — featuring AWS,
                  Azure & GCP cloud components, cloud infrastructure problems, and AI-powered
                  assessment
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://diagrammatic.next-zen.dev/problems?utm_source=learn-algo&utm_medium=homepage&utm_campaign=inline-recommendation&utm_content=sales"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white/80 px-5 py-3 text-sm font-bold text-gray-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all hover:border-gray-400 hover:bg-white hover:text-gray-900 dark:border-gray-800 dark:bg-transparent dark:text-white dark:hover:border-gray-600 active:scale-[0.98]"
                >
                  Explore Problems
                </a>
                <a
                  href="https://diagrammatic.next-zen.dev/?utm_source=learn-algo&utm_medium=homepage&utm_campaign=inline-recommendation"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-all hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white active:scale-[0.98]"
                  onClick={() => {
                    if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                      ;(globalThis.window as any).gtag('event', 'click', {
                        event_category: 'Partner CTA',
                        event_label: 'Diagrammatic - Try',
                      })
                    }
                  }}
                >
                  Open Diagrammatic
                  <svg
                    className="ml-1.5 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* How It Works – numbered timeline */}
          <section id="how-it-works" className="relative z-10 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl tracking-widest text-orange-500 text-center">How it works</h2>
              <ol className="space-y-0">
                {(
                  [
                    {
                      num: '01',
                      title: 'Choose an algorithm',
                      body: 'Pick from 30+ algorithms across DSA, ML, and AI. Generate a random dataset or supply your own. Adjust parameters like array size or cluster count before you begin.',
                    },
                    {
                      num: '02',
                      title: 'Watch every step',
                      body: 'Hit play and watch each comparison, swap, or iteration animate in real time. Pause at any moment, step forward or backward, and change the speed to match your pace.',
                    },
                    {
                      num: '03',
                      title: 'Build real intuition',
                      body: "Enable debug mode to see why each decision is made. Experiment with edge cases — nearly-sorted arrays, single clusters, adversarial inputs — until the algorithm's logic becomes second nature.",
                    },
                  ] as const
                ).map((item, i, arr) => (
                  <li
                    key={item.num}
                    className={`group reveal stagger-${i + 1} flex gap-8 items-start py-8 ${i < arr.length - 1 ? 'border-b border-gray-200 dark:border-gray-800' : ''}`}
                  >
                    <span className="how-step-num text-5xl font-black text-gray-400 dark:text-gray-600 group-hover:text-orange-400 dark:group-hover:text-orange-500 transition-colors duration-300 leading-none select-none w-14 flex-shrink-0 text-right tabular-nums">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* FAQ Section */}
          <section className="relative z-10 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl tracking-widest text-orange-500 text-center mb-8">
                Frequently asked questions
              </h2>

              <div className="space-y-3">
                {(
                  [
                    {
                      q: 'Do I need programming experience to use LEARN ALGO?',
                      a: 'No. Visualizations make algorithms intuitive even for beginners. Watch, experiment, and learn by doing — no code required. Basic programming knowledge helps when reading the complexity analysis, but the visuals stand on their own.',
                    },
                    {
                      q: 'Are new algorithms added regularly?',
                      a: "Yes. We're constantly expanding the library across all three domains. Algorithms are prioritized by user requests and educational value.",
                    },
                    {
                      q: 'How long does it take to learn an algorithm?',
                      a: 'Most users get a solid intuition in 15–30 minutes through the interactive visualizer. Deeper mastery — understanding edge cases, complexity trade-offs, and real-world applicability — takes an hour of hands-on experimentation.',
                    },
                    {
                      q: 'Can I use this for interview preparation?',
                      a: 'Absolutely. The step-by-step visualization builds the intuition you need to reason through algorithm problems under pressure. Many users report improved performance on coding challenges after spending time here.',
                    },
                    {
                      q: 'What makes LEARN ALGO different from other resources?',
                      a: 'Full interactive control: play, pause, step forward/backward, adjust speed, change array sizes, generate random data. The focus is on helping you understand why each step happens — not just what the algorithm does.',
                    },
                  ] as const
                ).map(({ q, a }) => (
                  <FaqItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src="/logo/logo.png"
                      alt="Learn Algo Logo"
                      width={40}
                      height={40}
                      className="rounded-lg dark:invert"
                    />
                    <div>
                      <div className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                        LEARN <span className="text-orange-500">ALGO</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-px bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">
                          DSA
                        </span>
                        <span className="px-1.5 py-px bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded text-xs font-bold">
                          ML
                        </span>
                        <span className="px-1.5 py-px bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold">
                          AI
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Interactive algorithm visualizations for developers and learners.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                    Explore
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li>
                      <Link
                        href="/dsa"
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Data Structures &amp; Algorithms
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ml"
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Machine Learning
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ai"
                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Artificial Intelligence
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                    About
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li>Free &amp; open source</li>
                    <li>Built for developers, by developers</li>
                    <li>
                      <a
                        href="https://github.com/satya00089/learn-algo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Star on GitHub
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/satya00089/learn-algo/issues/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Report an Issue
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                  <p>&copy; 2026 LEARN ALGO. All rights reserved.</p>
                  <div className="flex gap-6">
                    <Link
                      href="/privacy"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      href="/terms"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Terms of Service
                    </Link>
                    <Link
                      href="/contact"
                      className="hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </main>
  )
}
