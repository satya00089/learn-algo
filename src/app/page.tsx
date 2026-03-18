'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from '@/core/theme'
import { HomepageStructuredData } from '@/components/HomepageStructuredData'

// ─── Bubble Sort Visualization ───

const DEMO_BARS = [7, 2, 9, 4, 1, 8, 3, 6, 5]
const MAX_BAR = Math.max(...DEMO_BARS)

type SortStep = {
  array: number[]
  comparing: [number, number] | null
  swapped: boolean
  sortedIndices: number[]
}

function computeBubbleSortSteps(arr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const a = [...arr]
  const sorted: number[] = []
  const n = a.length

  steps.push({ array: [...a], comparing: null, swapped: false, sortedIndices: [] })

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], swapped: false, sortedIndices: [...sorted] })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({ array: [...a], comparing: [j, j + 1], swapped: true, sortedIndices: [...sorted] })
      }
    }
    sorted.push(n - 1 - i)
    steps.push({ array: [...a], comparing: null, swapped: false, sortedIndices: [...sorted] })
  }
  sorted.push(0)
  steps.push({ array: [...a], comparing: null, swapped: false, sortedIndices: Array.from({ length: n }, (_, i) => i) })

  return steps
}

const BUBBLE_STEPS = computeBubbleSortSteps(DEMO_BARS)

function BubbleSortViz() {
  const [stepIdx, setStepIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStepIdx((i) => (i + 1) % BUBBLE_STEPS.length)
    }, 480)
    return () => clearInterval(id)
  }, [])

  const step = BUBBLE_STEPS[stepIdx]
  const n = DEMO_BARS.length
  const barW = 9
  const gap = 2
  const totalW = n * barW + (n - 1) * gap

  return (
    <div className="relative aspect-[4/3] bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
      {/* Top chrome */}
      <div className="h-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
          <div className="w-3 h-3 rounded-full bg-green-400/50" />
        </div>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 select-none">
          Bubble Sort · step {stepIdx + 1}/{BUBBLE_STEPS.length}
        </span>
      </div>

      {/* Bars area */}
      <div className="absolute inset-x-0 top-10 bottom-14 flex items-end justify-center pb-4 px-10">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${totalW} 100`}
          preserveAspectRatio="none"
        >
          {step.array.map((val, i) => {
            const isCmp = step.comparing
              ? step.comparing[0] === i || step.comparing[1] === i
              : false
            const isSorted = step.sortedIndices.includes(i)
            const h = (val / MAX_BAR) * 92
            const x = i * (barW + gap)
            const fill = isSorted
              ? '#22c55e'
              : isCmp
              ? step.swapped
                ? '#f97316'
                : '#f59e0b'
              : '#94a3b8'
            return (
              <rect
                key={i}
                x={x}
                y={100 - h}
                width={barW}
                height={h}
                fill={fill}
                rx="1.5"
                style={{ transition: 'fill 0.15s ease' }}
              />
            )
          })}
        </svg>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {step.sortedIndices.length === n
              ? 'Array sorted!'
              : step.comparing
              ? `Comparing [${step.comparing[0] + 1}] and [${step.comparing[1] + 1}]${step.swapped ? ' → swapping' : ''}`
              : 'Pass complete'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-500">Bubble Sort</span>
          <code className="text-xs text-gray-400 dark:text-gray-600 font-mono">O(n²)</code>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const size1Ref = useRef(25)
  const size2Ref = useRef(28)
    const mainIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const animationRef = useRef<NodeJS.Timeout | null>(null)
    const [patternValues, setPatternValues] = useState({ size1: 25, size2: 28 })

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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HomepageStructuredData />
      <div className="relative">
        {/* Left Decorative Pattern Column */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-16 border-r border-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]" />

        {/* Right Decorative Pattern Column */}
        <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-16 border-l border-(--pattern-fg) bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:theme(colors.gray.950/0.05)] dark:[--pattern-fg:theme(colors.white/0.1)]" />

        {/* Content Container */}
        <div className="relative mx-16">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(156,163,175,0.25) ${patternValues.size1}px, rgba(156,163,175,0.25) ${patternValues.size2}px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Header */}
          <header className="relative z-10 flex justify-between items-center py-6 px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo/logo.png"
                alt="Learn Algo Logo"
                width={48}
                height={48}
                className="rounded-lg dark:invert"
              />
              <div className="space-y-0.5">
                <div className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  LEARN ALGO
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
          <section className="relative z-10 py-12 px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="lg:col-span-6 space-y-8">
                {/* Trust indicators – above the ask */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
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
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <div className="space-y-4">
                  <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.08]">
                    Understand algorithms{' '}
                    <span className="block text-orange-500">
                      by seeing why each step happens.
                    </span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                    Step-by-step visualizations of sorting, searching, and ML algorithms. Play,
                    pause, step forward — see every decision as it&apos;s made.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dsa"
                    className="group inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
                    className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 transition-colors"
                  >
                    Browse all modules
                  </Link>
                </div>
              </div>

              {/* Right Column – Real visualization */}
              <div className="lg:col-span-6">
                <BubbleSortViz />
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* Stats strip */}
          <section className="relative z-10 py-7 px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">30+</span>{' '}
                algorithms
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">3</span>{' '}
                domains
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">100%</span>{' '}
                interactive
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 dark:text-white mr-1.5">Free</span>{' '}
                &amp; open-source
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* Module Cards */}
          <section id="modules" className="relative z-10 py-12 px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Choose your learning path
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Three domains, each with step-by-step interactive visualizations
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
              {/* DSA Card */}
              <Link
                href="/dsa"
                className="group"
                onClick={() => {
                  if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                    ;(globalThis.window as any).gtag('event', 'click', {
                      event_category: 'Module Card',
                      event_label: 'DSA',
                    })
                  }
                }}
              >
                <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg h-full flex flex-col">
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="mb-5">
                      <Image
                        src="/icons/dsa/dsa.png"
                        alt="Data Structures & Algorithms"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Data Structures &amp; Algorithms
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-sm flex-1">
                      Sorting, searching, trees, stacks, queues — every step visualized with full
                      interactive control.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Sorting', 'Trees', 'Searching', 'Recursion'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-7 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      14 visualizations
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
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
                  </div>
                </div>
              </Link>

              {/* ML Card */}
              <Link
                href="/ml"
                className="group"
                onClick={() => {
                  if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                    ;(globalThis.window as any).gtag('event', 'click', {
                      event_category: 'Module Card',
                      event_label: 'ML',
                    })
                  }
                }}
              >
                <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-lg h-full flex flex-col">
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="mb-5">
                      <Image
                        src="/icons/ml/ml.png"
                        alt="Machine Learning"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Machine Learning
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-sm flex-1">
                      Regression, clustering, classification — adjust parameters and watch the model
                      adapt in real time.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Regression', 'Clustering', 'Classification', 'Dimensionality'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-7 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      13 visualizations
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
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
                  </div>
                </div>
              </Link>

              {/* AI Card */}
              <Link
                href="/ai"
                className="group"
                onClick={() => {
                  if (globalThis.window !== undefined && (globalThis.window as any).gtag) {
                    ;(globalThis.window as any).gtag('event', 'click', {
                      event_category: 'Module Card',
                      event_label: 'AI',
                    })
                  }
                }}
              >
                <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg h-full flex flex-col">
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="mb-5">
                      <Image
                        src="/icons/ai/ai.png"
                        alt="Artificial Intelligence"
                        width={48}
                        height={48}
                        className="object-contain dark:invert dark:drop-shadow-[0_0_6px_rgba(156,163,175,0.6)]"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Artificial Intelligence
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-5 leading-relaxed text-sm flex-1">
                      Search algorithms, game trees, and intelligent agents — see how AI reasons
                      through decision spaces.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Search', 'Game Trees', 'Planning'].map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-7 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      Growing collection
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
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
                  </div>
                </div>
              </Link>
            </div>
          </section>

          <div className="h-px bg-gray-950/5 dark:bg-white/10" />

          {/* How It Works – numbered timeline */}
          <section id="how-it-works" className="relative z-10 py-12 px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-10 text-center">
                How it works
              </h2>
              <ol className="space-y-0">
                {[
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
                ].map((item, i, arr) => (
                  <li
                    key={item.num}
                    className={`flex gap-8 items-start py-8 ${i < arr.length - 1 ? 'border-b border-gray-200 dark:border-gray-800' : ''}`}
                  >
                    <span className="text-5xl font-black text-gray-100 dark:text-gray-800 leading-none select-none w-14 flex-shrink-0 text-right tabular-nums">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.body}</p>
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
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 text-center">
                Frequently asked questions
              </h2>

              <div className="space-y-3">
                {[
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
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
                      <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5 text-gray-500 dark:text-gray-400 leading-relaxed">{a}</div>
                  </details>
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
                        LEARN ALGO
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-px bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">DSA</span>
                        <span className="px-1.5 py-px bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded text-xs font-bold">ML</span>
                        <span className="px-1.5 py-px bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-bold">AI</span>
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
                      <Link href="/dsa" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Data Structures &amp; Algorithms
                      </Link>
                    </li>
                    <li>
                      <Link href="/ml" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Machine Learning
                      </Link>
                    </li>
                    <li>
                      <Link href="/ai" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                        Artificial Intelligence
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">About</h4>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li>Free &amp; open source</li>
                    <li>Built for developers, by developers</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                  <p>&copy; 2025 LEARN ALGO. All rights reserved.</p>
                  <div className="flex gap-6">
                    <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                    <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">
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

