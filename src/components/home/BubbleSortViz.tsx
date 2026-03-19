'use client'

import { useState, useEffect } from 'react'
import { ShaderBackground } from './ShaderBackground'

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
      steps.push({
        array: [...a],
        comparing: [j, j + 1],
        swapped: false,
        sortedIndices: [...sorted],
      })
      if (a[j] > a[j + 1]) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        steps.push({
          array: [...a],
          comparing: [j, j + 1],
          swapped: true,
          sortedIndices: [...sorted],
        })
      }
    }
    sorted.push(n - 1 - i)
    steps.push({ array: [...a], comparing: null, swapped: false, sortedIndices: [...sorted] })
  }
  sorted.push(0)
  steps.push({
    array: [...a],
    comparing: null,
    swapped: false,
    sortedIndices: Array.from({ length: n }, (_, i) => i),
  })

  return steps
}

const BUBBLE_STEPS = computeBubbleSortSteps(DEMO_BARS)

export function BubbleSortViz() {
  const [stepIdx, setStepIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState<number>(480) // ms per step

  useEffect(() => {
    if (!isPlaying) return
    const id = globalThis.setInterval(() => {
      setStepIdx((i) => (i + 1) % BUBBLE_STEPS.length)
    }, speed)
    return () => globalThis.clearInterval(id)
  }, [isPlaying, speed])

  const step = BUBBLE_STEPS[stepIdx]
  const n = DEMO_BARS.length
  const isAllSorted = step.sortedIndices.length === n

  useEffect(() => {
    if (!isAllSorted) return
    // stepIdx in dep ensures re-evaluation on each loop cycle
  }, [isAllSorted, stepIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const barW = 9
  const gap = 2
  const totalW = n * barW + (n - 1) * gap

  return (
    <div className="relative aspect-[4/4] bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
      {/* WebGL orb shader — subtle, animated, mouse-reactive */}
      <ShaderBackground />

      {/* Top chrome */}
      <div className="relative z-10 h-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3">
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
        <svg width="100%" height="100%" viewBox={`0 0 ${totalW} 100`} preserveAspectRatio="none">
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
                style={{
                  transition: 'fill 0.15s ease',
                  ...(isAllSorted && {
                    transformBox: 'fill-box' as const,
                    transformOrigin: 'center 100%',
                    animation: `sortedPop 0.42s cubic-bezier(0.34,1.56,0.64,1) both`,
                  }),
                }}
              />
            )
          })}
        </svg>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 grid grid-cols-12 items-center px-4 sm:px-6">
        <div className="col-span-5 flex items-center gap-3 min-w-0">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
              isAllSorted ? 'bg-green-500 animate-ping' : 'bg-amber-500 animate-pulse'
            }`}
            aria-hidden
          />
          <span
            className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate"
            role="status"
            aria-live="polite"
          >
            {step.sortedIndices.length === n
              ? 'Array sorted!'
              : step.comparing
                ? `Comparing [${step.comparing[0] + 1}] and [${step.comparing[1] + 1}]${step.swapped ? ' → swapping' : ''}`
                : 'Pass complete'}
          </span>
        </div>

        <div className="col-span-7 flex items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous step"
              className="grid place-items-center w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setStepIdx((i) => (i - 1 + BUBBLE_STEPS.length) % BUBBLE_STEPS.length)}
            >
              <svg
                className="w-full h-full text-gray-600 dark:text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              aria-pressed={isPlaying}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="grid place-items-center w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 hover:scale-105"
              onClick={() => setIsPlaying((v) => !v)}
            >
              {isPlaying ? (
                <svg
                  className="w-full h-full text-gray-700 dark:text-gray-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 19h4V5H6v14zM14 5v14h4V5h-4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-full h-full text-gray-700 dark:text-gray-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v18l15-9L5 3z"
                  />
                </svg>
              )}
            </button>

            <button
              aria-label="Next step"
              className="grid place-items-center w-5 h-5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setStepIdx((i) => (i + 1) % BUBBLE_STEPS.length)}
            >
              <svg
                className="w-full h-full text-gray-600 dark:text-gray-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <select
            aria-label="Playback speed"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value={750}>Slow</option>
            <option value={480}>Normal</option>
            <option value={200}>Fast</option>
          </select>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
              Bubble Sort
            </span>
            <code className="text-xs text-gray-400 dark:text-gray-600 font-mono">O(n²)</code>
          </div>
        </div>
      </div>
    </div>
  )
}
