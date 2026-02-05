'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaRedo,
  FaInfoCircle,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaDatabase,
  FaExchangeAlt,
  FaVectorSquare,
} from 'react-icons/fa'
import { useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip } from '@/core/controls'
import { ThemeToggle, useTheme } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { PCAEngine } from '../engines/PCAEngine'
import { drawPCA } from '../visualizers/pcaVisualizer'
import type { DataPoint } from '../types'

// Gaussian random number generator
function gaussianRandom(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function PCAPlayground() {
  const { theme } = useTheme()

  // Engine state
  const engineRef = useRef<PCAEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    PCAEngine['getState']
  > | null>(null)

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(500) // milliseconds between steps
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Data generation
  const [dataType, setDataType] = useState<'iris' | 'swiss-roll' | 'random' | 'correlated'>('iris')
  const [numPoints, setNumPoints] = useState(100)

  // Algorithm parameters
  const [numComponents, setNumComponents] = useState(2)

  // Visualization options
  const [showOriginal, setShowOriginal] = useState(true)
  const [showTransformed, setShowTransformed] = useState(true)
  const [showComponents, setShowComponents] = useState(true)

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
    (type: 'iris' | 'swiss-roll' | 'random' | 'correlated') => {
      const newPoints: DataPoint[] = []

      if (type === 'iris') {
        // Simplified Iris dataset (first 2 features, 3 classes)
        const irisData = [
          // Setosa
          ...Array.from({ length: Math.floor(numPoints / 3) }, () => ({
            x: 5.1 + gaussianRandom() * 0.3,
            y: 3.5 + gaussianRandom() * 0.3,
          })),
          // Versicolor
          ...Array.from({ length: Math.floor(numPoints / 3) }, () => ({
            x: 5.9 + gaussianRandom() * 0.4,
            y: 2.8 + gaussianRandom() * 0.3,
          })),
          // Virginica
          ...Array.from({ length: Math.floor(numPoints / 3) }, () => ({
            x: 6.3 + gaussianRandom() * 0.5,
            y: 3.0 + gaussianRandom() * 0.4,
          })),
        ]
        newPoints.push(...irisData.slice(0, numPoints))
      } else if (type === 'swiss-roll') {
        // Swiss roll manifold
        for (let i = 0; i < numPoints; i++) {
          const t = (i / numPoints) * 3 + gaussianRandom() * 0.1
          const x = t * Math.cos(t)
          const y = t * Math.sin(t)
          newPoints.push({ x, y })
        }
      } else if (type === 'correlated') {
        // Highly correlated data
        for (let i = 0; i < numPoints; i++) {
          const base = gaussianRandom() * 3
          newPoints.push({
            x: base + gaussianRandom() * 0.5,
            y: base * 0.8 + gaussianRandom() * 0.5,
          })
        }
      } else {
        // Random data
        for (let i = 0; i < numPoints; i++) {
          newPoints.push({
            x: gaussianRandom() * 6,
            y: gaussianRandom() * 6,
          })
        }
      }

      return newPoints
    },
    [numPoints]
  )

  // Initialize engine
  const initializeEngine = useCallback(() => {
    const points = generateData(dataType)
    engineRef.current = new PCAEngine({
      points,
      numComponents,
    })
    setEngineState(engineRef.current.getState())
  }, [dataType, numComponents, generateData])

  // Initialize on mount and when parameters change
  useEffect(() => {
    initializeEngine()
  }, [initializeEngine])

  // Animation functions
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const step = useCallback(() => {
    if (!engineRef.current) return false

    const hasNext = engineRef.current.step()
    setEngineState(engineRef.current.getState())
    return hasNext
  }, [])

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopAnimation()
    } else {
      setIsPlaying(true)
      animationRef.current = setInterval(() => {
        const hasNext = step()
        if (!hasNext) {
          stopAnimation()
        }
      }, animationSpeed)
    }
  }, [isPlaying, step, animationSpeed, stopAnimation])

  const handleStep = useCallback(() => {
    stopAnimation()
    step()
  }, [step, stopAnimation])

  const handleRun = useCallback(() => {
    stopAnimation()
    if (engineRef.current) {
      engineRef.current.run()
      setEngineState(engineRef.current.getState())
    }
  }, [stopAnimation])

  const handleReset = useCallback(() => {
    stopAnimation()
    initializeEngine()
  }, [stopAnimation, initializeEngine])

  // Update engine when parameters change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfig({ numComponents })
      setEngineState(engineRef.current.getState())
    }
  }, [numComponents])

  // Update animation speed
  useEffect(() => {
    if (isPlaying && animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = setInterval(() => {
        const hasNext = step()
        if (!hasNext) {
          stopAnimation()
        }
      }, animationSpeed)
    }
  }, [animationSpeed, isPlaying, step, stopAnimation])

  // Canvas drawing
  const { canvasRef } = useCanvas({
    config: canvasConfig,
    draw: (ctx) => {
      if (engineState) {
        drawPCA(
          ctx,
          engineState,
          canvasConfig.width,
          canvasConfig.height,
          canvasConfig.padding,
          theme,
          showOriginal,
          showTransformed,
          showComponents
        )
      }
    },
  })

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Principal Component Analysis
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Dimensionality reduction using principal components to capture maximum variance
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={handlePlayPause}
                    disabled={!engineState || engineState.isComplete}
                    className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>
                  <button
                    onClick={handleStep}
                    disabled={isPlaying || !engineState || engineState.isComplete}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Step"
                  >
                    <FaStepForward size={12} />
                  </button>
                  <button
                    onClick={handleRun}
                    disabled={isPlaying || !engineState || engineState.isComplete}
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
                    min={50}
                    max={2000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Points:</span>
                  <input
                    type="number"
                    value={numPoints}
                    min={50}
                    max={500}
                    step={25}
                    onChange={(e) => setNumPoints(Number(e.target.value))}
                    disabled={isPlaying}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Components:</span>
                  <input
                    type="number"
                    value={numComponents}
                    min={1}
                    max={2}
                    onChange={(e) => setNumComponents(Number(e.target.value))}
                    disabled={isPlaying}
                    className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <Tooltip text="Show Original Data">
                    <button
                      onClick={() => setShowOriginal(!showOriginal)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showOriginal
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaDatabase size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Transformed Data">
                    <button
                      onClick={() => setShowTransformed(!showTransformed)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showTransformed
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaExchangeAlt size={14} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Principal Components">
                    <button
                      onClick={() => setShowComponents(!showComponents)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showComponents
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FaVectorSquare size={14} />
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

            {/* Dataset Generation */}
            <ControlGroup title="Dataset">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDataType('iris')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Iris
                </button>
                <button
                  onClick={() => setDataType('swiss-roll')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Swiss Roll
                </button>
                <button
                  onClick={() => setDataType('correlated')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Correlated
                </button>
                <button
                  onClick={() => setDataType('random')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Random
                </button>
              </div>
            </ControlGroup>

            {/* Algorithm Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaInfoCircle size={14} />
                How PCA Works
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Step 1:</strong> Center data by subtracting mean</p>
                <p><strong>Step 2:</strong> Compute covariance matrix</p>
                <p><strong>Step 3:</strong> Find eigenvalues/eigenvectors</p>
                <p><strong>Step 4:</strong> Select principal components</p>
                <p><strong>Step 5:</strong> Transform data</p>
              </div>
            </div>

            {/* Related Algorithms */}
            <RelatedAlgorithms route="pca" type="ml" compact />
          </div>
        </div>
      </div>
    </div>
  )
}