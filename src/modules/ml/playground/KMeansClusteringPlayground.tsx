'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo, FaRandom } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { GiBookCover } from 'react-icons/gi'
import { useCanvas } from '@/core/canvas'
import { ControlGroup, Tooltip, Button } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { TheoryModal } from '@/components/TheoryModal'
import { KMeansClusteringEngine } from '../engines/KMeansClusteringEngine'
import { useKMeansPlayground } from '../hooks/useKMeansPlayground'
import type { DataPoint } from '../types'

export function KMeansClusteringPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )
  const { animationSpeed, setAnimationSpeed, isDebugMode, setIsDebugMode } = useKMeansPlayground()

  const engineRef = useRef<KMeansClusteringEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    KMeansClusteringEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Initialization method
  const [initMethod, setInitMethod] = useState<'random' | 'kmeans++'>('kmeans++')
  const [visualizeInit, setVisualizeInit] = useState(false)

  // Comparison mode
  const [comparisonMode, setComparisonMode] = useState(false)
  const comparisonEngineRef = useRef<KMeansClusteringEngine | null>(null)
  const [comparisonEngineState, setComparisonEngineState] = useState<ReturnType<
    KMeansClusteringEngine['getState']
  > | null>(null)

  // Elbow method state
  const [elbowData, setElbowData] = useState<{ k: number; inertia: number }[]>([])
  const [isComputingElbow, setIsComputingElbow] = useState(false)
  const [selectedElbowK, setSelectedElbowK] = useState<number | null>(null)
  const [currentElbowK, setCurrentElbowK] = useState<number>(1)

  // Data management
  const [points, setPoints] = useState<DataPoint[]>([])
  const [k, setK] = useState(1)
  const [maxIterations, setMaxIterations] = useState(50)
  const [isPickingCentroids, setIsPickingCentroids] = useState(false)
  const [pickedCentroids, setPickedCentroids] = useState<DataPoint[]>([])

  // Canvas configuration - rectangular canvas
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 550,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Data bounds - adjusted for canvas aspect ratio to ensure visual distances match Euclidean distances
  // Canvas drawable area: 1120 x 470 (after padding)
  // Aspect ratio: 1120/470 ≈ 2.38
  // To maintain square visual appearance: if y range is 24, x range should be 24 * 2.38 ≈ 57
  const xMin = -28.5
  const xMax = 28.5
  const yMin = -12
  const yMax = 12

  // Cluster colors
  const clusterColors = useMemo(
    () => [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ],
    []
  )

  // Generate sample data
  const generateData = useCallback(
    (type: 'blobs' | 'circles' | 'grid' | 'uniform') => {
      const newPoints: DataPoint[] = []

      if (type === 'blobs') {
        // Generate gaussian blobs - increased density and spread across wider canvas
        const centers = [
          { x: -15, y: -5 },
          { x: -15, y: 5 },
          { x: -5, y: -5 },
          { x: -5, y: 5 },
          { x: 5, y: -5 },
          { x: 5, y: 5 },
          { x: 15, y: -5 },
          { x: 15, y: 5 },
        ]
        centers.forEach((center) => {
          for (let i = 0; i < 50; i++) {
            newPoints.push({
              x: center.x + (Math.random() - 0.5) * 6,
              y: center.y + (Math.random() - 0.5) * 6,
            })
          }
        })
      } else if (type === 'circles') {
        // Concentric circles - more points and better spread
        for (let i = 0; i < 80; i++) {
          const r = 4
          const theta = (i / 80) * Math.PI * 2
          newPoints.push({
            x: r * Math.cos(theta) + (Math.random() - 0.5) * 0.8,
            y: r * Math.sin(theta) + (Math.random() - 0.5) * 0.8,
          })
        }
        for (let i = 0; i < 100; i++) {
          const r = 8
          const theta = (i / 100) * Math.PI * 2
          newPoints.push({
            x: r * Math.cos(theta) + (Math.random() - 0.5) * 0.8,
            y: r * Math.sin(theta) + (Math.random() - 0.5) * 0.8,
          })
        }
      } else if (type === 'uniform') {
        // Uniform random distribution across the entire canvas
        for (let i = 0; i < 500; i++) {
          newPoints.push({
            x: xMin + Math.random() * (xMax - xMin),
            y: yMin + Math.random() * (yMax - yMin),
          })
        }
      } else {
        // Grid pattern - more points across wider canvas
        for (let i = -24; i <= 24; i += 6) {
          for (let j = -9; j <= 9; j += 6) {
            for (let k = 0; k < 15; k++) {
              newPoints.push({
                x: i + (Math.random() - 0.5) * 4,
                y: j + (Math.random() - 0.5) * 4,
              })
            }
          }
        }
      }

      setPoints(newPoints)
      // Clear elbow data when new data is generated
      setElbowData([])
      setSelectedElbowK(null)
      setCurrentElbowK(1)
    },
    [xMin, xMax, yMin, yMax]
  )

  // Compute Elbow Method data incrementally
  const computeElbowMethod = useCallback(async () => {
    if (points.length === 0) return

    setIsComputingElbow(true)
    setElbowData([]) // Clear previous data
    setCurrentElbowK(1)
    setSelectedElbowK(null)

    // Test k from 1 to 10 incrementally
    for (let testK = 1; testK <= 10; testK++) {
      setCurrentElbowK(testK)

      const tempEngine = new KMeansClusteringEngine({
        points,
        k: testK,
        maxIterations: 50, // Use fixed iterations for consistency
      })

      // Run to completion
      tempEngine.run()
      const state = tempEngine.getState()

      // Update the graph with the new data point
      setElbowData((prevData) => [...prevData, { k: testK, inertia: state.inertia }])

      // Small delay to show the incremental update
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setIsComputingElbow(false)
    setCurrentElbowK(1) // Reset for next run
  }, [points])

  // Initialize with sample data
  useEffect(() => {
    generateData('blobs')
  }, [generateData])

  // Initialize engine when config changes
  useEffect(() => {
    if (points.length > 0 && !isPickingCentroids) {
      const initialCentroids =
        pickedCentroids.length > 0
          ? pickedCentroids.map((p, idx) => ({ ...p, clusterId: idx }))
          : undefined

      // Main engine
      engineRef.current = new KMeansClusteringEngine({
        points,
        k,
        maxIterations,
        initialCentroids,
        initMethod,
        visualizeInit,
      })
      setEngineState(engineRef.current.getState())

      // Comparison engine (opposite init method)
      if (comparisonMode && !initialCentroids) {
        const oppositeMethod = initMethod === 'kmeans++' ? 'random' : 'kmeans++'
        comparisonEngineRef.current = new KMeansClusteringEngine({
          points,
          k,
          maxIterations,
          initMethod: oppositeMethod,
          visualizeInit: false,
        })
        setComparisonEngineState(comparisonEngineRef.current.getState())
      } else {
        comparisonEngineRef.current = null
        setComparisonEngineState(null)
      }
    }
  }, [
    points,
    k,
    maxIterations,
    pickedCentroids,
    isPickingCentroids,
    initMethod,
    visualizeInit,
    comparisonMode,
  ])

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

  // Transform canvas coordinates to data coordinates
  const toDataCoords = useCallback(
    (canvasX: number, canvasY: number) => {
      const { width, height, padding } = canvasConfig
      const x =
        xMin + ((canvasX - padding.left) / (width - padding.left - padding.right)) * (xMax - xMin)
      const y =
        yMax - ((canvasY - padding.top) / (height - padding.top - padding.bottom)) * (yMax - yMin)
      return { x, y }
    },
    [canvasConfig, xMin, xMax, yMin, yMax]
  )

  // Handle canvas click for centroid picking
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isPickingCentroids) return

      const canvas = event.currentTarget
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const canvasX = (event.clientX - rect.left) * scaleX
      const canvasY = (event.clientY - rect.top) * scaleY

      const { x, y } = toDataCoords(canvasX, canvasY)
      setPickedCentroids([...pickedCentroids, { x, y }])
    },
    [isPickingCentroids, pickedCentroids, toDataCoords]
  )

  // Helper function to draw engine state on a specific canvas
  const drawEngineState = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      state: ReturnType<KMeansClusteringEngine['getState']> | null,
      width: number,
      height: number
    ) => {
      ctx.clearRect(0, 0, width, height)

      if (!state) return

      // Calculate padding proportionally
      const padding = {
        top: (40 * height) / canvasConfig.height,
        right: (40 * width) / canvasConfig.width,
        bottom: (40 * height) / canvasConfig.height,
        left: (40 * width) / canvasConfig.width,
      }

      // Helper to transform coordinates for this specific canvas
      const toCanvasX = (x: number) =>
        padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
      const toCanvasY = (y: number) =>
        height -
        padding.bottom -
        ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1
      const originX = toCanvasX(0)
      const originY = toCanvasY(0)
      ctx.beginPath()
      ctx.moveTo(toCanvasX(xMin), originY)
      ctx.lineTo(toCanvasX(xMax), originY)
      ctx.moveTo(originX, toCanvasY(yMin))
      ctx.lineTo(originX, toCanvasY(yMax))
      ctx.stroke()

      // Draw data points
      state.points.forEach((point) => {
        const canvasX = toCanvasX(point.x)
        const canvasY = toCanvasY(point.y)

        if (point.clusterId >= 0) {
          ctx.fillStyle = clusterColors[point.clusterId % clusterColors.length]
        } else {
          ctx.fillStyle = '#94a3b8'
        }

        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw centroids
      state.centroids.forEach((centroid, idx) => {
        const canvasX = toCanvasX(centroid.x)
        const canvasY = toCanvasY(centroid.y)
        const color = clusterColors[idx % clusterColors.length]

        // Draw outer glow
        ctx.fillStyle = color + '40'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 10, 0, Math.PI * 2)
        ctx.fill()

        // Draw cross
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(canvasX - 6, canvasY)
        ctx.lineTo(canvasX + 6, canvasY)
        ctx.moveTo(canvasX, canvasY - 6)
        ctx.lineTo(canvasX, canvasY + 6)
        ctx.stroke()

        // Draw number
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(idx + 1), canvasX, canvasY)
      })
    },
    [canvasConfig, clusterColors, xMin, xMax, yMin, yMax]
  )

  // Draw function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      ctx.clearRect(0, 0, width, height)

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1
      const origin = toCanvasCoords(0, 0)
      ctx.beginPath()
      ctx.moveTo(toCanvasCoords(xMin, 0).canvasX, origin.canvasY)
      ctx.lineTo(toCanvasCoords(xMax, 0).canvasX, origin.canvasY)
      ctx.moveTo(origin.canvasX, toCanvasCoords(0, yMin).canvasY)
      ctx.lineTo(origin.canvasX, toCanvasCoords(0, yMax).canvasY)
      ctx.stroke()

      // When in picking mode, draw raw data points
      if (isPickingCentroids) {
        // Draw data points from raw points state
        points.forEach((point) => {
          const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
          ctx.fillStyle = '#94a3b8'
          ctx.beginPath()
          ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2)
          ctx.fill()
        })

        // Draw picked centroids
        pickedCentroids.forEach((centroid, idx) => {
          const { canvasX, canvasY } = toCanvasCoords(centroid.x, centroid.y)
          const color = clusterColors[idx % clusterColors.length]

          // Draw outer glow
          ctx.fillStyle = color + '40'
          ctx.beginPath()
          ctx.arc(canvasX, canvasY, 14, 0, Math.PI * 2)
          ctx.fill()

          // Draw cross
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(canvasX - 8, canvasY)
          ctx.lineTo(canvasX + 8, canvasY)
          ctx.moveTo(canvasX, canvasY - 8)
          ctx.lineTo(canvasX, canvasY + 8)
          ctx.stroke()

          // Draw number
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 10px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(idx + 1), canvasX, canvasY)
        })

        return // Don't draw engine state when picking
      }

      if (!engineState) return

      // Draw centroid trajectories in debug mode (before other elements so they're in background)
      if (isDebugMode && engineState.centroidTrajectories.size > 0 && !engineState.isInitializing) {
        engineState.centroidTrajectories.forEach((trajectory, clusterId) => {
          if (trajectory.length < 2) return // Need at least 2 points to draw a path

          const color = clusterColors[clusterId % clusterColors.length]

          // Draw trajectory path
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.setLineDash([5, 3]) // Dashed line
          ctx.globalAlpha = 0.6
          ctx.beginPath()

          const firstPoint = toCanvasCoords(trajectory[0].x, trajectory[0].y)
          ctx.moveTo(firstPoint.canvasX, firstPoint.canvasY)

          for (let i = 1; i < trajectory.length; i++) {
            const point = toCanvasCoords(trajectory[i].x, trajectory[i].y)
            ctx.lineTo(point.canvasX, point.canvasY)
          }
          ctx.stroke()
          ctx.setLineDash([]) // Reset to solid line
          ctx.globalAlpha = 1.0

          // Draw small circles at each trajectory point (except the last which is the current centroid)
          for (let i = 0; i < trajectory.length - 1; i++) {
            const point = toCanvasCoords(trajectory[i].x, trajectory[i].y)

            // Fade older points
            const age = (trajectory.length - 1 - i) / trajectory.length
            ctx.globalAlpha = 0.3 + age * 0.4

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(point.canvasX, point.canvasY, 3, 0, Math.PI * 2)
            ctx.fill()

            // Draw step number for significant points
            if (i % 2 === 0) {
              ctx.fillStyle = color
              ctx.font = 'bold 8px monospace'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'bottom'
              ctx.fillText(String(i), point.canvasX, point.canvasY - 5)
            }
          }
          ctx.globalAlpha = 1.0
        })
      }

      // Draw K-Means++ initialization visualization
      if (engineState.isInitializing && engineState.phase === 'init') {
        // Draw all data points
        points.forEach((point, idx) => {
          const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
          const isSelected = engineState.selectedCentroidIndices.includes(idx)

          if (isSelected) {
            // Already selected as centroid - don't draw as point
            return
          }

          // Color based on distance to nearest centroid
          if (engineState.candidateDistances.length > 0) {
            const maxDist = Math.max(...engineState.candidateDistances)
            const dist = engineState.candidateDistances[idx]
            const intensity = maxDist > 0 ? dist / maxDist : 0
            ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + intensity * 0.7})` // Red with varying opacity
          } else {
            ctx.fillStyle = '#94a3b8'
          }

          ctx.beginPath()
          ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2)
          ctx.fill()
        })

        // Draw selected centroids with animation
        engineState.centroids.forEach((centroid, idx) => {
          const { canvasX, canvasY } = toCanvasCoords(centroid.x, centroid.y)
          const color = clusterColors[idx % clusterColors.length]
          const isLatest = idx === engineState.centroids.length - 1

          // Draw outer glow (larger for latest)
          ctx.fillStyle = color + '40'
          ctx.beginPath()
          ctx.arc(canvasX, canvasY, isLatest ? 18 : 14, 0, Math.PI * 2)
          ctx.fill()

          // Draw cross
          ctx.strokeStyle = color
          ctx.lineWidth = isLatest ? 4 : 3
          ctx.beginPath()
          ctx.moveTo(canvasX - 8, canvasY)
          ctx.lineTo(canvasX + 8, canvasY)
          ctx.moveTo(canvasX, canvasY - 8)
          ctx.lineTo(canvasX, canvasY + 8)
          ctx.stroke()

          // Draw number
          ctx.fillStyle = '#ffffff'
          ctx.font = `bold ${isLatest ? '12px' : '10px'} monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(idx + 1), canvasX, canvasY)
        })

        return // Don't draw regular state during initialization
      }

      // Draw assignment lines (during assign phase)
      if (engineState.phase === 'assign' && engineState.currentPointIndex > 0) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
        ctx.lineWidth = 1
        engineState.points.slice(0, engineState.currentPointIndex).forEach((point) => {
          if (point.clusterId >= 0) {
            const centroid = engineState.centroids[point.clusterId]
            const p1 = toCanvasCoords(point.x, point.y)
            const p2 = toCanvasCoords(centroid.x, centroid.y)
            ctx.beginPath()
            ctx.moveTo(p1.canvasX, p1.canvasY)
            ctx.lineTo(p2.canvasX, p2.canvasY)
            ctx.stroke()
          }
        })
      }

      // Draw data points
      engineState.points.forEach((point, idx) => {
        const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
        const isBeingAssigned =
          engineState.phase === 'assign' && idx === engineState.currentPointIndex - 1

        if (point.clusterId >= 0) {
          ctx.fillStyle = clusterColors[point.clusterId % clusterColors.length]
        } else {
          ctx.fillStyle = '#94a3b8'
        }

        ctx.beginPath()
        ctx.arc(canvasX, canvasY, isBeingAssigned ? 8 : 5, 0, Math.PI * 2)
        ctx.fill()

        if (isBeingAssigned) {
          ctx.strokeStyle = '#fbbf24'
          ctx.lineWidth = 3
          ctx.stroke()
        }
      })

      // Draw centroids
      engineState.centroids.forEach((centroid, idx) => {
        const { canvasX, canvasY } = toCanvasCoords(centroid.x, centroid.y)
        const color = clusterColors[idx % clusterColors.length]

        // Draw outer glow
        ctx.fillStyle = color + '40' // Add alpha for glow
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 14, 0, Math.PI * 2)
        ctx.fill()

        // Draw cross/star shape for centroid
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(canvasX - 8, canvasY)
        ctx.lineTo(canvasX + 8, canvasY)
        ctx.moveTo(canvasX, canvasY - 8)
        ctx.lineTo(canvasX, canvasY + 8)
        ctx.stroke()

        // Draw cluster number
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(idx + 1), canvasX, canvasY)
      })
    },
    [
      canvasConfig,
      engineState,
      toCanvasCoords,
      clusterColors,
      xMin,
      xMax,
      yMin,
      yMax,
      isPickingCentroids,
      pickedCentroids,
      points,
      isDebugMode,
    ]
  )

  // Use canvas hook
  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })

  // Trigger redraw when state changes
  useEffect(() => {
    redraw()
    // Redraw comparison canvas if in comparison mode
    if (comparisonMode && comparisonEngineState) {
      // The comparison canvas will be redrawn through the ref callback
      // Force a re-render to trigger the canvas ref callback
      setComparisonEngineState({ ...comparisonEngineState })
    }
  }, [
    engineState,
    redraw,
    pickedCentroids,
    isPickingCentroids,
    comparisonEngineState,
    comparisonMode,
  ])

  // Playback controls
  const handleStep = () => {
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
    if (comparisonMode && comparisonEngineRef.current) {
      comparisonEngineRef.current.step()
      setComparisonEngineState(comparisonEngineRef.current.getState())
    }
  }

  const handleRun = () => {
    if (engineRef.current) {
      engineRef.current.run()
      setEngineState(engineRef.current.getState())
    }
    if (comparisonMode && comparisonEngineRef.current) {
      comparisonEngineRef.current.run()
      setComparisonEngineState(comparisonEngineRef.current.getState())
    }
  }

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
    }
    if (comparisonMode && comparisonEngineRef.current) {
      comparisonEngineRef.current.reset()
      setComparisonEngineState(comparisonEngineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
  }

  const handleStartPickingCentroids = () => {
    setIsPickingCentroids(true)
    setPickedCentroids([])
    // Clear the engine state to remove existing centroids from view
    setEngineState(null)
  }

  const handleCancelPickingCentroids = () => {
    if (pickedCentroids.length > 0) {
      // Update k to match the number of picked centroids
      setK(pickedCentroids.length)
      setIsPickingCentroids(false)
      // Engine will reinitialize via useEffect with picked centroids
    } else {
      // If no centroids placed, just cancel
      setIsPickingCentroids(false)
      setPickedCentroids([])
    }
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
          if (state.isConverged || state.phase === 'complete') {
            setIsPlaying(false)
            if (playIntervalRef.current) clearInterval(playIntervalRef.current)
          } else {
            engineRef.current.step()
            setEngineState(engineRef.current.getState())
          }
        }
        // Also step comparison engine
        if (comparisonMode && comparisonEngineRef.current) {
          const compState = comparisonEngineRef.current.getState()
          if (!compState.isConverged && compState.phase !== 'complete') {
            comparisonEngineRef.current.step()
            setComparisonEngineState(comparisonEngineRef.current.getState())
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">K-Means Clustering</h1>
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
          Unsupervised learning: group similar data points into clusters
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
                      disabled={engineState?.isConverged || engineState?.phase === 'complete'}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={
                        isPlaying || engineState?.isConverged || engineState?.phase === 'complete'
                      }
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={
                        isPlaying || engineState?.isConverged || engineState?.phase === 'complete'
                      }
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
                    min={10}
                    max={2000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 50)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

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
                      Phase:{' '}
                      <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">
                        {engineState.phase}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Inertia:{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {engineState.inertia.toFixed(2)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 overflow-hidden flex flex-col relative">
              {comparisonMode && comparisonEngineState ? (
                /* Comparison Mode: Two Canvases Side by Side */
                <div className="flex-1 flex gap-4 items-center justify-center">
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 text-center">
                      {initMethod === 'kmeans++' ? 'K-Means++' : 'Random'} Initialization
                    </h3>
                    <canvas
                      ref={canvasRef}
                      width={canvasConfig.width / 1.5}
                      height={canvasConfig.height / 1.5}
                      className="border border-gray-300 rounded-lg mx-auto"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                    />
                    <div className="mt-2 text-xs text-center">
                      <span className="text-gray-600 dark:text-gray-400">Iter: </span>
                      <span className="font-bold">{engineState?.iteration || 0}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-3">Inertia: </span>
                      <span className="font-bold">{engineState?.inertia.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 text-center">
                      {initMethod === 'kmeans++' ? 'Random' : 'K-Means++'} Initialization
                    </h3>
                    <canvas
                      ref={(el) => {
                        if (el && comparisonEngineState) {
                          const ctx = el.getContext('2d')
                          if (ctx) {
                            // Draw comparison engine state here - we'll use same draw logic
                            drawEngineState(
                              ctx,
                              comparisonEngineState,
                              canvasConfig.width / 1.5,
                              canvasConfig.height / 1.5
                            )
                          }
                        }
                      }}
                      width={canvasConfig.width / 1.5}
                      height={canvasConfig.height / 1.5}
                      className="border border-gray-300 rounded-lg mx-auto"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                    />
                    <div className="mt-2 text-xs text-center">
                      <span className="text-gray-600 dark:text-gray-400">Iter: </span>
                      <span className="font-bold">{comparisonEngineState?.iteration || 0}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-3">Inertia: </span>
                      <span className="font-bold">
                        {comparisonEngineState?.inertia.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Canvas Mode */
                <div className="flex-1 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={canvasConfig.width}
                    height={canvasConfig.height}
                    onClick={handleCanvasClick}
                    className={`border border-gray-300 rounded-lg ${isPickingCentroids ? 'cursor-crosshair' : ''}`}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </div>
              )}
              {isPickingCentroids && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                  {pickedCentroids.length === 0
                    ? 'Click to place centroids'
                    : `${pickedCentroids.length} centroid${pickedCentroids.length > 1 ? 's' : ''} placed`}
                </div>
              )}
              {engineState?.isInitializing && engineState?.phase === 'init' && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                  K-Means++ Init: Selecting centroid {engineState.initializationStep + 1} of {k}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Controls */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Data Generation */}
            <ControlGroup title="Data Generation">
              <div className="space-y-2">
                <button
                  onClick={() => generateData('blobs')}
                  disabled={isPlaying || isPickingCentroids}
                  className="w-full px-2 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Gaussian Blobs
                </button>
                <button
                  onClick={() => generateData('circles')}
                  disabled={isPlaying || isPickingCentroids}
                  className="w-full px-2 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Concentric Circles
                </button>
                <button
                  onClick={() => generateData('uniform')}
                  disabled={isPlaying || isPickingCentroids}
                  className="w-full px-2 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Uniform Random
                </button>
                <button
                  onClick={() => generateData('grid')}
                  disabled={isPlaying || isPickingCentroids}
                  className="w-full px-2 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  <FaRandom size={12} /> Grid Pattern
                </button>
              </div>
            </ControlGroup>

            {/* Initial Centroid Selection */}
            <ControlGroup title="Initial Centroids">
              {!isPickingCentroids ? (
                <div className="space-y-2">
                  <button
                    onClick={handleStartPickingCentroids}
                    disabled={isPlaying || points.length === 0}
                    className="w-full px-2 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 font-semibold"
                  >
                    Pick Centroids Manually
                  </button>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">
                    {pickedCentroids.length === k
                      ? '✓ Using manually picked centroids'
                      : `Using ${initMethod === 'kmeans++' ? 'K-Means++' : 'Random'} initialization`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Click on canvas to place centroids
                    <br />
                    <span className="text-[10px]">
                      Placed: {pickedCentroids.length} centroid
                      {pickedCentroids.length !== 1 ? 's' : ''}
                      {pickedCentroids.length > 0 &&
                        ` (k will be set to ${pickedCentroids.length})`}
                    </span>
                  </p>
                  <button
                    onClick={handleCancelPickingCentroids}
                    className="w-full px-2 py-2 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </ControlGroup>

            {/* Initialization Method */}
            <ControlGroup title="Initialization Method">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInitMethod('kmeans++')
                      setPickedCentroids([])
                    }}
                    disabled={isPlaying || isPickingCentroids}
                    className={`flex-1 px-2 py-2 text-xs rounded font-semibold transition-colors ${
                      initMethod === 'kmeans++'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    K-Means++
                  </button>
                  <button
                    onClick={() => {
                      setInitMethod('random')
                      setPickedCentroids([])
                    }}
                    disabled={isPlaying || isPickingCentroids}
                    className={`flex-1 px-2 py-2 text-xs rounded font-semibold transition-colors ${
                      initMethod === 'random'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    } disabled:opacity-50`}
                  >
                    Random
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visualizeInit}
                    onChange={(e) => setVisualizeInit(e.target.checked)}
                    disabled={
                      isPlaying ||
                      isPickingCentroids ||
                      initMethod === 'random' ||
                      pickedCentroids.length > 0
                    }
                    className="rounded"
                  />
                  <span>Visualize K-Means++ initialization</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.checked)}
                    disabled={isPlaying || isPickingCentroids || pickedCentroids.length > 0}
                    className="rounded"
                  />
                  <span>Compare with {initMethod === 'kmeans++' ? 'Random' : 'K-Means++'}</span>
                </label>

                {/* Educational Content */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Why K-Means++?
                  </h4>
                  <p className="text-[10px] text-blue-800 dark:text-blue-200 leading-relaxed">
                    K-Means++ is a smart initialization algorithm that selects initial centroids far
                    apart from each other. This leads to:
                  </p>
                  <ul className="text-[10px] text-blue-800 dark:text-blue-200 mt-1 ml-3 space-y-0.5 list-disc">
                    <li>Faster convergence</li>
                    <li>Better final clustering quality</li>
                    <li>More consistent results</li>
                  </ul>
                  <p className="text-[10px] text-blue-800 dark:text-blue-200 mt-2 leading-relaxed">
                    <strong>Algorithm:</strong> First centroid is chosen randomly. Each subsequent
                    centroid is selected with probability proportional to the square of its distance
                    from the nearest existing centroid.
                  </p>
                </div>
              </div>
            </ControlGroup>

            {/* Elbow Method */}
            <ControlGroup title="Elbow Method">
              <div className="space-y-2">
                {/* Elbow Method Plot */}
                {elbowData.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                      Elbow Method: Inertia vs Number of Clusters
                      {isComputingElbow && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                          (Computing k={currentElbowK}...)
                        </span>
                      )}
                    </h3>
                    <div className="relative h-48 bg-gray-50 dark:bg-gray-900 rounded border">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 400 180"
                        className="overflow-visible"
                      >
                        {/* Grid lines */}
                        <defs>
                          <pattern id="grid" width="40" height="36" patternUnits="userSpaceOnUse">
                            <path
                              d="M 40 0 L 0 0 0 36"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Axes */}
                        <line x1="30" y1="150" x2="370" y2="150" stroke="#6b7280" strokeWidth="1" />
                        <line x1="30" y1="20" x2="30" y2="150" stroke="#6b7280" strokeWidth="1" />

                        {/* Axis labels */}
                        <text
                          x="200"
                          y="190"
                          textAnchor="middle"
                          className="text-xs fill-gray-600 dark:fill-gray-400"
                        >
                          Number of Clusters (k)
                        </text>
                        <text
                          x="15"
                          y="90"
                          textAnchor="middle"
                          className="text-xs fill-gray-600 dark:fill-gray-400"
                          transform="rotate(-90 15 90)"
                        >
                          Inertia
                        </text>

                        {/* Data points and line */}
                        {(() => {
                          const maxInertia = Math.max(...elbowData.map((d) => d.inertia))
                          const minInertia = Math.min(...elbowData.map((d) => d.inertia))
                          const inertiaRange = maxInertia - minInertia || 1

                          return (
                            <>
                              {/* Line connecting points */}
                              <polyline
                                points={elbowData
                                  .map((point, index) => {
                                    const x = 30 + index * 34 // 34px spacing for k=1 to 10
                                    const y =
                                      150 - ((point.inertia - minInertia) / inertiaRange) * 120
                                    return `${x},${y}`
                                  })
                                  .join(' ')}
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="2"
                              />

                              {/* Data points */}
                              {elbowData.map((point, index) => {
                                const x = 30 + index * 34
                                const y = 150 - ((point.inertia - minInertia) / inertiaRange) * 120
                                const isSelected = selectedElbowK === point.k

                                return (
                                  <circle
                                    key={point.k}
                                    cx={x}
                                    cy={y}
                                    r={isSelected ? '6' : '4'}
                                    fill={isSelected ? '#f97316' : '#ffffff'}
                                    stroke="#f97316"
                                    strokeWidth="2"
                                    className="cursor-pointer hover:stroke-orange-400"
                                    onClick={() => {
                                      setK(point.k)
                                      setSelectedElbowK(point.k)
                                    }}
                                  />
                                )
                              })}

                              {/* X-axis tick marks and labels */}
                              {elbowData.map((point, index) => {
                                const x = 30 + index * 34
                                return (
                                  <g key={`tick-${point.k}`}>
                                    <line
                                      x1={x}
                                      y1="150"
                                      x2={x}
                                      y2="155"
                                      stroke="#6b7280"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x={x}
                                      y="170"
                                      textAnchor="middle"
                                      className="text-xs fill-gray-600 dark:fill-gray-400"
                                    >
                                      {point.k}
                                    </text>
                                  </g>
                                )
                              })}
                            </>
                          )
                        })()}
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Click on a point to set k. Optimal k is typically at the &quot;elbow&quot;
                      where inertia decreases more slowly.
                    </p>
                  </div>
                )}
                <button
                  onClick={computeElbowMethod}
                  disabled={
                    isPlaying || isPickingCentroids || points.length === 0 || isComputingElbow
                  }
                  className="w-full px-2 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                >
                  {isComputingElbow ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Computing k={currentElbowK}...
                    </>
                  ) : (
                    <>
                      <FaPlay size={12} /> Compute Elbow Method
                    </>
                  )}
                </button>
                {isComputingElbow && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Testing k values from 1 to 10...
                  </div>
                )}
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Find optimal k by looking for the &quot;elbow&quot; in the inertia curve
                </p>
              </div>
            </ControlGroup>

            {/* Hyperparameters */}
            <ControlGroup title="Algorithm Parameters">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Number of Clusters (k): {k}
                  </label>
                  <input
                    type="range"
                    value={k}
                    min={1}
                    max={8}
                    step={1}
                    onChange={(e) => {
                      setK(Number.parseInt(e.target.value))
                      setPickedCentroids([]) // Reset picked centroids when k changes
                    }}
                    disabled={isPlaying || isPickingCentroids}
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
                    min={10}
                    max={100}
                    step={10}
                    onChange={(e) => setMaxIterations(Number.parseInt(e.target.value))}
                    disabled={isPlaying || isPickingCentroids}
                    className="w-full"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Cluster Info */}
            {engineState && (
              <ControlGroup title="Cluster Sizes">
                <div className="space-y-1 text-xs">
                  {engineState.centroids.map((_centroid, idx) => {
                    const count = engineState.points.filter((p) => p.clusterId === idx).length
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: clusterColors[idx % clusterColors.length] }}
                          ></div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Cluster {idx + 1}:
                          </span>
                        </div>
                        <span className="font-mono font-semibold">{count} points</span>
                      </div>
                    )
                  })}
                </div>
              </ControlGroup>
            )}

            {/* Debug History */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
              <ControlGroup title="Iteration History">
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
                        {step.phase} | Inertia: {step.inertia.toFixed(2)}
                      </div>
                    ))}
                </div>
              </ControlGroup>
            )}

            {/* Legend */}
            <ControlGroup title="Legend">
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16">
                    <line x1="2" y1="8" x2="14" y2="8" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="14" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                  <span>Centroid (Cluster Center)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Unassigned Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-yellow-500"></div>
                  <span>Currently Assigning</span>
                </div>
                {isDebugMode && (
                  <div className="flex items-center gap-2 pt-1 mt-1 border-t border-gray-300 dark:border-gray-600">
                    <svg width="16" height="16">
                      <line
                        x1="2"
                        y1="8"
                        x2="14"
                        y2="8"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="3,2"
                      />
                    </svg>
                    <span>Centroid Trajectory</span>
                  </div>
                )}
              </div>
            </ControlGroup>

            {/* About */}
            <ControlGroup title="About K-Means & K-Means++">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Type:</strong> Unsupervised Learning
                </p>
                <p>
                  <strong>Goal:</strong> Minimize within-cluster variance
                </p>
                <p>
                  <strong>Init Methods:</strong>
                </p>
                <ul className="ml-3 space-y-0.5 list-disc">
                  <li>
                    <strong>K-Means++:</strong> Smart initialization (default) - selects centroids
                    far apart
                  </li>
                  <li>
                    <strong>Random:</strong> Randomly selects k points as initial centroids
                  </li>
                </ul>
                <p>
                  <strong>Complexity:</strong> O(n × k × i) where i = iterations
                </p>
                <p className="pt-1 border-t border-gray-300 dark:border-gray-600">
                  <strong>K-Means++ Advantage:</strong> Reduces iterations needed and improves final
                  cluster quality by up to 1000x compared to random initialization.
                </p>
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
              <RelatedAlgorithms route="k-means" type="ml" compact />
            </div>
          )}
        </div>
      </div>
      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/ml/k-means.md"
        title="Understanding K-Means Clustering"
      />
    </div>
  )
}
