'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaRedo,
  FaDrawPolygon,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { TbRoute } from 'react-icons/tb'
import { useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle, useTheme } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { GMMEngine } from '../engines/GMMEngine'
import { useGMMPlayground } from '../hooks/useGMMPlayground'
import { drawGMMClustering, drawLogLikelihoodChart } from '../visualizers/gmmVisualizer'
import type { DataPoint } from '../types'

export function GMMPlayground() {
  const { theme } = useTheme()
  const {
    animationSpeed,
    setAnimationSpeed,
    showEllipses,
    setShowEllipses,
    showTrajectories,
    setShowTrajectories,
    isDebugMode,
    setIsDebugMode,
  } = useGMMPlayground()

  const engineRef = useRef<GMMEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<GMMEngine['getState']> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Initialization method
  const [initMethod, setInitMethod] = useState<'kmeans' | 'random'>('kmeans')

  // Data management
  const [points, setPoints] = useState<DataPoint[]>([])
  const [k, setK] = useState(3)
  const [maxIterations, setMaxIterations] = useState(50)
  const [convergenceThreshold] = useState(0.01)

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

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  const chartConfig = useMemo(
    () => ({
      width: 600,
      height: 300,
      padding: { top: 40, right: 40, bottom: 40, left: 60 },
    }),
    []
  )

  const gaussianConfig = useMemo(
    () => ({
      width: 600,
      height: 200,
      padding: { top: 20, right: 40, bottom: 40, left: 60 },
    }),
    []
  )

  // Data bounds
  const xMin = -28.5
  const xMax = 28.5
  const yMin = -12
  const yMax = 12

  // Generate sample data
  const generateData = useCallback(
    (type: 'blobs' | 'circles' | 'uniform' | 'elliptical' | '1d-gaussians') => {
      const newPoints: DataPoint[] = []

      if (type === 'blobs') {
        // Generate Gaussian blobs
        const centers = [
          { x: -10, y: -4 },
          { x: -10, y: 4 },
          { x: 0, y: 0 },
          { x: 10, y: -4 },
          { x: 10, y: 4 },
        ]
        const pointsPerBlob = 60

        centers.forEach((center) => {
          for (let i = 0; i < pointsPerBlob; i++) {
            const angle = Math.random() * 2 * Math.PI
            const radius = Math.abs(gaussianRandom() * 2.5)
            newPoints.push({
              x: center.x + radius * Math.cos(angle),
              y: center.y + radius * Math.sin(angle),
            })
          }
        })
      } else if (type === 'circles') {
        // Generate concentric circles
        const radii = [4, 8, 12]
        const pointsPerCircle = 100

        radii.forEach((radius) => {
          for (let i = 0; i < pointsPerCircle; i++) {
            const angle = (i / pointsPerCircle) * 2 * Math.PI
            const noise = (Math.random() - 0.5) * 1.5
            newPoints.push({
              x: (radius + noise) * Math.cos(angle),
              y: (radius + noise) * Math.sin(angle),
            })
          }
        })
      } else if (type === 'elliptical') {
        // Generate elongated elliptical clusters
        const centers = [
          { x: -12, y: 0, angle: Math.PI / 4, scaleX: 6, scaleY: 2 },
          { x: 0, y: 6, angle: -Math.PI / 6, scaleX: 5, scaleY: 2.5 },
          { x: 12, y: -2, angle: Math.PI / 3, scaleX: 7, scaleY: 2 },
        ]
        const pointsPerCluster = 100

        centers.forEach((center) => {
          for (let i = 0; i < pointsPerCluster; i++) {
            const u = gaussianRandom()
            const v = gaussianRandom()

            // Apply scaling
            const x = u * center.scaleX
            const y = v * center.scaleY

            // Apply rotation
            const rotatedX = x * Math.cos(center.angle) - y * Math.sin(center.angle)
            const rotatedY = x * Math.sin(center.angle) + y * Math.cos(center.angle)

            newPoints.push({
              x: center.x + rotatedX,
              y: center.y + rotatedY,
            })
          }
        })
      } else if (type === '1d-gaussians') {
        // Generate several 1D Gaussian distributions with distinct means and variances
        const configs = [
          { mean: -15, variance: 2, count: 60 },
          { mean: 0, variance: 5, count: 80 },
          { mean: 12, variance: 1, count: 40 },
        ]
        configs.forEach(({ mean, variance, count }) => {
          for (let i = 0; i < count; i++) {
            const x = mean + gaussianRandom() * Math.sqrt(variance)
            newPoints.push({ x, y: 0 })
          }
        })
      } else {
        // Uniform random
        for (let i = 0; i < 300; i++) {
          newPoints.push({
            x: Math.random() * (xMax - xMin) + xMin,
            y: Math.random() * (yMax - yMin) + yMin,
          })
        }
      }

      setPoints(newPoints)
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    },
    [xMin, xMax, yMin, yMax]
  )

  // Gaussian random number generator
  const gaussianRandom = () => {
    let u = 0,
      v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  // Initialize with default data
  useEffect(() => {
    generateData('blobs')
  }, [generateData])

  // Initialize engine when points or k changes
  useEffect(() => {
    if (points.length > 0) {
      engineRef.current = new GMMEngine({
        points,
        k,
        maxIterations,
        convergenceThreshold,
        initMethod,
      })
      setEngineState(engineRef.current.getState())
    }
  }, [points, k, maxIterations, convergenceThreshold, initMethod])

  // Canvas draw functions
  const drawMain = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (engineState) {
        const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b'
        drawGMMClustering(
          ctx,
          canvasConfig,
          engineState,
          xMin,
          xMax,
          yMin,
          yMax,
          showEllipses,
          showTrajectories,
          textColor
        )
      }
    },
    [engineState, canvasConfig, xMin, xMax, yMin, yMax, showEllipses, showTrajectories, theme]
  )

  const drawChart = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (engineState) {
        const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b'
        drawLogLikelihoodChart(ctx, chartConfig, engineState, textColor)
      }
    },
    [engineState, chartConfig, theme]
  )

  const drawGaussianCurves = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (engineState && engineState.components.length > 0) {
        const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b'
        const { width, height, padding } = gaussianConfig

        // Clear canvas
        ctx.fillStyle = theme === 'dark' ? '#1e293b' : '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // Calculate plot area
        const plotWidth = width - padding.left - padding.right
        const plotHeight = height - padding.top - padding.bottom

        // Data range
        const xMin = -20
        const xMax = 20

        // Calculate maximum density across all components
        let maxDensity = 0
        engineState.components.forEach((component) => {
          const { mean, covariance, weight } = component
          const variance = covariance[0][0]
          const std = Math.sqrt(variance)

          // Sample the PDF at several points to find max
          for (let i = 0; i <= 100; i++) {
            const x = xMin + (i / 100) * (xMax - xMin)
            const pdf =
              (1 / (std * Math.sqrt(2 * Math.PI))) *
              Math.exp(-0.5 * Math.pow((x - mean.x) / std, 2)) *
              weight
            maxDensity = Math.max(maxDensity, pdf)
          }
        })

        const yMax = maxDensity * 1.1 // Add 10% padding

        // Draw axes
        ctx.strokeStyle = textColor
        ctx.lineWidth = 1

        // X-axis
        ctx.beginPath()
        ctx.moveTo(padding.left, height - padding.bottom)
        ctx.lineTo(width - padding.right, height - padding.bottom)
        ctx.stroke()

        // Y-axis
        ctx.beginPath()
        ctx.moveTo(padding.left, padding.top)
        ctx.lineTo(padding.left, height - padding.bottom)
        ctx.stroke()

        // Draw grid lines
        ctx.strokeStyle = theme === 'dark' ? '#334155' : '#e2e8f0'
        ctx.lineWidth = 0.5

        // Vertical grid lines
        for (let x = xMin; x <= xMax; x += 5) {
          const screenX = padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth
          ctx.beginPath()
          ctx.moveTo(screenX, padding.top)
          ctx.lineTo(screenX, height - padding.bottom)
          ctx.stroke()
        }

        // Horizontal grid lines
        const gridSteps = 5
        for (let i = 0; i <= gridSteps; i++) {
          const y = (i / gridSteps) * yMax
          const screenY = height - padding.bottom - (y / yMax) * plotHeight
          ctx.beginPath()
          ctx.moveTo(padding.left, screenY)
          ctx.lineTo(width - padding.right, screenY)
          ctx.stroke()
        }

        // Draw Gaussian curves for each component
        const colors = [
          '#3b82f6',
          '#ef4444',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#84cc16',
        ]

        engineState.components.forEach((component, index) => {
          const { mean, covariance, weight } = component
          const variance = covariance[0][0] // Assuming diagonal covariance for 1D
          const std = Math.sqrt(variance)

          ctx.strokeStyle = colors[index % colors.length]
          ctx.lineWidth = 2
          ctx.beginPath()

          // Draw the PDF curve
          const steps = 200
          for (let i = 0; i <= steps; i++) {
            const x = xMin + (i / steps) * (xMax - xMin)
            const pdf =
              (1 / (std * Math.sqrt(2 * Math.PI))) *
              Math.exp(-0.5 * Math.pow((x - mean.x) / std, 2)) *
              weight

            const screenX = padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth
            const screenY = height - padding.bottom - (pdf / yMax) * plotHeight

            if (i === 0) {
              ctx.moveTo(screenX, screenY)
            } else {
              ctx.lineTo(screenX, screenY)
            }
          }
          ctx.stroke()

          // Draw mean line
          const meanScreenX = padding.left + ((mean.x - xMin) / (xMax - xMin)) * plotWidth
          ctx.strokeStyle = colors[index % colors.length]
          ctx.lineWidth = 1
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.moveTo(meanScreenX, padding.top)
          ctx.lineTo(meanScreenX, height - padding.bottom)
          ctx.stroke()
          ctx.setLineDash([])
        })

        // Draw axis labels
        ctx.fillStyle = textColor
        ctx.font = '12px system-ui'
        ctx.textAlign = 'center'

        // X-axis label
        ctx.fillText('Value', width / 2, height - 5)

        // Y-axis label
        ctx.save()
        ctx.translate(15, height / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText('Density', 0, 0)
        ctx.restore()

        // Title
        ctx.font = '14px system-ui'
        ctx.fillText('Gaussian Components (Theoretical PDFs)', width / 2, 15)
      }
    },
    [engineState, gaussianConfig, theme]
  )

  // Canvas refs
  const { canvasRef: mainCanvasRef, redraw: redrawMain } = useCanvas({
    config: canvasConfig,
    draw: drawMain,
  })

  const { canvasRef: chartCanvasRef, redraw: redrawChart } = useCanvas({
    config: chartConfig,
    draw: drawChart,
  })

  const { canvasRef: gaussianCanvasRef, redraw: redrawGaussian } = useCanvas({
    config: gaussianConfig,
    draw: drawGaussianCurves,
  })

  // Trigger redraws when state changes
  useEffect(() => {
    redrawMain()
    redrawChart()
    redrawGaussian()
  }, [engineState, redrawMain, redrawChart, redrawGaussian])

  // Control handlers
  const handleStep = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
  }, [])

  const handlePlay = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isConverged) {
            setIsPlaying(false)
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current)
            }
            return
          }
          engineRef.current.step()
          setEngineState(engineRef.current.getState())
        }
      }, animationSpeed)
    }
  }, [isPlaying, animationSpeed])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }, [])

  const handleFastForward = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.runToCompletion()
      setEngineState(engineRef.current.getState())
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  const handleReset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Gaussian Mixture Model
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Soft clustering with probabilistic assignments via EM algorithm
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>
                  <button
                    onClick={handleStep}
                    disabled={isPlaying || engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Step"
                  >
                    <FaStepForward size={12} />
                  </button>
                  <button
                    onClick={handleFastForward}
                    disabled={isPlaying || engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Run to Completion"
                  >
                    <FaFastForward size={12} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    title="Reset"
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
                    min={10}
                    max={2000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 100)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">k:</span>
                  <input
                    type="number"
                    value={k}
                    min={1}
                    max={8}
                    onChange={(e) => setK(Number.parseInt(e.target.value) || 1)}
                    disabled={isPlaying}
                    className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Init:</span>
                  <select
                    value={initMethod}
                    onChange={(e) => setInitMethod(e.target.value as 'kmeans' | 'random')}
                    disabled={isPlaying}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    title="Initialization Method"
                  >
                    <option value="kmeans">K-Means++</option>
                    <option value="random">Random</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Max Iter:</span>
                  <input
                    type="number"
                    value={maxIterations}
                    min={10}
                    max={100}
                    step={10}
                    onChange={(e) => setMaxIterations(Number.parseInt(e.target.value) || 50)}
                    disabled={isPlaying}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    title="Maximum Iterations"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <Tooltip text="Show Gaussian Covariance Ellipses">
                    <button
                      onClick={() => setShowEllipses(!showEllipses)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showEllipses
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaDrawPolygon size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Component Mean Trajectories">
                    <button
                      onClick={() => setShowTrajectories(!showTrajectories)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showTrajectories
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <TbRoute size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Debug Mode - Show Iteration History">
                    <button
                      onClick={() => setIsDebugMode(!isDebugMode)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        isDebugMode
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <VscDebugAltSmall size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden">
              <canvas
                ref={mainCanvasRef}
                width={canvasConfig.width}
                height={canvasConfig.height}
                className="w-full h-full"
                style={{ maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col space-y-3 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">

            {/* Dataset Generation */}
            <ControlGroup title="Dataset">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => generateData('blobs')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Blobs
                </button>
                <button
                  onClick={() => generateData('elliptical')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Elliptical
                </button>
                <button
                  onClick={() => generateData('circles')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Circles
                </button>
                <button
                  onClick={() => generateData('uniform')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Uniform
                </button>
              </div>
            </ControlGroup>

            {/* Convergence Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Convergence Analysis
              </h3>
              <canvas
                ref={chartCanvasRef}
                width={chartConfig.width}
                height={chartConfig.height}
                className="w-full"
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            </div>

            {/* Gaussian Components Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Gaussian Components
              </h3>
              <canvas
                ref={gaussianCanvasRef}
                width={gaussianConfig.width}
                height={gaussianConfig.height}
                className="w-full"
                style={{ maxHeight: '150px', objectFit: 'contain' }}
              />
            </div>

            {/* Statistics */}
            <ControlGroup title="Statistics">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Iteration:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {engineState?.iteration || 0} / {maxIterations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phase:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {(() => {
                      if (engineState?.phase === 'e-step') return 'E-Step'
                      if (engineState?.phase === 'm-step') return 'M-Step'
                      return 'Complete'
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Log-Likelihood:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {engineState?.logLikelihood !== -Infinity
                      ? engineState?.logLikelihood.toFixed(2)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{points.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Converged:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {engineState?.isConverged ? 'Yes' : 'No'}
                  </span>
                </div>
                {engineState && engineRef.current && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">BIC:</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {engineRef.current.getBIC().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">AIC:</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {engineRef.current.getAIC().toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </ControlGroup>

            {/* Debug History */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
              <ControlGroup title="Iteration History">
                <div className="space-y-1 max-h-40 overflow-y-auto text-[10px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-blue-100 dark:[&::-webkit-scrollbar-track]:bg-blue-900/30 [&::-webkit-scrollbar-thumb]:bg-blue-300 dark:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded">
                  {engineState.history
                    .slice()
                    .reverse()
                    .map((step, idx) => (
                      <div
                        key={step.iteration}
                        className={`p-1.5 rounded ${
                          idx === 0
                            ? 'bg-blue-100 dark:bg-blue-800/30 font-semibold'
                            : 'bg-gray-50 dark:bg-gray-900/50'
                        }`}
                      >
                        <span className="text-blue-600 dark:text-blue-400">#{step.iteration}</span>{' '}
                        {step.phase === 'm-step' ? 'M-Step' : 'E-Step'} | LL:{' '}
                        {step.logLikelihood.toFixed(2)}
                      </div>
                    ))}
                </div>
              </ControlGroup>
            )}

            {/* Algorithm Info */}
            <ControlGroup title="Algorithm">
              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">EM Algorithm</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Iteratively refines Gaussian components with soft assignments
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">E-Step</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Compute posterior probabilities γ_ik for each point-component pair
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">M-Step</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Update means μ_k, covariances Σ_k, and weights π_k
                  </p>
                </div>
              </div>
            </ControlGroup>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3>Related Algorithms</h3>
              <RelatedAlgorithms route="gmm" type="ml" compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
