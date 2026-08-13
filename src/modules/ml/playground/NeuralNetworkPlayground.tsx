'use client'

import { useEffect, useRef, useCallback, useState, useMemo, type ReactElement } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo, FaPlus, FaMinus } from 'react-icons/fa'
import { Canvas, useCanvas } from '@/core/canvas'
import { Tooltip, ShareButton } from '@/core/controls'
import {
  NeuralNetworkEngine,
  type ActivationFunction,
  type RegularizationType,
  type NeuralNetworkState,
} from '../engines/NeuralNetworkEngine'
import { divergingColor, type NeuronTileGrid } from '../visualizers/neuralNetworkVisualizer'
import { generateNeuralNetworkDataset, splitTrainTest } from '../algorithms/neuralNetworkDatasets'
import type { NeuralNetworkDatasetType } from '../algorithms/neuralNetworkDatasets'
import { useNeuralNetworkPlayground } from '../hooks/useNeuralNetworkPlayground'
import type { DataPoint } from '../types'
import { PlaygroundHeader } from '@/components/PlaygroundHeader'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { TheoryModal } from '@/components/TheoryModal'

const MAX_EPOCHS = 3000
const CONVERGENCE_THRESHOLD = 1e-7
const MIN_HIDDEN_LAYERS = 0
const MAX_HIDDEN_LAYERS = 6
const MIN_NEURONS = 1
const MAX_NEURONS = 8
const TILE_RESOLUTION = 10
const OUTPUT_RESOLUTION = 60
const OUTPUT_DISPLAY_SIZE = 360 // capped so the output panel stays compact, not oversized

const LEARNING_RATE_PRESETS = [0.00001, 0.0001, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10]
const REG_RATE_PRESETS = [0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1, 3, 10]

const DATASETS: NeuralNetworkDatasetType[] = ['circle', 'xor', 'gaussian', 'spiral']
const DATASET_LABELS: Record<NeuralNetworkDatasetType, string> = {
  circle: 'Circle',
  xor: 'Exclusive Or',
  gaussian: 'Gaussian',
  spiral: 'Spiral',
}

const xMin = -6
const xMax = 6
const yMin = -6
const yMax = 6

// Network diagram is plain DOM + SVG (no canvas) — small per-neuron tiles and
// SVG connection lines sitting directly on the panel, matching TF Playground's
// look instead of one filled, boxed-looking canvas rectangle.
const NET_DESIGN_WIDTH = 680
const NET_DESIGN_HEIGHT = 360
const NET_PADDING = { top: 26, right: 34, bottom: 10, left: 34 }
const NEURON_SIZE = 32

function drawDatasetPreview(canvas: HTMLCanvasElement, type: NeuralNetworkDatasetType) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  const pts = generateNeuralNetworkDataset(type, { numPoints: 60, noise: 0.05, seed: 99 })
  pts.forEach((p) => {
    const px = ((p.x - xMin) / (xMax - xMin)) * width
    const py = height - ((p.y - yMin) / (yMax - yMin)) * height
    ctx.fillStyle = p.label === 0 ? '#f59322' : '#0877bd'
    ctx.beginPath()
    ctx.arc(px, py, 1.6, 0, Math.PI * 2)
    ctx.fill()
  })
}

function DatasetThumb({
  type,
  active,
  disabled,
  onClick,
}: {
  type: NeuralNetworkDatasetType
  active: boolean
  disabled: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) drawDatasetPreview(ref.current, type)
  }, [type])

  return (
    <Tooltip text={DATASET_LABELS[type]}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full aspect-square rounded border-2 overflow-hidden bg-white dark:bg-gray-900 transition-colors disabled:opacity-50 ${
          active
            ? 'border-indigo-500 ring-2 ring-indigo-400/50'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <canvas ref={ref} width={48} height={48} className="w-full h-full" />
      </button>
    </Tooltip>
  )
}

/** A single neuron's mini decision-pattern tile — its own tiny canvas, not part of one big diagram canvas. */
function NeuronTile({ grid, size = NEURON_SIZE }: { grid?: NeuronTileGrid; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !grid || grid.length === 0) return

    const resolution = grid.length
    const cell = canvas.width / resolution
    let maxAbs = 1e-6
    for (const col of grid) for (const v of col) maxAbs = Math.max(maxAbs, Math.abs(v))

    for (let cx = 0; cx < resolution; cx++) {
      for (let cy = 0; cy < resolution; cy++) {
        ctx.fillStyle = divergingColor(grid[cx][cy], maxAbs)
        ctx.fillRect(cx * cell, cy * cell, cell + 0.5, cell + 0.5)
      }
    }
  }, [grid])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="rounded-sm border border-gray-300 dark:border-gray-600"
      style={{ width: size, height: size }}
    />
  )
}

function computeNetworkLayout(layerCounts: number[]) {
  const drawWidth = NET_DESIGN_WIDTH - NET_PADDING.left - NET_PADDING.right
  const drawHeight = NET_DESIGN_HEIGHT - NET_PADDING.top - NET_PADDING.bottom
  const colSpacing = layerCounts.length > 1 ? drawWidth / (layerCounts.length - 1) : 0
  return layerCounts.map((count, col) => {
    const x = NET_PADDING.left + col * colSpacing
    const rowSpacing = drawHeight / (count + 1)
    return Array.from({ length: count }, (_, row) => ({
      x,
      y: NET_PADDING.top + (row + 1) * rowSpacing,
    }))
  })
}

/** The network diagram itself: DOM-positioned neuron tiles + an SVG overlay for
 * weighted connections. No bounding canvas — it sits directly on the card's
 * own background, the way TF Playground's diagram does. */
function NetworkDiagram({
  layers,
  neuronTiles,
}: {
  layers: NeuralNetworkState['layers']
  neuronTiles: NeuronTileGrid[][]
}) {
  const positions = useMemo(
    () => computeNetworkLayout(layers.map((l) => l.neuronCount)),
    [layers]
  )

  if (layers.length === 0) return null

  let maxAbsWeight = 1e-6
  for (const layer of layers) {
    for (const row of layer.weights) {
      for (const w of row) maxAbsWeight = Math.max(maxAbsWeight, Math.abs(w))
    }
  }

  const connections: ReactElement[] = []
  for (let col = 1; col < layers.length; col++) {
    const layer = layers[col]
    for (let j = 0; j < layer.weights.length; j++) {
      for (let i = 0; i < layer.weights[j].length; i++) {
        const weight = layer.weights[j][i]
        const magnitude = Math.abs(weight) / maxAbsWeight
        const from = positions[col - 1][i]
        const to = positions[col][j]
        if (!from || !to) continue
        connections.push(
          <line
            key={`${col}-${j}-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={divergingColor(weight, maxAbsWeight)}
            strokeWidth={Math.min(4, Math.max(0.5, 0.5 + magnitude * 4))}
            strokeOpacity={Math.min(1, Math.max(0.2, 0.2 + magnitude * 0.8))}
          />
        )
      }
    }
  }

  return (
    <div
      className="relative w-full mx-auto"
      style={{ maxWidth: NET_DESIGN_WIDTH, aspectRatio: `${NET_DESIGN_WIDTH} / ${NET_DESIGN_HEIGHT}` }}
    >
      <svg viewBox={`0 0 ${NET_DESIGN_WIDTH} ${NET_DESIGN_HEIGHT}`} className="absolute inset-0 w-full h-full">
        {connections}
      </svg>
      {layers.map((layer, col) => {
        const isOutput = col === layers.length - 1
        const label = col === 0 ? 'Input' : isOutput ? 'Output' : layer.activation
        const headX = positions[col][0]?.x ?? 0

        return (
          <div key={col}>
            <div
              className="absolute -translate-x-1/2 text-[11px] text-gray-500 dark:text-gray-400"
              style={{ left: `${(headX / NET_DESIGN_WIDTH) * 100}%`, top: '1%' }}
            >
              {label}
            </div>
            {positions[col].map((pos, row) => (
              <div
                key={row}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${(pos.x / NET_DESIGN_WIDTH) * 100}%`,
                  top: `${(pos.y / NET_DESIGN_HEIGHT) * 100}%`,
                }}
              >
                {isOutput ? (
                  <div
                    className="rounded-full border-2 border-white dark:border-gray-800"
                    style={{ width: NEURON_SIZE, height: NEURON_SIZE, background: '#8b5cf6' }}
                  />
                ) : (
                  <NeuronTile grid={neuronTiles[col]?.[row]} />
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function NeuralNetworkPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )

  const {
    animationSpeed,
    setAnimationSpeed,
    dataset,
    setDataset,
    noise,
    setNoise,
    learningRate,
    setLearningRate,
    activation,
    setActivation,
    regularization,
    setRegularization,
    regularizationRate,
    setRegularizationRate,
    hiddenLayers,
    setHiddenLayers,
    testRatio,
    setTestRatio,
  } = useNeuralNetworkPlayground()

  const engineRef = useRef<NeuralNetworkEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<NeuralNetworkEngine['getState']> | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const fastForwardWorkerRef = useRef<Worker | null>(null)
  const [isFastForwarding, setIsFastForwarding] = useState(false)

  const [trainPoints, setTrainPoints] = useState<DataPoint[]>([])
  const [testPoints, setTestPoints] = useState<DataPoint[]>([])

  const outputCanvasConfig = useMemo(
    () => ({
      width: OUTPUT_DISPLAY_SIZE,
      height: OUTPUT_DISPLAY_SIZE,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }),
    []
  )

  // Data generation: regenerate whenever dataset/noise/testRatio change
  useEffect(() => {
    const generated = generateNeuralNetworkDataset(dataset, { noise })
    const { train, test } = splitTrainTest(generated, testRatio)
    setTrainPoints(train)
    setTestPoints(test)
  }, [dataset, noise, testRatio])

  // (Re)initialize engine whenever data or hyperparameters change
  useEffect(() => {
    if (trainPoints.length === 0) return

    setIsPlaying(false)
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    fastForwardWorkerRef.current?.terminate()
    fastForwardWorkerRef.current = null
    setIsFastForwarding(false)

    engineRef.current = new NeuralNetworkEngine({
      points: trainPoints,
      testPoints,
      hiddenLayers,
      activation,
      learningRate,
      regularization,
      regularizationRate,
      maxEpochs: MAX_EPOCHS,
      convergenceThreshold: CONVERGENCE_THRESHOLD,
    })
    setEngineState(engineRef.current.getState())
  }, [trainPoints, testPoints, hiddenLayers, activation, learningRate, regularization, regularizationRate])

  const toCanvasCoords = useCallback(
    (x: number, y: number, config: { width: number; height: number }) => {
      const canvasX = ((x - xMin) / (xMax - xMin)) * config.width
      const canvasY = config.height - ((y - yMin) / (yMax - yMin)) * config.height
      return { canvasX, canvasY }
    },
    []
  )

  // Compute a small activation grid per neuron (input + hidden layers) for the
  // network diagram's mini heatmap tiles. One forward pass per grid point
  // yields every neuron's value at once — cheap even for the largest network.
  const computeNeuronTiles = useCallback((engine: NeuralNetworkEngine): NeuronTileGrid[][] => {
    const layers = engine.getState().layers
    const resolution = TILE_RESOLUTION
    const xs = Array.from({ length: resolution }, (_, i) => xMin + (i / (resolution - 1)) * (xMax - xMin))
    const ys = Array.from({ length: resolution }, (_, i) => yMax - (i / (resolution - 1)) * (yMax - yMin))
    const raw: number[][][][] = []
    for (let xi = 0; xi < resolution; xi++) {
      raw[xi] = []
      for (let yi = 0; yi < resolution; yi++) {
        raw[xi][yi] = engine.getActivationsAt(xs[xi], ys[yi])
      }
    }
    return layers.map((layer, l) =>
      Array.from({ length: layer.neuronCount }, (_, j) =>
        Array.from({ length: resolution }, (_, xi) =>
          Array.from({ length: resolution }, (_, yi) => raw[xi][yi][l][j])
        )
      )
    )
  }, [])

  // Ref reads belong in an effect (post-render), not during render itself —
  // recompute tiles only after the commit where engineRef was last updated.
  const [neuronTiles, setNeuronTiles] = useState<NeuronTileGrid[][]>([])
  useEffect(() => {
    setNeuronTiles(engineRef.current ? computeNeuronTiles(engineRef.current) : [])
  }, [engineState, computeNeuronTiles])

  // Output panel: full-bleed probability heatmap + train/test data points
  const drawOutput = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const config = outputCanvasConfig
      const engine = engineRef.current
      const trained = engineState && engineState.epoch > 0 && engine

      if (trained) {
        const xStep = (xMax - xMin) / OUTPUT_RESOLUTION
        const yStep = (yMax - yMin) / OUTPUT_RESOLUTION
        for (let i = 0; i < OUTPUT_RESOLUTION; i++) {
          const x = xMin + i * xStep
          for (let j = 0; j < OUTPUT_RESOLUTION; j++) {
            const y = yMin + j * yStep
            const prob = engine.getProbabilityAt(x, y)
            ctx.fillStyle = divergingColor(prob * 2 - 1, 1)
            const p1 = toCanvasCoords(x, y, config)
            const p2 = toCanvasCoords(x + xStep, y + yStep, config)
            ctx.fillRect(p1.canvasX, p2.canvasY, p2.canvasX - p1.canvasX + 1, p1.canvasY - p2.canvasY + 1)
          }
        }
      } else {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, config.width, config.height)
        ctx.fillStyle = '#9ca3af'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('👆 Click Play to start training', config.width / 2, config.height / 2)
      }

      const drawPoint = (point: DataPoint, isTest: boolean) => {
        const { canvasX, canvasY } = toCanvasCoords(point.x, point.y, config)
        ctx.fillStyle = point.label === 0 ? '#f59322' : '#0877bd'
        ctx.strokeStyle = isTest ? '#111827' : '#ffffff'
        ctx.lineWidth = isTest ? 1.6 : 1.2
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, isTest ? 3.5 : 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      trainPoints.forEach((p) => drawPoint(p, false))
      testPoints.forEach((p) => drawPoint(p, true))
    },
    [outputCanvasConfig, engineState, trainPoints, testPoints, toCanvasCoords]
  )

  const { canvasRef: outputCanvasRef, redraw: redrawOutput } = useCanvas({
    config: outputCanvasConfig,
    draw: drawOutput,
  })

  useEffect(() => {
    redrawOutput()
  }, [engineState, redrawOutput])

  // Playback controls
  const handleStep = () => {
    if (engineRef.current) {
      engineRef.current.step()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleReset = useCallback(() => {
    fastForwardWorkerRef.current?.terminate()
    fastForwardWorkerRef.current = null
    setIsFastForwarding(false)
    setIsPlaying(false)
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
    }
  }, [])

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

  // "Run to Convergence" — offloaded to a Worker since a full run can take
  // 100ms+ of blocking main-thread work at MAX_EPOCHS, unlike a single step().
  const handleRunToConvergence = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return

    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }
    fastForwardWorkerRef.current?.terminate()

    const snapshot = engine.createSnapshot()
    const worker = new Worker(new URL('../workers/neuralNetworkRunWorker.ts', import.meta.url), {
      type: 'module',
    })
    fastForwardWorkerRef.current = worker
    setIsFastForwarding(true)

    worker.onmessage = (
      event: MessageEvent<{
        type: 'done' | 'error'
        state?: ReturnType<NeuralNetworkEngine['getState']>
        error?: string
      }>
    ) => {
      if (fastForwardWorkerRef.current !== worker) return

      if (event.data.type === 'done' && event.data.state) {
        engineRef.current = NeuralNetworkEngine.fromSnapshot({ ...snapshot, state: event.data.state })
        setEngineState(event.data.state)
      } else if (event.data.type === 'error') {
        console.error('Neural network fast-forward worker failed:', event.data.error)
      }

      setIsFastForwarding(false)
      worker.terminate()
      if (fastForwardWorkerRef.current === worker) fastForwardWorkerRef.current = null
    }

    worker.onerror = (error) => {
      if (fastForwardWorkerRef.current !== worker) return
      console.error('Neural network fast-forward worker error:', error)
      setIsFastForwarding(false)
      worker.terminate()
      if (fastForwardWorkerRef.current === worker) fastForwardWorkerRef.current = null
    }

    worker.postMessage({ type: 'run', snapshot })
  }, [])

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
      fastForwardWorkerRef.current?.terminate()
    }
  }, [])

  // Network architecture editor
  const addLayer = () => {
    if (hiddenLayers.length >= MAX_HIDDEN_LAYERS || isPlaying) return
    setHiddenLayers([...hiddenLayers, 4])
  }
  const removeLayer = () => {
    if (hiddenLayers.length <= MIN_HIDDEN_LAYERS || isPlaying) return
    setHiddenLayers(hiddenLayers.slice(0, -1))
  }
  const incrementNeuron = (idx: number) => {
    if (hiddenLayers[idx] >= MAX_NEURONS || isPlaying) return
    setHiddenLayers(hiddenLayers.map((n, i) => (i === idx ? n + 1 : n)))
  }
  const decrementNeuron = (idx: number) => {
    if (hiddenLayers[idx] <= MIN_NEURONS || isPlaying) return
    setHiddenLayers(hiddenLayers.map((n, i) => (i === idx ? n - 1 : n)))
  }

  const isBusy = isPlaying || isFastForwarding
  const selectClass =
    'px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50'

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <PlaygroundHeader
          title="Neural Network Playground"
          onOpenTheory={() => setShowExplanation(true)}
        >
          <ShareButton />
        </PlaygroundHeader>

        {/* Top control bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 mb-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                <button
                  onClick={handlePlayPause}
                  disabled={engineState?.isConverged || isFastForwarding}
                  className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                </button>
              </Tooltip>
              <Tooltip text="Step Forward">
                <button
                  onClick={handleStep}
                  disabled={isBusy || engineState?.isConverged}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaStepForward size={12} />
                </button>
              </Tooltip>
              <Tooltip text="Run to Convergence">
                <button
                  onClick={handleRunToConvergence}
                  disabled={isBusy || engineState?.isConverged}
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

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Epoch <span className="font-bold text-gray-900 dark:text-white">{engineState?.epoch ?? 0}</span>
              {isFastForwarding && <span className="ml-2 text-indigo-500 animate-pulse">Training…</span>}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-wide text-gray-500">Learning rate</label>
              <select
                value={learningRate}
                disabled={isBusy}
                onChange={(e) => setLearningRate(Number.parseFloat(e.target.value))}
                className={selectClass}
              >
                {LEARNING_RATE_PRESETS.map((lr) => (
                  <option key={lr} value={lr}>
                    {lr}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-wide text-gray-500">Activation</label>
              <select
                value={activation}
                disabled={isBusy}
                onChange={(e) => setActivation(e.target.value as ActivationFunction)}
                className={selectClass}
              >
                <option value="relu">ReLU</option>
                <option value="tanh">Tanh</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="linear">Linear</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-wide text-gray-500">Regularization</label>
              <select
                value={regularization}
                disabled={isBusy}
                onChange={(e) => setRegularization(e.target.value as RegularizationType)}
                className={selectClass}
              >
                <option value="none">None</option>
                <option value="l1">L1</option>
                <option value="l2">L2</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-wide text-gray-500">Reg. rate</label>
              <select
                value={regularizationRate}
                disabled={isBusy || regularization === 'none'}
                onChange={(e) => setRegularizationRate(Number.parseFloat(e.target.value))}
                className={selectClass}
              >
                {REG_RATE_PRESETS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {engineState && (
              <div className="ml-auto flex items-center gap-4 text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Training loss:{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {engineState.loss.toFixed(3)}
                  </span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Test loss:{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {engineState.testLoss.toFixed(3)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Three-column TF-Playground-style layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[200px_1.4fr_1fr] gap-3 overflow-hidden min-h-0">
          {/* DATA column */}
          <div className="overflow-y-auto pr-1 space-y-3 [&::-webkit-scrollbar]:w-1.5">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 space-y-3">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Data
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {DATASETS.map((type) => (
                  <DatasetThumb
                    key={type}
                    type={type}
                    active={dataset === type}
                    disabled={isBusy}
                    onClick={() => setDataset(type)}
                  />
                ))}
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                  <span>Ratio of training to test data</span>
                  <span className="font-semibold">{Math.round((1 - testRatio) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={10}
                  value={Math.round((1 - testRatio) * 100)}
                  disabled={isBusy}
                  onChange={(e) => setTestRatio(1 - Number.parseInt(e.target.value) / 100)}
                  className="themed-range w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 disabled:opacity-50"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-400 mb-1">
                  <span>Noise</span>
                  <span className="font-semibold">{Math.round(noise * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={Math.round(noise * 100)}
                  disabled={isBusy}
                  onChange={(e) => setNoise(Number.parseInt(e.target.value) / 100)}
                  className="themed-range w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700 disabled:opacity-50"
                />
              </div>

              <div className="pt-1 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Speed:</span>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={50}
                    max={2000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
                    className="w-16 px-1.5 py-0.5 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-[9px] text-gray-500">ms/epoch</span>
                </div>
              </div>
            </div>
          </div>

          {/* NETWORK column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-auto flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Network
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Hidden layers</span>
                <button
                  onClick={removeLayer}
                  disabled={hiddenLayers.length <= MIN_HIDDEN_LAYERS || isBusy}
                  className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaMinus size={7} />
                </button>
                <button
                  onClick={addLayer}
                  disabled={hiddenLayers.length >= MAX_HIDDEN_LAYERS || isBusy}
                  className="w-5 h-5 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaPlus size={7} />
                </button>
              </div>
            </div>

            {hiddenLayers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {hiddenLayers.map((count, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/50 rounded px-1.5 py-0.5"
                  >
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">
                      L{idx + 1}: {count}
                    </span>
                    <button
                      onClick={() => decrementNeuron(idx)}
                      disabled={count <= MIN_NEURONS || isBusy}
                      className="w-4 h-4 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaMinus size={6} />
                    </button>
                    <button
                      onClick={() => incrementNeuron(idx)}
                      disabled={count >= MAX_NEURONS || isBusy}
                      className="w-4 h-4 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaPlus size={6} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1 flex items-center justify-center min-h-0">
              <NetworkDiagram layers={engineState?.layers ?? []} neuronTiles={neuronTiles} />
            </div>
          </div>

          {/* OUTPUT column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Output
              </h3>
              {engineState && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Test accuracy:{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {(engineState.testAccuracy * 100).toFixed(1)}%
                  </span>
                </span>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div
                className="w-full h-full"
                style={{ maxWidth: OUTPUT_DISPLAY_SIZE, maxHeight: OUTPUT_DISPLAY_SIZE }}
              >
                <Canvas canvasRef={outputCanvasRef} config={outputCanvasConfig} />
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-2 text-[9px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59322' }} /> Class 0
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#0877bd' }} /> Class 1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white" /> Train
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-gray-900" /> Test
              </span>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            {isRelatedOpen && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
                <RelatedAlgorithms route="neural-network-playground" type="ml" compact />
              </div>
            )}
          </div>
        </div>
      </div>

      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/ml/neural-network-playground.md"
        title="Understanding Neural Networks"
      />
    </div>
  )
}
