'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { TbTopologyRing } from 'react-icons/tb'
import { useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle, useTheme } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { HierarchicalClusteringEngine } from '../engines/HierarchicalClusteringEngine'
import { drawHierarchicalClustering } from '../visualizers/hierarchicalClusteringVisualizer'
import type { DataPoint } from '../types'

export function HierarchicalClusteringPlayground() {
  const { theme } = useTheme()
  const engineRef = useRef<HierarchicalClusteringEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    HierarchicalClusteringEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()
  const [animationSpeed, setAnimationSpeed] = useState(500)

  // Data management
  const [points, setPoints] = useState<DataPoint[]>([])
  const [targetClusters, setTargetClusters] = useState(3)
  const [linkageType, setLinkageType] = useState<'single' | 'complete' | 'average'>('average')
  const [clusteringType, setClusteringType] = useState<'agglomerative' | 'divisive'>('agglomerative')
  const [showConnections, setShowConnections] = useState(true)

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
      padding: { top: 80, right: 40, bottom: 40, left: 40 },
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
    (type: 'blobs' | 'circles' | 'grid' | 'uniform') => {
      const newPoints: DataPoint[] = []

      if (type === 'blobs') {
        // Generate gaussian blobs
        const centers = [
          { x: -15, y: -5 },
          { x: -15, y: 5 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: 18, y: 0 },
        ]

        centers.forEach((center) => {
          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * 2 * Math.PI
            const radius = Math.random() * 3 + Math.random() * 3
            const x = center.x + radius * Math.cos(angle)
            const y = center.y + radius * Math.sin(angle)

            // Skip if out of bounds
            if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
              newPoints.push({ x, y })
            }
          }
        })
      } else if (type === 'circles') {
        // Generate concentric circles
        const centerX = 0
        const centerY = 0
        const radii = [4, 8, 12]

        radii.forEach((radius) => {
          const pointsInCircle = Math.floor(radius * 12)
          for (let i = 0; i < pointsInCircle; i++) {
            const angle = (i / pointsInCircle) * 2 * Math.PI
            const r = radius + (Math.random() - 0.5) * 1.5
            const x = centerX + r * Math.cos(angle)
            const y = centerY + r * Math.sin(angle)

            if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
              newPoints.push({ x, y })
            }
          }
        })
      } else if (type === 'grid') {
        // Generate grid pattern
        const spacing = 5
        for (let x = -20; x <= 20; x += spacing) {
          for (let y = -10; y <= 10; y += spacing) {
            const jitterX = (Math.random() - 0.5) * 2
            const jitterY = (Math.random() - 0.5) * 2
            const px = x + jitterX
            const py = y + jitterY

            if (px >= xMin && px <= xMax && py >= yMin && py <= yMax) {
              newPoints.push({ x: px, y: py })
            }
          }
        }
      } else if (type === 'uniform') {
        // Generate uniform random points
        for (let i = 0; i < 150; i++) {
          const x = Math.random() * (xMax - xMin) + xMin
          const y = Math.random() * (yMax - yMin) + yMin
          newPoints.push({ x, y })
        }
      }

      setPoints(newPoints)
      setIsPlaying(false)
    },
    [xMin, xMax, yMin, yMax]
  )

  // Initialize engine when points or config change
  useEffect(() => {
    if (points.length > 0) {
      engineRef.current = new HierarchicalClusteringEngine({
        points,
        linkageType,
        targetClusters,
        clusteringType,
      })
      setEngineState(engineRef.current.getState())
    }
  }, [points, linkageType, targetClusters, clusteringType])

  // Canvas drawing
  const drawMain = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!engineState) return

      const textColor = theme === 'dark' ? '#f1f5f9' : '#1e293b'

      drawHierarchicalClustering(
        ctx,
        canvasConfig,
        engineState,
        { xMin, xMax, yMin, yMax },
        { showConnections, textColor }
      )
    },
    [engineState, canvasConfig, xMin, xMax, yMin, yMax, showConnections, theme]
  )

  const { canvasRef: mainCanvasRef } = useCanvas({ config: canvasConfig, draw: drawMain })

  // Step functions
  const handlePlay = useCallback(() => {
    if (!engineRef.current) return

    setIsPlaying(true)
    playIntervalRef.current = setInterval(() => {
      if (!engineRef.current) return

      engineRef.current.step()
      setEngineState(engineRef.current.getState())

      if (engineRef.current.getState().isComplete) {
        setIsPlaying(false)
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current)
        }
      }
    }, animationSpeed)
  }, [animationSpeed])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }, [])

  const handleStep = useCallback(() => {
    if (!engineRef.current) return

    engineRef.current.step()
    setEngineState(engineRef.current.getState())

    if (engineRef.current.getState().isComplete) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  const handleFastForward = useCallback(() => {
    if (!engineRef.current) return

    engineRef.current.runToCompletion()
    setEngineState(engineRef.current.getState())
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }, [])

  const handleReset = useCallback(() => {
    if (!engineRef.current) return

    engineRef.current.reset()
    setEngineState(engineRef.current.getState())
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }, [])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  // Generate initial data
  useEffect(() => {
    generateData('blobs')
  }, [generateData])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Hierarchical Clustering
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Build a hierarchy of clusters using agglomerative (bottom-up) approach. Watch points merge step by step based on linkage criteria.
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause Animation' : 'Play Animation'}>
                    <button
                      onClick={isPlaying ? handlePause : handlePlay}
                      disabled={engineState?.isComplete}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward One Iteration">
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
                      onClick={handleFastForward}
                      disabled={isPlaying || engineState?.isComplete}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaFastForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset Algorithm">
                    <button
                      onClick={handleReset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Animation Speed (ms)">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                    <input
                      type="number"
                      value={animationSpeed}
                      min={10}
                      max={2000}
                      step={50}
                      onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Target Number of Clusters">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Clusters:</span>
                    <input
                      type="number"
                      value={targetClusters}
                      min={1}
                      max={8}
                      onChange={(e) => setTargetClusters(Number.parseInt(e.target.value) || 3)}
                      disabled={isPlaying}
                      className="w-12 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                    />
                  </div>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Clustering Approach">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Type:</span>
                    <select
                      value={clusteringType}
                      onChange={(e) =>
                        setClusteringType(e.target.value as 'agglomerative' | 'divisive')
                      }
                      disabled={isPlaying}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                      title="Clustering Type"
                    >
                      <option value="agglomerative">Agglomerative</option>
                      <option value="divisive">Divisive</option>
                    </select>
                  </div>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Linkage Method for Distance Calculation">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Linkage:</span>
                    <select
                      value={linkageType}
                      onChange={(e) =>
                        setLinkageType(e.target.value as 'single' | 'complete' | 'average')
                      }
                      disabled={isPlaying}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                      title="Linkage Type"
                    >
                      <option value="single">Single</option>
                      <option value="complete">Complete</option>
                      <option value="average">Average</option>
                    </select>
                  </div>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <Tooltip text="Show Cluster Connections">
                    <button
                      onClick={() => setShowConnections(!showConnections)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showConnections
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <TbTopologyRing size={16} />
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
                  onClick={() => generateData('circles')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Circles
                </button>
                <button
                  onClick={() => generateData('grid')}
                  disabled={isPlaying}
                  className="px-3 py-1.5 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Grid
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

            {/* Statistics */}
            {engineState && (
              <ControlGroup title="Statistics">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Iteration:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {engineState.currentIteration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Clusters:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {engineState.clusters.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Target Clusters:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {engineState.targetClusters}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Points:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {engineState.points.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Merges Done:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {engineState.mergeHistory.length}
                    </span>
                  </div>
                  {engineState.mergeHistory.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Distance:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {engineState.mergeHistory.at(-1)?.distance.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span
                      className={`font-semibold ${
                        engineState.isComplete ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {engineState.isComplete ? 'Complete' : 'Running'}
                    </span>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Algorithm Info */}
            <ControlGroup title="How It Works">
              <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Hierarchical Clustering</strong> creates a hierarchy of clusters:
                </p>
                
                <div className="mt-3">
                  <p className="font-semibold mb-1">Clustering Types:</p>
                  <ul className="space-y-1 ml-2">
                    <li>
                      <strong>Agglomerative (Bottom-up):</strong> Start with each point as a cluster, merge closest pairs
                    </li>
                    <li>
                      <strong>Divisive (Top-down):</strong> Start with one cluster, recursively split into smaller ones
                    </li>
                  </ul>
                </div>

                <div className="mt-3">
                  <p className="font-semibold mb-1">Linkage Types:</p>
                  <ul className="space-y-1 ml-2">
                    <li>
                      <strong>Single:</strong> Min distance
                    </li>
                    <li>
                      <strong>Complete:</strong> Max distance
                    </li>
                    <li>
                      <strong>Average:</strong> Mean distance
                    </li>
                  </ul>
                </div>
              </div>
            </ControlGroup>

            {/* Related Algorithms */}
            <ControlGroup title="Related Algorithms">
              <div className="space-y-2">
                <RelatedAlgorithms route="hierarchical-clustering" type="ml" compact />
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>
    </div>
  )
}
