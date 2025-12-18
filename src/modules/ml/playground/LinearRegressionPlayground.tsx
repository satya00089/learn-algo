'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaRedo,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRandom,
  FaPlus,
  FaMinus,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { LinearRegressionEngine } from '../engines/LinearRegressionEngine'
import { useLinearRegressionPlayground } from '../hooks/useLinearRegressionPlayground'
import {
  drawPoints,
  drawRegressionLine,
  drawErrorLines,
  drawCoordinateAxes,
} from '../visualizers/linearRegressionVisualizer'
import { closedFormSolution } from '../algorithms/linearRegression'

/**
 * Linear Regression Playground
 * Orchestrates engine, visualization, and controls
 * Follows strict separation of concerns
 */
export function LinearRegressionPlayground() {
  const router = useRouter()
  const {
    points,
    generateNewPoints,
    learningRate,
    setLearningRate,
    maxIterations,
    setMaxIterations,
    showErrorLines,
    setShowErrorLines,
    isDebugMode,
    setIsDebugMode,
  } = useLinearRegressionPlayground()

  const engineRef = useRef<LinearRegressionEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    LinearRegressionEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showBestFit, setShowBestFit] = useState(true)
  const [outliers, setOutliers] = useState<Array<{ x: number; y: number }>>([])
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Combine regular points with outliers (memoized to prevent re-renders)
  const allPoints = useMemo(() => [...points, ...outliers], [points, outliers])

  // Calculate best-fit line using closed-form solution
  const bestFitParams = useMemo(
    () => (allPoints.length > 0 ? closedFormSolution(allPoints) : null),
    [allPoints]
  )

  // Calculate best-fit WITHOUT outliers for comparison
  const bestFitWithoutOutliers = useMemo(
    () => (points.length > 0 ? closedFormSolution(points) : null),
    [points]
  )

  // Canvas configuration - will be sized by container
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Data bounds for visualization
  const xMin = -15
  const xMax = 15
  const yMin = -30
  const yMax = 30

  // Initialize engine when points or config changes
  useEffect(() => {
    engineRef.current = new LinearRegressionEngine({
      points: allPoints,
      learningRate,
      maxIterations,
      convergenceThreshold: 0.0001,
      initialSlope: 0,
      initialIntercept: 0,
    })
    setEngineState(engineRef.current.getState())
  }, [allPoints, learningRate, maxIterations])

  // Draw function for canvas
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig

      // Clear canvas first
      ctx.clearRect(0, 0, width, height)

      // Draw coordinate axes
      drawCoordinateAxes(ctx, {
        canvasWidth: width,
        canvasHeight: height,
        xMin,
        xMax,
        yMin,
        yMax,
        axisColor: '#94a3b8',
        axisWidth: 2,
      })

      // Draw regular data points
      if (points.length > 0) {
        drawPoints(ctx, points, {
          canvasWidth: width,
          canvasHeight: height,
          xMin,
          xMax,
          yMin,
          yMax,
          pointRadius: 5,
          pointColor: '#3b82f6',
        })
      }

      // Draw outlier points in a different color
      if (outliers.length > 0) {
        drawPoints(ctx, outliers, {
          canvasWidth: width,
          canvasHeight: height,
          xMin,
          xMax,
          yMin,
          yMax,
          pointRadius: 6,
          pointColor: '#ef4444', // Red for outliers
        })
      }

      // Draw best-fit line (optimal solution) if enabled
      if (showBestFit && bestFitParams && allPoints.length > 0) {
        ctx.save()
        ctx.setLineDash([8, 4]) // Dashed line pattern
        drawRegressionLine(ctx, bestFitParams, {
          canvasWidth: width,
          canvasHeight: height,
          xMin,
          xMax,
          yMin,
          yMax,
          lineWidth: 2,
          lineColor: '#10b981', // Green color for best-fit
        })
        ctx.setLineDash([]) // Reset to solid line
        ctx.restore()
      }

      // Debug Mode: Draw previous steps with reduced opacity
      if (isDebugMode && engineState && engineState.history.length > 0 && allPoints.length > 0) {
        ctx.save()

        // Determine how many historical steps to show (max 25 for performance)
        const maxHistorySteps = 25
        const historyToShow = engineState.history.slice(-maxHistorySteps)

        historyToShow.forEach((step, index) => {
          // Calculate opacity: older steps are more transparent (min 10%, max 35%)
          const minOpacity = 0.1
          const maxOpacity = 0.35
          const opacity =
            minOpacity + ((index + 1) / historyToShow.length) * (maxOpacity - minOpacity)
          const color = `rgba(239, 68, 68, ${opacity})` // Red with varying opacity

          // Convert step to params format
          const stepParams = {
            slope: step.slope,
            intercept: step.intercept,
          }

          drawRegressionLine(ctx, stepParams, {
            canvasWidth: width,
            canvasHeight: height,
            xMin,
            xMax,
            yMin,
            yMax,
            lineWidth: 2,
            lineColor: color,
          })
        })

        ctx.restore()
      }

      // Draw regression line if we have state
      if (engineState && allPoints.length > 0) {
        drawRegressionLine(ctx, engineState.params, {
          canvasWidth: width,
          canvasHeight: height,
          xMin,
          xMax,
          yMin,
          yMax,
          lineWidth: 3,
          lineColor: '#ef4444',
        })

        // Draw error lines if enabled
        if (showErrorLines) {
          drawErrorLines(ctx, allPoints, engineState.params, {
            canvasWidth: width,
            canvasHeight: height,
            xMin,
            xMax,
            yMin,
            yMax,
            lineWidth: 1,
            lineColor: 'rgba(239, 68, 68, 0.3)',
          })
        }

        if (isDebugMode) {
          ctx.save()
          ctx.font = '14px monospace'
          ctx.fillStyle = '#1e293b'
          ctx.textAlign = 'left'

          // Draw equation on canvas
          const equation = `y = ${engineState.params.slope.toFixed(3)}x + ${engineState.params.intercept.toFixed(3)}`
          ctx.fillStyle = '#ef4444'
          ctx.font = 'bold 16px monospace'
          ctx.fillText(equation, 20, 30)

          // Draw debug info
          ctx.font = '12px monospace'
          ctx.fillStyle = '#475569'
          let yOffset = 55
          ctx.fillText(`Iteration: ${engineState.iteration}`, 20, yOffset)
          yOffset += 18
          ctx.fillText(`Cost: ${engineState.cost.toFixed(6)}`, 20, yOffset)
          yOffset += 18

          // Show gradient information if available and iteration > 0
          if (engineState.history.length > 0) {
            const lastStep = engineState.history.at(-1)!
            ctx.fillText(`Gradient (slope): ${lastStep.gradientSlope.toFixed(6)}`, 20, yOffset)
            yOffset += 18
            ctx.fillText(
              `Gradient (intercept): ${lastStep.gradientIntercept.toFixed(6)}`,
              20,
              yOffset
            )
            yOffset += 18
            ctx.fillText(
              `Showing last ${Math.min(25, engineState.history.length)} steps`,
              20,
              yOffset
            )
          }

          // Highlight individual prediction errors with labels
          if (showErrorLines && allPoints.length <= 10) {
            ctx.font = '10px sans-serif'
            ctx.fillStyle = '#ef4444'
            allPoints.forEach((point) => {
              const predictedY = engineState.params.slope * point.x + engineState.params.intercept
              const error = Math.abs(point.y - predictedY)

              const canvasX = mapToCanvas(point.x, xMin, xMax, 0, width)
              const canvasY = mapToCanvas(point.y, yMin, yMax, height, 0)

              // Draw error value next to point
              ctx.fillText(error.toFixed(2), canvasX + 8, canvasY - 8)
            })
          }

          ctx.restore()
        }
      }

      // Draw legend
      if (allPoints.length > 0) {
        ctx.save()
        ctx.font = '12px sans-serif'
        const legendX = width - 200
        const legendY = height - 80

        // Gradient descent line
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(legendX, legendY)
        ctx.lineTo(legendX + 30, legendY)
        ctx.stroke()
        ctx.fillStyle = '#374151'
        ctx.fillText('Gradient Descent', legendX + 38, legendY + 4)

        // Best-fit line
        if (showBestFit && bestFitParams) {
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth = 2
          ctx.setLineDash([8, 4])
          ctx.beginPath()
          ctx.moveTo(legendX, legendY + 20)
          ctx.lineTo(legendX + 30, legendY + 20)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = '#374151'
          ctx.fillText('Best Fit (Optimal)', legendX + 38, legendY + 24)
        }

        // Debug mode: Previous steps
        if (isDebugMode && engineState && engineState.history.length > 0) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(legendX, legendY + 40)
          ctx.lineTo(legendX + 30, legendY + 40)
          ctx.stroke()
          ctx.fillStyle = '#374151'
          ctx.fillText('Previous Steps', legendX + 38, legendY + 44)
        }

        ctx.restore()
      }
    },
    [
      points,
      outliers,
      allPoints,
      engineState,
      showErrorLines,
      isDebugMode,
      showBestFit,
      bestFitParams,
      canvasConfig,
      xMin,
      xMax,
      yMin,
      yMax,
    ]
  )

  // Helper function to map values (defined inline since it's used in draw)
  const mapToCanvas = (
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
  ): number => {
    return ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin
  }

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
    console.log('Step button clicked')
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
      console.log('After step:', engineRef.current.getState())
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
    console.log('Play/Pause clicked, currently:', { isPlaying, hasEngine: !!engineRef.current })
    if (isPlaying) {
      console.log('Pausing...')
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = undefined
      }
    } else {
      console.log('Starting playback...')
      if (!engineRef.current) return

      // Check if already converged
      const currentState = engineRef.current.getState()
      if (currentState.isConverged || currentState.iteration >= maxIterations) {
        return
      }

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isConverged || state.iteration >= maxIterations) {
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
      }, 100)
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

  // Outlier handlers
  const addOutlier = () => {
    console.log('Adding outlier...', { currentOutliers: outliers.length })
    // Add a random outlier far from the trend
    const x = Math.random() * 20 - 10
    const y = Math.random() * 50 - 25 // Much wider range for outliers
    const newOutlier = { x, y }
    console.log('New outlier:', newOutlier)
    setOutliers([...outliers, newOutlier])
  }

  const removeLastOutlier = () => {
    if (outliers.length > 0) {
      setOutliers(outliers.slice(0, -1))
    }
  }

  const clearOutliers = () => {
    setOutliers([])
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

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="h-full flex flex-col">
        {/* Header with Back Button and Theme Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ml')}
              className="px-3 py-1.5 flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span>←</span> Back to ML
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Linear Regression</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Watch gradient descent optimize a line to fit the data points
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Canvas with Controls on Top */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0 overflow-visible">
            {/* Controls Above Canvas - Single Line */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Execution Buttons with Icons */}
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
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
                  <Tooltip text="Run to Completion">
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

                {/* Learning Rate with Text Input */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Learning Rate">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Learning Rate (α):
                    </span>
                  </Tooltip>
                  <input
                    type="number"
                    value={learningRate}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    onChange={(e) => setLearningRate(Number.parseFloat(e.target.value) || 0.001)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Iterations with Text Input */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Max Iterations">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Max Iterations (n):
                    </span>
                  </Tooltip>
                  <input
                    type="number"
                    value={maxIterations}
                    min={10}
                    max={500}
                    step={10}
                    onChange={(e) => setMaxIterations(Number.parseInt(e.target.value) || 10)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Toggles with Icons */}
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
                  <Tooltip text="Show Best Fit Line">
                    <button
                      onClick={() => setShowBestFit(!showBestFit)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showBestFit
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaCheckCircle size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Error Lines">
                    <button
                      onClick={() => setShowErrorLines(!showErrorLines)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showErrorLines
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaExclamationTriangle size={14} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Generate Data Button with Icon */}
                <Tooltip text="Generate New Data Points">
                  <button
                    onClick={() => generateNewPoints(50)}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                  >
                    <FaRandom size={12} />
                    Data
                  </button>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Outlier Controls */}
                <div className="flex items-center gap-1">
                  <Tooltip text="Add Outlier Point">
                    <button
                      onClick={addOutlier}
                      className="w-8 h-8 flex items-center justify-center rounded border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Remove Last Outlier">
                    <button
                      onClick={removeLastOutlier}
                      disabled={outliers.length === 0}
                      className="w-8 h-8 flex items-center justify-center rounded border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaMinus size={12} />
                    </button>
                  </Tooltip>
                  {outliers.length > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400 font-mono ml-1">
                      {outliers.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center justify-center min-h-0">
              <Canvas canvasRef={canvasRef} config={canvasConfig} className="w-full h-full" />
            </div>
          </div>

          {/* Right Side: Information Panels */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* State Display - Compact */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Iteration:</span>
                  <span className="font-semibold text-right">{engineState.iteration}</span>

                  <span className="text-gray-600 dark:text-gray-400">Cost:</span>
                  <span className="font-semibold text-right">{engineState.cost.toFixed(4)}</span>

                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-right">
                    {engineState.isConverged ? '✓ Converged' : '⟳ Running'}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-mono bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    y = {engineState.params.slope.toFixed(3)}x +{' '}
                    {engineState.params.intercept.toFixed(3)}
                  </div>
                </div>

                {/* Debug Mode: Show gradient information */}
                {isDebugMode && engineState.history.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">∂Cost/∂m:</span>
                    <span className="font-mono text-right">
                      {engineState.history.at(-1)!.gradientSlope.toFixed(5)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">∂Cost/∂b:</span>
                    <span className="font-mono text-right">
                      {engineState.history.at(-1)!.gradientIntercept.toFixed(5)}
                    </span>
                    {engineState.history.length > 1 && (
                      <>
                        <span className="text-gray-600 dark:text-gray-400">Cost Δ:</span>
                        <span className="font-mono text-right text-green-600 dark:text-green-400">
                          -{(engineState.history.at(-2)!.cost - engineState.cost).toFixed(5)}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </ControlGroup>
            )}

            {/* Best Fit Comparison - Compact */}
            {showBestFit && bestFitParams && engineState && (
              <ControlGroup title="Convergence">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 dark:text-green-400">● Optimal:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      y = {bestFitParams.slope.toFixed(3)}x + {bestFitParams.intercept.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 dark:text-red-400">● Current:</span>
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      y = {engineState.params.slope.toFixed(3)}x +{' '}
                      {engineState.params.intercept.toFixed(3)}
                    </span>
                  </div>
                  <div className="pt-1.5 mt-1.5 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-x-4">
                    <span className="text-gray-600 dark:text-gray-400">Δm:</span>
                    <span className="font-mono text-right">
                      {Math.abs(engineState.params.slope - bestFitParams.slope).toFixed(4)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">Δb:</span>
                    <span className="font-mono text-right">
                      {Math.abs(engineState.params.intercept - bestFitParams.intercept).toFixed(4)}
                    </span>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Outlier Impact Panel */}
            {outliers.length > 0 && bestFitParams && bestFitWithoutOutliers && (
              <ControlGroup title="Outlier Impact">
                <div className="space-y-2 text-xs">
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <div className="text-gray-700 dark:text-gray-300 mb-2">
                      <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                        {outliers.length}
                      </span>{' '}
                      outlier point{outliers.length > 1 ? 's' : ''} detected
                    </div>

                    {/* Line Shift Visualization */}
                    <div className="space-y-1.5 text-xs border-t border-red-200 dark:border-red-800 pt-2">
                      <div className="font-semibold text-red-700 dark:text-red-300 mb-1">
                        Line Shift:
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        <span className="text-gray-600 dark:text-gray-400">Slope (m):</span>
                        <div className="text-right">
                          <div className="font-mono text-gray-500 dark:text-gray-400 line-through text-[10px]">
                            {bestFitWithoutOutliers.slope.toFixed(3)}
                          </div>
                          <div className="font-mono text-red-600 dark:text-red-400 font-semibold">
                            {bestFitParams.slope.toFixed(3)}
                          </div>
                          <div className="text-[9px] text-red-500 dark:text-red-400">
                            {bestFitParams.slope > bestFitWithoutOutliers.slope ? '▲' : '▼'}{' '}
                            {Math.abs(bestFitParams.slope - bestFitWithoutOutliers.slope).toFixed(
                              3
                            )}
                          </div>
                        </div>

                        <span className="text-gray-600 dark:text-gray-400">Intercept (b):</span>
                        <div className="text-right">
                          <div className="font-mono text-gray-500 dark:text-gray-400 line-through text-[10px]">
                            {bestFitWithoutOutliers.intercept.toFixed(3)}
                          </div>
                          <div className="font-mono text-red-600 dark:text-red-400 font-semibold">
                            {bestFitParams.intercept.toFixed(3)}
                          </div>
                          <div className="text-[9px] text-red-500 dark:text-red-400">
                            {bestFitParams.intercept > bestFitWithoutOutliers.intercept ? '▲' : '▼'}{' '}
                            {Math.abs(
                              bestFitParams.intercept - bestFitWithoutOutliers.intercept
                            ).toFixed(3)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Shift:</span>
                          <span className="font-mono font-semibold text-red-600 dark:text-red-400">
                            {(
                              Math.abs(bestFitParams.slope - bestFitWithoutOutliers.slope) +
                              Math.abs(bestFitParams.intercept - bestFitWithoutOutliers.intercept)
                            ).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={clearOutliers}
                    className="w-full px-3 py-1.5 text-xs rounded border border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 transition-colors"
                  >
                    Clear All Outliers
                  </button>
                </div>
              </ControlGroup>
            )}

            {/* Debug Mode: Additional Info Panel - Compact */}
            {isDebugMode && engineState && (
              <ControlGroup title="Algorithm Details">
                <div className="space-y-2 text-xs">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-2 rounded">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      Gradient Descent
                    </p>
                    <div className="space-y-0.5 font-mono text-gray-700 dark:text-gray-300 text-[10px]">
                      <div>m = m - α × ∂Cost/∂m</div>
                      <div>b = b - α × ∂Cost/∂b</div>
                    </div>
                  </div>

                  {/* Current Parameters */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Current Parameters:
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <span className="text-gray-600 dark:text-gray-400">Slope (m):</span>
                      <span className="font-mono text-right">
                        {engineState.params.slope.toFixed(6)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">Intercept (b):</span>
                      <span className="font-mono text-right">
                        {engineState.params.intercept.toFixed(6)}
                      </span>
                    </div>
                  </div>

                  {/* Gradient Information */}
                  {engineState.history.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                      <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                        Current Gradients:
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                        <span className="text-gray-600 dark:text-gray-400">∂Cost/∂m:</span>
                        <span className="font-mono text-right">
                          {engineState.history.at(-1)!.gradientSlope.toFixed(6)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">∂Cost/∂b:</span>
                        <span className="font-mono text-right">
                          {engineState.history.at(-1)!.gradientIntercept.toFixed(6)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">Magnitude:</span>
                        <span className="font-mono text-right">
                          {Math.sqrt(
                            Math.pow(engineState.history.at(-1)!.gradientSlope, 2) +
                              Math.pow(engineState.history.at(-1)!.gradientIntercept, 2)
                          ).toFixed(6)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Learning Progress */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">
                      Learning Progress:
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                      <span className="text-gray-600 dark:text-gray-400">Iterations:</span>
                      <span className="font-mono text-right">
                        {engineState.iteration} / {maxIterations}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                      <span className="font-mono text-right">
                        {((engineState.iteration / maxIterations) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-right">
                        {engineState.isConverged ? (
                          <span className="text-green-600 dark:text-green-400">✓ Converged</span>
                        ) : engineState.iteration >= maxIterations ? (
                          <span className="text-yellow-600 dark:text-yellow-400">⚠ Max Iter</span>
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400">⟳ Running</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded text-center">
                      <div className="text-green-700 dark:text-green-400 font-semibold text-[10px]">
                        Learning Rate (α)
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 font-mono text-xs">
                        {learningRate}
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-1.5 rounded text-center">
                      <div className="text-yellow-700 dark:text-yellow-400 font-semibold text-[10px]">
                        Data Points
                      </div>
                      <div className="text-gray-700 dark:text-gray-300 text-xs">
                        {points.length} + {outliers.length} outlier
                        {outliers.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Cost Function Info */}
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded text-[10px]">
                    <div className="font-semibold text-cyan-700 dark:text-cyan-300 mb-1">
                      Cost Function (MSE):
                    </div>
                    <div className="font-mono text-gray-700 dark:text-gray-300 mb-1">
                      J = (1/2n) Σ(ŷᵢ - yᵢ)²
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      <span className="text-gray-600 dark:text-gray-400">Current Cost:</span>
                      <span className="font-mono text-right">{engineState.cost.toFixed(6)}</span>
                      {engineState.history.length > 1 && (
                        <>
                          <span className="text-gray-600 dark:text-gray-400">Cost Change:</span>
                          <span
                            className={`font-mono text-right ${
                              engineState.history.at(-2)!.cost > engineState.cost
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {engineState.history.at(-2)!.cost > engineState.cost ? '▼' : '▲'}{' '}
                            {Math.abs(engineState.history.at(-2)!.cost - engineState.cost).toFixed(
                              6
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </ControlGroup>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
