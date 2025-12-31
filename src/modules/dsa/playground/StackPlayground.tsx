'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaRedo,
  FaRandom,
  FaPlus,
  FaMinus,
  FaEye,
  FaBroom,
  FaQuestion,
  FaRulerVertical,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { StackEngine } from '../engines/StackEngine'
import { useStackPlayground } from '../hooks/useStackPlayground'
import type { ArrayElement } from '../types'

/**
 * Stack Playground
 * Visualizes stack operations (LIFO - Last In First Out)
 */
export function StackPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const {
    maxSize,
    setMaxSize,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    generateInitialStack,
  } = useStackPlayground()

  const engineRef = useRef<StackEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<StackEngine['getState']> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Operation inputs
  const [pushValue, setPushValue] = useState('')

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 500,
      padding: { top: 40, right: 40, bottom: 40, left: 40 },
    }),
    []
  )

  // Initialize engine
  useEffect(() => {
    const initialStack = generateInitialStack(maxSize)
    engineRef.current = new StackEngine(maxSize, initialStack)
    setEngineState(engineRef.current.getState())
  }, [maxSize, generateInitialStack])

  // Draw function - vertical stack visualization
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height, padding } = canvasConfig

      ctx.clearRect(0, 0, width, height)

      if (!engineState || engineState.stack.length === 0) {
        // Draw empty stack message
        ctx.font = '20px Arial'
        ctx.fillStyle = '#9ca3af'
        ctx.textAlign = 'center'
        ctx.fillText('Stack is Empty', width / 2, height / 2)
        return
      }

      const stackWidth = 200
      const elementHeight = 50
      const gap = 5
      const startX = width / 2 - stackWidth / 2
      const startY = padding.top

      // Draw stack elements from top to bottom (reversed order - top element at visual top)
      engineState.stack
        .slice()
        .reverse()
        .forEach((element: ArrayElement, visualIndex: number) => {
          const index = engineState.stack.length - 1 - visualIndex // Original index
          const x = startX
          const y = startY + visualIndex * (elementHeight + gap)

          // Determine color based on state
          let fillColor = '#3b82f6' // blue (default)
          let strokeColor = '#2563eb'

          switch (element.state) {
            case 'comparing':
              fillColor = '#f59e0b' // amber (rear/newest)
              strokeColor = '#d97706'
              break
            case 'sorted':
              fillColor = '#10b981' // green (top/front)
              strokeColor = '#059669'
              break
            case 'swapping':
              fillColor = '#ef4444' // red
              strokeColor = '#dc2626'
              break
          }

          // Draw element box
          ctx.fillStyle = fillColor
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = 2
          ctx.fillRect(x, y, stackWidth, elementHeight)
          ctx.strokeRect(x, y, stackWidth, elementHeight)

          // Draw value
          ctx.font = 'bold 24px Arial'
          ctx.fillStyle = '#ffffff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(element.value.toString(), x + stackWidth / 2, y + elementHeight / 2)

          // Draw index label
          ctx.font = '12px Arial'
          ctx.fillStyle = '#6b7280'
          ctx.textAlign = 'right'
          ctx.fillText(`[${index}]`, x - 10, y + elementHeight / 2)
        })

      // Draw "TOP" indicator (at the visual top - index 0)
      if (engineState.stack.length > 0) {
        const topY = startY

        ctx.font = 'bold 16px Arial'
        ctx.fillStyle = '#10b981'
        ctx.textAlign = 'left'
        ctx.fillText('← TOP', startX + stackWidth + 15, topY + elementHeight / 2)
      }

      // Draw stack base (at the bottom)
      const baseY = startY + engineState.stack.length * (elementHeight + gap)
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(startX - 20, baseY)
      ctx.lineTo(startX + stackWidth + 20, baseY)
      ctx.stroke()
    },
    [engineState, canvasConfig]
  )

  const { canvasRef, redraw } = useCanvas({
    config: canvasConfig,
    draw,
    animate: false,
  })

  useEffect(() => {
    redraw()
  }, [engineState, redraw])

  // Control handlers
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
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
        playIntervalRef.current = undefined
      }
    } else {
      if (!engineRef.current) return

      const currentState = engineRef.current.getState()
      if (currentState.isOperationComplete) {
        return
      }

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.isOperationComplete) {
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
      }, animationSpeed)
    }
  }

  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  const handleGenerateNew = () => {
    const newStack = generateInitialStack(maxSize)
    if (engineRef.current) {
      engineRef.current.updateStack(newStack)
      setEngineState(engineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }

  // Operation handlers
  const handlePush = () => {
    const value = Number.parseInt(pushValue)
    if (Number.isNaN(value) || !engineRef.current) return

    engineRef.current.startPush(value)
    setEngineState(engineRef.current.getState())
    setPushValue('')
  }

  const handlePop = () => {
    if (!engineRef.current) return
    engineRef.current.startPop()
    setEngineState(engineRef.current.getState())
  }

  const handlePeek = () => {
    if (!engineRef.current) return
    engineRef.current.startPeek()
    setEngineState(engineRef.current.getState())
  }

  const handleIsEmpty = () => {
    if (!engineRef.current) return
    engineRef.current.startIsEmpty()
    setEngineState(engineRef.current.getState())
  }

  const handleSize = () => {
    if (!engineRef.current) return
    engineRef.current.startSize()
    setEngineState(engineRef.current.getState())
  }

  const handleClear = () => {
    if (!engineRef.current) return
    engineRef.current.startClear()
    setEngineState(engineRef.current.getState())
  }

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

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Stack (LIFO)</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Last In First Out (LIFO) - Elements are added and removed from the top
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0 overflow-visible">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={engineState?.isOperationComplete}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || engineState?.isOperationComplete}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || engineState?.isOperationComplete}
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
                  <Tooltip text="Max Stack Size">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Max:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={maxSize}
                    min={5}
                    max={15}
                    step={1}
                    onChange={(e) => setMaxSize(Number.parseInt(e.target.value) || 10)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Tooltip text="Animation Speed (ms)">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={100}
                    max={2000}
                    step={100}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Debug Mode">
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

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Tooltip text="Generate New Stack">
                  <button
                    onClick={handleGenerateNew}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                  >
                    <FaRandom size={12} />
                    New Stack
                  </button>
                </Tooltip>
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
                  <div className="w-4 h-4 rounded bg-blue-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Element</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Top</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">New/Rear</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Operations */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Current State */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <span className="font-semibold text-right">{engineState.stack.length}</span>

                  <span className="text-gray-600 dark:text-gray-400">Max Size:</span>
                  <span className="font-semibold text-right">{engineState.maxSize}</span>

                  <span className="text-gray-600 dark:text-gray-400">Top Index:</span>
                  <span className="font-semibold text-right">{engineState.topIndex}</span>

                  <span className="text-gray-600 dark:text-gray-400">Is Empty:</span>
                  <span className="font-semibold text-right">
                    {engineState.stack.length === 0 ? 'Yes' : 'No'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Operation:</span>
                  <span className="font-semibold text-right">
                    {engineState.currentOperation || 'None'}
                  </span>
                </div>
              </ControlGroup>
            )}

            {/* Push Operation */}
            <ControlGroup title="Push (Add to Top)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Add element to top - O(1)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={pushValue}
                    onChange={(e) => setPushValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handlePush}
                    disabled={!pushValue || isPlaying}
                    className="px-3 py-1 flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaPlus size={10} /> Push
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Pop Operation */}
            <ControlGroup title="Pop (Remove from Top)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Remove and return top element - O(1)
                </p>
                <button
                  onClick={handlePop}
                  disabled={isPlaying || !engineState || engineState.stack.length === 0}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaMinus size={10} /> Pop
                </button>
              </div>
            </ControlGroup>

            {/* Peek Operation */}
            <ControlGroup title="Peek (View Top)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  View top element without removing - O(1)
                </p>
                <button
                  onClick={handlePeek}
                  disabled={isPlaying || !engineState || engineState.stack.length === 0}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaEye size={10} /> Peek
                </button>
              </div>
            </ControlGroup>

            {/* Query Operations */}
            <ControlGroup title="Query Operations">
              <div className="space-y-2">
                <button
                  onClick={handleIsEmpty}
                  disabled={isPlaying}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaQuestion size={10} /> Is Empty
                </button>
                <button
                  onClick={handleSize}
                  disabled={isPlaying}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaRulerVertical size={10} /> Get Size
                </button>
                <button
                  onClick={handleClear}
                  disabled={isPlaying || !engineState || engineState.stack.length === 0}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaBroom size={10} /> Clear Stack
                </button>
              </div>
            </ControlGroup>

            {/* Debug Mode Info */}
            {isDebugMode && engineState && (
              <ControlGroup title="Debug Details">
                <div className="space-y-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Current Stack:
                    </div>
                    <div className="font-mono text-[10px] text-gray-600 dark:text-gray-400 break-words">
                      [{engineState.stack.map((el) => el.value).join(', ')}]
                    </div>
                  </div>

                  {engineState.history.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                        Action History:
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-blue-100 dark:[&::-webkit-scrollbar-track]:bg-blue-900/30 [&::-webkit-scrollbar-thumb]:bg-blue-300 dark:[&::-webkit-scrollbar-thumb]:bg-blue-700 [&::-webkit-scrollbar-thumb]:rounded">
                        {engineState.history
                          .slice()
                          .reverse()
                          .map((step, idx) => (
                            <div
                              key={step.iteration}
                              className={`text-[10px] p-1.5 rounded ${
                                idx === 0
                                  ? 'bg-blue-100 dark:bg-blue-800/30 text-blue-900 dark:text-blue-100 font-semibold'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <span className="text-blue-600 dark:text-blue-400 font-mono">
                                #{step.iteration}
                              </span>{' '}
                              {step.description}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </ControlGroup>
            )}

            {/* About Stack */}
            <ControlGroup title="About Stack">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white">LIFO Principle:</strong> Last
                  In, First Out - the most recently added element is removed first.
                </p>
                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Time Complexity:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Push: O(1)</li>
                  <li>Pop: O(1)</li>
                  <li>Peek: O(1)</li>
                </ul>
                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Use Cases:</strong> Function
                  call stack, undo/redo, expression evaluation, backtracking
                </p>
              </div>
            </ControlGroup>
          </div>
        </div>

        {/* Related Algorithms Accordion Footer */}
        <div className="fixed bottom-0 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <div
            className={`bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-b-0 border-gray-200 dark:border-gray-700 transition-opacity ${
              isRelatedOpen ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <button
              onClick={() => setIsRelatedOpen(!isRelatedOpen)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle related algorithms"
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
                <RelatedAlgorithms currentRoute="stack" compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
