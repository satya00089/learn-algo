'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { RecursionEngine } from '../engines/RecursionEngine'
import { useRecursionPlayground } from '../hooks/useRecursionPlayground'

export function RecursionPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const { animationSpeed, setAnimationSpeed, isDebugMode, setIsDebugMode } =
    useRecursionPlayground()

  const engineRef = useRef<RecursionEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<RecursionEngine['getState']> | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  const [nInput, setNInput] = useState('5')
  const [baseInput, setBaseInput] = useState('2')
  const [expInput, setExpInput] = useState('3')

  // Pan and zoom state for Fibonacci tree
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    engineRef.current = new RecursionEngine()
    setEngineState(engineRef.current.getState())
  }, [])

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
    // Reset pan and zoom for Fibonacci tree
    setPan({ x: 0, y: 0 })
    setZoom(1)
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
      if (currentState.isOperationComplete) return

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

  const handleOperation = (op: string) => {
    if (!engineRef.current) return
    const n = Number.parseInt(nInput) || 0
    const base = Number.parseInt(baseInput) || 2
    const exp = Number.parseInt(expInput) || 3

    switch (op) {
      case 'FACTORIAL':
        engineRef.current.startFactorial(n)
        break
      case 'FIBONACCI':
        engineRef.current.startFibonacci(n)
        break
      case 'TOWER_OF_HANOI':
        engineRef.current.startTowerOfHanoi(n)
        break
      case 'POWER':
        engineRef.current.startPower(base, exp)
        break
    }
    setEngineState(engineRef.current.getState())
  }

  const renderFibonacciTree = () => {
    if (!engineState || engineState.callStack.length === 0) return null

    // Mouse event handlers for pan and zoom
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((prevZoom) => Math.max(0.1, Math.min(prevZoom * zoomFactor, 5)))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const panStep = 20
      const zoomStep = 0.1

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setPan((prev) => ({ ...prev, x: prev.x + panStep }))
          break
        case 'ArrowRight':
          e.preventDefault()
          setPan((prev) => ({ ...prev, x: prev.x - panStep }))
          break
        case 'ArrowUp':
          e.preventDefault()
          setPan((prev) => ({ ...prev, y: prev.y + panStep }))
          break
        case 'ArrowDown':
          e.preventDefault()
          setPan((prev) => ({ ...prev, y: prev.y - panStep }))
          break
        case '+':
        case '=':
          e.preventDefault()
          setZoom((prev) => Math.min(prev + zoomStep, 5))
          break
        case '-':
        case '_':
          e.preventDefault()
          setZoom((prev) => Math.max(prev - zoomStep, 0.1))
          break
        case '0':
          e.preventDefault()
          setPan({ x: 0, y: 0 })
          setZoom(1)
          break
      }
    }

    // Build a tree structure from call stack
    interface TreeNode {
      n: number
      result?: number
      state: string
      children: TreeNode[]
      depth: number
      x?: number
      y?: number
    }

    const renderNode = (node: TreeNode, x: number, y: number, width: number): JSX.Element => {
      const nodeSize = 50
      const childY = y + 100
      const childCount = node.children.length
      const childSpacing = width / Math.max(childCount, 1)

      let fillColor = '#E5E7EB' // gray-200
      let strokeColor = '#9CA3AF' // gray-400
      let textFill = '#1F2937' // gray-800

      if (node.state === 'active') {
        fillColor = '#60A5FA' // blue-400
        strokeColor = '#2563EB' // blue-600
        textFill = '#FFFFFF' // white
      } else if (node.state === 'waiting' || node.state === 'waiting-second') {
        fillColor = '#FCD34D' // yellow-300
        strokeColor = '#F59E0B' // yellow-500
        textFill = '#1F2937' // gray-900
      } else if (node.state === 'complete') {
        fillColor = '#34D399' // green-400
        strokeColor = '#10B981' // green-500
        textFill = '#FFFFFF' // white
      }

      return (
        <g key={`${node.n}-${node.depth}-${x}-${y}`}>
          {/* Lines to children */}
          {node.children.map((_, idx) => {
            const childX = x - width / 2 + (idx + 0.5) * childSpacing
            return (
              <line
                key={`line-${idx}`}
                x1={x}
                y1={y + nodeSize / 2}
                x2={childX}
                y2={childY - nodeSize / 2}
                stroke="#9CA3AF"
                strokeWidth="2"
              />
            )
          })}

          {/* Node circle */}
          <circle
            cx={x}
            cy={y}
            r={nodeSize / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* Node text */}
          <text x={x} y={y - 5} textAnchor="middle" fill={textFill} className="text-xs font-bold">
            fib({node.n})
          </text>
          {node.result !== undefined && (
            <text
              x={x}
              y={y + 10}
              textAnchor="middle"
              fill={textFill}
              className="text-[10px] font-semibold"
            >
              = {node.result}
            </text>
          )}

          {/* Render children */}
          {node.children.map((child, idx) => {
            const childX = x - width / 2 + (idx + 0.5) * childSpacing
            return renderNode(child, childX, childY, childSpacing)
          })}
        </g>
      )
    }

    // Build a complete tree showing all potential recursive calls
    const buildCompleteTree = (n: number, maxDepth: number): TreeNode => {
      const node: TreeNode = {
        n,
        state: 'inactive',
        children: [],
        depth: 0,
      }

      if (n <= 1 || maxDepth <= 0) {
        node.result = n
        return node
      }

      // Add both children for visualization
      if (n > 1) {
        node.children.push(buildCompleteTree(n - 1, maxDepth - 1))
        node.children.push(buildCompleteTree(n - 2, maxDepth - 1))
      }

      return node
    }

    // Update tree with current call stack state
    const updateTreeWithCallStack = (tree: TreeNode, callStack: typeof engineState.callStack) => {
      const updateNode = (node: TreeNode) => {
        const matchingCall = callStack.find((c) => c.n === node.n)
        if (matchingCall) {
          node.state = matchingCall.state
          node.result = matchingCall.result
        }
        node.children.forEach(updateNode)
      }

      updateNode(tree)
    }

    const tree = buildCompleteTree(engineState.n, Math.min(engineState.n, 5))
    updateTreeWithCallStack(tree, engineState.callStack)

    // Calculate tree depth
    const getTreeDepth = (node: TreeNode): number => {
      if (node.children.length === 0) return 1
      return 1 + Math.max(...node.children.map(getTreeDepth))
    }

    const treeDepth = getTreeDepth(tree)
    const svgWidth = Math.min(1200, Math.max(600, Math.pow(2, engineState.n) * 80))
    const svgHeight = treeDepth * 100 + 100 // Add padding at bottom

    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Fibonacci Recursion Tree
        </div>
        <div
          ref={svgContainerRef}
          role="application"
          aria-label="Interactive Fibonacci recursion tree - drag to pan, scroll to zoom. Use arrow keys to pan, +/- to zoom, 0 to reset"
          tabIndex={0}
          className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center p-4 overflow-hidden cursor-grab active:cursor-grabbing h-[400px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        >
          <svg width={svgWidth} height={svgHeight}>
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {renderNode(tree, svgWidth / 2, 60, svgWidth * 0.9)}
            </g>
          </svg>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-400 rounded-full"></span> Active{' '}
            <span className="w-3 h-3 bg-yellow-300 rounded-full ml-2"></span> Waiting{' '}
            <span className="w-3 h-3 bg-green-400 rounded-full ml-2"></span> Complete{' '}
            <span className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full ml-2"></span> Not yet
            called{' '}
          </span>
          <button
            onClick={() => {
              setPan({ x: 0, y: 0 })
              setZoom(1)
            }}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
          >
            Reset View
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 italic">
          💡 Drag to pan, scroll to zoom • Keyboard: Arrow keys to pan, +/- to zoom, 0 to reset
        </div>
      </div>
    )
  }

  const renderCallStack = () => {
    if (!engineState || engineState.callStack.length === 0) return null

    return (
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Call Stack (Depth: {engineState.callStack.length})
        </div>
        {engineState.callStack
          .slice()
          .reverse()
          .map((call, idx) => {
            const reverseIdx = engineState.callStack.length - 1 - idx
            let bgColor = 'bg-gray-100 dark:bg-gray-700'
            let borderColor = 'border-gray-300 dark:border-gray-600'

            if (call.state === 'active') {
              bgColor = 'bg-blue-100 dark:bg-blue-900/30'
              borderColor = 'border-blue-500'
            } else if (call.state === 'waiting' || call.state === 'waiting-second') {
              bgColor = 'bg-yellow-100 dark:bg-yellow-900/30'
              borderColor = 'border-yellow-500'
            } else if (call.state === 'complete') {
              bgColor = 'bg-green-100 dark:bg-green-900/30'
              borderColor = 'border-green-500'
            }

            return (
              <div
                key={reverseIdx}
                className={`p-3 rounded border-2 ${borderColor} ${bgColor}`}
                style={{ marginLeft: `${call.depth * 12}px` }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {engineState.operation}({call.n})
                  </div>
                  {call.result !== undefined && (
                    <div className="text-xs font-semibold text-green-700 dark:text-green-400">
                      → {call.result}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  Depth: {call.depth} | State: {call.state}
                </div>
              </div>
            )
          })}
      </div>
    )
  }

  const renderTowerOfHanoi = () => {
    if (!engineState?.towers) return null

    const maxDisk = engineState.n
    const towerNames = ['A', 'B', 'C'] as const

    return (
      <div className="space-y-4">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Tower of Hanoi - {engineState.n} Disks
        </div>
        <div className="grid grid-cols-3 gap-4">
          {towerNames.map((tower) => (
            <div key={tower} className="flex flex-col items-center">
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                Tower {tower}
              </div>
              <div className="relative w-full h-48 flex flex-col-reverse items-center justify-start bg-gray-100 dark:bg-gray-800 rounded-lg p-2 border-2 border-gray-300 dark:border-gray-600">
                {/* Rod */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-40 bg-gray-400 dark:bg-gray-600"></div>

                {/* Disks */}
                <div className="relative flex flex-col-reverse items-center gap-1 z-10">
                  {engineState.towers?.[tower].map((disk, idx) => {
                    const width = (disk / maxDisk) * 80 + 20
                    const colors = [
                      'bg-red-500',
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-yellow-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-indigo-500',
                    ]
                    return (
                      <div
                        key={idx}
                        className={`h-6 rounded ${colors[disk - 1]} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                        style={{ width: `${width}%` }}
                      >
                        {disk}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Recursion</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Visualize recursive algorithms with call stack tracking
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button
                    onClick={handlePlayPause}
                    disabled={engineState?.isOperationComplete}
                    className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>
                  <button
                    onClick={handleStep}
                    disabled={isPlaying || engineState?.isOperationComplete}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaStepForward size={12} />
                  </button>
                  <button
                    onClick={handleRun}
                    disabled={isPlaying || engineState?.isOperationComplete}
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
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 800)}
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
              </div>
            </div>

            {/* Visualization */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-auto">
              {engineState?.operation ? (
                <div>
                  {engineState.operation === 'TOWER_OF_HANOI' && engineState.towers
                    ? renderTowerOfHanoi()
                    : engineState.operation === 'FIBONACCI'
                      ? renderFibonacciTree()
                      : renderCallStack()}

                  {engineState.moves && engineState.moves.length > 0 && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-purple-100 dark:[&::-webkit-scrollbar-track]:bg-purple-900/30 [&::-webkit-scrollbar-thumb]:bg-purple-300 dark:[&::-webkit-scrollbar-thumb]:bg-purple-700 [&::-webkit-scrollbar-thumb]:rounded">
                      <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                        Moves ({engineState.moves.length}):
                      </div>
                      <div className="space-y-1 text-xs font-mono text-purple-700 dark:text-purple-400">
                        {engineState.moves.map((move, idx) => (
                          <div key={idx}>
                            {idx + 1}. {move}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔄</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a recursive algorithm to begin
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Operations */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Inputs */}
            <ControlGroup title="Input Parameters">
              <div className="space-y-2">
                <div>
                  <label htmlFor="n-input" className="text-xs text-gray-600 dark:text-gray-400">
                    N (1-10)
                  </label>
                  <input
                    id="n-input"
                    type="number"
                    value={nInput}
                    onChange={(e) => setNInput(e.target.value)}
                    min={1}
                    max={10}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="base-input" className="text-xs text-gray-600 dark:text-gray-400">
                    Base (for Power)
                  </label>
                  <input
                    id="base-input"
                    type="number"
                    value={baseInput}
                    onChange={(e) => setBaseInput(e.target.value)}
                    min={1}
                    max={10}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="exp-input" className="text-xs text-gray-600 dark:text-gray-400">
                    Exponent (for Power)
                  </label>
                  <input
                    id="exp-input"
                    type="number"
                    value={expInput}
                    onChange={(e) => setExpInput(e.target.value)}
                    min={1}
                    max={10}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Algorithms */}
            <ControlGroup title="Recursive Algorithms">
              <div className="space-y-2">
                <button
                  onClick={() => handleOperation('FACTORIAL')}
                  disabled={isPlaying || !nInput}
                  className="w-full px-2 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🔢 Factorial(n)
                </button>
                <button
                  onClick={() => handleOperation('FIBONACCI')}
                  disabled={isPlaying || !nInput}
                  className="w-full px-2 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🌀 Fibonacci(n)
                </button>
                <button
                  onClick={() => handleOperation('TOWER_OF_HANOI')}
                  disabled={isPlaying || !nInput}
                  className="w-full px-2 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🗼 Tower of Hanoi(n)
                </button>
                <button
                  onClick={() => handleOperation('POWER')}
                  disabled={isPlaying || !baseInput || !expInput}
                  className="w-full px-2 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  ⚡ Power(base, exp)
                </button>
              </div>
            </ControlGroup>

            {/* Current State */}
            {engineState?.operation && (
              <ControlGroup title="Current State">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Algorithm:</span>
                    <span className="font-semibold">{engineState.operation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Input N:</span>
                    <span className="font-semibold">{engineState.n}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Call Depth:</span>
                    <span className="font-semibold">{engineState.callStack.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phase:</span>
                    <span className="font-semibold capitalize">{engineState.phase}</span>
                  </div>
                </div>
              </ControlGroup>
            )}

            {/* Debug Info */}
            {isDebugMode && engineState?.history.length && (
              <ControlGroup title="Debug History">
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
                        {step.depth !== undefined && (
                          <span className="text-purple-600 dark:text-purple-400">
                            [D{step.depth}]
                          </span>
                        )}{' '}
                        {step.description}
                      </div>
                    ))}
                </div>
              </ControlGroup>
            )}

            {/* About */}
            <ControlGroup title="Complexity">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Factorial:</strong> O(n)
                </p>
                <p>
                  <strong>Fibonacci:</strong> O(2^n) naive, O(n) optimized
                </p>
                <p>
                  <strong>Tower of Hanoi:</strong> O(2^n)
                </p>
                <p>
                  <strong>Power:</strong> O(log n) optimized
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
                <RelatedAlgorithms route="recursion" type="dsa" compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
