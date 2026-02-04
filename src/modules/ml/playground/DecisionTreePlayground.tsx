'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaRedo, FaRandom, FaTree, FaStepForward } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { MdGridOn } from 'react-icons/md'
import { BiNetworkChart } from 'react-icons/bi'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { DecisionTreeEngine } from '../engines/DecisionTreeEngine'
import type { DataPoint } from '../algorithms/decisionTree'

/**
 * Decision Tree Playground
 * Interactive visualization for binary classification with decision trees
 */
export function DecisionTreePlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)

  // Engine and state
  const engineRef = useRef<DecisionTreeEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<DecisionTreeEngine['getState']> | null>(
    null
  )

  // Configuration
  const [maxDepth, setMaxDepth] = useState(3)
  const [minSamplesSplit, setMinSamplesSplit] = useState(2)
  const [criterion, setCriterion] = useState<'entropy' | 'gini'>('gini')
  const [numPoints, setNumPoints] = useState(50)

  // Visualization state
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true)
  const [showTreeStructure, setShowTreeStructure] = useState(false)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 500,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Data bounds
  const xMin = -10
  const xMax = 10
  const yMin = -10
  const yMax = 10

  /**
   * Generate random classification data
   */
  const generateData = useCallback(() => {
    const points: DataPoint[] = []
    const halfPoints = Math.floor(numPoints / 2)

    // Generate class 0 points (cluster around bottom-left)
    for (let i = 0; i < halfPoints; i++) {
      points.push({
        x: (Math.random() - 0.5) * 8 - 2,
        y: (Math.random() - 0.5) * 8 - 2,
        label: 0,
      })
    }

    // Generate class 1 points (cluster around top-right)
    for (let i = 0; i < numPoints - halfPoints; i++) {
      points.push({
        x: (Math.random() - 0.5) * 8 + 2,
        y: (Math.random() - 0.5) * 8 + 2,
        label: 1,
      })
    }

    setDataPoints(points)
  }, [numPoints])

  // Initialize data
  useEffect(() => {
    generateData()
  }, [generateData])

  // Initialize engine when data or config changes
  useEffect(() => {
    if (dataPoints.length === 0) return

    engineRef.current = new DecisionTreeEngine({
      data: dataPoints,
      maxDepth,
      minSamplesSplit,
      criterion,
    })
    setEngineState(engineRef.current.getState())
  }, [dataPoints, maxDepth, minSamplesSplit, criterion])

  /**
   * Step execution
   */
  const handleStep = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.step()
    setEngineState(engineRef.current.getState())
  }, [])

  /**
   * Run to completion
   */
  const handleRun = useCallback(() => {
    if (!engineRef.current) return
    engineRef.current.run()
    setEngineState(engineRef.current.getState())
  }, [])

  /**
   * Play/Pause toggle
   */
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = undefined
      }
    } else {
      if (!engineRef.current) return

      const currentState = engineRef.current.getState()
      if (currentState.isBuilt) {
        return
      }

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isBuilt) {
            setIsPlaying(false)
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current)
              playIntervalRef.current = undefined
            }
          } else {
            engineRef.current.step()
            setEngineState(engineRef.current.getState())
          }
        }
      }, 800) // Build one level every 800ms
    }
  }, [isPlaying])

  /**
   * Reset the tree
   */
  const reset = useCallback(() => {
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

  /**
   * Draw tree structure visualization
   */
  const drawTreeStructure = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      tree: NonNullable<typeof engineState>['tree'],
      width: number
    ) => {
      if (!tree) return

      const treeX = width - 300
      const treeY = 60
      const nodeRadius = 20
      const levelHeight = 60

      const drawNode = (
        node: typeof tree,
        x: number,
        y: number,
        horizontalSpacing: number,
        depth: number
      ) => {
        if (!node) return

        // Draw node circle
        let fillColor: string
        if (node.isLeaf) {
          fillColor = node.prediction === 0 ? '#3b82f6' : '#ef4444'
        } else {
          fillColor = '#94a3b8'
        }
        ctx.fillStyle = fillColor
        ctx.beginPath()
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI)
        ctx.fill()

        // Draw node text
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (node.isLeaf) {
          ctx.fillText(node.prediction!.toString(), x, y)
        } else {
          ctx.fillText(`${node.feature}≤${node.threshold?.toFixed(1)}`, x, y - 5)
          ctx.font = '10px Arial'
          ctx.fillText(`n=${node.samples}`, x, y + 7)
        }

        // Draw children
        if (!node.isLeaf && node.left && node.right) {
          const childY = y + levelHeight
          const leftX = x - horizontalSpacing
          const rightX = x + horizontalSpacing

          // Draw lines to children
          ctx.strokeStyle = '#94a3b8'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x, y + nodeRadius)
          ctx.lineTo(leftX, childY - nodeRadius)
          ctx.moveTo(x, y + nodeRadius)
          ctx.lineTo(rightX, childY - nodeRadius)
          ctx.stroke()

          // Recursively draw children
          drawNode(node.left, leftX, childY, horizontalSpacing / 2, depth + 1)
          drawNode(node.right, rightX, childY, horizontalSpacing / 2, depth + 1)
        }
      }

      drawNode(tree, treeX, treeY, 80, 0)
    },
    []
  )

  /**
   * Draw function for canvas
   */
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Helper to convert data coords to canvas coords
      const toCanvasX = (x: number) => {
        return ((x - xMin) / (xMax - xMin)) * (width - 80) + 40
      }
      const toCanvasY = (y: number) => {
        return height - (((y - yMin) / (yMax - yMin)) * (height - 80) + 40)
      }

      // Draw coordinate axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(toCanvasX(xMin), toCanvasY(0))
      ctx.lineTo(toCanvasX(xMax), toCanvasY(0))
      ctx.moveTo(toCanvasX(0), toCanvasY(yMin))
      ctx.lineTo(toCanvasX(0), toCanvasY(yMax))
      ctx.stroke()

      // Draw decision boundary if tree is built
      if (showDecisionBoundary && engineState?.tree && engineRef.current) {
        const resolution = 50
        const stepX = (xMax - xMin) / resolution
        const stepY = (yMax - yMin) / resolution

        // Create a grid and predict each cell
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = xMin + i * stepX
            const y = yMin + j * stepY
            const prediction = engineRef.current.predict({ x, y })

            if (prediction !== null) {
              ctx.fillStyle =
                prediction === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)'
              ctx.fillRect(
                toCanvasX(x),
                toCanvasY(y + stepY),
                (stepX * (width - 80)) / (xMax - xMin),
                (stepY * (height - 80)) / (yMax - yMin)
              )
            }
          }
        }
      }

      // Draw data points
      for (const point of dataPoints) {
        const canvasX = toCanvasX(point.x)
        const canvasY = toCanvasY(point.y)

        ctx.fillStyle = point.label === 0 ? '#3b82f6' : '#ef4444'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI)
        ctx.fill()

        // Add border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw tree structure if enabled
      if (showTreeStructure && engineState?.tree) {
        drawTreeStructure(ctx, engineState.tree, width)
      }

      // Draw debug info if enabled
      if (isDebugMode && engineState?.tree) {
        ctx.save()
        ctx.font = '12px monospace'
        ctx.fillStyle = '#1e293b'
        ctx.textAlign = 'left'

        let yOffset = 20
        ctx.fillStyle = '#7c3aed'
        ctx.font = 'bold 14px monospace'
        ctx.fillText('🐛 DEBUG MODE', 20, yOffset)
        yOffset += 25

        ctx.font = '11px monospace'
        ctx.fillStyle = '#475569'

        ctx.fillText(`Current Depth: ${engineState.currentDepth} / ${maxDepth}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Total Nodes: ${engineState.totalNodes}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Nodes to Expand: ${engineState.nodesToExpand.length}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Tree Depth: ${engineState.treeDepth}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Accuracy: ${(engineState.accuracy * 100).toFixed(2)}%`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Criterion: ${criterion}`, 20, yOffset)
        yOffset += 16
        ctx.fillText(`Min Samples Split: ${minSamplesSplit}`, 20, yOffset)

        ctx.restore()
      }
    },
    [
      canvasConfig,
      dataPoints,
      engineState,
      showDecisionBoundary,
      showTreeStructure,
      isDebugMode,
      maxDepth,
      criterion,
      minSamplesSplit,
      xMin,
      xMax,
      yMin,
      yMax,
      drawTreeStructure,
    ]
  )

  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, showDecisionBoundary, showTreeStructure, redraw])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Decision Tree</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Binary classification using recursive tree splitting with entropy or Gini impurity
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={engineState?.isBuilt}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step">
                    <button
                      onClick={handleStep}
                      disabled={engineState?.isBuilt || isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={engineState?.isBuilt || isPlaying}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaTree size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset">
                    <button
                      onClick={reset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="flex items-center gap-1.5">
                  <Tooltip text="Number of Data Points">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Points:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={numPoints}
                    min={20}
                    max={200}
                    step={10}
                    onChange={(e) => setNumPoints(Number.parseInt(e.target.value) || 20)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Visualization Toggles with Icons */}
                <div className="flex items-center gap-2">
                  <Tooltip text="Debug Mode">
                    <button
                      onClick={() => setIsDebugMode(!isDebugMode)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        isDebugMode
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <VscDebugAltSmall size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Decision Boundary">
                    <button
                      onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showDecisionBoundary
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <MdGridOn size={16} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Tree Structure">
                    <button
                      onClick={() => setShowTreeStructure(!showTreeStructure)}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                        showTreeStructure
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <BiNetworkChart size={16} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Generate New Random Data">
                  <button
                    onClick={generateData}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                  >
                    <FaRandom size={12} />
                    New Data
                  </button>
                </Tooltip>

                {engineState?.isBuilt && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Accuracy:{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {(engineState.accuracy * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Nodes:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.totalNodes}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Depth:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.treeDepth}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col min-h-0">
              <div className="flex-1 flex items-center justify-center min-h-0">
                <Canvas canvasRef={canvasRef} config={canvasConfig} className="w-full h-full" />
              </div>

              {/* Color Legend */}
              <div className="flex items-center justify-center gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Class 0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Class 1</span>
                </div>
                {showDecisionBoundary && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500/10"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Region 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500/10"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-300">Region 1</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Information Panels */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Current State */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-right">
                    {engineState.isBuilt
                      ? '✓ Built'
                      : engineState.tree
                        ? '⏳ Building...'
                        : '○ Not Started'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Current Depth:</span>
                  <span className="font-semibold text-right">
                    {engineState.tree ? engineState.currentDepth : '-'} / {maxDepth}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className="font-semibold text-right">
                    {engineState.tree ? `${(engineState.accuracy * 100).toFixed(1)}%` : '-'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Total Nodes:</span>
                  <span className="font-semibold text-right">
                    {engineState.tree ? engineState.totalNodes : '-'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Tree Depth:</span>
                  <span className="font-semibold text-right">
                    {engineState.tree ? engineState.treeDepth : '-'}
                  </span>
                </div>
              </ControlGroup>
            )}

            {/* Tree Parameters */}
            <ControlGroup title="Tree Parameters">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Max Depth: {maxDepth}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    <span>1 (Simple)</span>
                    <span>8 (Complex)</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Min Samples Split: {minSamplesSplit}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={minSamplesSplit}
                    onChange={(e) => setMinSamplesSplit(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    <span>2 (Precise)</span>
                    <span>20 (General)</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Split Criterion
                  </label>
                  <select
                    value={criterion}
                    onChange={(e) => setCriterion(e.target.value as 'entropy' | 'gini')}
                    className="w-full mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                  >
                    <option value="gini">Gini Impurity</option>
                    <option value="entropy">Entropy (Information Gain)</option>
                  </select>
                </div>
              </div>
            </ControlGroup>

            {/* Algorithm Info */}
            <ControlGroup title="About Decision Trees">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white">Time Complexity:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Training: O(n × m × log n)</li>
                  <li>Prediction: O(log n)</li>
                </ul>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Space Complexity:</strong> O(n)
                </p>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Interpretable:</strong> Yes
                </p>
              </div>
            </ControlGroup>

            {/* How It Works */}
            <ControlGroup title="How It Works">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  Decision Trees recursively partition the feature space by choosing the best split
                  at each node based on information gain or Gini impurity reduction.
                </p>
                <p>
                  <strong className="text-gray-800 dark:text-white">Gini Impurity:</strong> Measures
                  how often a randomly chosen element would be incorrectly labeled. Lower is better.
                </p>
                <p>
                  <strong className="text-gray-800 dark:text-white">Entropy:</strong> Measures the
                  randomness in the labels. Splits maximize information gain.
                </p>
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-[10px]">
                    💡 Tip: Try different max depths to see how tree complexity affects decision
                    boundaries!
                  </p>
                </div>
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
              <RelatedAlgorithms route="decision-tree" type="ml" compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
