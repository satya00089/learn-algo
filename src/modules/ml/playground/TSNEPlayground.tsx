'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaRedo,
  FaFilm,
  FaGlobe,
} from 'react-icons/fa'
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
import { loadMoviesForTSNE, clearTSNEMoviesCache } from '../data/movieDataLoader'
import { loadCountriesForTSNE, clearCountriesTSNECache } from '../data/countryDataLoader'
import { drawTSNEVisualization } from '../visualizers/tsneVisualizer'
import { TSNE3DScene } from '../visualizers/TSNE3DScene'
import { TSNE2DMovieScene } from '../visualizers/TSNE2DMovieScene'
import { TSNE2DCountryScene } from '../visualizers/TSNE2DCountryScene'

export function TSNEPlayground() {
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )
  const { theme } = useTheme()

  const engineRef = useRef<TSNEEngine | null>(null)
  const [engineState, setEngineState] = useState<TSNEState | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const fastForwardWorkerRef = useRef<Worker | null>(null)
  const [isFastForwarding, setIsFastForwarding] = useState(false)

  // Dataset selection
  const [dataType, setDataType] = useState<'mnist-digits' | 'movies' | 'countries'>(
    'mnist-digits'
  )
  const [isLoadingDataset, setIsLoadingDataset] = useState(false)
  const [datasetError, setDatasetError] = useState<string | null>(null)

  // 3D View state
  const [view3D, setView3D] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)

  // Configuration
  const [perplexity, setPerplexity] = useState(30)
  const [learningRate, setLearningRate] = useState(200)
  const [maxIterations, setMaxIterations] = useState(1000)
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

  // Initialize engine
  const initializeEngine = useCallback(async () => {
    fastForwardWorkerRef.current?.terminate()
    fastForwardWorkerRef.current = null
    setIsFastForwarding(false)
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }

    if (dataType === 'movies' || dataType === 'countries') {
      setIsLoadingDataset(true)
      setDatasetError(null)
      try {
        const loader = dataType === 'movies' ? loadMoviesForTSNE : loadCountriesForTSNE
        const { tsnePoints, highDimData } = await loader()
        // sklearn auto learning rate: max(n / (exaggeration×4), 50)
        // For 561 movies with exaggeration=12: max(11.7, 50) = 50
        const autoLR = Math.max(tsnePoints.length / (12 * 4), 50)
        const config: TSNEConfig = {
          inputDimensions: highDimData[0].length,
          outputDimensions: view3D ? 3 : 2,
          perplexity,
          learningRate: autoLR, // override slider — perplexity is still user-configurable
          momentum: 0.8,
          // sklearn default is 12; higher exaggeration → crisper genre separation early on
          earlyExaggeration: 12,
          earlyExaggerationIter: 250,
          maxIterations,
          dataset: dataType,
          enableLiveSimulation: false,
          init: 'pca', // matches sklearn TSNE(init='pca') — deterministic, stable clusters
        }
        const engine = new TSNEEngine(config, tsnePoints, highDimData)
        engineRef.current = engine
        setEngineState(engine.getState())
      } catch (error) {
        console.error(`Failed to load ${dataType} dataset:`, error)
        setDatasetError(`Failed to load ${dataType} dataset. Check console for details.`)
      } finally {
        setIsLoadingDataset(false)
      }
    } else {
      const { points, highDimData } = generateTSNEDataset('mnist-digits')
      const config: TSNEConfig = {
        inputDimensions: highDimData[0].length,
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
    }
  }, [perplexity, learningRate, maxIterations, view3D, dataType])

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

  useEffect(() => {
    return () => {
      fastForwardWorkerRef.current?.terminate()
    }
  }, [])

  // Canvas drawing (MNIST only — movies use TSNE2DMovieScene)
  const { canvasRef } = useCanvas({
    draw: (ctx: CanvasRenderingContext2D) => {
      if (!engineState || view3D || dataType !== 'mnist-digits') return

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
    const engine = engineRef.current
    if (!engine) return

    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }
    fastForwardWorkerRef.current?.terminate()

    const snapshot = engine.createSnapshot()
    const worker = new Worker(new URL('../workers/tsneRunWorker.ts', import.meta.url), {
      type: 'module',
    })
    fastForwardWorkerRef.current = worker
    setIsFastForwarding(true)

    worker.onmessage = (
      event: MessageEvent<{ type: 'done' | 'error'; state?: TSNEState; error?: string }>
    ) => {
      if (fastForwardWorkerRef.current !== worker) return

      if (event.data.type === 'done' && event.data.state) {
        engineRef.current = TSNEEngine.fromSnapshot({
          ...snapshot,
          state: event.data.state,
        })
        setEngineState(event.data.state)
      } else if (event.data.type === 'error') {
        console.error('t-SNE fast-forward worker failed:', event.data.error)
      }

      setIsFastForwarding(false)
      worker.terminate()
      if (fastForwardWorkerRef.current === worker) {
        fastForwardWorkerRef.current = null
      }
    }

    worker.onerror = (error) => {
      if (fastForwardWorkerRef.current !== worker) return
      console.error('t-SNE fast-forward worker error:', error)
      setIsFastForwarding(false)
      worker.terminate()
      if (fastForwardWorkerRef.current === worker) {
        fastForwardWorkerRef.current = null
      }
    }

    worker.postMessage({ type: 'run', snapshot })
  }, [])

  const handleReset = useCallback(() => {
    fastForwardWorkerRef.current?.terminate()
    fastForwardWorkerRef.current = null
    setIsFastForwarding(false)
    setIsPlaying(false)
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    if (dataType === 'movies') clearTSNEMoviesCache() // force fresh PCA init on next run
    if (dataType === 'countries') clearCountriesTSNECache()
    initializeEngine()
  }, [initializeEngine, dataType])

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
          {dataType === 'mnist-digits'
            ? 'Dimensionality reduction: Visualize 64-dimensional handwritten digits in 2D/3D'
            : dataType === 'movies'
              ? 'Dimensionality reduction: Watch 561 movies cluster by genre as t-SNE iterates over their semantic embeddings'
              : 'Dimensionality reduction: Watch countries cluster by region as t-SNE iterates over their semantic embeddings'}
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
                      disabled={(engineState?.phase === 'complete' && !isPlaying) || isFastForwarding}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || engineState?.phase === 'complete' || isFastForwarding}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || engineState?.phase === 'complete' || isFastForwarding}
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
                  <span className="text-xs text-gray-600 dark:text-gray-400">Max Iters:</span>
                  <input
                    type="number"
                    value={maxIterations}
                    min={100}
                    max={5000}
                    step={100}
                    onChange={(e) =>
                      setMaxIterations(Math.max(100, Math.min(5000, Number.parseInt(e.target.value) || 1000)))
                    }
                    className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    disabled={isPlaying}
                  />
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
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden relative">
              {isLoadingDataset ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <div className="text-gray-600 dark:text-gray-400">Loading movies &amp; computing affinities…</div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">First 50 of ~500 embedding dims · 561 movies</div>
                  </div>
                </div>
              ) : isFastForwarding ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                    <div className="text-gray-600 dark:text-gray-400">
                      Finishing t-SNE in the background...
                    </div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      The page stays responsive while the worker computes the final embedding.
                    </div>
                  </div>
                </div>
              ) : datasetError ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-600 dark:text-red-400">
                    <p className="font-semibold mb-2">Error Loading Dataset</p>
                    <p className="text-sm">{datasetError}</p>
                    <button
                      onClick={() => initializeEngine()}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : view3D ? (
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
              ) : dataType === 'movies' && engineState ? (
                <TSNE2DMovieScene state={engineState} theme={theme} />
              ) : dataType === 'countries' && engineState ? (
                <TSNE2DCountryScene state={engineState} theme={theme} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <canvas
                    ref={canvasRef}
                    width={canvasConfig.width}
                    height={canvasConfig.height}
                    className="border border-gray-300 rounded-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Dataset Info */}
            <ControlGroup title="Datasets">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setDataType('mnist-digits'); setPerplexity(30); setLearningRate(200); setMaxIterations(1000) }}
                  disabled={isPlaying || isLoadingDataset}
                  className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    dataType === 'mnist-digits'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  MNIST Digits
                </button>
                <button
                  onClick={() => { setDataType('movies'); setPerplexity(15); setLearningRate(50); setMaxIterations(1000) }}
                  disabled={isPlaying || isLoadingDataset}
                  className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ${
                    dataType === 'movies'
                      ? 'bg-orange-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  <FaFilm size={10} />
                  Movies
                </button>
                <button
                  onClick={() => { setDataType('countries'); setPerplexity(15); setLearningRate(50); setMaxIterations(1000) }}
                  disabled={isPlaying || isLoadingDataset}
                  className={`w-full px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ${
                    dataType === 'countries'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <FaGlobe size={10} />
                  Countries
                </button>
              </div>
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400">
                {dataType === 'mnist-digits' ? (
                  <div className="space-y-1">
                    <p>📊 300 handwritten digit samples</p>
                    <p>📐 64 dimensions (8×8 pixels)</p>
                    <p>🏷️ 10 categories (digits 0-9)</p>
                    <p className="text-[10px] mt-1 text-gray-500 dark:text-gray-500">
                      Each point represents an 8×8 grayscale image. t-SNE maps 64D vectors to 2D/3D preserving local neighborhoods.
                    </p>
                  </div>
                ) : dataType === 'movies' ? (
                  <div className="space-y-1">
                    <p>🎬 561 movies with genre clustering</p>
                    <p>📐 numeric + genre + keyword features</p>
                    <p>🏷️ Perplexity 15, LR 50 (sklearn auto)</p>
                    <p className="text-[10px] mt-1 text-orange-600 dark:text-orange-400">
                      Watch genre clusters form live — action, comedy, sci-fi, and horror movies drift together as t-SNE iterates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p>Country sprites with regional clustering</p>
                    <p>271 embedding dimensions + sprite metadata</p>
                    <p>Perplexity 15, LR 50 (sklearn auto)</p>
                    <p className="text-[10px] mt-1 text-emerald-600 dark:text-emerald-400">
                      Watch countries group by region and geography while the sprite sheet keeps the showcase visual and familiar.
                    </p>
                  </div>
                )}
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
                {dataType === 'mnist-digits' ? (
                  <>
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
                      💡 Tip: Try different perplexity values to see how it affects local vs global structure visibility!
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        • Genre clusters:
                      </span>{' '}
                      Action, sci-fi, horror, and comedy films group by theme
                    </p>
                    <p>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        • Franchises:
                      </span>{' '}
                      Marvel, Harry Potter, and Pixar films cluster tightly together
                    </p>
                    <p>
                      <span className="text-orange-600 dark:text-orange-400 font-semibold">
                        • Live formation:
                      </span>{' '}
                      Watch posters drift into neighbourhoods each iteration
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-2">
                      💡 Early exaggeration (0–250 iter) pushes clusters far apart; optimization refines them.
                    </p>
                  </>
                )}
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



