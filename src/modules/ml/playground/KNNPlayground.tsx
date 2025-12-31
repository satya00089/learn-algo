'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaRedo, FaRandom } from 'react-icons/fa'
import { KNNEngine } from '../engines/KNNEngine'
import { useKNNPlayground } from '../hooks/useKNNPlayground'
import { KNNDataPoint } from '../types'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup, Toggle } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'

// Color schemes for different classes
const CLASS_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
]

export function KNNPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const {
    k,
    setK,
    selectedDataset,
    setSelectedDataset,
    showDecisionBoundary,
    setShowDecisionBoundary,
    testPoint,
    setTestPoint,
  } = useKNNPlayground()

  const engineRef = useRef<KNNEngine | null>(null)
  const [currentPoints, setCurrentPoints] = useState<KNNDataPoint[]>([])
  const [classificationResult, setClassificationResult] = useState<{
    predictedLabel: number
    neighbors: { point: KNNDataPoint; distance: number }[]
    distances: number[]
  } | null>(null)

  // Dataset generators
  const generateDataset = useCallback((type: string): KNNDataPoint[] => {
    const points: KNNDataPoint[] = []

    if (type === 'blobs') {
      // Three well-separated clusters
      const centers = [
        { x: -3, y: -2, label: 0 },
        { x: 3, y: -2, label: 1 },
        { x: 0, y: 3, label: 2 },
      ]

      centers.forEach((center) => {
        for (let i = 0; i < 15; i++) {
          const angle = (Math.PI * 2 * i) / 15
          const radius = Math.random() * 1.5
          points.push({
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
            label: center.label,
          })
        }
      })
    } else if (type === 'overlapping') {
      // Overlapping clusters
      const centers = [
        { x: -1, y: 0, label: 0 },
        { x: 1, y: 0, label: 1 },
      ]

      centers.forEach((center) => {
        for (let i = 0; i < 25; i++) {
          points.push({
            x: center.x + (Math.random() - 0.5) * 3,
            y: center.y + (Math.random() - 0.5) * 3,
            label: center.label,
          })
        }
      })
    } else if (type === 'linear') {
      // Linear separable data
      for (let i = 0; i < 40; i++) {
        const x = (Math.random() - 0.5) * 8
        const y = (Math.random() - 0.5) * 6

        // Simple linear decision boundary: y = x
        const label = y > x ? 0 : 1
        points.push({ x, y, label })
      }
    } else if (type === 'complex') {
      // More complex non-linear boundary
      for (let i = 0; i < 50; i++) {
        const x = (Math.random() - 0.5) * 8
        const y = (Math.random() - 0.5) * 6

        // Circular decision boundary
        const label = x * x + y * y < 6 ? 0 : 1
        points.push({ x, y, label })
      }
    }

    return points
  }, [])

  // Initialize with dataset
  useEffect(() => {
    const points = generateDataset(selectedDataset)
    setCurrentPoints(points)

    if (points.length > 0) {
      engineRef.current = new KNNEngine({
        points,
        k,
      })
    }
  }, [selectedDataset, k, generateDataset])

  // Update engine when k changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateConfig({ k })
    }
  }, [k])

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1000,
      height: 500,
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
    }),
    []
  )

  // Handle canvas click for test point
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (currentPoints.length === 0) return

      // Find the canvas element within the clicked div
      const div = event.currentTarget
      const canvas = div.querySelector('canvas')
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()

      // Get click position relative to the actual canvas element
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top

      // Scale from displayed canvas size to actual canvas size
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const canvasX = clickX * scaleX
      const canvasY = clickY * scaleY

      // Calculate bounds from current points (same as toCanvasCoords)
      const xValues = currentPoints.map((p) => p.x)
      const yValues = currentPoints.map((p) => p.y)
      const xMin = Math.min(...xValues) - 1
      const xMax = Math.max(...xValues) + 1
      const yMin = Math.min(...yValues) - 1
      const yMax = Math.max(...yValues) + 1

      // Convert canvas coordinates back to data coordinates
      const { width, height, padding } = canvasConfig
      const dataX =
        xMin + ((canvasX - padding.left) / (width - padding.left - padding.right)) * (xMax - xMin)
      const dataY =
        yMax - ((canvasY - padding.top) / (height - padding.top - padding.bottom)) * (yMax - yMin)

      const newTestPoint = { x: dataX, y: dataY }
      setTestPoint(newTestPoint)

      // Classify the point
      if (engineRef.current) {
        const result = engineRef.current.classify(newTestPoint)
        setClassificationResult(result)
      }
    },
    [currentPoints, canvasConfig, setTestPoint]
  )

  // Transform coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => {
      const { width, height, padding } = canvasConfig

      // Calculate bounds from current points
      const xValues = currentPoints.map((p) => p.x)
      const yValues = currentPoints.map((p) => p.y)
      const xMin = Math.min(...xValues) - 1
      const xMax = Math.max(...xValues) + 1
      const yMin = Math.min(...yValues) - 1
      const yMax = Math.max(...yValues) + 1

      const canvasX =
        padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
      const canvasY =
        height -
        padding.bottom -
        ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)
      return { canvasX, canvasY }
    },
    [canvasConfig, currentPoints]
  )

  // Draw function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      ctx.clearRect(0, 0, width, height)

      if (currentPoints.length === 0) return

      // Calculate bounds
      const xValues = currentPoints.map((p) => p.x)
      const yValues = currentPoints.map((p) => p.y)
      const xMin = Math.min(...xValues) - 1
      const xMax = Math.max(...xValues) + 1
      const yMin = Math.min(...yValues) - 1
      const yMax = Math.max(...yValues) + 1

      // Draw decision boundary if enabled
      if (showDecisionBoundary && engineRef.current) {
        const boundaryPoints = engineRef.current.getDecisionBoundaryPoints(15)

        boundaryPoints.forEach(({ point, label }) => {
          const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
          ctx.fillStyle = CLASS_COLORS[label % CLASS_COLORS.length] + '20' // Add transparency
          ctx.fillRect(canvasX - 10, canvasY - 10, 20, 20)
        })
      }

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      const origin = toCanvasCoords(0, 0)
      ctx.beginPath()
      ctx.moveTo(toCanvasCoords(xMin, 0).canvasX, origin.canvasY)
      ctx.lineTo(toCanvasCoords(xMax, 0).canvasX, origin.canvasY)
      ctx.moveTo(origin.canvasX, toCanvasCoords(0, yMin).canvasY)
      ctx.lineTo(origin.canvasX, toCanvasCoords(0, yMax).canvasY)
      ctx.stroke()

      // Draw data points
      currentPoints.forEach((point) => {
        const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
        const color = CLASS_COLORS[point.label % CLASS_COLORS.length]

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 6, 0, Math.PI * 2)
        ctx.fill()

        // Add white border
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // Draw test point and classification result
      if (testPoint && classificationResult) {
        const { canvasX, canvasY } = toCanvasCoords(testPoint.x, testPoint.y)

        // Draw test point
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2)
        ctx.fill()

        // Draw predicted class indicator
        const predictedColor =
          CLASS_COLORS[classificationResult.predictedLabel % CLASS_COLORS.length]
        ctx.strokeStyle = predictedColor
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 12, 0, Math.PI * 2)
        ctx.stroke()

        // Draw lines to k nearest neighbors
        classificationResult.neighbors.forEach(
          (neighbor: { point: KNNDataPoint; distance: number }) => {
            const neighborCoords = toCanvasCoords(neighbor.point.x, neighbor.point.y)
            ctx.strokeStyle = '#666666'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(canvasX, canvasY)
            ctx.lineTo(neighborCoords.canvasX, neighborCoords.canvasY)
            ctx.stroke()
            ctx.setLineDash([])
          }
        )
      }
    },
    [
      currentPoints,
      testPoint,
      classificationResult,
      showDecisionBoundary,
      canvasConfig,
      toCanvasCoords,
    ]
  )

  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
  }, [currentPoints, testPoint, classificationResult, showDecisionBoundary, redraw])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              K-Nearest Neighbors
            </h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Interactive classification using K-nearest neighbors algorithm
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const points = generateDataset(selectedDataset)
                      setCurrentPoints(points)
                      setTestPoint(null)
                      setClassificationResult(null)
                      if (points.length > 0) {
                        engineRef.current = new KNNEngine({ points, k })
                      }
                      redraw()
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <FaRandom size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setTestPoint(null)
                      setClassificationResult(null)
                      redraw()
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <FaRedo size={12} />
                  </button>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Click on the canvas to classify a test point
                </div>

                {classificationResult && testPoint && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Predicted:{' '}
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {classificationResult.predictedLabel}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      K: <span className="font-bold text-gray-900 dark:text-white">{k}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Dataset:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {currentPoints.length} points
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden flex items-center justify-center relative">
              <div
                className="w-full h-full cursor-crosshair"
                onClick={handleCanvasClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCanvasClick(e as any)
                  }
                }}
              >
                <Canvas canvasRef={canvasRef} config={canvasConfig} />
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-3 rounded shadow-lg">
                <div className="text-xs font-semibold mb-2">Classes:</div>
                {Array.from(new Set(currentPoints.map((p) => p.label))).map((label) => (
                  <div key={label} className="flex items-center gap-2 text-xs mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CLASS_COLORS[label % CLASS_COLORS.length] }}
                    />
                    Class {label}
                  </div>
                ))}
              </div>

              {/* Classification Result Overlay */}
              {classificationResult && testPoint && (
                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-700 p-3 rounded shadow-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 text-sm">
                    Classification Result
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Predicted:</span>{' '}
                      <span
                        className="font-bold"
                        style={{
                          color:
                            CLASS_COLORS[classificationResult.predictedLabel % CLASS_COLORS.length],
                        }}
                      >
                        {classificationResult.predictedLabel}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Neighbors:</span>{' '}
                      {classificationResult.neighbors.length}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Test Point:</span> ({testPoint.x.toFixed(2)},{' '}
                      {testPoint.y.toFixed(2)})
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Dataset Selection */}
            <ControlGroup title="Sample Datasets">
              <div className="space-y-1.5">
                {[
                  { value: 'blobs', label: 'Well-Separated Blobs', desc: '3 distinct clusters' },
                  {
                    value: 'overlapping',
                    label: 'Overlapping Clusters',
                    desc: 'Harder classification',
                  },
                  { value: 'linear', label: 'Linear Boundary', desc: 'Linearly separable' },
                  { value: 'complex', label: 'Non-Linear Boundary', desc: 'Circular boundary' },
                ].map((dataset) => (
                  <button
                    key={dataset.value}
                    onClick={() => setSelectedDataset(dataset.value)}
                    className={`w-full px-3 py-2 text-left rounded transition-colors ${
                      selectedDataset === dataset.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{dataset.label}</div>
                    <div className="text-xs opacity-75">{dataset.desc}</div>
                  </button>
                ))}
              </div>
            </ControlGroup>

            {/* KNN Parameters */}
            <ControlGroup title="Algorithm Parameters">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    K Value: {k}
                  </label>
                  <input
                    type="range"
                    value={k}
                    min={1}
                    max={15}
                    step={1}
                    onChange={(e) => setK(Number.parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                    <span>1 (Precise)</span>
                    <span>15 (Smooth)</span>
                  </div>
                </div>

                <Toggle
                  label="Show Decision Boundary"
                  checked={showDecisionBoundary}
                  onChange={setShowDecisionBoundary}
                />
              </div>
            </ControlGroup>

            {/* How it Works */}
            <ControlGroup title="How KNN Works">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-3">
                <p>
                  <strong>K-Nearest Neighbors</strong> classifies a test point by finding the K
                  closest training points and using majority vote.
                </p>
                <p>
                  <strong>Distance Metric:</strong> Euclidean distance between points in 2D space.
                </p>
                <p>
                  <strong>Decision Boundary:</strong> Shows regions where each class dominates.
                  Boundaries become smoother with higher K values.
                </p>
                <p>
                  <strong>Interactive:</strong> Click anywhere on the canvas to see how a new point
                  would be classified!
                </p>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>

      {/* Related Algorithms Accordion */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsRelatedOpen(!isRelatedOpen)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            Related Algorithms
            <span className={`transform transition-transform ${isRelatedOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {isRelatedOpen && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <RelatedAlgorithms route="knn" type="ml" compact />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
