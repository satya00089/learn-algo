'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo, FaRandom } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { GradientDescentEngine } from '../engines/GradientDescentEngine'
import { useGradientDescentPlayground } from '../hooks/useGradientDescentPlayground'
import type { GradientDescentFunction } from '../types'

export function GradientDescentPlayground() {
  const router = useRouter()
  const {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    selectedFunction,
    setSelectedFunction,
    learningRate,
    setLearningRate,
    maxIterations,
    setMaxIterations,
    initialX,
    setInitialX,
  } = useGradientDescentPlayground()

  const engineRef = useRef<GradientDescentEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    GradientDescentEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Function definitions
  const functions: Record<string, GradientDescentFunction> = useMemo(
    () => ({
      quadratic: {
        name: 'x²',
        f: (x) => x * x,
        df: (x) => 2 * x,
        domain: [-5, 5],
      },
      cubic: {
        name: 'x³ - 3x',
        f: (x) => x * x * x - 3 * x,
        df: (x) => 3 * x * x - 3,
        domain: [-3, 3],
      },
      quartic: {
        name: 'x⁴ - 4x² + 1',
        f: (x) => x * x * x * x - 4 * x * x + 1,
        df: (x) => 4 * x * x * x - 8 * x,
        domain: [-3, 3],
      },
      sine: {
        name: 'sin(x) + x/5',
        f: (x) => Math.sin(x) + x / 5,
        df: (x) => Math.cos(x) + 1 / 5,
        domain: [-6, 6],
      },
      complex: {
        name: '(x-2)² + sin(2x)',
        f: (x) => (x - 2) * (x - 2) + Math.sin(2 * x),
        df: (x) => 2 * (x - 2) + 2 * Math.cos(2 * x),
        domain: [-1, 5],
      },
    }),
    []
  )

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1000,
      height: 500,
      padding: { top: 40, right: 40, bottom: 60, left: 60 },
    }),
    []
  )

  // Initialize engine when config changes
  useEffect(() => {
    const func = functions[selectedFunction]
    if (func) {
      engineRef.current = new GradientDescentEngine({
        function: func,
        learningRate,
        maxIterations,
        convergenceThreshold: 0.001,
        initialX,
      })
      setEngineState(engineRef.current.getState())
    }
  }, [selectedFunction, learningRate, maxIterations, initialX, functions])

  // Transform coordinates
  const toCanvasCoords = useCallback(
    (x: number, y: number) => {
      const { width, height, padding } = canvasConfig
      const func = functions[selectedFunction]
      const xMin = func.domain[0]
      const xMax = func.domain[1]
      const yMin = -5 // Approximate range
      const yMax = 5

      const canvasX =
        padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
      const canvasY =
        height -
        padding.bottom -
        ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)
      return { canvasX, canvasY }
    },
    [canvasConfig, selectedFunction, functions]
  )

  // Draw function
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig
      ctx.clearRect(0, 0, width, height)

      const func = functions[selectedFunction]
      if (!func || !engineState) return

      const xMin = func.domain[0]
      const xMax = func.domain[1]

      // Draw axes
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2
      const origin = toCanvasCoords(0, 0)
      ctx.beginPath()
      ctx.moveTo(toCanvasCoords(xMin, 0).canvasX, origin.canvasY)
      ctx.lineTo(toCanvasCoords(xMax, 0).canvasX, origin.canvasY)
      ctx.moveTo(origin.canvasX, toCanvasCoords(0, -5).canvasY)
      ctx.lineTo(origin.canvasX, toCanvasCoords(0, 5).canvasY)
      ctx.stroke()

      // Draw function curve
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 3
      ctx.beginPath()

      const steps = 200
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = xMin + t * (xMax - xMin)
        const y = func.f(x)

        const { canvasX, canvasY } = toCanvasCoords(x, y)
        if (i === 0) {
          ctx.moveTo(canvasX, canvasY)
        } else {
          ctx.lineTo(canvasX, canvasY)
        }
      }
      ctx.stroke()

      // Draw gradient descent path
      if (engineState.history.length > 1) {
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()

        engineState.history.forEach((point, index) => {
          const { canvasX, canvasY } = toCanvasCoords(point.x, point.y)
          if (index === 0) {
            ctx.moveTo(canvasX, canvasY)
          } else {
            ctx.lineTo(canvasX, canvasY)
          }
        })
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Draw current position
      if (engineState.history.length > 0) {
        const current = engineState.history[engineState.history.length - 1]
        const { canvasX, canvasY } = toCanvasCoords(current.x, current.y)

        // Draw point on curve
        ctx.fillStyle = '#ef4444'
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 6, 0, Math.PI * 2)
        ctx.fill()

        // Draw tangent line (derivative)
        const tangentLength = 1
        const tangentX = current.x + tangentLength
        const tangentY = current.y + current.gradient * tangentLength

        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(canvasX, canvasY)
        const tangentPoint = toCanvasCoords(tangentX, tangentY)
        ctx.lineTo(tangentPoint.canvasX, tangentPoint.canvasY)
        ctx.stroke()

        // Draw step direction
        if (current.stepSize > 0) {
          const stepX = current.x - current.stepSize
          const stepY = func.f(stepX)

          ctx.strokeStyle = '#f59e0b'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(canvasX, canvasY)
          const stepPoint = toCanvasCoords(stepX, stepY)
          ctx.lineTo(stepPoint.canvasX, stepPoint.canvasY)
          ctx.stroke()
        }
      }

      // Draw convergence message
      if (engineState.isConverged) {
        ctx.fillStyle = '#10b981'
        ctx.font = '16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('✓ Converged!', width / 2, 30)
      }
    },
    [canvasConfig, selectedFunction, engineState, functions, toCanvasCoords]
  )

  // Use canvas hook
  const { canvasRef, redraw } = useCanvas({ config: canvasConfig, draw })

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/ml')}
              className="px-3 py-1.5 flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span>←</span> Back to ML
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gradient Descent</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Interactive optimization of mathematical functions
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={handlePlayPause}
                    disabled={engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>
                  <button
                    onClick={handleStep}
                    disabled={isPlaying || engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaStepForward size={12} />
                  </button>
                  <button
                    onClick={handleRun}
                    disabled={isPlaying || engineState?.isConverged}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaFastForward size={12} />
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
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
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                    isDebugMode
                      ? 'bg-blue-600 border-blue-600 text-white'
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
                      x:{' '}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {engineState.currentX.toFixed(3)}
                      </span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      f(x):{' '}
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {functions[selectedFunction]?.f(engineState.currentX).toFixed(3)}
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
            {/* Function Selection */}
            <ControlGroup title="Mathematical Functions">
              <div className="space-y-1.5">
                {Object.entries(functions).map(([key, func]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFunction(key)}
                    disabled={isPlaying}
                    className={`w-full px-2 py-1.5 text-[10px] rounded disabled:opacity-50 font-semibold flex items-center justify-center gap-1.5 ${
                      selectedFunction === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FaRandom size={10} /> {func.name}
                  </button>
                ))}
              </div>
            </ControlGroup>

            {/* Parameters */}
            <ControlGroup title="Optimization Parameters">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Learning Rate: {learningRate}
                  </label>
                  <input
                    type="range"
                    value={learningRate}
                    min={0.001}
                    max={0.5}
                    step={0.001}
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
                    min={10}
                    max={500}
                    step={10}
                    onChange={(e) => setMaxIterations(Number.parseInt(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Initial x: {initialX}</label>
                  <input
                    type="range"
                    value={initialX}
                    min={functions[selectedFunction]?.domain[0] || -5}
                    max={functions[selectedFunction]?.domain[1] || 5}
                    step={0.1}
                    onChange={(e) => setInitialX(Number.parseFloat(e.target.value))}
                    disabled={isPlaying}
                    className="w-full"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Legend */}
            <ControlGroup title="Legend">
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span>Function: {functions[selectedFunction]?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Current Position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-0.5 bg-red-500 opacity-60"
                    style={{ borderStyle: 'dashed' }}
                  ></div>
                  <span>Optimization Path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-green-500"></div>
                  <span>Tangent (Derivative)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-yellow-500"></div>
                  <span>Step Direction</span>
                </div>
              </div>
            </ControlGroup>

            {/* Debug History */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
              <ControlGroup title="Optimization History">
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
                        #{step.iteration}: x={step.x.toFixed(3)}, f(x)={step.y.toFixed(3)}, ∇f=
                        {step.gradient.toFixed(3)}
                      </div>
                    ))}
                </div>
              </ControlGroup>
            )}

            {/* About */}
            <ControlGroup title="About Gradient Descent">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Algorithm:</strong> xₙ₊₁ = xₙ - α·∇f(xₙ)
                </p>
                <p>
                  <strong>Goal:</strong> Find x that minimizes f(x)
                </p>
                <p>
                  <strong>Learning Rate (α):</strong> Step size
                </p>
                <p>
                  <strong>Convergence:</strong> When |∇f(x)| &lt; threshold
                </p>
                <p>
                  <strong>Challenges:</strong>
                </p>
                <p className="pl-2">• Local minima</p>
                <p className="pl-2">• Learning rate too large/small</p>
                <p className="pl-2">• Saddle points</p>
              </div>
            </ControlGroup>
          </div>
        </div>
      </div>
    </div>
  )
}
