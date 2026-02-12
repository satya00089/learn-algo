'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo, FaRandom } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { GiBookCover } from 'react-icons/gi'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip, Button } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { TheoryModal } from '@/components/TheoryModal'
import { LogisticRegressionEngine } from '../engines/LogisticRegressionEngine'
import { useLogisticRegressionPlayground } from '../hooks/useLogisticRegressionPlayground'
import type { DataPoint } from '../types'

export function LogisticRegressionPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )
  const { animationSpeed, setAnimationSpeed, isDebugMode, setIsDebugMode } =
    useLogisticRegressionPlayground()

  const engineRef = useRef<LogisticRegressionEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    LogisticRegressionEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Data management
  const [points, setPoints] = useState<DataPoint[]>([])
  const [learningRate, setLearningRate] = useState(0.1)
  const [maxIterations, setMaxIterations] = useState(1000)
  const [polynomialDegree, setPolynomialDegree] = useState(1)
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Sigmoid graph canvas configuration
  const sigmoidCanvasConfig = useMemo(
    () => ({
      width: 300,
      height: 200,
      padding: { top: 20, right: 20, bottom: 30, left: 40 },
    }),
    []
  )

  const xMin = -10
  const xMax = 10
  const yMin = -10
  const yMax = 10

  // Generate sample data
  const generateData = useCallback(
    (type: 'linear' | 'clusters' | 'circle' | 'diabetes' | 'credit' | 'exam' | 'xor') => {
      const newPoints: DataPoint[] = []

      if (type === 'linear') {
        // Linearly separable data
        for (let i = 0; i < 50; i++) {
          newPoints.push(
            {
              x: Math.random() * 8 - 4,
              y: Math.random() * 8 - 6,
              label: 0,
            },
            {
              x: Math.random() * 8 - 4,
              y: Math.random() * 8 + 2,
              label: 1,
            }
          )
        }
      } else if (type === 'clusters') {
        // Two distinct clusters
        for (let i = 0; i < 50; i++) {
          newPoints.push(
            {
              x: (Math.random() - 0.5) * 4 - 4,
              y: (Math.random() - 0.5) * 4 - 4,
              label: 0,
            },
            {
              x: (Math.random() - 0.5) * 4 + 4,
              y: (Math.random() - 0.5) * 4 + 4,
              label: 1,
            }
          )
        }
      } else if (type === 'circle') {
        // Circular pattern (non-linear)
        for (let i = 0; i < 100; i++) {
          const r = Math.random() * 3
          const theta = Math.random() * Math.PI * 2
          const x = r * Math.cos(theta)
          const y = r * Math.sin(theta)
          newPoints.push({ x, y, label: r < 2 ? 0 : 1 })
        }
      } else if (type === 'diabetes') {
        // Simulated: Diabetes prediction (Age vs Glucose Level)
        // Class 0: No diabetes, Class 1: Diabetes
        for (let i = 0; i < 60; i++) {
          // Healthy patients: younger, lower glucose
          const age = 20 + Math.random() * 40 // 20-60 years
          const glucose = 70 + Math.random() * 40 + (age - 20) * 0.3 // 70-120 mg/dL

          // Diabetic patients: older, higher glucose
          const age2 = 40 + Math.random() * 40 // 40-80 years
          const glucose2 = 120 + Math.random() * 60 + (age2 - 40) * 0.5 // 120-200 mg/dL

          newPoints.push(
            {
              x: (age - 45) / 10, // Normalize around 0
              y: (glucose - 100) / 20,
              label: 0,
            },
            {
              x: (age2 - 45) / 10,
              y: (glucose2 - 100) / 20,
              label: 1,
            }
          )
        }
      } else if (type === 'credit') {
        // Simulated: Credit card fraud detection (Transaction Amount vs Time of Day)
        // Class 0: Legitimate, Class 1: Fraud
        for (let i = 0; i < 70; i++) {
          // Legitimate transactions: normal hours, reasonable amounts
          const hour = 8 + Math.random() * 12 // 8am-8pm
          const amount = 10 + Math.random() * 200 // $10-$210

          // Fraudulent transactions: odd hours, high amounts
          const hour2 = Math.random() < 0.5 ? Math.random() * 6 : 20 + Math.random() * 4 // late night/early morning
          const amount2 = 200 + Math.random() * 400 // $200-$600

          newPoints.push(
            {
              x: (hour - 14) / 4,
              y: (amount - 100) / 50,
              label: 0,
            },
            {
              x: (hour2 - 14) / 4,
              y: (amount2 - 100) / 50,
              label: 1,
            }
          )
        }
      } else if (type === 'exam') {
        // Simulated: Student exam pass/fail (Study Hours vs Previous Score)
        // Class 0: Fail, Class 1: Pass
        for (let i = 0; i < 60; i++) {
          // Failing students: low study hours, low previous scores
          const studyHours = Math.random() * 3 // 0-3 hours
          const prevScore = 30 + Math.random() * 30 + studyHours * 5 // 30-60 + study bonus

          // Passing students: more study hours, higher previous scores
          const studyHours2 = 3 + Math.random() * 5 // 3-8 hours
          const prevScore2 = 50 + Math.random() * 30 + studyHours2 * 5 // 50-90 + study bonus

          newPoints.push(
            {
              x: (studyHours - 4) / 2,
              y: (prevScore - 60) / 20,
              label: 0,
            },
            {
              x: (studyHours2 - 4) / 2,
              y: (prevScore2 - 60) / 20,
              label: 1,
            }
          )
        }
      } else if (type === 'xor') {
        // XOR pattern (requires polynomial features)
        for (let i = 0; i < 50; i++) {
          // Quadrant 1 & 3: Class 0
          if (Math.random() < 0.5) {
            newPoints.push(
              {
                x: Math.random() * 4 + 1,
                y: Math.random() * 4 + 1,
                label: 0,
              },
              // Quadrant 2 & 4: Class 1
              Math.random() < 0.5
                ? {
                    x: Math.random() * 4 - 5,
                    y: Math.random() * 4 + 1,
                    label: 1,
                  }
                : {
                    x: Math.random() * 4 + 1,
                    y: Math.random() * 4 - 5,
                    label: 1,
                  }
            )
          } else {
            newPoints.push(
              {
                x: Math.random() * 4 - 5,
                y: Math.random() * 4 - 5,
                label: 0,
              },
              // Quadrant 2 & 4: Class 1
              Math.random() < 0.5
                ? {
                    x: Math.random() * 4 - 5,
                    y: Math.random() * 4 + 1,
                    label: 1,
                  }
                : {
                    x: Math.random() * 4 + 1,
                    y: Math.random() * 4 - 5,
                    label: 1,
                  }
            )
          }
        }
      }

      setPoints(newPoints)
    },
    []
  )

  // Initialize with sample data
  useEffect(() => {
    generateData('linear')
  }, [generateData])

  // Initialize engine when config changes
  useEffect(() => {
    if (points.length > 0) {
      engineRef.current = new LogisticRegressionEngine({
        points,
        learningRate,
        maxIterations,
        convergenceThreshold: 0.0001,
        polynomialDegree,
      })
      setEngineState(engineRef.current.getState())
    }
  }, [points, learningRate, maxIterations, polynomialDegree])

  // Transform coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => {
      const { width, height, padding } = canvasConfig
      const canvasX =
        padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
      const canvasY =
        height -
        padding.bottom -
        ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)
      return { canvasX, canvasY }
    },
    [canvasConfig, xMin, xMax, yMin, yMax]
  )

  // Draw function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      ctx.clearRect(0, 0, width, height)

      // Reset canvas state
      ctx.setLineDash([])

      // Draw probability heatmap (matplotlib-style) if trained and enabled
      if (showHeatmap && engineState && engineState.iteration > 0 && engineRef.current) {
        const resolution = 50
        const xStep = (xMax - xMin) / resolution
        const yStep = (yMax - yMin) / resolution

        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = xMin + i * xStep
            const y = yMin + j * yStep
            const prob = engineRef.current.getProbabilityAt(x, y)

            // Color interpolation: blue (class 0) to red (class 1)
            const r = Math.floor(prob * 239 + 16) // 16 to 255
            const b = Math.floor((1 - prob) * 239 + 16) // 255 to 16
            const g = 60 // constant

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`

            const p1 = toCanvasCoords(x, y)
            const p2 = toCanvasCoords(x + xStep, y + yStep)
            ctx.fillRect(p1.canvasX, p2.canvasY, p2.canvasX - p1.canvasX, p1.canvasY - p2.canvasY)
          }
        }
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

      // Draw decision boundary (only if model has been trained)
      // Skip drawing if no training has occurred yet
      if (!engineState || engineState.iteration === 0) {
        // Show "Click Play to start training" message
        ctx.fillStyle = '#94a3b8'
        ctx.font = '14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('👆 Click Play to start training', width / 2, 30)
      } else if (engineRef.current) {
        if (polynomialDegree === 1) {
          // Linear: draw straight line
          const boundary = engineRef.current.getDecisionBoundaryLine([xMin, xMax])
          if (boundary) {
            const p1 = toCanvasCoords(boundary.x1, boundary.y1)
            const p2 = toCanvasCoords(boundary.x2, boundary.y2)

            ctx.strokeStyle = '#8b5cf6'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(p1.canvasX, p1.canvasY)
            ctx.lineTo(p2.canvasX, p2.canvasY)
            ctx.stroke()
          }
        } else {
          // Polynomial: draw smooth curved boundary like matplotlib contour
          const resolution = 100
          const xStep = (xMax - xMin) / resolution
          const yStep = (yMax - yMin) / resolution

          // Create probability heatmap
          const heatmap: number[][] = []
          for (let i = 0; i <= resolution; i++) {
            heatmap[i] = []
            for (let j = 0; j <= resolution; j++) {
              const x = xMin + i * xStep
              const y = yMin + j * yStep
              const prob = engineRef.current.getProbabilityAt(x, y)
              heatmap[i][j] = prob
            }
          }

          // Draw contour lines using marching squares algorithm
          ctx.strokeStyle = '#8b5cf6'
          ctx.lineWidth = 3
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'

          const threshold = 0.5

          // Marching squares: process each grid cell
          for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
              // Cell corners (in standard marching squares order)
              // v00 --- v10
              //  |       |
              // v01 --- v11
              const x0 = xMin + i * xStep
              const y0 = yMin + j * yStep
              const x1 = x0 + xStep
              const y1 = y0 + yStep

              const v00 = heatmap[i][j] // bottom-left
              const v10 = heatmap[i + 1][j] // bottom-right
              const v01 = heatmap[i][j + 1] // top-left
              const v11 = heatmap[i + 1][j + 1] // top-right

              // Create binary code for marching squares case (0-15)
              let caseId = 0
              if (v00 >= threshold) caseId |= 1
              if (v10 >= threshold) caseId |= 2
              if (v11 >= threshold) caseId |= 4
              if (v01 >= threshold) caseId |= 8

              // Skip if all same (no contour in this cell)
              if (caseId === 0 || caseId === 15) continue

              // Helper function for linear interpolation
              const lerp = (val0: number, val1: number, pos0: number, pos1: number): number => {
                const denom = val1 - val0
                if (Math.abs(denom) < 1e-10) return (pos0 + pos1) / 2
                const t = (threshold - val0) / denom
                return pos0 + t * (pos1 - pos0)
              }

              // Calculate edge midpoints with interpolation
              const edges: Array<{ x: number; y: number }> = []

              // Edge 0: bottom (v00 to v10)
              if ((caseId & 1) !== (caseId & 2)) {
                edges.push({ x: lerp(v00, v10, x0, x1), y: y0 })
              }

              // Edge 1: right (v10 to v11)
              if ((caseId & 2) !== (caseId & 4)) {
                edges.push({ x: x1, y: lerp(v10, v11, y0, y1) })
              }

              // Edge 2: top (v11 to v01)
              if ((caseId & 4) !== (caseId & 8)) {
                edges.push({ x: lerp(v11, v01, x1, x0), y: y1 })
              }

              // Edge 3: left (v01 to v00)
              if ((caseId & 8) !== (caseId & 1)) {
                edges.push({ x: x0, y: lerp(v01, v00, y1, y0) })
              }

              // Draw contour line(s) based on case
              if (edges.length === 2) {
                // Simple case: one line segment
                const p1 = toCanvasCoords(edges[0].x, edges[0].y)
                const p2 = toCanvasCoords(edges[1].x, edges[1].y)

                ctx.beginPath()
                ctx.moveTo(p1.canvasX, p1.canvasY)
                ctx.lineTo(p2.canvasX, p2.canvasY)
                ctx.stroke()
              } else if (edges.length === 4) {
                // Saddle point case (5 or 10): need to resolve ambiguity
                // Use center point to determine configuration
                const centerProb = engineRef.current.getProbabilityAt(
                  x0 + xStep / 2,
                  y0 + yStep / 2
                )

                if (caseId === 5) {
                  // Case 5: bottom and top edges active
                  if (centerProb >= threshold) {
                    // Connect bottom to top (edges[0] to edges[2])
                    const p0 = toCanvasCoords(edges[0].x, edges[0].y)
                    const p2 = toCanvasCoords(edges[2].x, edges[2].y)
                    ctx.beginPath()
                    ctx.moveTo(p0.canvasX, p0.canvasY)
                    ctx.lineTo(p2.canvasX, p2.canvasY)
                    ctx.stroke()
                  } else {
                    // Connect left to right (edges[3] to edges[1])
                    const p3 = toCanvasCoords(edges[3].x, edges[3].y)
                    const p1 = toCanvasCoords(edges[1].x, edges[1].y)
                    ctx.beginPath()
                    ctx.moveTo(p3.canvasX, p3.canvasY)
                    ctx.lineTo(p1.canvasX, p1.canvasY)
                    ctx.stroke()
                  }
                } else if (caseId === 10) {
                  // Case 10: right and left edges active
                  if (centerProb >= threshold) {
                    // Connect right to left (edges[1] to edges[3])
                    const p1 = toCanvasCoords(edges[1].x, edges[1].y)
                    const p3 = toCanvasCoords(edges[3].x, edges[3].y)
                    ctx.beginPath()
                    ctx.moveTo(p1.canvasX, p1.canvasY)
                    ctx.lineTo(p3.canvasX, p3.canvasY)
                    ctx.stroke()
                  } else {
                    // Connect top to bottom (edges[2] to edges[0])
                    const p2 = toCanvasCoords(edges[2].x, edges[2].y)
                    const p0 = toCanvasCoords(edges[0].x, edges[0].y)
                    ctx.beginPath()
                    ctx.moveTo(p2.canvasX, p2.canvasY)
                    ctx.lineTo(p0.canvasX, p0.canvasY)
                    ctx.stroke()
                  }
                }
              }
            }
          }
        }
      }

      // Draw points
      points.forEach((point, idx) => {
        const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
        const prediction = engineState?.predictions[idx]
        const correct = prediction === point.label

        ctx.fillStyle = point.label === 0 ? '#3b82f6' : '#ef4444'
        ctx.strokeStyle = correct ? '#10b981' : '#f59e0b'
        ctx.lineWidth = correct ? 2 : 3

        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      })
    },
    [
      canvasConfig,
      points,
      engineState,
      toCanvasCoords,
      xMin,
      xMax,
      yMin,
      yMax,
      polynomialDegree,
      showHeatmap,
    ]
  )

  // Sigmoid function graph drawing
  const drawSigmoid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height, padding } = sigmoidCanvasConfig
      ctx.clearRect(0, 0, width, height)

      // Reset canvas state
      ctx.setLineDash([])

      const plotWidth = width - padding.left - padding.right
      const plotHeight = height - padding.top - padding.bottom

      // Draw background (full canvas - solid white to prevent transparency)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Draw border around entire canvas
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, width, height)

      // Draw plot area background
      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight)

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top)
      ctx.lineTo(padding.left, height - padding.bottom)
      ctx.stroke()

      // X-axis (at y=0.5)
      const midY = padding.top + plotHeight / 2
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(padding.left, midY)
      ctx.lineTo(width - padding.right, midY)
      ctx.stroke()
      ctx.setLineDash([])

      // Draw sigmoid curve
      const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
      const zMin = -6
      const zMax = 6
      const steps = 100

      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 3
      ctx.beginPath()

      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const z = zMin + t * (zMax - zMin)
        const y = sigmoid(z)

        const x = padding.left + t * plotWidth
        const canvasY = padding.top + (1 - y) * plotHeight

        if (i === 0) {
          ctx.moveTo(x, canvasY)
        } else {
          ctx.lineTo(x, canvasY)
        }
      }
      ctx.stroke()

      // Draw labels
      ctx.fillStyle = '#64748b'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      // Y-axis labels
      ctx.fillText('1', padding.left - 5, padding.top)
      ctx.fillText('0.5', padding.left - 5, midY)
      ctx.fillText('0', padding.left - 5, height - padding.bottom)

      // X-axis labels
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('z', width / 2, height - padding.bottom + 5)

      // Title
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#374151'
      ctx.fillText('σ(z) = 1 / (1 + e⁻ᶻ)', width / 2, 5)
    },
    [sigmoidCanvasConfig]
  )

  // Use canvas hooks
  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })
  const { canvasRef: sigmoidCanvasRef } = useCanvas({
    config: sigmoidCanvasConfig,
    draw: drawSigmoid,
  })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, redraw])

  // Playback controls
  const handleStep = () => {
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleRun = () => {
    if (engineRef.current) {
      engineRef.current.run()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    } else {
      if (!engineRef.current || engineState?.isConverged) return
      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isConverged) {
            setIsPlaying(false)
            if (playIntervalRef.current) clearInterval(playIntervalRef.current)
          } else {
            engineRef.current.step()
            setEngineState(engineRef.current.getState())
          }
        }
      }, animationSpeed)
    }
  }

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Logistic Regression
            </h1>
          </div>
          <div className="flex items-center gap-2">
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
          Binary classification with gradient descent optimization
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
                      disabled={engineState?.isConverged}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || engineState?.isConverged}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || engineState?.isConverged}
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
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  title="Toggle Probability Heatmap"
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    showHeatmap
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Heatmap
                </button>

                <button
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                    isDebugMode
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <VscDebugAltSmall size={16} />
                </button>

                {engineState && (
                  <div className="ml-auto flex items-center gap-4 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      Iteration:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.iteration}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Cost:{' '}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {engineState.cost.toFixed(4)}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Accuracy:{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {(engineState.accuracy * 100).toFixed(1)}%
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden flex items-center justify-center">
              <Canvas canvasRef={canvasRef} config={canvasConfig} />
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Data Generation */}
            <ControlGroup title="Synthetic Datasets">
              <div className="space-y-1.5">
                <button
                  onClick={() => generateData('linear')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> Linear Separable
                </button>
                <button
                  onClick={() => generateData('clusters')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> Two Clusters
                </button>
                <button
                  onClick={() => generateData('circle')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> Circular (Hard)
                </button>
                <button
                  onClick={() => generateData('xor')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-pink-600 hover:bg-pink-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> XOR Pattern
                </button>
              </div>
            </ControlGroup>

            {/* Real-World Datasets */}
            <ControlGroup title="Real-World Examples">
              <div className="space-y-1.5">
                <button
                  onClick={() => generateData('diabetes')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> Diabetes Risk
                </button>
                <button
                  onClick={() => generateData('credit')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> Fraud Detection
                </button>
                <button
                  onClick={() => generateData('exam')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5"
                >
                  <FaRandom size={10} /> Exam Pass/Fail
                </button>
              </div>
            </ControlGroup>

            {/* Hyperparameters */}
            <ControlGroup title="Hyperparameters">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Polynomial Degree: {polynomialDegree}{' '}
                    {polynomialDegree === 1 ? '(Linear)' : '(Curved)'}
                  </label>
                  <input
                    type="range"
                    value={polynomialDegree}
                    min={1}
                    max={3}
                    step={1}
                    onChange={(e) => setPolynomialDegree(Number.parseInt(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 dark:text-gray-500 mt-0.5">
                    <span>1 (Line)</span>
                    <span>2 (Curve)</span>
                    <span>3 (Complex)</span>
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Learning Rate: {learningRate}
                  </label>
                  <input
                    type="range"
                    value={learningRate}
                    min={0.01}
                    max={1}
                    step={0.01}
                    onChange={(e) => setLearningRate(Number.parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Max Iterations: {maxIterations}
                  </label>
                  <input
                    type="range"
                    value={maxIterations}
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(e) => setMaxIterations(Number.parseInt(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Model Info */}
            {engineState && (
              <ControlGroup title="Model Parameters">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">w₁:</span>
                    <span className="font-mono font-semibold">
                      {engineState.params.weights[0].toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">w₂:</span>
                    <span className="font-mono font-semibold">
                      {engineState.params.weights[1].toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bias:</span>
                    <span className="font-mono font-semibold">
                      {engineState.params.bias.toFixed(4)}
                    </span>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Debug History */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
              <ControlGroup title="Training History">
                <div className="space-y-1 max-h-40 overflow-y-auto text-[10px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-blue-100 dark:[&::-webkit-scrollbar-track]:bg-blue-900/30 [&::-webkit-scrollbar-thumb]:bg-blue-300 dark:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded">
                  {engineState.history
                    .slice()
                    .reverse()
                    .map((step, idx) => (
                      <div
                        key={step.iteration}
                        className={`p-1.5 rounded ${
                          idx === 0
                            ? 'bg-blue-100 dark:bg-blue-800/30 font-semibold'
                            : 'bg-gray-50 dark:bg-gray-900/50'
                        }`}
                      >
                        <span className="text-blue-600 dark:text-blue-400">#{step.iteration}</span>{' '}
                        Cost: {step.cost.toFixed(4)} | Acc: {(step.accuracy * 100).toFixed(1)}%
                      </div>
                    ))}
                </div>
              </ControlGroup>
            )}

            {/* Legend */}
            <ControlGroup title="Legend">
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Class 0 (Blue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Class 1 (Red)</span>
                </div>
                <div className="flex items-center gap-2">
                  {polynomialDegree === 1 ? (
                    <div className="w-6 h-0.5 bg-purple-500"></div>
                  ) : (
                    <div className="w-6 h-2 bg-purple-500 rounded-full opacity-50"></div>
                  )}
                  <span>Decision Boundary {polynomialDegree > 1 ? '(Curved)' : '(Line)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
                  <span>Correct Prediction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-yellow-500"></div>
                  <span>Incorrect Prediction</span>
                </div>
              </div>
            </ControlGroup>

            {/* Sigmoid Graph */}
            <ControlGroup title="Sigmoid Function">
              <div className="flex justify-center bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                <Canvas canvasRef={sigmoidCanvasRef} config={sigmoidCanvasConfig} />
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 text-center">
                <p>Maps any input z to probability [0, 1]</p>
                <p className="text-[9px] mt-0.5">Output = 0.5 when z = 0</p>
              </div>
            </ControlGroup>

            {/* Dataset Info */}
            <ControlGroup title="Dataset Info">
              <div className="text-[9px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Diabetes Risk:</strong> Age vs Glucose
                </p>
                <p>
                  <strong>Fraud Detection:</strong> Time vs Amount
                </p>
                <p>
                  <strong>Exam Pass/Fail:</strong> Study Hours vs Score
                </p>
                <p>
                  <strong>XOR Pattern:</strong> Requires degree ≥ 2
                </p>
              </div>
            </ControlGroup>

            {/* About */}
            <ControlGroup title="About">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Sigmoid:</strong> σ(z) = 1 / (1 + e^(-z))
                </p>
                <p>
                  <strong>Cost:</strong> Binary Cross-Entropy
                </p>
                <p>
                  <strong>Optimization:</strong> Gradient Descent
                </p>
                <p>
                  <strong>Decision Boundary:</strong>
                </p>
                <p className="pl-2">• Degree 1: Straight line</p>
                <p className="pl-2">• Degree 2+: Curved boundary</p>
                <p>
                  <strong>Complexity:</strong> O(n × d² × iter)
                </p>
                <p className="text-[9px] italic">where d = polynomial degree</p>
              </div>
            </ControlGroup>
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
                <RelatedAlgorithms route="logistic-regression" type="ml" compact />
              </div>
            )}
          </div>
        </div>
      </div>

      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/ml/logistic-regression.md"
        title="Understanding Logistic Regression"
      />
    </div>
  )
}
