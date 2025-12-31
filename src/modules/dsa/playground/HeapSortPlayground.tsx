'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo, FaRandom } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { HeapSortEngine } from '../engines/HeapSortEngine'
import { useHeapSortPlayground } from '../hooks/useHeapSortPlayground'
import { drawArray } from '../visualizers/sortingVisualizer'

/**
 * Heap Sort Playground
 * Visualizes binary heap operations: heapify and extract
 */
export function HeapSortPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const {
    arraySize,
    setArraySize,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    generateRandomArray,
  } = useHeapSortPlayground()

  const engineRef = useRef<HeapSortEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<HeapSortEngine['getState']> | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 500,
      padding: { top: 40, right: 40, bottom: 80, left: 40 },
    }),
    []
  )

  // Initialize engine with random array
  useEffect(() => {
    const initialArray = generateRandomArray(arraySize)
    engineRef.current = new HeapSortEngine(initialArray)
    setEngineState(engineRef.current.getState())
  }, [arraySize, generateRandomArray])

  // Draw function for canvas
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height, padding } = canvasConfig

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!engineState) return

      // Draw array bars
      drawArray(ctx, engineState.array, {
        canvasWidth: width,
        canvasHeight: height,
        padding: padding.left,
      })
    },
    [engineState, canvasConfig]
  )

  const { canvasRef, redraw } = useCanvas({
    config: canvasConfig,
    draw,
    animate: false,
  })

  // Redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, redraw])

  // Control handlers
  const handleStep = () => {
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleRun = () => {
    if (engineRef.current) {
      engineRef.current.run()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = undefined
      }
    } else {
      if (!engineRef.current) return

      const currentState = engineRef.current.getState()
      if (currentState.isSorted) {
        return
      }

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isSorted) {
            setIsPlaying(false)
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current)
              playIntervalRef.current = undefined
            }
          } else {
            engineRef.current.step()
            setEngineState(engineRef.current.getState())
          }
        }
      }, animationSpeed)
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  const handleGenerateNewArray = () => {
    const newArray = generateRandomArray(arraySize)
    if (engineRef.current) {
      engineRef.current.updateArray(newArray)
      setEngineState(engineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }

  // Tooltip component
  const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
    const [show, setShow] = useState(false)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)

    return (
      <div
        ref={buttonRef}
        className="relative inline-block"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
        {show && (
          <div
            ref={tooltipRef}
            className="fixed px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap pointer-events-none"
            style={{
              zIndex: 9999,
              bottom: 'auto',
              left: buttonRef.current
                ? `${buttonRef.current.getBoundingClientRect().left + buttonRef.current.offsetWidth / 2}px`
                : '0',
              top: buttonRef.current
                ? `${buttonRef.current.getBoundingClientRect().top - 8}px`
                : '0',
              transform: 'translate(-50%, -100%)',
            }}
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
          </div>
        )}
      </div>
    )
  }

  const getPhaseDescription = () => {
    if (!engineState) return ''
    switch (engineState.stepPhase) {
      case 'building':
        return '🏗️ Building max heap structure'
      case 'heapifying':
        return '⬇️ Heapifying: maintaining heap property'
      case 'extracting':
        return '📤 Extracting max element to sorted region'
      case 'complete':
        return '✅ Heap sort complete'
      default:
        return ''
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header with Back Button and Theme Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Heap Sort</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Build a max heap, then repeatedly extract the maximum element to sort the array
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Canvas with Controls on Top */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0 overflow-visible">
            {/* Controls Above Canvas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Execution Buttons */}
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={engineState?.isSorted}
                      className="w-8 h-8 flex items-center justify-center rounded bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || engineState?.isSorted}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || engineState?.isSorted}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaFastForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset">
                    <button
                      onClick={handleReset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Array Size Slider */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Array Size">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Size:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={arraySize}
                    min={5}
                    max={30}
                    step={1}
                    onChange={(e) => setArraySize(Number.parseInt(e.target.value) || 5)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Animation Speed Slider */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Animation Speed (ms)">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={50}
                    max={1000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 100)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Debug Toggle */}
                <Tooltip text="Debug Mode">
                  <button
                    onClick={() => setIsDebugMode(!isDebugMode)}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                      isDebugMode
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <VscDebugAltSmall size={16} />
                  </button>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Generate New Array Button */}
                <Tooltip text="Generate New Array">
                  <button
                    onClick={handleGenerateNewArray}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                  >
                    <FaRandom size={12} />
                    New Array
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-0">
              <div className="flex-1 flex items-center justify-center min-h-0">
                <Canvas canvasRef={canvasRef} config={canvasConfig} className="w-full h-full" />
              </div>

              {/* Color Legend */}
              <div className="flex items-center justify-center gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Heap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Heapifying</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Extracting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Sorted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Information Panels */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Current State */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Heap Size:</span>
                  <span className="font-semibold text-right">{engineState.heapSize}</span>

                  <span className="text-gray-600 dark:text-gray-400">Current Index:</span>
                  <span className="font-semibold text-right">{engineState.currentIndex}</span>

                  <span className="text-gray-600 dark:text-gray-400">Comparisons:</span>
                  <span className="font-semibold text-right">{engineState.comparisons}</span>

                  <span className="text-gray-600 dark:text-gray-400">Swaps:</span>
                  <span className="font-semibold text-right">{engineState.swaps}</span>

                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-right">
                    {engineState.isSorted ? '✓ Sorted' : '⟳ Sorting'}
                  </span>
                </div>
              </ControlGroup>
            )}

            {/* Algorithm Info */}
            <ControlGroup title="About Heap Sort">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white">Time Complexity:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Best: O(n log n)</li>
                  <li>Average: O(n log n)</li>
                  <li>Worst: O(n log n)</li>
                </ul>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Space Complexity:</strong> O(1)
                </p>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Stable:</strong> No
                </p>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">In-Place:</strong> Yes
                </p>
              </div>
            </ControlGroup>

            {/* Debug Mode Info */}
            {isDebugMode && engineState && (
              <ControlGroup title="Debug Details">
                <div className="space-y-2 text-xs">
                  {/* Current Phase */}
                  {!engineState.isSorted && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                      <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                        Current Phase:
                      </div>
                      <div className="text-green-900 dark:text-green-100 text-[10px] font-semibold">
                        {getPhaseDescription()}
                      </div>
                      <div className="text-green-700 dark:text-green-300 text-[10px] mt-1">
                        Index: {engineState.currentIndex} | Heap Size: {engineState.heapSize}
                      </div>
                    </div>
                  )}

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">
                      Heap Properties:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 text-[10px]">
                      <li>Parent ≥ Children (Max Heap)</li>
                      <li>Left child: 2i + 1</li>
                      <li>Right child: 2i + 2</li>
                      <li>Parent: floor((i-1)/2)</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Current Array:
                    </div>
                    <div className="font-mono text-[10px] text-gray-600 dark:text-gray-400 break-words">
                      [{engineState.array.map((el) => el.value).join(', ')}]
                    </div>
                  </div>

                  {engineState.history.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                        Action History:
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-blue-100 dark:[&::-webkit-scrollbar-track]:bg-blue-900/30 [&::-webkit-scrollbar-thumb]:bg-blue-300 dark:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded">
                        {engineState.history
                          .slice()
                          .reverse()
                          .map((step, idx) => (
                            <div
                              key={step.iteration}
                              className={`text-[10px] p-1.5 rounded ${
                                idx === 0
                                  ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-900 dark:text-blue-100 font-semibold'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <span className="text-blue-600 dark:text-blue-400 font-mono">
                                #{step.iteration}
                              </span>{' '}
                              {step.description}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </ControlGroup>
            )}

            {/* How It Works */}
            <ControlGroup title="How It Works">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white">Phase 1: Build Max Heap</strong>
                </p>
                <p>
                  Transform the array into a max heap where every parent is greater than or equal to
                  its children. Start from the last non-leaf node and heapify downwards.
                </p>
                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">
                    Phase 2: Extract Maximum
                  </strong>
                </p>
                <p>
                  Repeatedly swap the root (maximum element) with the last element of the heap,
                  reduce heap size, and heapify the root to maintain heap property.
                </p>
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-[10px]">
                    💡 Tip: Watch how the heap property is maintained after each extraction!
                  </p>
                </div>
              </div>
            </ControlGroup>
          </div>
        </div>

        {/* Related Algorithms Accordion Footer */}
        <div className="fixed bottom-0 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <div
            className={`bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-b-0 border-gray-200 dark:border-gray-700 transition-opacity ${
              isRelatedOpen ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <button
              onClick={() => setIsRelatedOpen(!isRelatedOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle related algorithms"
            >
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                Related Algorithms
              </span>
              <svg
                className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                  isRelatedOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            {isRelatedOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
                <RelatedAlgorithms route="heap-sort" type="dsa" compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
