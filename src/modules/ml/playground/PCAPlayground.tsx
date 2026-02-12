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
import { GiBookCover } from 'react-icons/gi'
import { useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip } from '@/core/controls'
import { Button } from '@/core/controls/Button'
import { ThemeToggle, useTheme } from '@/core/theme'
import { TheoryModal } from '@/components/TheoryModal'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { PCAEngine } from '../engines/PCAEngine'
import { drawPCA } from '../visualizers/pcaVisualizer'
import { PCA3DScene } from '../visualizers/PCA3DScene'
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
  const [engineState, setEngineState] = useState<ReturnType<PCAEngine['getState']> | null>(null)

  // Animation state
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(500) // milliseconds between steps
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Data generation
  const [dataType, setDataType] = useState<'iris' | 'wine' | 'breast-cancer' | 'mnist'>('iris')
  const [numPoints, setNumPoints] = useState(150)

  // Algorithm parameters
  const [numComponents, setNumComponents] = useState(2)
  const [view3D, setView3D] = useState(false)

  // Visualization options
  const [showOriginal, setShowOriginal] = useState(true)
  const [showTransformed, setShowTransformed] = useState(true)
  const [showComponents, setShowComponents] = useState(true)
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )

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
    (type: 'iris' | 'wine' | 'breast-cancer' | 'mnist') => {
      const newPoints: DataPoint[] = []
      const use3D = view3D || numComponents >= 3

      if (type === 'iris') {
        // Classic Iris dataset - 150 samples, 4 features (sepal length, sepal width, petal length, petal width)
        // Simulating principal components for visualization
        const classSize = Math.floor(numPoints / 3)

        // Setosa (clearly separable)
        for (let i = 0; i < classSize; i++) {
          const point: DataPoint = {
            x: -2.0 + gaussianRandom() * 0.35,
            y: 0.0 + gaussianRandom() * 0.35,
          }
          if (use3D) point.z = 0.0 + gaussianRandom() * 0.25
          newPoints.push(point)
        }

        // Versicolor (some overlap with Virginica)
        for (let i = 0; i < classSize; i++) {
          const point: DataPoint = {
            x: 0.5 + gaussianRandom() * 0.5,
            y: -0.5 + gaussianRandom() * 0.4,
          }
          if (use3D) point.z = 0.0 + gaussianRandom() * 0.4
          newPoints.push(point)
        }

        // Virginica
        for (let i = 0; i < numPoints - 2 * classSize; i++) {
          const point: DataPoint = {
            x: 1.5 + gaussianRandom() * 0.6,
            y: 0.2 + gaussianRandom() * 0.5,
          }
          if (use3D) point.z = 0.4 + gaussianRandom() * 0.3
          newPoints.push(point)
        }
      } else if (type === 'wine') {
        // Wine Quality dataset - 13 chemical features (alcohol, acidity, etc.)
        // 3 wine cultivars from Italy
        const classSize = Math.floor(numPoints / 3)

        // Class 1 - High alcohol, low acidity, high phenols
        for (let i = 0; i < classSize; i++) {
          const point: DataPoint = {
            x: 3.0 + gaussianRandom() * 0.6,
            y: 0.5 + gaussianRandom() * 0.4,
          }
          if (use3D) point.z = 1.2 + gaussianRandom() * 0.4
          newPoints.push(point)
        }

        // Class 2 - Medium alcohol, medium acidity, medium phenols
        for (let i = 0; i < classSize; i++) {
          const point: DataPoint = {
            x: 0.0 + gaussianRandom() * 0.5,
            y: -0.2 + gaussianRandom() * 0.5,
          }
          if (use3D) point.z = -0.1 + gaussianRandom() * 0.4
          newPoints.push(point)
        }

        // Class 3 - Lower alcohol, higher acidity, lower phenols
        for (let i = 0; i < numPoints - 2 * classSize; i++) {
          const point: DataPoint = {
            x: -2.5 + gaussianRandom() * 0.7,
            y: 0.0 + gaussianRandom() * 0.6,
          }
          if (use3D) point.z = -1.0 + gaussianRandom() * 0.5
          newPoints.push(point)
        }
      } else if (type === 'breast-cancer') {
        // Breast Cancer Wisconsin dataset - 30 features (cell measurements)
        // 2 classes: malignant and benign
        const malignantSize = Math.floor(numPoints * 0.37) // ~37% malignant

        // Malignant tumors - larger, more irregular cells
        for (let i = 0; i < malignantSize; i++) {
          const point: DataPoint = {
            x: 2.0 + gaussianRandom() * 0.8,
            y: 0.3 + gaussianRandom() * 0.7,
          }
          if (use3D) point.z = 0.8 + gaussianRandom() * 0.6
          newPoints.push(point)
        }

        // Benign tumors - smaller, more regular cells
        for (let i = 0; i < numPoints - malignantSize; i++) {
          const point: DataPoint = {
            x: -1.5 + gaussianRandom() * 0.6,
            y: -0.2 + gaussianRandom() * 0.5,
          }
          if (use3D) point.z = -0.8 + gaussianRandom() * 0.5
          newPoints.push(point)
        }
      } else if (type === 'mnist') {
        // MNIST-like handwritten digits - 784 features (28x28 pixels)
        // Simulating 4 digit classes
        const digitsPerClass = Math.floor(numPoints / 4)

        // Digit 0 (circular pattern)
        for (let i = 0; i < digitsPerClass; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = 1.5 + gaussianRandom() * 0.3
          const point: DataPoint = {
            x: Math.cos(angle) * radius - 2,
            y: Math.sin(angle) * radius + 2,
          }
          if (use3D) point.z = gaussianRandom() * 0.5
          newPoints.push(point)
        }

        // Digit 1 (vertical line)
        for (let i = 0; i < digitsPerClass; i++) {
          const point: DataPoint = {
            x: 2.0 + gaussianRandom() * 0.3,
            y: 2.0 + gaussianRandom() * 0.5,
          }
          if (use3D) point.z = 1.0 + gaussianRandom() * 0.4
          newPoints.push(point)
        }

        // Digit 4 (angular pattern)
        for (let i = 0; i < digitsPerClass; i++) {
          const point: DataPoint = {
            x: -2.5 + gaussianRandom() * 0.4,
            y: -2.0 + gaussianRandom() * 0.4,
          }
          if (use3D) point.z = -0.5 + gaussianRandom() * 0.4
          newPoints.push(point)
        }

        // Digit 7 (angular pattern, different orientation)
        for (let i = 0; i < numPoints - 3 * digitsPerClass; i++) {
          const point: DataPoint = {
            x: 2.5 + gaussianRandom() * 0.4,
            y: -2.0 + gaussianRandom() * 0.4,
          }
          if (use3D) point.z = -1.5 + gaussianRandom() * 0.5
          newPoints.push(point)
        }
      }

      return newPoints
    },
    [numPoints, view3D, numComponents]
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
          showComponents,
          view3D
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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowExplanation(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <GiBookCover size={14} />
              Theory
            </Button>
            <ThemeToggle />
          </div>
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
                  <span className="text-xs text-gray-600 dark:text-gray-400">Samples:</span>
                  <input
                    type="number"
                    value={numPoints}
                    min={100}
                    max={500}
                    step={50}
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
                    max={view3D ? 3 : 2}
                    onChange={(e) => setNumComponents(Number(e.target.value))}
                    disabled={isPlaying}
                    className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <Tooltip text="Toggle 3D Isometric View">
                    <button
                      onClick={() => {
                        const newView3D = !view3D
                        setView3D(newView3D)
                        // When switching to 3D view, ensure we have at least 3 components
                        if (newView3D && numComponents < 3) {
                          setNumComponents(3)
                        }
                      }}
                      disabled={isPlaying}
                      className={`px-3 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        view3D
                          ? 'bg-indigo-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {view3D ? '3D View' : '2D View'}
                    </button>
                  </Tooltip>
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
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden relative">
              {view3D && engineState ? (
                <PCA3DScene
                  state={engineState}
                  showOriginal={showOriginal}
                  showTransformed={showTransformed}
                  showComponents={showComponents}
                  theme={theme}
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={canvasConfig.width}
                  height={canvasConfig.height}
                  className="w-full h-full"
                  style={{ maxHeight: '100%', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col space-y-3 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Dataset Generation */}
            <ControlGroup title="Classic ML Datasets">
              <div className="grid grid-cols-2 gap-2">
                <Tooltip text="4D → 2D: Sepal & petal measurements reduced to 2 principal components">
                  <button
                    onClick={() => setDataType('iris')}
                    disabled={isPlaying}
                    className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      dataType === 'iris'
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Iris
                  </button>
                </Tooltip>
                <Tooltip text="13D → 2D: Chemical properties reduced to 2 principal components">
                  <button
                    onClick={() => setDataType('wine')}
                    disabled={isPlaying}
                    className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      dataType === 'wine'
                        ? 'bg-purple-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Wine
                  </button>
                </Tooltip>
                <Tooltip text="30D → 2D: Cell measurements reduced to 2 principal components">
                  <button
                    onClick={() => setDataType('breast-cancer')}
                    disabled={isPlaying}
                    className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      dataType === 'breast-cancer'
                        ? 'bg-pink-700 text-white'
                        : 'bg-pink-600 hover:bg-pink-700 text-white'
                    }`}
                  >
                    Cancer
                  </button>
                </Tooltip>
                <Tooltip text="784D → 2D: Pixel features reduced to 2 principal components">
                  <button
                    onClick={() => setDataType('mnist')}
                    disabled={isPlaying}
                    className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      dataType === 'mnist'
                        ? 'bg-green-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    MNIST
                  </button>
                </Tooltip>
              </div>

              {/* Dataset Info */}
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400">
                {dataType === 'iris' && (
                  <div>
                    <strong>Iris Dataset (1936)</strong>
                    <p className="mt-1">📊 150 samples × 4 features → 2D projection</p>
                    <p className="mt-1">
                      Features: sepal length, sepal width, petal length, petal width
                    </p>
                    <p className="mt-1">Classes: Setosa, Versicolor, Virginica</p>
                    <p className="mt-1 text-blue-600 dark:text-blue-400">
                      PCA reduces 4D to 2D while preserving ~95% variance
                    </p>
                  </div>
                )}
                {dataType === 'wine' && (
                  <div>
                    <strong>Wine Dataset</strong>
                    <p className="mt-1">📊 178 samples × 13 features → 2D projection</p>
                    <p className="mt-1">Features: alcohol, acidity, phenols, flavonoids, etc.</p>
                    <p className="mt-1">Classes: 3 Italian wine cultivars</p>
                    <p className="mt-1 text-purple-600 dark:text-purple-400">
                      PCA reduces 13D to 2D while preserving key chemical patterns
                    </p>
                  </div>
                )}
                {dataType === 'breast-cancer' && (
                  <div>
                    <strong>Breast Cancer Wisconsin</strong>
                    <p className="mt-1">📊 569 samples × 30 features → 2D projection</p>
                    <p className="mt-1">
                      Features: radius, texture, perimeter, area, smoothness, etc.
                    </p>
                    <p className="mt-1">Classes: Malignant vs Benign tumors</p>
                    <p className="mt-1 text-pink-600 dark:text-pink-400">
                      PCA reduces 30D to 2D for visualization and analysis
                    </p>
                  </div>
                )}
                {dataType === 'mnist' && (
                  <div>
                    <strong>MNIST Handwritten Digits</strong>
                    <p className="mt-1">📊 70,000 samples × 784 features → 2D projection</p>
                    <p className="mt-1">Features: 28×28 pixel intensities (784 dimensions)</p>
                    <p className="mt-1">Classes: 10 digits (0-9). Shown: 0, 1, 4, 7</p>
                    <p className="mt-1 text-green-600 dark:text-green-400">
                      PCA reduces 784D images to 2D while preserving digit shapes
                    </p>
                  </div>
                )}
              </div>
            </ControlGroup>

            {/* Algorithm Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FaInfoCircle size={14} />
                How PCA Works
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Step 1:</strong> Center data by subtracting mean
                </p>
                <p>
                  <strong>Step 2:</strong> Compute covariance matrix
                </p>
                <p>
                  <strong>Step 3:</strong> Find eigenvalues/eigenvectors
                </p>
                <p>
                  <strong>Step 4:</strong> Select principal components
                </p>
                <p>
                  <strong>Step 5:</strong> Transform data
                </p>
              </div>
            </div>

            {/* Related Algorithms */}
            <RelatedAlgorithms route="pca" type="ml" compact />
          </div>
        </div>

        {/* Theory Modal */}
        <TheoryModal
          isOpen={showExplanation}
          onClose={() => setShowExplanation(false)}
          theoryFile="/theory/ml/pca.md"
          title="Understanding Principal Component Analysis (PCA)"
        />
      </div>
    </div>
  )
}
