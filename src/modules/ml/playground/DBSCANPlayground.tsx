'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { TbCircleDotted, TbTopologyRing } from 'react-icons/tb'
import { useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle, useTheme } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { DBSCANEngine } from '../engines/DBSCANEngine'
import { useDBSCANPlayground } from '../hooks/useDBSCANPlayground'
import { drawDBSCANClustering } from '../visualizers/dbscanVisualizer'
import type { DataPoint } from '../types'

export function DBSCANPlayground() {
  const { theme } = useTheme()
  const {
    animationSpeed,
    setAnimationSpeed,
    showNeighborhoods,
    setShowNeighborhoods,
    showConnections,
    setShowConnections,
    isDebugMode,
    setIsDebugMode,
  } = useDBSCANPlayground()

  const engineRef = useRef<DBSCANEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<DBSCANEngine['getState']> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // DBSCAN parameters
  const [points, setPoints] = useState<DataPoint[]>([])
  const [epsilon, setEpsilon] = useState(2.5)
  const [minPts, setMinPts] = useState(4)

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

  // Data bounds
  const xMin = -28.5
  const xMax = 28.5
  const yMin = -12
  const yMax = 12

  // Generate sample data
  const generateData = useCallback((type: 'moons' | 'blobs' | 'noise' | 'dense') => {
    const newPoints: DataPoint[] = []

    if (type === 'moons') {
      // Two half-moons pattern
      const pointsPerMoon = 150
      for (let i = 0; i < pointsPerMoon; i++) {
        const angle = (i / pointsPerMoon) * Math.PI
        const noise = (Math.random() - 0.5) * 1.5
        
        // Upper moon
        newPoints.push({
          x: Math.cos(angle) * 10 - 5,
          y: Math.sin(angle) * 5 + noise + 2,
        })
        
        // Lower moon
        newPoints.push({
          x: Math.cos(angle) * 10 + 5,
          y: -Math.sin(angle) * 5 + noise - 2,
        })
      }
    } else if (type === 'blobs') {
      // Multiple Gaussian blobs
      const centers = [
        { x: -15, y: -5 },
        { x: -15, y: 5 },
        { x: 0, y: 0 },
        { x: 15, y: -5 },
        { x: 15, y: 5 },
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
    } else if (type === 'noise') {
      // Clusters with outliers
      const centers = [
        { x: -10, y: 0 },
        { x: 10, y: 0 },
      ]
      const pointsPerBlob = 80

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

      // Add outliers
      for (let i = 0; i < 40; i++) {
        newPoints.push({
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 20,
        })
      }
    } else if (type === 'dense') {
      // Variable density clusters
      const clusters = [
        { x: -12, y: 0, points: 120, radius: 3 },
        { x: 0, y: 0, points: 60, radius: 3 },
        { x: 12, y: 0, points: 30, radius: 3 },
      ]

      clusters.forEach((cluster) => {
        for (let i = 0; i < cluster.points; i++) {
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.random() * cluster.radius
          newPoints.push({
            x: cluster.x + radius * Math.cos(angle),
            y: cluster.y + radius * Math.sin(angle),
          })
        }
      })
    }

    setPoints(newPoints)
  }, [])

  // Gaussian random number generator
  function gaussianRandom(): number {
    let u = 0,
      v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }

  // Initialize engine
  useEffect(() => {
    if (points.length === 0) {
      generateData('moons')
      return
    }

    engineRef.current = new DBSCANEngine({
      points,
      epsilon,
      minPts,
    })

    setEngineState(engineRef.current.getState())
  }, [points, epsilon, minPts, generateData])

  // Canvas draw functions
  const drawMain = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (engineState) {
        const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b'
        drawDBSCANClustering(
          ctx,
          canvasConfig,
          engineState,
          xMin,
          xMax,
          yMin,
          yMax,
          showNeighborhoods,
          showConnections,
          textColor
        )
      }
    },
    [engineState, canvasConfig, xMin, xMax, yMin, yMax, showNeighborhoods, showConnections, theme]
  )

  const { canvasRef: mainCanvasRef } = useCanvas({ config: canvasConfig, draw: drawMain })

  // Control functions
  const handleStep = useCallback(() => {
    if (engineRef.current && !engineState?.isComplete) {
      const newState = engineRef.current.step()
      setEngineState(newState)
    }
  }, [engineState])

  const handlePlay = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current && !engineRef.current.getState().isComplete) {
          const newState = engineRef.current.step()
          setEngineState(newState)
        } else {
          setIsPlaying(false)
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current)
          }
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
      const newState = engineRef.current.runToCompletion()
      setEngineState(newState)
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

  // Stop playing when complete
  useEffect(() => {
    if (engineState?.isComplete && isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [engineState?.isComplete, isPlaying])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              DBSCAN: Density-Based Spatial Clustering
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Discover clusters based on density. DBSCAN automatically finds clusters of arbitrary
          shapes and identifies outliers without needing to specify the number of clusters.
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
              {/* Playback Controls */}
              <div className="flex gap-1">
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={engineState?.isComplete}
                  className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                </button>
                <button
                  onClick={handleStep}
                  disabled={isPlaying || engineState?.isComplete}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Step"
                >
                  <FaStepForward size={12} />
                </button>
                <button
                  onClick={handleFastForward}
                  disabled={isPlaying || engineState?.isComplete}
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

              {/* Speed Control */}
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

              {/* Epsilon Control */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">ε:</span>
                <input
                  type="number"
                  value={epsilon}
                  onChange={(e) => setEpsilon(Number.parseFloat(e.target.value) || 2.5)}
                  disabled={isPlaying}
                  min={0.5}
                  max={10}
                  step={0.5}
                  className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  title="Epsilon - Neighborhood Radius"
                />
              </div>

              {/* MinPts Control */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">MinPts:</span>
                <input
                  type="number"
                  value={minPts}
                  onChange={(e) => setMinPts(Number.parseInt(e.target.value) || 4)}
                  disabled={isPlaying}
                  min={1}
                  max={20}
                  step={1}
                  className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  title="Minimum Points for Dense Region"
                />
              </div>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

              {/* Visualization Controls */}
              <div className="flex items-center gap-2">
                <Tooltip text="Show ε-Neighborhoods">
                  <button
                    onClick={() => setShowNeighborhoods(!showNeighborhoods)}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                      showNeighborhoods
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <TbCircleDotted size={16} />
                  </button>
                </Tooltip>
                <Tooltip text="Show Density Connections">
                  <button
                    onClick={() => setShowConnections(!showConnections)}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                      showConnections
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <TbTopologyRing size={16} />
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
                  onClick={() => generateData('moons')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Two Moons
                </button>
                <button
                  onClick={() => generateData('blobs')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Multiple Blobs
                </button>
                <button
                  onClick={() => generateData('noise')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Blobs with Noise
                </button>
                <button
                  onClick={() => generateData('dense')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Variable Density
                </button>
              </div>
            </ControlGroup>

            {/* Statistics */}
            {engineState && (
              <ControlGroup title="Statistics">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Clusters:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{engineState.statistics.totalClusters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Core Points:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{engineState.statistics.totalCore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Border Points:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{engineState.statistics.totalBorder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Noise Points:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{engineState.statistics.totalNoise}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{engineState.points.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {engineState.isComplete ? 'Complete' : 'Running'}
                    </span>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Debug Info */}
            {isDebugMode && engineState && (
              <ControlGroup title="Debug Info">
                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400 font-mono">
                  <div>Phase: {engineState.phase}</div>
                  <div>Current Point: {engineState.currentPointIndex}</div>
                  <div>Epsilon: {epsilon}</div>
                  <div>MinPts: {minPts}</div>
                </div>
              </ControlGroup>
            )}

            {/* Algorithm Explanation */}
            <ControlGroup title="Algorithm">
              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">Parameters</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    ε (epsilon): neighborhood radius
                    <br />MinPts: minimum points for dense region
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">Point Types</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    • Core: ≥MinPts neighbors within ε
                    <br />• Border: &lt;MinPts neighbors, reachable from core
                    <br />• Noise: not reachable from any core
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-0.5">Clustering</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Connect density-reachable core points and their borders into clusters.
                  </p>
                </div>
              </div>
            </ControlGroup>

            {/* Related Algorithms */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3>Related Algorithms</h3>
              <RelatedAlgorithms route="dbscan" type="ml" compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
