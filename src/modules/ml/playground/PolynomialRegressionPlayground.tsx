'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaRedo,
  FaRandom,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { PolynomialRegressionEngine } from '../engines/PolynomialRegressionEngine'
import { usePolynomialRegressionPlayground } from '../hooks/usePolynomialRegressionPlayground'
import type { Point2D } from '../types'

export function PolynomialRegressionPlayground() {
  const router = useRouter()
  const {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    selectedDataset,
    setSelectedDataset,
    degree,
    setDegree,
    learningRate,
    setLearningRate,
    maxIterations,
    setMaxIterations,
    showResiduals,
    setShowResiduals,
  } = usePolynomialRegressionPlayground()

  const engineRef = useRef<PolynomialRegressionEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<PolynomialRegressionEngine['getState']> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Dataset generators
  const generateDataset = useCallback((type: string): Point2D[] => {
    const points: Point2D[] = []
    let numPoints: number
    let xRange: [number, number]
    let noiseLevel: number

    // Configure dataset parameters
    switch (type) {
      case 'simple':
        numPoints = 20
        xRange = [-5, 5]
        noiseLevel = 2
        break
      case 'cubic':
        numPoints = 25
        xRange = [-5, 5]
        noiseLevel = 3
        break
      case 'sine':
        numPoints = 30
        xRange = [-4.5, 4.5]
        noiseLevel = 1
        break
      case 'outliers':
        numPoints = 22
        xRange = [-5, 5]
        noiseLevel = 2
        break
      case 'underfit':
        numPoints = 25
        xRange = [-5, 5]
        noiseLevel = 4
        break
      default:
        numPoints = 20
        xRange = [-5, 5]
        noiseLevel = 2.5
    }

    // Generate points
    for (let i = 0; i < numPoints; i++) {
      const x = xRange[0] + (i / (numPoints - 1)) * (xRange[1] - xRange[0])
      let trueY: number

      switch (type) {
        case 'simple':
          trueY = 0.5 * x * x + 2 * x + 1
          break
        case 'cubic':
          trueY = 0.1 * x * x * x - 0.5 * x * x + x + 3
          break
        case 'sine':
          trueY = Math.sin(x) + 0.1 * x * x
          break
        case 'outliers':
          trueY = x * x - 3 * x + 2
          break
        case 'underfit':
          trueY = 0.05 * x * x * x * x - 0.2 * x * x * x + 0.3 * x * x + x
          break
        default:
          trueY = x * x
      }

      let noise = (Math.random() - 0.5) * noiseLevel

      // Add outliers for 'outliers' dataset
      if (type === 'outliers' && Math.random() < 0.1) {
        noise += (Math.random() - 0.5) * 10
      }

      points.push({ x, y: trueY + noise })
    }

    return points
  }, [])

  // Current dataset
  const [currentPoints, setCurrentPoints] = useState<Point2D[]>([])

  // Initialize with dataset
  useEffect(() => {
    const points = generateDataset(selectedDataset)
    setCurrentPoints(points)

    if (points.length > 0) {
      engineRef.current = new PolynomialRegressionEngine({
        points,
        degree,
        learningRate,
        maxIterations,
        convergenceThreshold: 0.001,
      })
      setEngineState(engineRef.current.getState())
    }
  }, [selectedDataset, degree, learningRate, maxIterations, generateDataset])

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1000,
      height: 500,
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
    }),
    []
  )

  // Transform coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => {
      const { width, height, padding } = canvasConfig

      // Calculate bounds from current points
      const xValues = currentPoints.map(p => p.x)
      const yValues = currentPoints.map(p => p.y)
      const xMin = Math.min(...xValues) - 1
      const xMax = Math.max(...xValues) + 1
      const yMin = Math.min(...yValues) - 2
      const yMax = Math.max(...yValues) + 2

      const canvasX =
        padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
      const canvasY =
        height - padding.bottom - ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)
      return { canvasX, canvasY }
    },
    [canvasConfig, currentPoints]
  )

  // Draw function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      ctx.clearRect(0, 0, width, height)

      if (currentPoints.length === 0 || !engineState) return

      // Calculate bounds
      const xValues = currentPoints.map(p => p.x)
      const yValues = currentPoints.map(p => p.y)
      const xMin = Math.min(...xValues) - 1
      const xMax = Math.max(...xValues) + 1

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      const origin = toCanvasCoords(0, 0)
      ctx.beginPath()
      ctx.moveTo(toCanvasCoords(xMin, 0).canvasX, origin.canvasY)
      ctx.lineTo(toCanvasCoords(xMax, 0).canvasX, origin.canvasY)
      ctx.moveTo(origin.canvasX, toCanvasCoords(0, Math.min(...yValues) - 2).canvasY)
      ctx.lineTo(origin.canvasX, toCanvasCoords(0, Math.max(...yValues) + 2).canvasY)
      ctx.stroke()

      // Draw data points
      ctx.fillStyle = '#3b82f6'
      currentPoints.forEach((point) => {
        const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw fitted polynomial curve
      if (engineState.iteration > 0) {
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 3
        ctx.beginPath()

        const steps = 200
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const x = xMin + t * (xMax - xMin)
          const y = engineRef.current?.getPredictionAt(x) || 0

          const { canvasX, canvasY } = toCanvasCoords(x, y)
          if (i === 0) {
            ctx.moveTo(canvasX, canvasY)
          } else {
            ctx.lineTo(canvasX, canvasY)
          }
        }
        ctx.stroke()

        // Draw residuals if enabled
        if (showResiduals) {
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth = 1

          currentPoints.forEach((point, index) => {
            const prediction = engineState.predictions[index]
            const { canvasX: dataX, canvasY: dataY } = toCanvasCoords(point.x, point.y)
            const { canvasX: predX, canvasY: predY } = toCanvasCoords(point.x, prediction)

            ctx.beginPath()
            ctx.moveTo(dataX, dataY)
            ctx.lineTo(predX, predY)
            ctx.stroke()
          })
        }
      }

      // Draw convergence message
      if (engineState.isConverged) {
        ctx.fillStyle = '#10b981'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('✓ Converged!', width / 2, 30)
      }
    },
    [canvasConfig, currentPoints, engineState, toCanvasCoords, showResiduals]
  )

  // Use canvas hook
  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, redraw])

  // Playback controls
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
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    } else {
      if (!engineRef.current || engineState?.isConverged) return
      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isConverged) {
            setIsPlaying(false)
            if (playIntervalRef.current) clearInterval(playIntervalRef.current)
          } else {
            engineRef.current.step()
            setEngineState(engineRef.current.getState())
          }
        }
      }, animationSpeed)
    }
  }

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [])

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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Polynomial Regression</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Fitting polynomial curves to data using gradient descent
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={handlePlayPause}
                    disabled={engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>
                  <button
                    onClick={handleStep}
                    disabled={isPlaying || engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaStepForward size={12} />
                  </button>
                  <button
                    onClick={handleRun}
                    disabled={isPlaying || engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaFastForward size={12} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <FaRedo size={12} />
                  </button>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={() => setShowResiduals(!showResiduals)}
                  title="Toggle Residuals"
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    showResiduals
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Residuals
                </button>

                <button
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                    isDebugMode
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <VscDebugAltSmall size={16} />
                </button>

                {engineState && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Iteration: <span className="font-bold text-gray-900 dark:text-white">{engineState.iteration}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Cost: <span className="font-bold text-red-600 dark:text-red-400">{engineState.cost.toFixed(4)}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Degree: <span className="font-bold text-blue-600 dark:text-blue-400">{degree}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden flex items-center justify-center">
              <Canvas canvasRef={canvasRef} config={canvasConfig} />
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Dataset Selection */}
            <ControlGroup title="Sample Datasets">
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedDataset('simple')}
                  disabled={isPlaying}
                  className={`w-full px-2 py-1.5 text-[10px] rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5 ${
                    selectedDataset === 'simple'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FaRandom size={10} /> Quadratic
                </button>
                <button
                  onClick={() => setSelectedDataset('cubic')}
                  disabled={isPlaying}
                  className={`w-full px-2 py-1.5 text-[10px] rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5 ${
                    selectedDataset === 'cubic'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FaRandom size={10} /> Cubic
                </button>
                <button
                  onClick={() => setSelectedDataset('sine')}
                  disabled={isPlaying}
                  className={`w-full px-2 py-1.5 text-[10px] rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5 ${
                    selectedDataset === 'sine'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FaRandom size={10} /> Sine + Trend
                </button>
                <button
                  onClick={() => setSelectedDataset('outliers')}
                  disabled={isPlaying}
                  className={`w-full px-2 py-1.5 text-[10px] rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5 ${
                    selectedDataset === 'outliers'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FaRandom size={10} /> With Outliers
                </button>
                <button
                  onClick={() => setSelectedDataset('underfit')}
                  disabled={isPlaying}
                  className={`w-full px-2 py-1.5 text-[10px] rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5 ${
                    selectedDataset === 'underfit'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <FaRandom size={10} /> High Degree
                </button>
              </div>
            </ControlGroup>

            {/* Parameters */}
            <ControlGroup title="Model Parameters">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Polynomial Degree: {degree}</label>
                  <input
                    type="range"
                    value={degree}
                    min={1}
                    max={6}
                    step={1}
                    onChange={(e) => setDegree(Number.parseInt(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 dark:text-gray-500 mt-0.5">
                    <span>1 (Line)</span>
                    <span>6 (Complex)</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Learning Rate: {learningRate}</label>
                  <input
                    type="range"
                    value={learningRate}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    onChange={(e) => setLearningRate(Number.parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Max Iterations: {maxIterations}</label>
                  <input
                    type="range"
                    value={maxIterations}
                    min={100}
                    max={5000}
                    step={100}
                    onChange={(e) => setMaxIterations(Number.parseInt(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Model Info */}
            {engineState && (
              <ControlGroup title="Model Coefficients">
                <div className="space-y-1 text-xs">
                  {engineState.params.coefficients.map((coeff, i) => {
                    const getLabel = (index: number) => {
                      if (index === 0) return 'Constant'
                      return index === 1 ? 'x' : `x^${index}`
                    }

                    return (
                      <div key={getLabel(i)} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {getLabel(i)}:
                        </span>
                        <span className="font-mono font-semibold">{coeff.toFixed(4)}</span>
                      </div>
                    )
                  })}
                </div>
              </ControlGroup>
            )}

            {/* Legend */}
            <ControlGroup title="Legend">
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Data Points</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500"></div>
                  <span>Fitted Polynomial</span>
                </div>
                {showResiduals && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-green-500"></div>
                    <span>Residuals (Errors)</span>
                  </div>
                )}
              </div>
            </ControlGroup>

            {/* Debug History */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
              <ControlGroup title="Training History">
                <div className="space-y-1 max-h-40 overflow-y-auto text-[10px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-green-100 dark:[&::-webkit-scrollbar-track]:bg-green-900/30 [&::-webkit-scrollbar-thumb]:bg-green-300 dark:[&::-webkit-scrollbar-thumb]:bg-green-700 [&::-webkit-scrollbar-thumb]:rounded">
                  {engineState.history.slice().reverse().map((step, idx) => (
                    <div
                      key={step.iteration}
                      className={`p-1.5 rounded ${
                        idx === 0
                          ? 'bg-green-100 dark:bg-green-800/30 font-semibold'
                          : 'bg-gray-50 dark:bg-gray-900/50'
                      }`}
                    >
                      #{step.iteration}: Cost={step.cost.toFixed(4)}
                    </div>
                  ))}
                </div>
              </ControlGroup>
            )}

            {/* About */}
            <ControlGroup title="About Polynomial Regression">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Model:</strong> y = a₀ + a₁x + a₂x² + ... + aₙxⁿ</p>
                <p><strong>Cost:</strong> Mean Squared Error</p>
                <p><strong>Optimization:</strong> Gradient Descent</p>
                <p><strong>Degree Selection:</strong></p>
                <p className="pl-2">• Too low: Underfitting</p>
                <p className="pl-2">• Too high: Overfitting</p>
                <p className="pl-2">• Just right: Good fit</p>
                <p><strong>Complexity:</strong> O(d × n × iter)</p>
                <p className="text-[9px] italic">d=degree, n=points, iter=iterations</p>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>
    </div>
  )
}