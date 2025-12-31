'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaFastForward,
  FaRedo,
  FaRandom,
  FaSearch,
  FaPlus,
  FaTrash,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { BinarySearchTreeEngine } from '../engines/BinarySearchTreeEngine'
import { useBinarySearchTreePlayground } from '../hooks/useBinarySearchTreePlayground'
import { drawTree } from '../visualizers/treeVisualizer'

/**
 * Binary Search Tree Playground
 * Orchestrates engine, visualization, and controls
 * Follows strict separation of concerns
 */
export function BinarySearchTreePlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    inputValue,
    setInputValue,
    generateRandomValue,
    generateRandomTree,
  } = useBinarySearchTreePlayground()

  const engineRef = useRef<BinarySearchTreeEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    BinarySearchTreeEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 500,
      padding: { top: 40, right: 40, bottom: 80, left: 40 },
    }),
    []
  )

  // Initialize engine
  useEffect(() => {
    engineRef.current = new BinarySearchTreeEngine()
    setEngineState(engineRef.current.getState())
  }, [])

  // Draw function for canvas
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!engineState) return

      // Draw tree
      drawTree(ctx, engineState.root, {
        canvasWidth: width,
        canvasHeight: height,
      })
    },
    [engineState, canvasConfig]
  )

  const { canvasRef, redraw } = useCanvas({
    config: canvasConfig,
    draw,
    animate: false,
  })

  // Redraw when state changes
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
      if (currentState.stepPhase === 'complete' || !currentState.currentOperation) {
        return
      }

      setIsPlaying(true)
      playIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const state = engineRef.current.getState()
          if (state.stepPhase === 'complete' || !state.currentOperation) {
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  const handleInsert = () => {
    const value = Number.parseInt(inputValue)
    if (Number.isNaN(value)) return

    if (engineRef.current) {
      engineRef.current.startInsert(value)
      setEngineState(engineRef.current.getState())
    }
    setInputValue('')
  }

  const handleSearch = () => {
    const value = Number.parseInt(inputValue)
    if (Number.isNaN(value)) return

    if (engineRef.current) {
      engineRef.current.startSearch(value)
      setEngineState(engineRef.current.getState())
    }
    setInputValue('')
  }

  const handleRandomInsert = () => {
    const value = generateRandomValue()
    if (engineRef.current) {
      engineRef.current.startInsert(value)
      setEngineState(engineRef.current.getState())
    }
  }

  const handleGenerateTree = () => {
    const values = generateRandomTree()
    if (engineRef.current) {
      engineRef.current.clear()
      values.forEach((value) => {
        engineRef.current!.startInsert(value)
        engineRef.current!.run()
      })
      setEngineState(engineRef.current.getState())
    }
  }

  const handleClear = () => {
    if (engineRef.current) {
      engineRef.current.clear()
      setEngineState(engineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }

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

  const getPhaseDescription = () => {
    if (!engineState) return ''
    switch (engineState.stepPhase) {
      case 'selecting':
        return '🎯 Selecting starting node'
      case 'comparing':
        return '🔍 Comparing values'
      case 'navigating':
        return '➡️ Navigating tree'
      case 'inserting':
        return '➕ Inserting node'
      case 'complete':
        return '✅ Operation complete'
      default:
        return ''
    }
  }

  const canOperate = engineState?.stepPhase === 'complete' || !engineState?.currentOperation

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header with Back Button and Theme Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Binary Search Tree</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Interactive tree operations: insert nodes, search for values, and visualize tree traversal
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Canvas with Controls on Top */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0 overflow-visible">
            {/* Controls Above Canvas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Input and Operation Buttons */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleInsert()
                    }}
                    placeholder="Value"
                    disabled={!canOperate}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <Tooltip text="Insert Value">
                    <button
                      onClick={handleInsert}
                      disabled={!canOperate || !inputValue}
                      className="w-8 h-8 flex items-center justify-center rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaPlus size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Search Value">
                    <button
                      onClick={handleSearch}
                      disabled={!canOperate || !inputValue}
                      className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaSearch size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Execution Buttons */}
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={canOperate}
                      className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || canOperate}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Run to Completion">
                    <button
                      onClick={handleRun}
                      disabled={isPlaying || canOperate}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaFastForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset Operation">
                    <button
                      onClick={handleReset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Animation Speed */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Animation Speed (ms)">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={50}
                    max={1000}
                    step={50}
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 100)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Debug Toggle */}
                <Tooltip text="Debug Mode">
                  <button
                    onClick={() => setIsDebugMode(!isDebugMode)}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                      isDebugMode
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <VscDebugAltSmall size={16} />
                  </button>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Tree Operations */}
                <Tooltip text="Random Insert">
                  <button
                    onClick={handleRandomInsert}
                    disabled={!canOperate}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors disabled:opacity-50"
                  >
                    <FaRandom size={12} />
                    Random
                  </button>
                </Tooltip>

                <Tooltip text="Generate Tree">
                  <button
                    onClick={handleGenerateTree}
                    disabled={!canOperate}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors disabled:opacity-50"
                  >
                    Generate
                  </button>
                </Tooltip>

                <Tooltip text="Clear Tree">
                  <button
                    onClick={handleClear}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 text-xs transition-colors"
                  >
                    <FaTrash size={12} />
                    Clear
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
                  <div className="w-4 h-4 rounded-full bg-blue-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Found/Inserted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Not Found</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Information Panels */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Current State */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Nodes:</span>
                  <span className="font-semibold text-right">{engineState.nodes.length}</span>

                  <span className="text-gray-600 dark:text-gray-400">Comparisons:</span>
                  <span className="font-semibold text-right">{engineState.comparisons}</span>

                  <span className="text-gray-600 dark:text-gray-400">Insertions:</span>
                  <span className="font-semibold text-right">{engineState.insertions}</span>

                  <span className="text-gray-600 dark:text-gray-400">Operation:</span>
                  <span className="font-semibold text-right">
                    {engineState.currentOperation
                      ? engineState.currentOperation.charAt(0).toUpperCase() +
                        engineState.currentOperation.slice(1)
                      : 'None'}
                  </span>
                </div>
              </ControlGroup>
            )}

            {/* Algorithm Info */}
            <ControlGroup title="About BST">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  <strong className="text-gray-800 dark:text-white">Time Complexity:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Best: O(log n) - balanced tree</li>
                  <li>Average: O(log n)</li>
                  <li>Worst: O(n) - skewed tree</li>
                </ul>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Space Complexity:</strong> O(n)
                </p>

                <p className="mt-2">
                  <strong className="text-gray-800 dark:text-white">Properties:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Left subtree {'<'} node value</li>
                  <li>Right subtree {'>'} node value</li>
                  <li>No duplicate values</li>
                </ul>
              </div>
            </ControlGroup>

            {/* Debug Mode Info */}
            {isDebugMode && engineState && (
              <ControlGroup title="Debug Details">
                <div className="space-y-2 text-xs">
                  {/* Current Phase */}
                  {engineState.currentOperation && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                      <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                        Current Phase:
                      </div>
                      <div className="text-green-900 dark:text-green-100 text-[10px] font-semibold">
                        {getPhaseDescription()}
                      </div>
                      {engineState.targetValue !== null && (
                        <div className="text-green-700 dark:text-green-300 text-[10px] mt-1">
                          Target: {engineState.targetValue}
                          {engineState.path.length > 0 &&
                            ` | Path: ${engineState.path.join(' → ')}`}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                    <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                      BST Properties:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 text-[10px]">
                      <li>Left child {'<'} parent</li>
                      <li>Right child {'>'} parent</li>
                      <li>Recursive structure</li>
                      <li>In-order gives sorted list</li>
                    </ol>
                  </div>

                  {engineState.nodes.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        In-Order Traversal:
                      </div>
                      <div className="font-mono text-[10px] text-gray-600 dark:text-gray-400 break-words">
                        {engineRef.current?.getInOrderTraversal().join(' → ')}
                      </div>
                    </div>
                  )}

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

            {/* How It Works */}
            <ControlGroup title="How It Works">
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <p>
                  A Binary Search Tree maintains a sorted structure where each node&apos;s left
                  child is smaller and right child is larger than the parent.
                </p>
                <p>
                  This property enables efficient searching, insertion, and deletion operations with
                  O(log n) average time complexity.
                </p>
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold text-[10px]">
                    💡 Tip: Try inserting sorted values to see how the tree becomes unbalanced!
                  </p>
                </div>
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
                <RelatedAlgorithms currentRoute="binary-search-tree" compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
