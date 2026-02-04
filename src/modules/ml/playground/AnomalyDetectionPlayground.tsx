'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaRedo,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
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
  const [engineState, setEngineState] = useState<ReturnType<AnomalyDetectionEngine['getState']> | null>(null)

  // Data generation
  const [dataType, setDataType] = useState<'blobs' | 'circles' | 'uniform' | 'anomalous'>('blobs')
  const [numPoints, setNumPoints] = useState(100)

  // Algorithm parameters
  const [method, setMethod] = useState<'isolation-forest' | 'one-class-svm' | 'lof' | 'z-score' | 'iqr'>('isolation-forest')
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
  const generateData = useCallback((type: 'blobs' | 'circles' | 'uniform' | 'anomalous') => {
    const newPoints: DataPoint[] = []

    if (type === 'blobs') {
      // Generate normal data blobs
      const centers = [
        { x: -8, y: -4 },
        { x: -8, y: 4 },
        { x: 0, y: 0 },
        { x: 8, y: -4 },
        { x: 8, y: 4 },
      ]
      const pointsPerBlob = Math.floor(numPoints / centers.length)

      centers.forEach((center) => {
        for (let i = 0; i < pointsPerBlob; i++) {
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.abs(gaussianRandom() * 2)
          newPoints.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
          })
        }
      })
    } else if (type === 'circles') {
      // Generate concentric circles
      const numCircles = 3
      const pointsPerCircle = Math.floor(numPoints / numCircles)

      for (let c = 0; c < numCircles; c++) {
        const radius = (c + 1) * 3
        for (let i = 0; i < pointsPerCircle; i++) {
          const angle = (i / pointsPerCircle) * 2 * Math.PI
          const noise = gaussianRandom() * 0.5
          newPoints.push({
            x: radius * Math.cos(angle) + noise,
            y: radius * Math.sin(angle) + noise,
          })
        }
      }
    } else if (type === 'uniform') {
      // Generate uniform random data
      for (let i = 0; i < numPoints; i++) {
        newPoints.push({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
        })
      }
    } else if (type === 'anomalous') {
      // Generate normal data with some anomalies
      const normalPoints = Math.floor(numPoints * 0.9)
      const anomalyPoints = numPoints - normalPoints

      // Normal data
      for (let i = 0; i < normalPoints; i++) {
        const centerX = gaussianRandom() * 3
        const centerY = gaussianRandom() * 3
        newPoints.push({
          x: centerX + gaussianRandom() * 1,
          y: centerY + gaussianRandom() * 1,
        })
      }

      // Anomalies
      for (let i = 0; i < anomalyPoints; i++) {
        // Place anomalies far from the center
        const angle = Math.random() * 2 * Math.PI
        const distance = 8 + Math.random() * 4
        newPoints.push({
          x: distance * Math.cos(angle),
          y: distance * Math.sin(angle),
        })
      }
    }

    return newPoints
  }, [numPoints])

  // Initialize engine
  const initializeEngine = useCallback(() => {
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
  }, [dataType, method, contamination, numTrees, maxDepth, nu, k, generateData])

  // Run anomaly detection
  const runDetection = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
    }
  }, [])

  // Reset everything
  const handleReset = useCallback(() => {
    initializeEngine()
  }, [initializeEngine])

  // Initialize on mount and when parameters change
  useEffect(() => {
    initializeEngine()
  }, [initializeEngine])

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

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Anomaly Detection
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Identify outliers and anomalous data points using various detection algorithms
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text="Run Anomaly Detection">
                    <button
                      onClick={runDetection}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      <FaPlay size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset and Regenerate Data">
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
                  <span className="text-xs text-gray-600 dark:text-gray-400">Method:</span>
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

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Contamination:</span>
                  <input
                    type="number"
                    value={contamination}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    onChange={(e) => setContamination(Number.parseFloat(e.target.value) || 0.1)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Method-specific parameters */}
                {method === 'isolation-forest' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Trees:</span>
                      <input
                        type="number"
                        value={numTrees}
                        min={10}
                        max={500}
                        step={10}
                        onChange={(e) => setNumTrees(Number.parseInt(e.target.value) || 100)}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Max Depth:</span>
                      <input
                        type="number"
                        value={maxDepth}
                        min={4}
                        max={16}
                        step={1}
                        onChange={(e) => setMaxDepth(Number.parseInt(e.target.value) || 8)}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </>
                )}

                {method === 'one-class-svm' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">ν:</span>
                    <input
                      type="number"
                      value={nu}
                      min={0.01}
                      max={0.5}
                      step={0.01}
                      onChange={(e) => setNu(Number.parseFloat(e.target.value) || 0.1)}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                {method === 'lof' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">k:</span>
                    <input
                      type="number"
                      value={k}
                      min={3}
                      max={20}
                      step={1}
                      onChange={(e) => setK(Number.parseInt(e.target.value) || 5)}
                      className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
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
            {/* Data Configuration */}
            <ControlGroup title="Data Configuration">
              <div className="space-y-3">
                <div>
                  <label htmlFor="data-type" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Data Type
                  </label>
                  <select
                    id="data-type"
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="blobs">Gaussian Blobs</option>
                    <option value="circles">Concentric Circles</option>
                    <option value="uniform">Uniform Random</option>
                    <option value="anomalous">With Anomalies</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="num-points" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Number of Points
                  </label>
                  <input
                    id="num-points"
                    type="number"
                    value={numPoints}
                    min={20}
                    max={500}
                    step={10}
                    onChange={(e) => setNumPoints(Number.parseInt(e.target.value) || 100)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
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
                    {engineState?.points.filter(p => p.isAnomaly).length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Normal:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">
                    {engineState?.points.filter(p => !p.isAnomaly).length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                  <span className="font-mono">{engineState?.threshold.toFixed(3) || '0.000'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Contamination:</span>
                  <span className="font-mono">{((engineState?.contamination || 0) * 100).toFixed(1)}%</span>
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
                      Builds random decision trees. Anomalies are isolated closer to the root with fewer splits.
                    </p>
                  </div>
                )}
                {method === 'one-class-svm' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>One-Class SVM:</strong>
                    </p>
                    <p className="text-xs">
                      Learns a decision boundary around normal data points using support vector machines.
                    </p>
                  </div>
                )}
                {method === 'lof' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Local Outlier Factor:</strong>
                    </p>
                    <p className="text-xs">
                      Measures local density deviation. Points with lower density than neighbors are anomalies.
                    </p>
                  </div>
                )}
                {method === 'z-score' && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <strong>Z-Score:</strong>
                    </p>
                    <p className="text-xs">
                      Statistical method using standard deviations. Points beyond threshold are anomalies.
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