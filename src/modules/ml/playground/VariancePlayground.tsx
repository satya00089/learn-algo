'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaRedo, FaFastForward } from 'react-icons/fa'
import { GiCardAceSpades } from 'react-icons/gi'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { VarianceEngine, type CardDeck } from '../engines/VarianceEngine'
import { useVariancePlayground } from '../hooks/useVariancePlayground'
import { drawConvergenceChart } from '../visualizers/varianceVisualizer'

/**
 * Variance Playground
 * Interactive card drawing simulation demonstrating variance and convergence
 */
export function VariancePlayground() {
  const { deck, toggleCard, resetDeck, showTheoretical, toggleShowTheoretical } =
    useVariancePlayground()

  const engineRef = useRef<VarianceEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<VarianceEngine['getState']> | null>(
    null
  )
  const [currentCardValue, setCurrentCardValue] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Canvas configurations
  const convergenceCanvasConfig = useMemo(
    () => ({
      width: 1400,
      height: 550,
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
    }),
    []
  )

  // Initialize engine
  useEffect(() => {
    engineRef.current = new VarianceEngine({ deck })
    setEngineState(engineRef.current.getState())
  }, [])

  // Update deck when it changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setDeck(deck)
      setEngineState(engineRef.current.getState())
    }
  }, [deck])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  // Draw convergence chart
  const drawConvergence = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!engineState) return
      drawConvergenceChart(ctx, convergenceCanvasConfig, engineState, showTheoretical)
    },
    [engineState, showTheoretical, convergenceCanvasConfig]
  )

  const { canvasRef: convergenceCanvasRef } = useCanvas({
    config: convergenceCanvasConfig,
    draw: drawConvergence,
    animate: true,
  })

  // Draw a single card
  const handleDrawCard = useCallback(() => {
    if (!engineRef.current || isDrawing || isPlaying) return

    setIsDrawing(true)
    const result = engineRef.current.drawCard()
    setCurrentCardValue(result.value)
    setEngineState(engineRef.current.getState())

    setTimeout(() => {
      setIsDrawing(false)
    }, 300)
  }, [isDrawing, isPlaying])

  // Play/Pause continuous drawing
  const handlePlayPause = useCallback(() => {
    if (playIntervalRef.current) {
      // Pause
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
      setIsPlaying(false)
      setIsDrawing(false)
    } else {
      // Play
      if (!engineRef.current) return

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const result = engineRef.current.drawCard()
          setCurrentCardValue(result.value)
          setEngineState(engineRef.current.getState())
        }
      }, 100)
    }
  }, [])

  // Draw multiple cards quickly
  const handleDraw100 = useCallback(() => {
    if (!engineRef.current || isPlaying) return

    setIsDrawing(true)
    const results = engineRef.current.drawMultiple(100)
    setEngineState(engineRef.current.getState())
    if (results.length > 0) {
      setCurrentCardValue(results[results.length - 1].value)
    }
    setTimeout(() => setIsDrawing(false), 300)
  }, [isPlaying])

  // Reset simulation
  const handleReset = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }

    setIsPlaying(false)
    setIsDrawing(false)

    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
      setCurrentCardValue(null)
    }
  }, [])

  const handleResetDeck = useCallback(() => {
    resetDeck()
    handleReset()
  }, [resetDeck, handleReset])

  const stats = engineRef.current?.getStats()

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Variance</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Draw cards randomly from a deck and observe how the running variance (average of squared
          differences) converges to the theoretical variance. Toggle cards to change the
          distribution.
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Main Visualizations */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Execution Controls */}
                <div className="flex gap-1">
                  <Tooltip text="Draw Once">
                    <button
                      onClick={handleDrawCard}
                      disabled={isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <GiCardAceSpades size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text={isPlaying ? 'Pause' : 'Auto Draw'}>
                    <button
                      onClick={handlePlayPause}
                      className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Draw 100 times">
                    <button
                      onClick={handleDraw100}
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
              </div>
            </div>

            {/* Convergence Chart */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                      Variance Convergence
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Running variance (green) converges to theoretical variance (blue)
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 h-[calc(100%-60px)] flex items-center justify-center">
                <Canvas canvasRef={convergenceCanvasRef} config={convergenceCanvasConfig} />
              </div>
            </div>
          </div>

          {/* Right Sidebar: Settings and Statistics */}
          <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Card Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white text-center">
                  Current Card
                </h3>
                {currentCardValue && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Value: {currentCardValue}
                  </p>
                )}
              </div>
              <div className="p-4 flex items-center justify-center">
                <div className="w-32 h-44 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  {currentCardValue ? (
                    <span className="text-6xl font-bold text-red-600 dark:text-red-400">
                      {currentCardValue === 1 ? 'A' : currentCardValue}
                    </span>
                  ) : (
                    <span className="text-4xl text-gray-400">?</span>
                  )}
                </div>
              </div>
            </div>

            {/* Deck Selection */}
            <ControlGroup title="Card Deck Selection">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <GiCardAceSpades
                      className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
                      size={16}
                    />
                    <div>
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Toggle Cards
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        Click cards to include/exclude them from the deck.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cardNumber) => {
                    const isSelected = deck[`card${cardNumber}` as keyof CardDeck]
                    const displayValue = cardNumber === 1 ? 'A' : cardNumber.toString()

                    return (
                      <button
                        key={cardNumber}
                        onClick={() => toggleCard(cardNumber)}
                        disabled={isPlaying}
                        className={`relative flex flex-col items-center justify-center aspect-[3/4] rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50'
                        } hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100`}
                      >
                        <span
                          className={`text-2xl font-bold ${
                            isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-400'
                          }`}
                        >
                          {displayValue}
                        </span>
                        {!isSelected && (
                          <div className="absolute inset-0 bg-gray-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl text-gray-600 dark:text-gray-400">✕</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={handleResetDeck}
                  disabled={isPlaying}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600"
                >
                  <FaRedo size={12} />
                  Reset Deck (All Cards)
                </button>
              </div>
            </ControlGroup>

            {/* Statistics */}
            {stats && (
              <ControlGroup title="Statistics">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Total Draws:</span>
                    <span className="font-semibold text-gray-800 dark:text-white text-lg">
                      {stats.totalDraws}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Available Cards:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {stats.availableCards}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Running Variance:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400 font-mono">
                      {stats.runningVariance.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-gray-600 dark:text-gray-400">Theoretical Var:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                      {stats.theoreticalVariance.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <span className="text-gray-600 dark:text-gray-400">E[X]:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400 font-mono">
                      {stats.theoreticalExpectation.toFixed(4)}
                    </span>
                  </div>
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
            <ControlGroup title="Understanding Variance">
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-gray-800 dark:text-white mb-2">
                    Variance Formula
                  </p>
                  <p className="text-xs">Measures the spread of a distribution:</p>
                  <div className="font-mono text-xs bg-white dark:bg-gray-900 p-2 rounded mt-2 border border-blue-200 dark:border-blue-800">
                    Var(X) = E[(X - E[X])²]
                  </div>
                  <p className="text-xs mt-2">
                    Average of squared differences from the expected value.
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-gray-800 dark:text-white mb-2">Convergence</p>
                  <p className="text-xs">
                    As you draw more cards, the running variance (green line) converges to the
                    theoretical variance (blue dashed line).
                  </p>
                </div>
              </div>
            </ControlGroup>

            {/* Related Algorithms */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <RelatedAlgorithms route="variance" type="ml" compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
