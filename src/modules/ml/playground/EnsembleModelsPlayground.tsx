'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlay, FaPause, FaRedo, FaRandom, FaStepForward } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { MdGridOn, MdForest } from 'react-icons/md'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { EnsembleModelsEngine } from '../engines/EnsembleModelsEngine'
import type { DataPoint } from '../algorithms/decisionTree'

/**
 * Ensemble Models Playground (Random Forest)
 * Interactive visualization for ensemble learning
 */
export function EnsembleModelsPlayground() {
  const router = useRouter()

  // Engine and state
  const engineRef = useRef<EnsembleModelsEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    EnsembleModelsEngine['getState']
  > | null>(null)

  // Configuration
  const [numTrees, setNumTrees] = useState(10)
  const [maxDepth, setMaxDepth] = useState(3)
  const [minSamplesSplit] = useState(2)
  const [criterion, setCriterion] = useState<'entropy' | 'gini'>('gini')
  const [sampleRatio, setSampleRatio] = useState(0.8)
  const [numPoints, setNumPoints] = useState(50)

  // Visualization state
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 500,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Data bounds
  const xMin = -10
  const xMax = 10
  const yMin = -10
  const yMax = 10

  /**
   * Generate random classification data
   */
  const generateData = useCallback(() => {
    const points: DataPoint[] = []
    const halfPoints = Math.floor(numPoints / 2)

    // Generate class 0 points (cluster around bottom-left)
    for (let i = 0; i < halfPoints; i++) {
      points.push({
        x: (Math.random() - 0.5) * 8 - 2,
        y: (Math.random() - 0.5) * 8 - 2,
        label: 0,
      })
    }

    // Generate class 1 points (cluster around top-right)
    for (let i = 0; i < numPoints - halfPoints; i++) {
      points.push({
        x: (Math.random() - 0.5) * 8 + 2,
        y: (Math.random() - 0.5) * 8 + 2,
        label: 1,
      })
    }

    setDataPoints(points)
  }, [numPoints])

  // Initialize data
  useEffect(() => {
    generateData()
  }, [generateData])

  // Initialize engine when data or config changes
  useEffect(() => {
    if (dataPoints.length === 0) return

    engineRef.current = new EnsembleModelsEngine({
      data: dataPoints,
      numTrees,
      maxDepth,
      minSamplesSplit,
      criterion,
      sampleRatio,
    })
    setEngineState(engineRef.current.getState())
  }, [dataPoints, numTrees, maxDepth, minSamplesSplit, criterion, sampleRatio])

  /**
   * Step execution (build one tree at a time)
   */
  const handleStep = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.step()
    setEngineState(engineRef.current.getState())
  }, [])

  /**
   * Run to completion
   */
  const handleRun = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.run()
    setEngineState(engineRef.current.getState())
  }, [])

  /**
   * Play/Pause toggle
   */
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = undefined
      }
    } else {
      if (!engineRef.current) return

      const currentState = engineRef.current.getState()
      if (currentState.isBuilt) {
        return
      }

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isBuilt || state.currentTreeIndex >= numTrees) {
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
      }, 500) // Build one tree every 500ms
    }
  }, [isPlaying, numTrees])

  /**
   * Reset the forest
   */
  const reset = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.reset()
    setEngineState(engineRef.current.getState())
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  /**
   * Draw function for canvas
   */
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Helper to convert data coords to canvas coords
      const toCanvasX = (x: number) => {
        return ((x - xMin) / (xMax - xMin)) * (width - 80) + 40
      }
      const toCanvasY = (y: number) => {
        return height - (((y - yMin) / (yMax - yMin)) * (height - 80) + 40)
      }

      // Draw coordinate axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(toCanvasX(xMin), toCanvasY(0))
      ctx.lineTo(toCanvasX(xMax), toCanvasY(0))
      ctx.moveTo(toCanvasX(0), toCanvasY(yMin))
      ctx.lineTo(toCanvasX(0), toCanvasY(yMax))
      ctx.stroke()

      // Draw decision boundary if forest is built
      if (showDecisionBoundary && engineState?.forest && engineRef.current) {
        const resolution = 50
        const stepX = (xMax - xMin) / resolution
        const stepY = (yMax - yMin) / resolution

        // Create a grid and predict each cell
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = xMin + i * stepX
            const y = yMin + j * stepY
            const prediction = engineRef.current.predict({ x, y })

            if (prediction !== null) {
              ctx.fillStyle =
                prediction === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              ctx.fillRect(
                toCanvasX(x),
                toCanvasY(y + stepY),
                (stepX * (width - 80)) / (xMax - xMin),
                (stepY * (height - 80)) / (yMax - yMin)
              )
            }
          }
        }
      }

      // Draw data points
      for (const point of dataPoints) {
        const canvasX = toCanvasX(point.x)
        const canvasY = toCanvasY(point.y)

        ctx.fillStyle = point.label === 0 ? '#3b82f6' : '#ef4444'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Add border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw debug info if enabled
      if (isDebugMode && engineState?.forest) {
        ctx.save()
        ctx.font = '12px monospace'
        ctx.fillStyle = '#1e293b'
        ctx.textAlign = 'left'

        let yOffset = 20
        ctx.fillStyle = '#7c3aed'
        ctx.font = 'bold 14px monospace'
        ctx.fillText('🐛 DEBUG MODE', 20, yOffset)
        yOffset += 25

        ctx.font = '11px monospace'
        ctx.fillStyle = '#475569'

        ctx.fillText(`Trees Built: ${engineState.currentTreeIndex} / ${numTrees}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Total Trees: ${engineState.forest.trees.length}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Accuracy: ${(engineState.accuracy * 100).toFixed(2)}%`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Diversity: ${(engineState.treeDiversity * 100).toFixed(2)}%`, 20, yOffset)
        yOffset += 16
        ctx.fillText(
          `Feature X Importance: ${(engineState.featureImportance.x * 100).toFixed(1)}%`,
          20,
          yOffset
        )
        yOffset += 16
        ctx.fillText(
          `Feature Y Importance: ${(engineState.featureImportance.y * 100).toFixed(1)}%`,
          20,
          yOffset
        )
        yOffset += 16
        ctx.fillText(`Max Depth: ${maxDepth}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Sample Ratio: ${(sampleRatio * 100).toFixed(0)}%`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Criterion: ${criterion}`, 20, yOffset)

        ctx.restore()
      }
    },
    [
      canvasConfig,
      dataPoints,
      engineState,
      showDecisionBoundary,
      isDebugMode,
      numTrees,
      maxDepth,
      sampleRatio,
      criterion,
      xMin,
      xMax,
      yMin,
      yMax,
    ]
  )

  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, showDecisionBoundary, redraw])

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

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ml')}
              className="px-3 py-1.5 flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span>←</span> Back to ML
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Ensemble Models (Random Forest)
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Ensemble learning using multiple decision trees with bootstrap sampling and majority
          voting
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={engineState?.isBuilt}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step (Build One Tree)">
                    <button
                      onClick={handleStep}
                      disabled={engineState?.isBuilt || isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={engineState?.isBuilt || isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <MdForest size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset">
                    <button
                      onClick={reset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <Tooltip text="Number of Data Points">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Points:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={numPoints}
                    min={20}
                    max={200}
                    step={10}
                    onChange={(e) => setNumPoints(Number.parseInt(e.target.value) || 20)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Visualization Toggles with Icons */}
                <div className="flex items-center gap-2">
                  <Tooltip text="Debug Mode">
                    <button
                      onClick={() => setIsDebugMode(!isDebugMode)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        isDebugMode
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <VscDebugAltSmall size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Decision Boundary">
                    <button
                      onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showDecisionBoundary
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <MdGridOn size={16} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Generate New Random Data">
                  <button
                    onClick={generateData}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                  >
                    <FaRandom size={12} />
                    New Data
                  </button>
                </Tooltip>

                {engineState?.isBuilt && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Accuracy:{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {(engineState.accuracy * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Trees:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.forest?.trees.length || 0}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Diversity:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {(engineState.treeDiversity * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                )}
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
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Class 0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Class 1</span>
                </div>
                {showDecisionBoundary && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500/10"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Region 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500/10"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Region 1</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Information Panels */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Current State */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-right">
                    {engineState.isBuilt
                      ? '✓ Built'
                      : engineState.forest
                        ? '⏳ Building...'
                        : '○ Not Started'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                  <span className="font-semibold text-right">
                    {engineState.forest ? `${engineState.currentTreeIndex} / ${numTrees}` : '-'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className="font-semibold text-right">
                    {engineState.forest ? `${(engineState.accuracy * 100).toFixed(1)}%` : '-'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Trees Built:</span>
                  <span className="font-semibold text-right">
                    {engineState.forest ? engineState.forest.trees.length : '-'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Diversity:</span>
                  <span className="font-semibold text-right">
                    {engineState.forest && engineState.forest.trees.length > 1
                      ? `${(engineState.treeDiversity * 100).toFixed(1)}%`
                      : '-'}
                  </span>
                </div>
              </ControlGroup>
            )}

            {/* Ensemble Parameters */}
            <ControlGroup title="Ensemble Parameters">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Number of Trees: {numTrees}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={numTrees}
                    onChange={(e) => setNumTrees(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    <span>1 (Single)</span>
                    <span>50 (Ensemble)</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Max Depth: {maxDepth}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    <span>1 (Simple)</span>
                    <span>8 (Complex)</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Sample Ratio: {(sampleRatio * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.1"
                    value={sampleRatio}
                    onChange={(e) => setSampleRatio(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    <span>50% (High Diversity)</span>
                    <span>100% (Low Diversity)</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Split Criterion
                  </label>
                  <select
                    value={criterion}
                    onChange={(e) => setCriterion(e.target.value as 'entropy' | 'gini')}
                    className="w-full mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                  >
                    <option value="gini">Gini Impurity</option>
                    <option value="entropy">Entropy (Information Gain)</option>
                  </select>
                </div>
              </div>
            </ControlGroup>

            {/* Feature Importance */}
            {engineState?.isBuilt && (
              <ControlGroup title="Feature Importance">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">X Feature</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(engineState.featureImportance.x * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${engineState.featureImportance.x * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Y Feature</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {(engineState.featureImportance.y * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${engineState.featureImportance.y * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Algorithm Info */}
            <ControlGroup title="About Random Forest">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white">Time Complexity:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Training: O(n × m × log n × k)</li>
                  <li>Prediction: O(k × log n)</li>
                </ul>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Space Complexity:</strong> O(n ×
                  k)
                </p>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Robust:</strong> Yes
                </p>
              </div>
            </ControlGroup>

            {/* How It Works */}
            <ControlGroup title="How It Works">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  Random Forest combines multiple decision trees trained on different random subsets
                  of data (bootstrap sampling). Each tree votes on the final prediction.
                </p>
                <p>
                  <strong className="text-gray-800 dark:text-white">Bagging:</strong> Each tree is
                  trained on a random sample (with replacement), creating diverse trees.
                </p>
                <p>
                  <strong className="text-gray-800 dark:text-white">Diversity:</strong> Shows how
                  much trees disagree. Higher diversity often leads to better performance.
                </p>
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-[10px]">
                    💡 Tip: Try adjusting the number of trees and sample ratio to see how ensemble
                    diversity affects accuracy!
                  </p>
                </div>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>
    </div>
  )
}
