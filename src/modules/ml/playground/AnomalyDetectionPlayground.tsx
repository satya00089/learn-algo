'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaRedo,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaPause,
  FaStepForward,
  FaFastForward,
} from 'react-icons/fa'
import { useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip } from '@/core/controls'
import { ThemeToggle, useTheme } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { AnomalyDetectionEngine } from '../engines/AnomalyDetectionEngine'
import { drawAnomalyDetection } from '../visualizers/anomalyDetectionVisualizer'
import type { DataPoint } from '../types'

// Gaussian random number generator
function gaussianRandom(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function AnomalyDetectionPlayground() {
  const { theme } = useTheme()

  // Engine state
  const engineRef = useRef<AnomalyDetectionEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    AnomalyDetectionEngine['getState']
  > | null>(null)

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(500) // milliseconds between steps
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Data generation
  const [dataType, setDataType] = useState<'blobs' | 'circles' | 'uniform' | 'anomalous'>('blobs')
  const [numPoints, setNumPoints] = useState(100)

  // Algorithm parameters
  const [method, setMethod] = useState<
    'isolation-forest' | 'one-class-svm' | 'lof' | 'z-score' | 'iqr'
  >('isolation-forest')
  const [contamination, setContamination] = useState(0.1)
  const [numTrees, setNumTrees] = useState(100)
  const [maxDepth, setMaxDepth] = useState(8)
  const [nu, setNu] = useState(0.1)
  const [k, setK] = useState(5)

  // Visualization options
  const [showScores, setShowScores] = useState(false)
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true)

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Generate sample data
  const generateData = useCallback(
    (type: 'blobs' | 'circles' | 'uniform' | 'anomalous') => {
      const newPoints: DataPoint[] = []
      
      // Calculate number of anomalies based on contamination
      const numAnomalies = Math.max(1, Math.floor(numPoints * contamination))
      const numNormal = numPoints - numAnomalies

      if (type === 'blobs') {
        // Generate normal data blobs with some clear outliers
        const centers = [
          { x: -6, y: -3 },
          { x: -6, y: 3 },
          { x: 0, y: 0 },
          { x: 6, y: -3 },
          { x: 6, y: 3 },
        ]
        const pointsPerBlob = Math.floor(numNormal / centers.length)

        // Normal points in blobs
        centers.forEach((center) => {
          for (let i = 0; i < pointsPerBlob; i++) {
            const angle = Math.random() * 2 * Math.PI
            const radius = Math.abs(gaussianRandom() * 1.5)
            newPoints.push({
              x: center.x + radius * Math.cos(angle),
              y: center.y + radius * Math.sin(angle),
            })
          }
        })

        // Add anomalies - scattered far from clusters
        for (let i = 0; i < numAnomalies; i++) {
          const angle = Math.random() * 2 * Math.PI
          const distance = 10 + Math.random() * 5
          newPoints.push({
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
          })
        }
      } else if (type === 'circles') {
        // Generate concentric circles with outliers
        const numCircles = 3
        const pointsPerCircle = Math.floor(numNormal / numCircles)

        // Normal points on circles
        for (let c = 0; c < numCircles; c++) {
          const radius = (c + 1) * 3
          for (let i = 0; i < pointsPerCircle; i++) {
            const angle = (i / pointsPerCircle) * 2 * Math.PI
            const noise = gaussianRandom() * 0.4
            newPoints.push({
              x: radius * Math.cos(angle) + noise,
              y: radius * Math.sin(angle) + noise,
            })
          }
        }

        // Add anomalies - points not on any circle
        for (let i = 0; i < numAnomalies; i++) {
          // Random positions between circles or far outside
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.random() > 0.5 
            ? Math.random() * 2 + 1 // Between inner circles
            : Math.random() * 3 + 12 // Far outside
          newPoints.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
          })
        }
      } else if (type === 'uniform') {
        // Generate uniform random data with extreme outliers
        // Normal uniform distribution
        for (let i = 0; i < numNormal; i++) {
          newPoints.push({
            x: (Math.random() - 0.5) * 16,
            y: (Math.random() - 0.5) * 16,
          })
        }

        // Add extreme outliers at corners/edges
        for (let i = 0; i < numAnomalies; i++) {
          const edge = Math.floor(Math.random() * 4)
          switch (edge) {
            case 0: // Top edge
              newPoints.push({ x: (Math.random() - 0.5) * 20, y: 12 + Math.random() * 3 })
              break
            case 1: // Bottom edge
              newPoints.push({ x: (Math.random() - 0.5) * 20, y: -12 - Math.random() * 3 })
              break
            case 2: // Right edge
              newPoints.push({ x: 12 + Math.random() * 3, y: (Math.random() - 0.5) * 20 })
              break
            case 3: // Left edge
              newPoints.push({ x: -12 - Math.random() * 3, y: (Math.random() - 0.5) * 20 })
              break
          }
        }
      } else if (type === 'anomalous') {
        // Generate tight normal cluster with clear anomalies
        // Normal data - tight Gaussian cluster at center
        for (let i = 0; i < numNormal; i++) {
          newPoints.push({
            x: gaussianRandom() * 2.5,
            y: gaussianRandom() * 2.5,
          })
        }

        // Anomalies - clearly separated from normal cluster
        for (let i = 0; i < numAnomalies; i++) {
          const angle = Math.random() * 2 * Math.PI
          const distance = 7 + Math.random() * 5
          newPoints.push({
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
          })
        }
      }

      return newPoints
    },
    [numPoints, contamination]
  )

  // Stop animation helper
  const stopAnimation = useCallback(() => {
    setIsPlaying(false)
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // Initialize engine
  const initializeEngine = useCallback(() => {
    // Stop any ongoing animation first
    stopAnimation()

    const newPoints = generateData(dataType)

    const config = {
      points: newPoints,
      method,
      contamination,
      numTrees,
      maxDepth,
      nu,
      k,
    }

    engineRef.current = new AnomalyDetectionEngine(config)
    setEngineState(engineRef.current.getState())
  }, [dataType, method, contamination, numTrees, maxDepth, nu, k, generateData, stopAnimation])

  // Animation controls
  const handlePlayPause = useCallback(() => {
    if (!engineRef.current) return

    if (isPlaying) {
      // Stop animation
      stopAnimation()
    } else {
      // Start animation
      setIsPlaying(true)
      animationRef.current = setInterval(() => {
        if (engineRef.current && !engineRef.current.getState().isComplete) {
          engineRef.current.step()
          setEngineState(engineRef.current.getState())
        } else {
          // Stop when complete
          stopAnimation()
        }
      }, animationSpeed)
    }
  }, [isPlaying, animationSpeed, stopAnimation])

  const handleStep = useCallback(() => {
    if (engineRef.current && !engineRef.current.getState().isComplete) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
  }, [])

  const handleRun = useCallback(() => {
    if (engineRef.current) {
      stopAnimation()
      engineRef.current.run()
      setEngineState(engineRef.current.getState())
    }
  }, [stopAnimation])

  // Reset everything
  const handleReset = useCallback(() => {
    initializeEngine()
  }, [initializeEngine])

  // Initialize on mount and when parameters change
  useEffect(() => {
    initializeEngine()
  }, [initializeEngine])

  // Handle animation speed change during playback
  useEffect(() => {
    if (isPlaying && animationRef.current) {
      // Clear the old interval
      clearInterval(animationRef.current)
      // Start new interval with updated speed
      animationRef.current = setInterval(() => {
        if (engineRef.current && !engineRef.current.getState().isComplete) {
          engineRef.current.step()
          setEngineState(engineRef.current.getState())
        } else {
          stopAnimation()
        }
      }, animationSpeed)
    }
  }, [animationSpeed, isPlaying, stopAnimation])

  // Canvas
  const { canvasRef, redraw } = useCanvas({
    config: canvasConfig,
    draw: (ctx) => {
      if (engineState) {
        drawAnomalyDetection(
          ctx,
          engineState,
          canvasConfig.width,
          canvasConfig.height,
          canvasConfig.padding,
          theme,
          showScores,
          showDecisionBoundary
        )
      }
    },
  })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, redraw, showScores, showDecisionBoundary, theme])

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Anomaly Detection</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Identify outliers and anomalous data points using various detection algorithms
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

                {/* Animation Speed */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    step="50"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value) || 500)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">ms</span>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Number of Points */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Points:</span>
                  <input
                    type="number"
                    min="20"
                    max="500"
                    step="10"
                    value={numPoints}
                    onChange={(e) => setNumPoints(Number.parseInt(e.target.value) || 100)}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Algorithm Selection */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Algorithm:</span>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="isolation-forest">Isolation Forest</option>
                    <option value="one-class-svm">One-Class SVM</option>
                    <option value="lof">Local Outlier Factor</option>
                    <option value="z-score">Z-Score</option>
                    <option value="iqr">IQR Method</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Algorithm Parameters */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Contamination:</span>
                  <input
                    type="number"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={contamination}
                    onChange={(e) => setContamination(Number.parseFloat(e.target.value) || 0.1)}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                {/* Method-specific parameters */}
                {method === 'isolation-forest' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Trees:</span>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        step="10"
                        value={numTrees}
                        onChange={(e) => setNumTrees(Number.parseInt(e.target.value) || 100)}
                        className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Depth:</span>
                      <input
                        type="number"
                        min="4"
                        max="16"
                        step="1"
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(Number.parseInt(e.target.value) || 8)}
                        className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </>
                )}

                {method === 'one-class-svm' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Nu:</span>
                    <input
                      type="number"
                      min="0.01"
                      max="0.5"
                      step="0.01"
                      value={nu}
                      onChange={(e) => setNu(Number.parseFloat(e.target.value) || 0.1)}
                      className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                {method === 'lof' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">K:</span>
                    <input
                      type="number"
                      min="3"
                      max="20"
                      step="1"
                      value={k}
                      onChange={(e) => setK(Number.parseInt(e.target.value) || 5)}
                      className="w-14 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <Tooltip text="Show Anomaly Scores">
                    <button
                      onClick={() => setShowScores(!showScores)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showScores
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {showScores ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Decision Boundary">
                    <button
                      onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showDecisionBoundary
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaInfoCircle size={14} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={canvasConfig.width}
                height={canvasConfig.height}
                className="w-full h-full"
                style={{ maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col space-y-3 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Dataset */}
            <ControlGroup title="Dataset">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDataType('blobs')}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    dataType === 'blobs'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Blobs
                </button>
                <button
                  onClick={() => setDataType('circles')}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    dataType === 'circles'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Circles
                </button>
                <button
                  onClick={() => setDataType('uniform')}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    dataType === 'uniform'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Uniform
                </button>
                <button
                  onClick={() => setDataType('anomalous')}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    dataType === 'anomalous'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Anomalous
                </button>
              </div>
            </ControlGroup>

            {/* Statistics */}
            <ControlGroup title="Statistics">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                  <span className="font-mono">{engineState?.points.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Anomalies:</span>
                  <span className="font-mono text-red-600 dark:text-red-400">
                    {engineState?.points.filter((p) => p.isAnomaly).length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Normal:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">
                    {engineState?.points.filter((p) => !p.isAnomaly).length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                  <span className="font-mono">{engineState?.threshold.toFixed(3) || '0.000'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Contamination:</span>
                  <span className="font-mono">
                    {((engineState?.contamination || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </ControlGroup>

            {/* Algorithm Info */}
            <ControlGroup title="Algorithm Info">
              <div className="space-y-2 text-sm">
                {method === 'isolation-forest' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Isolation Forest:</strong>
                    </p>
                    <p className="text-xs">
                      Builds random decision trees. Anomalies are isolated closer to the root with
                      fewer splits.
                    </p>
                  </div>
                )}
                {method === 'one-class-svm' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>One-Class SVM:</strong>
                    </p>
                    <p className="text-xs">
                      Learns a decision boundary around normal data points using support vector
                      machines.
                    </p>
                  </div>
                )}
                {method === 'lof' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Local Outlier Factor:</strong>
                    </p>
                    <p className="text-xs">
                      Measures local density deviation. Points with lower density than neighbors are
                      anomalies.
                    </p>
                  </div>
                )}
                {method === 'z-score' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Z-Score:</strong>
                    </p>
                    <p className="text-xs">
                      Statistical method using standard deviations. Points beyond threshold are
                      anomalies.
                    </p>
                  </div>
                )}
                {method === 'iqr' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>IQR Method:</strong>
                    </p>
                    <p className="text-xs">
                      Uses interquartile range. Points outside 1.5×IQR from quartiles are anomalies.
                    </p>
                  </div>
                )}
              </div>
            </ControlGroup>

            {/* Related Algorithms */}
            <RelatedAlgorithms route="anomaly-detection" type="ml" compact />
          </div>
        </div>
      </div>
    </div>
  )
}
