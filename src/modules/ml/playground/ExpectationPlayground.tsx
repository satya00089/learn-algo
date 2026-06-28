'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaDice,
  FaFastForward,
  FaDiceOne,
  FaDiceTwo,
  FaDiceThree,
  FaDiceFour,
  FaDiceFive,
  FaDiceSix,
} from 'react-icons/fa'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip, ShareButton } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { ExpectationEngine, type DiceDistribution } from '../engines/ExpectationEngine'
import { useExpectationPlayground } from '../hooks/useExpectationPlayground'
import { drawCombinedChart, drawDice } from '../visualizers/expectationVisualizer'

/**
 * Expectation Playground
 * Interactive dice rolling simulation demonstrating expected value and Law of Large Numbers
 */
export function ExpectationPlayground() {
  const {
    distribution,
    setDistribution,
    rollSpeed,
    setRollSpeed,
    showTheoretical,
    toggleShowTheoretical,
    resetToFairDie,
  } = useExpectationPlayground()

  const engineRef = useRef<ExpectationEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<ExpectationEngine['getState']> | null>(
    null
  )
  const [currentDiceValue, setCurrentDiceValue] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Canvas configurations
  const combinedCanvasConfig = useMemo(
    () => ({
      width: 1400,
      height: 550,
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
    }),
    []
  )

  const diceCanvasConfig = useMemo(
    () => ({
      width: 200,
      height: 200,
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    }),
    []
  )

  // Initialize engine
  useEffect(() => {
    engineRef.current = new ExpectationEngine({
      distribution,
    })
    setEngineState(engineRef.current.getState())
  }, [])

  // Update distribution when it changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setDistribution(distribution)
      setEngineState(engineRef.current.getState())
    }
  }, [distribution])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  // Draw combined chart (convergence + distribution)
  const drawCombined = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = combinedCanvasConfig
      const isDark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, width, height)

      if (!engineState) return

      const stats = engineRef.current?.getStats()
      if (!stats) return

      drawCombinedChart(ctx, {
        canvasWidth: width,
        canvasHeight: height,
        rolls: engineState.rolls,
        theoreticalExpectation: stats.theoreticalExpectation,
        showTheoretical: showTheoretical,
        textColor: isDark ? '#f3f4f6' : '#1f2937',
        distribution: engineState.distribution,
        faceCounts: stats.faceCounts,
        totalRolls: stats.totalRolls,
        theoreticalProbabilities: stats.theoreticalProbabilities,
        observedProbabilities: stats.observedProbabilities,
      })
    },
    [combinedCanvasConfig, engineState, showTheoretical]
  )

  // Draw dice
  const drawDiceCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = diceCanvasConfig

      ctx.clearRect(0, 0, width, height)

      drawDice(ctx, {
        canvasWidth: width,
        canvasHeight: height,
        currentValue: currentDiceValue,
        isRolling: isRolling,
      })
    },
    [diceCanvasConfig, currentDiceValue, isRolling]
  )

  const { canvasRef: combinedCanvasRef } = useCanvas({
    config: combinedCanvasConfig,
    draw: drawCombined,
    animate: true,
  })

  const { canvasRef: diceCanvasRef } = useCanvas({
    config: diceCanvasConfig,
    draw: drawDiceCanvas,
    animate: true,
  })

  // Control handlers
  const handleRollOnce = useCallback(() => {
    if (engineRef.current && !isPlaying) {
      setIsRolling(true)
      setTimeout(() => {
        const roll = engineRef.current!.rollOnce()
        setEngineState(engineRef.current!.getState())
        setCurrentDiceValue(roll.value)
        setIsRolling(false)
      }, 300)
    }
  }, [isPlaying])

  const handlePlayPause = useCallback(() => {
    if (playIntervalRef.current) {
      // Pause
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
      setIsPlaying(false)
      setIsRolling(false)
    } else {
      // Play
      if (!engineRef.current) return

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const roll = engineRef.current.rollOnce()
          setEngineState(engineRef.current.getState())
          setCurrentDiceValue(roll.value)
        }
      }, rollSpeed)
    }
  }, [rollSpeed])

  const handleRoll100 = useCallback(() => {
    if (engineRef.current && !isPlaying) {
      setIsRolling(true)
      const rolls = engineRef.current.rollMultiple(100)
      setEngineState(engineRef.current.getState())
      if (rolls.length > 0) {
        setCurrentDiceValue(rolls[rolls.length - 1].value)
      }
      setTimeout(() => setIsRolling(false), 300)
    }
  }, [isPlaying])

  const handleReset = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }

    setIsPlaying(false)
    setIsRolling(false)

    if (engineRef.current) {
      engineRef.current.clearRolls()
      setEngineState(engineRef.current.getState())
      setCurrentDiceValue(null)
    }
  }, [])

  const handleResetToFairDie = useCallback(() => {
    resetToFairDie()
    handleReset()
  }, [resetToFairDie, handleReset])

  const handleDistributionChange = useCallback(
    (face: number, value: number) => {
      const newDist = { ...distribution }
      const faceKey = `face${face}` as keyof DiceDistribution
      newDist[faceKey] = Math.max(0, Math.min(10, value))
      setDistribution(newDist)
    },
    [distribution, setDistribution]
  )

  const stats = engineRef.current?.getStats()

  // Dice icon mapping
  const diceIcons = {
    1: FaDiceOne,
    2: FaDiceTwo,
    3: FaDiceThree,
    4: FaDiceFour,
    5: FaDiceFive,
    6: FaDiceSix,
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Expectation</h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <ThemeToggle />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Watch how the running mean converges to the expected value E[X] as you roll the die.
          Adjust the probability distribution to create a biased die and observe how it affects the
          expectation.
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Main Visualizations */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Execution Controls */}
                <div className="flex gap-1">
                  <Tooltip text="Roll Once">
                    <button
                      onClick={handleRollOnce}
                      disabled={isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaDice size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text={isPlaying ? 'Pause' : 'Auto Roll'}>
                    <button
                      onClick={handlePlayPause}
                      className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Roll 100 times">
                    <button
                      onClick={handleRoll100}
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

                {/* Speed Control */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Roll Speed">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed (ms):</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={rollSpeed}
                    min={10}
                    max={500}
                    step={10}
                    onChange={(e) => setRollSpeed(Number.parseInt(e.target.value) || 50)}
                    disabled={isPlaying}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Combined Chart - Convergence (70%) + Distribution (30%) */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Expected Value Visualization
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Running mean convergence (left) and probability distribution (right)
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 h-[calc(100%-60px)] flex items-center justify-center">
                <Canvas canvasRef={combinedCanvasRef} config={combinedCanvasConfig} />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Settings and Statistics */}
          <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Dice Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white text-center">
                  Current Roll
                </h3>
                {currentDiceValue && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Face: {currentDiceValue}
                  </p>
                )}
              </div>
              <div className="p-4 flex items-center justify-center">
                <Canvas canvasRef={diceCanvasRef} config={diceCanvasConfig} />
              </div>
            </div>

            {/* Distribution Settings */}
            <ControlGroup title="Dice Distribution">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <FaDice
                      className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div>
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Adjust Face Weights
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        Change weights to create a biased (unfair) die. Higher weight = more likely
                        to roll.
                      </p>
                    </div>
                  </div>
                </div>
                {[1, 2, 3, 4, 5, 6].map((face) => {
                  const DiceIcon = diceIcons[face as keyof typeof diceIcons]
                  const weight = distribution[`face${face}` as keyof DiceDistribution]
                  const percentage =
                    (weight /
                      (distribution.face1 +
                        distribution.face2 +
                        distribution.face3 +
                        distribution.face4 +
                        distribution.face5 +
                        distribution.face6)) *
                    100

                  return (
                    <div
                      key={face}
                      className="space-y-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DiceIcon className="text-gray-700 dark:text-gray-300" size={20} />
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Face {face}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {isFinite(percentage) ? percentage.toFixed(1) : '0.0'}%
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded min-w-[2rem] text-center">
                            {weight}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="1"
                          value={weight}
                          onChange={(e) => handleDistributionChange(face, Number(e.target.value))}
                          disabled={isPlaying}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                        />
                        <div className="flex gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-3 rounded-full transition-colors ${
                                i < weight
                                  ? 'bg-blue-600 dark:bg-blue-400'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <button
                  onClick={handleResetToFairDie}
                  disabled={isPlaying}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600"
                >
                  <FaRedo size={12} />
                  Reset to Fair Die
                </button>
              </div>
            </ControlGroup>

            {/* Statistics */}
            {stats && (
              <ControlGroup title="Statistics">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Total Rolls:</span>
                    <span className="font-semibold text-gray-800 dark:text-white text-lg">
                      {stats.totalRolls}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Running Mean:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                      {stats.runningMean.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-gray-600 dark:text-gray-400">E[X] (Expected):</span>
                    <span className="font-semibold text-green-600 dark:text-green-400 font-mono">
                      {stats.theoreticalExpectation.toFixed(4)}
                    </span>
                  </div>
                  {stats.totalRolls > 0 && (
                    <div className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Deviation:</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400 font-mono">
                        {stats.deviation.toFixed(4)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Theoretical
                      </label>
                      <button
                        onClick={toggleShowTheoretical}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showTheoretical ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showTheoretical ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Explanation */}
            <ControlGroup title="Expected Value">
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-gray-800 dark:text-white mb-2">
                    Expected Value E[X]
                  </p>
                  <p className="text-xs">
                    The probability-weighted average of all possible outcomes:
                  </p>
                  <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded mt-2 border border-blue-200 dark:border-blue-800">
                    E[X] = Σ x·P(x)
                  </div>
                  <p className="text-xs mt-2">
                    For a fair die:{' '}
                    <span className="font-mono font-semibold">E[X] = (1+2+3+4+5+6)/6 = 3.5</span>
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-gray-800 dark:text-white mb-2">
                    Law of Large Numbers
                  </p>
                  <p className="text-xs">
                    As you roll more times, the running mean converges to E[X]. This fundamental
                    theorem connects theoretical probability to practical observation.
                  </p>
                </div>
              </div>
            </ControlGroup>

            {/* Related Algorithms */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <RelatedAlgorithms route="expectation" type="ml" compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
