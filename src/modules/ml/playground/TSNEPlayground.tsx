'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { TbRotate360 } from 'react-icons/tb'
import { GiBookCover } from 'react-icons/gi'
import { useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip, Button } from '@/core/controls'
import { ThemeToggle, useTheme } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { TheoryModal } from '@/components/TheoryModal'
import { TSNEEngine } from '../engines/TSNEEngine'
import type { TSNEState, TSNEConfig } from '../engines/TSNEEngine'
import { generateTSNEDataset } from '../data/tsneDatasets'
import { drawTSNEVisualization } from '../visualizers/tsneVisualizer'
import { TSNE3DScene } from '../visualizers/TSNE3DScene'

export function TSNEPlayground() {
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )
  const { theme } = useTheme()

  const engineRef = useRef<TSNEEngine | null>(null)
  const [engineState, setEngineState] = useState<TSNEState | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // 3D View state
  const [view3D, setView3D] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  // Configuration
  const [perplexity, setPerplexity] = useState(30)
  const [learningRate, setLearningRate] = useState(200)
  const maxIterations = 1000
  const [animationSpeed, setAnimationSpeed] = useState(10) // iterations per step

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 60, right: 60, bottom: 60, left: 60 },
    }),
    []
  )

  // Initialize engine with MNIST dataset
  const initializeEngine = useCallback(() => {
    const { points, highDimData } = generateTSNEDataset('mnist-digits')

    const config: TSNEConfig = {
      inputDimensions: highDimData[0].length, // 64 dimensions (8x8 pixels)
      outputDimensions: view3D ? 3 : 2,
      perplexity,
      learningRate,
      momentum: 0.8,
      earlyExaggeration: 4,
      earlyExaggerationIter: 250,
      maxIterations,
      dataset: 'mnist-digits',
      enableLiveSimulation: false,
    }

    const engine = new TSNEEngine(config, points, highDimData)
    engineRef.current = engine
    setEngineState(engine.getState())
  }, [perplexity, learningRate, maxIterations, view3D])

  // Initialize on mount and when parameters change
  useEffect(() => {
    initializeEngine()
  }, [initializeEngine])

  // Auto-play interval
  useEffect(() => {
    if (isPlaying && engineRef.current) {
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const isDone = engineRef.current.runSteps(animationSpeed)
          setEngineState(engineRef.current.getState())

          if (isDone) {
            setIsPlaying(false)
          }
        }
      }, 50)
      return () => {
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current)
        }
      }
    }

    // Clean up when not playing
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }

    return undefined
  }, [isPlaying, animationSpeed])

  // Canvas drawing
  const { canvasRef } = useCanvas({
    draw: (ctx: CanvasRenderingContext2D) => {
      if (!engineState || view3D) return

      const canvas = ctx.canvas
      drawTSNEVisualization(ctx, canvas, engineState, {
        theme,
        showLabels: engineState.points.length < 100,
        highlightCategories: true,
        showCost: true,
      })
    },
    config: canvasConfig,
  })

  // Control handlers
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
      return
    }

    // Not playing, so start
    if (engineState?.phase === 'complete') {
      initializeEngine()
      setTimeout(() => setIsPlaying(true), 100)
      return
    }

    setIsPlaying(true)
  }

  const handleStep = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
  }, [])

  const handleRun = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.runSteps(100)
      setEngineState(engineRef.current.getState())
    }
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    initializeEngine()
  }, [initializeEngine])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">t-SNE</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowExplanation(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <GiBookCover className="w-4 h-4" />
              How It Works
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Dimensionality reduction: Visualize 64-dimensional handwritten digits in 2D/3D
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
                      disabled={engineState?.phase === 'complete' && !isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || engineState?.phase === 'complete'}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || engineState?.phase === 'complete'}
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
                    min={1}
                    max={50}
                    step={1}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 10)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">iter/step</span>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <Tooltip text="Toggle 3D View">
                    <button
                      onClick={() => {
                        setIsPlaying(false)
                        setView3D(!view3D)
                      }}
                      disabled={isPlaying}
                      className={`px-3 py-1 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        view3D
                          ? 'bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {view3D ? '3D View' : '2D View'}
                    </button>
                  </Tooltip>
                </div>

                {view3D && <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>}

                {view3D && (
                  <Tooltip text="Auto-rotate 3D view">
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        autoRotate
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <TbRotate360 size={14} />
                    </button>
                  </Tooltip>
                )}

                {engineState && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Iteration:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.iteration} / {engineState.maxIterations}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Phase:{' '}
                      <span className="font-bold text-purple-600 dark:text-purple-400 capitalize">
                        {engineState.phase === 'early-exaggeration'
                          ? 'Early Exag.'
                          : engineState.phase}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Cost:{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {engineState.cost.toFixed(4)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                {view3D ? (
                  <div className="w-full h-full">
                    {engineState ? (
                      <TSNE3DScene
                        state={engineState}
                        autoRotate={autoRotate}
                        showLabels={engineState.points.length < 100}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Run the algorithm to see the 3D visualization
                      </div>
                    )}
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Dataset Info */}
            <ControlGroup title="Dataset: MNIST Digits">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>📊 300 handwritten digit samples</p>
                <p>📐 64 dimensions (8×8 pixels)</p>
                <p>🏷️ 10 categories (digits 0-9)</p>
                <p className="text-[10px] mt-2 text-gray-500 dark:text-gray-500">
                  Each point represents an 8×8 grayscale image of a handwritten digit. t-SNE maps
                  these 64-dimensional vectors to 2D/3D while preserving local neighborhoods.
                </p>
              </div>
            </ControlGroup>

            {/* Perplexity */}
            <ControlGroup title={`Perplexity: ${perplexity}`}>
              <div className="space-y-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={perplexity}
                  onChange={(e) => setPerplexity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  disabled={isPlaying}
                />
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Balances local vs global structure. Low values (5-15) emphasize local clusters;
                  high values (30-50) reveal global relationships. Typical: 30.
                </p>
              </div>
            </ControlGroup>

            {/* Learning Rate */}
            <ControlGroup title={`Learning Rate: ${learningRate}`}>
              <div className="space-y-2">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={learningRate}
                  onChange={(e) => setLearningRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  disabled={isPlaying}
                />
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Gradient descent step size. Too low: slow convergence. Too high: unstable. Range:
                  10-1000. Typical: 100-500.
                </p>
              </div>
            </ControlGroup>

            {/* Algorithm Phases */}
            <ControlGroup title="Algorithm Phases">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 min-w-[80px]">
                    Early Exag.
                  </span>
                  <span className="text-[10px]">
                    First 250 iterations amplify distances to separate global clusters
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 min-w-[80px]">
                    Optimization
                  </span>
                  <span className="text-[10px]">
                    Remaining iterations refine local structure while maintaining global layout
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-green-600 dark:text-green-400 min-w-[80px]">
                    Complete
                  </span>
                  <span className="text-[10px]">
                    Similar digits cluster together; dissimilar digits separate
                  </span>
                </div>
              </div>
            </ControlGroup>

            {/* What to Look For */}
            <ControlGroup title="What to Look For">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                <p>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    • Digit clustering:
                  </span>{' '}
                  Similar digits (e.g., 3s, 8s) naturally group together
                </p>
                <p>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    • Confusion zones:
                  </span>{' '}
                  Look for overlaps between similar digits like 4/9 or 3/8
                </p>
                <p>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    • Handwriting variation:
                  </span>{' '}
                  Each digit cluster shows natural writing style diversity
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2">
                  💡 Tip: Try different perplexity values to see how it affects local vs global
                  structure visibility!
                </p>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/ml/tsne.md"
        title="Understanding t-SNE"
      />
    </div>
  )
}
