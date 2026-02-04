'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo, FaRandom } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { MinMaxScalerEngine } from '../engines/MinMaxScalerEngine'
import { useMinMaxScalerPlayground } from '../hooks/useMinMaxScalerPlayground'
import type { DataPoint } from '../types'

export function MinMaxScalerPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    featureRangeMin,
    setFeatureRangeMin,
    featureRangeMax,
    setFeatureRangeMax,
  } = useMinMaxScalerPlayground()

  const engineRef = useRef<MinMaxScalerEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<MinMaxScalerEngine['getState']> | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Data management
  const [points, setPoints] = useState<DataPoint[]>([])

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Data bounds for visualization
  const xMin = -30
  const xMax = 30
  const yMin = -15
  const yMax = 15

  // Generate sample data
  const generateData = useCallback((type: 'normal' | 'wide' | 'clustered' | 'outliers') => {
    const newPoints: DataPoint[] = []

    if (type === 'normal') {
      // Normal distribution around origin
      for (let i = 0; i < 100; i++) {
        newPoints.push({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 10,
        })
      }
    } else if (type === 'wide') {
      // Wide range of values
      for (let i = 0; i < 100; i++) {
        newPoints.push({
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 25,
        })
      }
    } else if (type === 'clustered') {
      // Multiple clusters with different scales
      const clusters = [
        { centerX: -15, centerY: -5, spread: 3 },
        { centerX: 15, centerY: 5, spread: 2 },
        { centerX: 0, centerY: 10, spread: 4 },
      ]

      clusters.forEach((cluster) => {
        for (let i = 0; i < 30; i++) {
          newPoints.push({
            x: cluster.centerX + (Math.random() - 0.5) * cluster.spread * 2,
            y: cluster.centerY + (Math.random() - 0.5) * cluster.spread,
          })
        }
      })
    } else {
      // Data with outliers
      for (let i = 0; i < 90; i++) {
        newPoints.push({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 10,
        })
      }
      // Add outliers
      newPoints.push({ x: 25, y: 12 })
      newPoints.push({ x: -28, y: -13 })
      newPoints.push({ x: 26, y: -11 })
    }

    setPoints(newPoints)
  }, [])

  // Initialize with sample data
  useEffect(() => {
    generateData('normal')
  }, [generateData])

  // Initialize engine when config changes
  useEffect(() => {
    if (points.length > 0) {
      engineRef.current = new MinMaxScalerEngine({
        data: points,
        featureRange: [featureRangeMin, featureRangeMax],
      })
      setEngineState(engineRef.current.getState())
    }
  }, [points, featureRangeMin, featureRangeMax])

  // Transform coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => {
      const { width, height, padding } = canvasConfig
      const canvasX =
        padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
      const canvasY =
        height -
        padding.bottom -
        ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)
      return { canvasX, canvasY }
    },
    [canvasConfig, xMin, xMax, yMin, yMax]
  )

  // Draw function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      ctx.clearRect(0, 0, width, height)

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1
      const origin = toCanvasCoords(0, 0)
      ctx.beginPath()
      ctx.moveTo(toCanvasCoords(xMin, 0).canvasX, origin.canvasY)
      ctx.lineTo(toCanvasCoords(xMax, 0).canvasX, origin.canvasY)
      ctx.moveTo(origin.canvasX, toCanvasCoords(0, yMin).canvasY)
      ctx.lineTo(origin.canvasX, toCanvasCoords(0, yMax).canvasY)
      ctx.stroke()

      if (!engineState) return

      // Draw original data points (gray)
      engineState.originalData.forEach((point) => {
        const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
        ctx.fillStyle = '#94a3b8'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw scaled data points (blue)
      if (engineState.scaledData.length > 0) {
        engineState.scaledData.forEach((point, index) => {
          const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
          ctx.fillStyle = '#3b82f6'
          ctx.beginPath()
          ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2)
          ctx.fill()

          // Draw connecting line between original and scaled points
          const originalPoint = engineState.originalData[index]
          const originalCoords = toCanvasCoords(originalPoint.x, originalPoint.y)
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(originalCoords.canvasX, originalCoords.canvasY)
          ctx.lineTo(canvasX, canvasY)
          ctx.stroke()
        })
      }

      // Draw feature range boundaries if scaling is complete
      if (engineState.isComplete) {
        const rangeMin = engineState.featureRange[0]
        const rangeMax = engineState.featureRange[1]

        // Draw horizontal lines at feature range boundaries
        const minY = toCanvasCoords(0, rangeMin).canvasY
        const maxY = toCanvasCoords(0, rangeMax).canvasY

        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])

        ctx.beginPath()
        ctx.moveTo(toCanvasCoords(xMin, rangeMin).canvasX, minY)
        ctx.lineTo(toCanvasCoords(xMax, rangeMin).canvasX, minY)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(toCanvasCoords(xMin, rangeMax).canvasX, maxY)
        ctx.lineTo(toCanvasCoords(xMax, rangeMax).canvasX, maxY)
        ctx.stroke()

        ctx.setLineDash([])
      }
    },
    [canvasConfig, engineState, toCanvasCoords, xMin, xMax, yMin, yMax]
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
      if (!engineRef.current || engineState?.isComplete) return
      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isComplete) {
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
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">MinMax Scaler</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Data preprocessing: Scale features to a fixed range
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={engineState?.isComplete}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || engineState?.isComplete}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || engineState?.isComplete}
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

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={10}
                    max={2000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 50)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                    isDebugMode
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <VscDebugAltSmall size={16} />
                </button>

                {engineState && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Step:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.currentStep}/{engineState.totalSteps}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Phase:{' '}
                      <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                        {engineState.phase.replace('-', ' ')}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden flex items-center justify-center relative">
              <canvas
                ref={canvasRef}
                width={canvasConfig.width}
                height={canvasConfig.height}
                className="border border-gray-300 rounded-lg"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Data Generation */}
            <ControlGroup title="Data Generation">
              <div className="space-y-2">
                <button
                  onClick={() => generateData('normal')}
                  disabled={isPlaying}
                  className="w-full px-2 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Normal Range
                </button>
                <button
                  onClick={() => generateData('wide')}
                  disabled={isPlaying}
                  className="w-full px-2 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Wide Range
                </button>
                <button
                  onClick={() => generateData('clustered')}
                  disabled={isPlaying}
                  className="w-full px-2 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Clustered
                </button>
                <button
                  onClick={() => generateData('outliers')}
                  disabled={isPlaying}
                  className="w-full px-2 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> With Outliers
                </button>
              </div>
            </ControlGroup>

            {/* Feature Range Settings */}
            <ControlGroup title="Feature Range">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Min: {featureRangeMin}</label>
                  <input
                    type="range"
                    value={featureRangeMin}
                    min={-5}
                    max={featureRangeMax - 0.1}
                    step={0.1}
                    onChange={(e) => setFeatureRangeMin(Number.parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Max: {featureRangeMax}</label>
                  <input
                    type="range"
                    value={featureRangeMax}
                    min={featureRangeMin + 0.1}
                    max={5}
                    step={0.1}
                    onChange={(e) => setFeatureRangeMax(Number.parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Formula: X_scaled = (X - X_min) / (X_max - X_min) * (max - min) + min
                </p>
              </div>
            </ControlGroup>

            {/* Statistics */}
            {engineState && engineState.isComplete && (
              <ControlGroup title="Scaling Statistics">
                <div className="space-y-1 text-[10px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">X Min:</span>
                      <span className="font-mono ml-1">{engineState.xMin.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">X Max:</span>
                      <span className="font-mono ml-1">{engineState.xMax.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Y Min:</span>
                      <span className="font-mono ml-1">{engineState.yMin.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Y Max:</span>
                      <span className="font-mono ml-1">{engineState.yMax.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Legend */}
            <ControlGroup title="Legend">
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Original Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Scaled Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 border-dashed border-2"></div>
                  <span>Feature Range Bounds</span>
                </div>
              </div>
            </ControlGroup>

            {/* About */}
            <ControlGroup title="About MinMax Scaling">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Purpose:</strong> Scale features to a fixed range
                </p>
                <p>
                  <strong>Default Range:</strong> [0, 1]
                </p>
                <p>
                  <strong>Use Case:</strong> Neural networks, image processing
                </p>
                <p>
                  <strong>Sensitive to:</strong> Outliers
                </p>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>

      {/* Related Algorithms Accordion Footer - Fixed Bottom */}
      <div className="fixed bottom-0 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
        <div
          className={`bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-b-0 border-gray-200 dark:border-gray-700 transition-opacity ${
            isRelatedOpen ? 'opacity-100' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <button
            onClick={() => setIsRelatedOpen(!isRelatedOpen)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
              <RelatedAlgorithms route="minmax-scaler" type="ml" compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
