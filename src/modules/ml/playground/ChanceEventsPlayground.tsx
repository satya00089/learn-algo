'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaStepForward,
  FaFastForward,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip, ShareButton } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { ChanceEventsEngine, type DebugMetrics } from '../engines/ChanceEventsEngine'
import { useChanceEventsPlayground } from '../hooks/useChanceEventsPlayground'
import { drawProbabilityBars, drawCoin } from '../visualizers/chanceEventsVisualizer'

/**
 * Chance Events Playground (Basic Probability)
 * Interactive coin flip simulation demonstrating probability concepts and random events
 */
export function ChanceEventsPlayground() {
  const {
    trueProbability,
    setTrueProbability,
    flipSpeed,
    setFlipSpeed,
    showTrueProbability,
    toggleShowTrueProbability,
  } = useChanceEventsPlayground()

  const engineRef = useRef<ChanceEventsEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<ChanceEventsEngine['getState']> | null>(
    null
  )
  const [currentCoin, setCurrentCoin] = useState<'heads' | 'tails' | 'flipping'>('flipping')
  const [coinRotation, setCoinRotation] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedIterations, setSelectedIterations] = useState<number>(10)
  const [currentIteration, setCurrentIteration] = useState<number>(0)
  const [debugMode, setDebugMode] = useState(false)
  const [debugMetrics, setDebugMetrics] = useState<DebugMetrics | null>(null)
  const [debugExpanded, setDebugExpanded] = useState(true)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Initialize engine
  useEffect(() => {
    engineRef.current = new ChanceEventsEngine({
      trueProbability,
    })
    setEngineState(engineRef.current.getState())
  }, [trueProbability])

  // Animation loop for coin rotation during flipping
  useEffect(() => {
    if (!isPlaying) return

    const animate = () => {
      // Rotate coin for animation effect
      setCoinRotation((prev) => (prev + 0.1) % (Math.PI * 2))
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Draw function for canvas
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      const isDark = document.documentElement.classList.contains('dark')

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!engineState) return

      const stats = engineRef.current?.getStats()
      if (!stats) return

      // Draw probability bars
      drawProbabilityBars(ctx, {
        canvasWidth: width,
        canvasHeight: height,
        headsCount: stats.headsCount,
        tailsCount: stats.tailsCount,
        totalFlips: stats.totalFlips,
        trueProbability: trueProbability,
        showTrueProbability: showTrueProbability,
        barColor: isDark ? '#60a5fa' : '#3b82f6',
        trueBarColor: isDark ? '#34d399' : '#10b981',
        textColor: isDark ? '#f3f4f6' : '#1f2937',
      })

      // Draw animated coin in center-top area
      if (stats.totalFlips > 0) {
        drawCoin(ctx, width / 2, 200, 50, currentCoin, isPlaying ? coinRotation : 0)
      }
    },
    [
      canvasConfig,
      engineState,
      trueProbability,
      showTrueProbability,
      currentCoin,
      coinRotation,
      isPlaying,
    ]
  )

  const { canvasRef } = useCanvas({ config: canvasConfig, draw, animate: true })

  // Control handlers
  const handleStep = useCallback(() => {
    if (engineRef.current && !isPlaying) {
      const flip = engineRef.current.flipOnce()
      setEngineState(engineRef.current.getState())
      setCurrentCoin(flip.outcome)

      // Update debug metrics
      if (debugMode) {
        setDebugMetrics(engineRef.current.getDebugMetrics())
      }
    }
  }, [isPlaying, debugMode])

  const handlePlayPause = useCallback(() => {
    // Check if already playing - clear interval first
    if (playIntervalRef.current) {
      // Pause
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
      setIsPlaying(false)
      setCurrentIteration(0)
    } else {
      // Play - run selected number of iterations
      if (!engineRef.current) return

      setIsPlaying(true)
      setCurrentIteration(0)
      let count = 0

      playIntervalRef.current = setInterval(() => {
        if (engineRef.current && count < selectedIterations) {
          const flip = engineRef.current.flipOnce()
          setEngineState(engineRef.current.getState())
          setCurrentCoin(flip.outcome)
          count++
          setCurrentIteration(count)

          // Update debug metrics in real-time if debug mode is on
          if (debugMode) {
            setDebugMetrics(engineRef.current.getDebugMetrics())
          }
        } else {
          // Reached selected iterations, stop
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current)
            playIntervalRef.current = undefined
          }
          setIsPlaying(false)
          setCurrentIteration(0)

          // Final debug metrics update
          if (debugMode && engineRef.current) {
            setDebugMetrics(engineRef.current.getDebugMetrics())
          }
        }
      }, flipSpeed)
    }
  }, [flipSpeed, selectedIterations, debugMode])

  const handleSelect10 = useCallback(() => {
    setSelectedIterations(10)
  }, [])

  const handleSelect100 = useCallback(() => {
    setSelectedIterations(100)
  }, [])

  const handleSelect1000 = useCallback(() => {
    setSelectedIterations(1000)
  }, [])

  const handleReset = useCallback(() => {
    // Stop playing if active
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = undefined
      }
    }

    setCurrentIteration(0)
    if (engineRef.current) {
      engineRef.current.clearFlips()
      setEngineState(engineRef.current.getState())
      setCurrentCoin('flipping')

      // Reset debug metrics
      if (debugMode) {
        setDebugMetrics(engineRef.current.getDebugMetrics())
      }
    }
  }, [isPlaying, debugMode])

  const handleRun = useCallback(() => {
    if (engineRef.current && !isPlaying) {
      // Run to completion instantly - no animation
      // Execute selected iterations immediately
      const flips = engineRef.current.flipMultiple(selectedIterations)
      setEngineState(engineRef.current.getState())
      // Set the last flip result
      if (flips.length > 0) {
        setCurrentCoin(flips[flips.length - 1].outcome)
      }

      // Update debug metrics
      if (debugMode) {
        setDebugMetrics(engineRef.current.getDebugMetrics())
      }
    }
  }, [isPlaying, selectedIterations, debugMode])

  const handleProbabilityChange = useCallback(
    (value: number) => {
      setTrueProbability(value / 100) // Convert percentage to decimal
      if (engineRef.current) {
        engineRef.current.setTrueProbability(value / 100)
        setEngineState(engineRef.current.getState())
      }
    },
    [setTrueProbability]
  )

  const stats = engineRef.current?.getStats()

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Chance Events</h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <ThemeToggle />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Explore random events through coin flips. Watch how observed frequencies converge to true
          probabilities as the number of trials increases (Law of Large Numbers).
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Canvas with Controls on Top */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls Above Canvas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Execution Controls */}
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : `Play ${selectedIterations} iterations`}>
                    <button
                      onClick={handlePlayPause}
                      className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text={`Run ${selectedIterations} iterations instantly`}>
                    <button
                      onClick={handleRun}
                      disabled={isPlaying}
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

                {/* Debug Mode Toggle */}
                <Tooltip text="Debug Mode">
                  <button
                    onClick={() => {
                      setDebugMode(!debugMode)
                      if (!debugMode && engineRef.current) {
                        setDebugMetrics(engineRef.current.getDebugMetrics())
                      }
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                      debugMode
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <VscDebugAltSmall size={16} />
                  </button>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Speed Control */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Flip Speed">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed (ms):</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={flipSpeed}
                    min={10}
                    max={500}
                    step={10}
                    onChange={(e) => setFlipSpeed(Number.parseInt(e.target.value) || 100)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Iteration Counter */}
                {isPlaying && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Progress: {currentIteration}/{selectedIterations}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                  </>
                )}

                {/* Batch Flip Buttons - Selection Mode */}
                <div className="flex gap-1.5">
                  <Tooltip text="Select 10 iterations">
                    <button
                      onClick={handleSelect10}
                      className={`px-3 py-1.5 text-xs rounded font-semibold transition-colors ${
                        selectedIterations === 10
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      disabled={isPlaying}
                    >
                      10
                    </button>
                  </Tooltip>
                  <Tooltip text="Select 100 iterations">
                    <button
                      onClick={handleSelect100}
                      className={`px-3 py-1.5 text-xs rounded font-semibold transition-colors ${
                        selectedIterations === 100
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      disabled={isPlaying}
                    >
                      100
                    </button>
                  </Tooltip>
                  <Tooltip text="Select 1000 iterations">
                    <button
                      onClick={handleSelect1000}
                      className={`px-3 py-1.5 text-xs rounded font-semibold transition-colors ${
                        selectedIterations === 1000
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      disabled={isPlaying}
                    >
                      1000
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden">
              <Canvas canvasRef={canvasRef} config={canvasConfig} />
            </div>
          </div>

          {/* Right Sidebar: Settings and Statistics */}
          <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Coin Settings */}
            <ControlGroup title="Coin Settings">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    True Probability of Heads: {(trueProbability * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={trueProbability * 100}
                    onChange={(e) => handleProbabilityChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    disabled={isPlaying}
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Always Tails (0%)</span>
                    <span>Fair (50%)</span>
                    <span>Always Heads (100%)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {trueProbability === 0.5
                      ? 'Fair coin: Equal probability for heads and tails'
                      : trueProbability > 0.5
                        ? 'Weighted coin: More likely to land on heads'
                        : 'Weighted coin: More likely to land on tails'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show True Probability
                  </label>
                  <button
                    onClick={toggleShowTrueProbability}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showTrueProbability ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showTrueProbability ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Statistics */}
            {stats && (
              <ControlGroup title="Statistics">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Flips:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {stats.totalFlips}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Heads:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {stats.headsCount} ({stats.headsPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tails:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {stats.tailsCount} ({stats.tailsPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">True Probability:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {(stats.trueProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Observed Probability:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {(stats.observedProbability * 100).toFixed(1)}%
                      </span>
                    </div>
                    {stats.totalFlips > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deviation:</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {(stats.deviation * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Advanced Debug Panel */}
            {debugMode && debugMetrics && (
              <ControlGroup title="Advanced Debug Mode">
                <div className="space-y-3">
                  {/* Collapsible sections */}

                  {/* Convergence Analysis */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setDebugExpanded(!debugExpanded)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>📊 Convergence Analysis</span>
                      {debugExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>
                    {debugExpanded && (
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Absolute Deviation:
                          </span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.absoluteDeviation.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Relative Deviation:
                          </span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.relativeDeviation.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Convergence Rate:
                          </span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.convergenceRate.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statistical Tests */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setDebugExpanded(!debugExpanded)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>🧪 Statistical Tests</span>
                      {debugExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>
                    {debugExpanded && (
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Z-Score:</span>
                          <span
                            className={`font-mono ${Math.abs(debugMetrics.zScore) > 1.96 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}
                          >
                            {debugMetrics.zScore.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">P-Value:</span>
                          <span
                            className={`font-mono ${debugMetrics.pValue < 0.05 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                          >
                            {debugMetrics.pValue.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Chi-Square (χ²):</span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.chiSquare.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">χ² P-Value:</span>
                          <span
                            className={`font-mono ${debugMetrics.chiSquarePValue < 0.05 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                          >
                            {debugMetrics.chiSquarePValue.toFixed(4)}
                          </span>
                        </div>
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-xs font-semibold ${debugMetrics.isStatisticallySignificant ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}
                            >
                              {debugMetrics.isStatisticallySignificant
                                ? '⚠️ Significant'
                                : '✓ Not Significant'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {debugMetrics.isStatisticallySignificant
                              ? 'Results differ significantly from expected (α=0.05)'
                              : 'Results align with expected probability (α=0.05)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variance & Distribution */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setDebugExpanded(!debugExpanded)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>📈 Variance & Distribution</span>
                      {debugExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>
                    {debugExpanded && (
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Variance (σ²):</span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.variance.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Std Deviation (σ):
                          </span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.standardDeviation.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Standard Error:</span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.standardError.toFixed(4)}
                          </span>
                        </div>
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            95% Confidence Interval:
                          </div>
                          <div className="font-mono text-xs text-blue-700 dark:text-blue-400">
                            [{(debugMetrics.confidenceInterval95.lower * 100).toFixed(2)}%,{' '}
                            {(debugMetrics.confidenceInterval95.upper * 100).toFixed(2)}%]
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Streak Analysis */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setDebugExpanded(!debugExpanded)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>🔥 Streak Analysis</span>
                      {debugExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>
                    {debugExpanded && (
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
                          <span
                            className={`font-mono ${debugMetrics.currentStreak.type === 'heads' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            {debugMetrics.currentStreak.count} {debugMetrics.currentStreak.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Longest Heads:</span>
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {debugMetrics.longestHeadsStreak}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Longest Tails:</span>
                          <span className="font-mono text-red-600 dark:text-red-400">
                            {debugMetrics.longestTailsStreak}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sample Size */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setDebugExpanded(!debugExpanded)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <span>📏 Sample Size Analysis</span>
                      {debugExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </button>
                    {debugExpanded && (
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Required Sample (±5%):
                          </span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {debugMetrics.requiredSampleSize.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Current Sample:</span>
                          <span className="font-mono text-gray-800 dark:text-white">
                            {engineState?.totalFlips.toLocaleString()}
                          </span>
                        </div>
                        {engineState &&
                          engineState.totalFlips < debugMetrics.requiredSampleSize && (
                            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                              <span className="text-xs text-yellow-800 dark:text-yellow-300">
                                ℹ️ Need{' '}
                                {(
                                  debugMetrics.requiredSampleSize - engineState.totalFlips
                                ).toLocaleString()}{' '}
                                more flips for 95% confidence with ±5% margin
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Explanation */}
            <ControlGroup title="How It Works">
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  <strong>Probability</strong> is a number between 0 and 1 indicating how likely an
                  event is to occur. 0 means impossible, 1 means certain.
                </p>
                <p>
                  For a <strong>fair coin</strong>, the probability of heads is 0.5 (50%). For an{' '}
                  <strong>unfair or weighted coin</strong>, one outcome is more likely than the
                  other.
                </p>
                <p>
                  As you increase the number of flips, the <strong>observed frequency</strong>{' '}
                  (experimental probability) gets closer to the <strong>true probability</strong>.
                  This is the <strong>Law of Large Numbers</strong>.
                </p>
                <p>
                  Try adjusting the coin&apos;s weight and observe how the results change over many
                  flips!
                </p>
              </div>
            </ControlGroup>

            {/* Related Algorithms */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <RelatedAlgorithms route="chance-events" type="ml" compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
