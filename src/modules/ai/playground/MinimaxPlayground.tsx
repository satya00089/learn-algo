'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaRedo, FaLightbulb, FaBrain, FaPlay, FaPause, FaStepForward } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { Tooltip } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MinimaxEngine } from '../engines/MinimaxEngine'
import { useMinimaxPlayground } from '../hooks/useMinimaxPlayground'
import type { MinimaxNode } from '../types'
import {
  drawBoard,
  drawTree,
  drawStatistics,
  calculateTreeLayout,
  drawSelectedNodeInfo,
} from '../visualizers/minimaxVisualizer'

/**
 * Minimax Algorithm Playground
 * Tic-Tac-Toe with AI using Minimax and Alpha-Beta Pruning
 */
export function MinimaxPlayground() {
  const { isDebugMode, setIsDebugMode, showTree, setShowTree } = useMinimaxPlayground()

  const engineRef = useRef<MinimaxEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<MinimaxEngine['getState']> | null>(null)
  const [isDark, setIsDark] = useState(false)
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false)
  const animationIntervalRef = useRef<NodeJS.Timeout>()

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 600,
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
    }),
    []
  )

  // Initialize engine
  useEffect(() => {
    engineRef.current = new MinimaxEngine('minimax')
    setEngineState(engineRef.current.getState())
  }, [])

  // Check dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  // Draw function for canvas
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvasConfig

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!engineState) return

      if (showTree && engineState.tree.length > 0) {
        // Draw tree visualization
        const visibleNodes = engineState.isAnimating
          ? engineState.tree.slice(0, engineState.animationStep + 1)
          : engineState.tree

        const layout = calculateTreeLayout(visibleNodes, width, height - 150)
        drawTree(
          ctx,
          visibleNodes,
          layout,
          isDark,
          engineState.currentNode,
          engineState.selectedNodeId
        )

        // Draw statistics
        drawStatistics(
          ctx,
          engineState.nodesEvaluated,
          engineState.nodesPruned,
          20,
          height - 60,
          isDark
        )

        // Draw selected node info if a node is selected
        if (engineState.selectedNodeId) {
          const selectedNode = engineState.tree.find((n) => n.id === engineState.selectedNodeId)
          if (selectedNode) {
            drawSelectedNodeInfo(ctx, selectedNode, width - 220, 20, isDark)
          }
        }
      } else {
        // Draw main game board (centered and larger)
        const boardSize = Math.min(width, height) * 0.6
        const boardX = (width - boardSize) / 2
        const boardY = (height - boardSize) / 2
        drawBoard(ctx, engineState.board, boardX, boardY, boardSize, isDark, engineState.bestMove)
      }
    },
    [engineState, canvasConfig, isDark, showTree]
  )

  const { canvasRef, redraw } = useCanvas({
    config: canvasConfig,
    draw,
    animate: false,
  })

  // Redraw when state changes
  useEffect(() => {
    redraw()
  }, [engineState, redraw, showTree])

  // Control handlers
  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleAlgorithmChange = (algorithm: 'minimax' | 'alpha-beta') => {
    if (engineRef.current) {
      engineRef.current.setAlgorithm(algorithm)
      setEngineState(engineRef.current.getState())
    }
  }

  const handleAIMove = () => {
    if (!engineRef.current || !engineState) return

    if (engineState.winner) {
      return
    }

    engineRef.current.findBestMove()
    setEngineState(engineRef.current.getState())

    if (engineState.bestMove !== null) {
      setTimeout(() => {
        if (engineRef.current && engineState.bestMove !== null) {
          engineRef.current.makeMove(engineState.bestMove, 'O')
          setEngineState(engineRef.current.getState())
        }
      }, 300)
    }
  }

  const handleCellClick = (index: number) => {
    if (!engineRef.current || !engineState) return

    if (engineState.board[index] !== null || engineState.winner) {
      return
    }

    if (engineState.currentPlayer === 'X') {
      engineRef.current.makeMove(index, 'X')
      setEngineState(engineRef.current.getState())
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !engineState) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Scale coordinates from display size to canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    if (showTree && engineState.tree.length > 0) {
      // Handle tree node click
      const layout = calculateTreeLayout(
        engineState.tree,
        canvasConfig.width,
        canvasConfig.height - 150
      )
      const clickedNode = findNodeAtPosition(x, y, engineState.tree, layout)

      if (clickedNode && engineRef.current) {
        engineRef.current.selectNode(clickedNode.id)
        setEngineState(engineRef.current.getState())
      }
    } else if (!showTree) {
      // Handle board click
      const boardSize = Math.min(canvasConfig.width, canvasConfig.height) * 0.6
      const boardX = (canvasConfig.width - boardSize) / 2
      const boardY = (canvasConfig.height - boardSize) / 2

      if (x >= boardX && x <= boardX + boardSize && y >= boardY && y <= boardY + boardSize) {
        const cellSize = boardSize / 3
        const col = Math.floor((x - boardX) / cellSize)
        const row = Math.floor((y - boardY) / cellSize)
        const index = row * 3 + col

        if (index >= 0 && index < 9) {
          handleCellClick(index)
        }
      }
    }
  }

  // Helper function to find node at click position
  const findNodeAtPosition = (
    x: number,
    y: number,
    nodes: MinimaxNode[],
    layout: Map<string, { x: number; y: number }>
  ) => {
    const nodeRadius = 20
    for (const node of nodes) {
      const pos = layout.get(node.id)
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2)
        if (distance <= nodeRadius) {
          return node
        }
      }
    }
    return null
  }

  // Animation controls
  const handlePlayPauseAnimation = () => {
    if (!engineRef.current || !engineState) return

    if (isAnimationPlaying) {
      // Pause
      setIsAnimationPlaying(false)
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
        animationIntervalRef.current = undefined
      }
      engineRef.current.stopAnimation()
      setEngineState(engineRef.current.getState())
    } else {
      // Play
      if (!engineState.isAnimating) {
        engineRef.current.startAnimation()
        setEngineState(engineRef.current.getState())
      }

      setIsAnimationPlaying(true)
      animationIntervalRef.current = setInterval(() => {
        if (engineRef.current) {
          const hasMore = engineRef.current.stepAnimation()
          setEngineState(engineRef.current.getState())

          if (!hasMore) {
            setIsAnimationPlaying(false)
            if (animationIntervalRef.current) {
              clearInterval(animationIntervalRef.current)
              animationIntervalRef.current = undefined
            }
          }
        }
      }, 500) // Animate every 500ms
    }
  }

  const handleStepAnimation = () => {
    if (!engineRef.current || !engineState) return

    if (!engineState.isAnimating) {
      engineRef.current.startAnimation()
    }

    engineRef.current.stepAnimation()
    setEngineState(engineRef.current.getState())
  }

  const handleResetAnimation = () => {
    if (!engineRef.current) return

    setIsAnimationPlaying(false)
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current)
      animationIntervalRef.current = undefined
    }

    engineRef.current.stopAnimation()
    setEngineState(engineRef.current.getState())
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Minimax Algorithm</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          AI decision-making for Tic-Tac-Toe using Minimax with Alpha-Beta Pruning optimization
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Canvas with Controls */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0 overflow-visible">
            {/* Controls Above Canvas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Algorithm Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Algorithm:</span>
                  <select
                    value={engineState?.algorithm || 'minimax'}
                    onChange={(e) =>
                      handleAlgorithmChange(e.target.value as 'minimax' | 'alpha-beta')
                    }
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="minimax">Minimax</option>
                    <option value="alpha-beta">Alpha-Beta Pruning</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Tooltip text="AI Move">
                    <button
                      onClick={handleAIMove}
                      disabled={!!engineState?.winner || engineState?.currentPlayer !== 'O'}
                      className="px-3 py-1.5 flex items-center gap-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaBrain size={12} />
                      <span>AI Think</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="Show Best Move">
                    <button
                      onClick={handleAIMove}
                      disabled={!!engineState?.winner || engineState?.currentPlayer === 'O'}
                      className="px-3 py-1.5 flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaLightbulb size={12} />
                      <span>Hint</span>
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset Game">
                    <button
                      onClick={handleReset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Animation Controls (only show when tree exists) */}
                {engineState && engineState.tree.length > 0 && showTree && (
                  <>
                    <div className="flex gap-1">
                      <Tooltip text={isAnimationPlaying ? 'Pause Animation' : 'Play Animation'}>
                        <button
                          onClick={handlePlayPauseAnimation}
                          className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                        >
                          {isAnimationPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                        </button>
                      </Tooltip>
                      <Tooltip text="Step Forward">
                        <button
                          onClick={handleStepAnimation}
                          disabled={isAnimationPlaying}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaStepForward size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Reset Animation">
                        <button
                          onClick={handleResetAnimation}
                          disabled={!engineState.isAnimating && engineState.animationStep === 0}
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaRedo size={12} />
                        </button>
                      </Tooltip>
                    </div>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                  </>
                )}

                {/* View Toggle */}
                <Tooltip text={showTree ? 'Show Board' : 'Show Tree'}>
                  <button
                    onClick={() => setShowTree(!showTree)}
                    disabled={!engineState?.tree || engineState.tree.length === 0}
                    className={`px-3 py-1.5 rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      showTree
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {showTree ? '🎄 Tree View' : '🎮 Board View'}
                  </button>
                </Tooltip>

                <Tooltip text="Debug Mode">
                  <button
                    onClick={() => setIsDebugMode(!isDebugMode)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                      isDebugMode
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <VscDebugAltSmall size={14} />
                  </button>
                </Tooltip>
              </div>

              {/* Status Message */}
              {engineState && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        engineState.winner === 'X'
                          ? 'text-red-600'
                          : engineState.winner === 'O'
                            ? 'text-blue-600'
                            : engineState.winner === 'Draw'
                              ? 'text-gray-600'
                              : engineState.currentPlayer === 'X'
                                ? 'text-red-600'
                                : 'text-blue-600'
                      }`}
                    >
                      {engineState.winner
                        ? `Game Over: ${engineState.winner === 'Draw' ? 'Draw!' : `${engineState.winner} Wins!`}`
                        : `Current Player: ${engineState.currentPlayer}`}
                    </span>
                    {!engineState.winner && engineState.currentPlayer === 'O' && (
                      <span className="text-gray-500 text-xs">(AI)</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                    {engineState.message}
                  </p>
                </div>
              )}
            </div>

            {/* Canvas */}
            <div
              className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center justify-center overflow-auto"
              onClick={handleCanvasClick}
            >
              <Canvas canvasRef={canvasRef} config={canvasConfig} className="cursor-pointer" />
            </div>
          </div>

          {/* Right Side: Info Panel */}
          <div className="space-y-3 overflow-y-auto">
            {/* Statistics */}
            {engineState && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                  📊 Statistics
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Algorithm:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {engineState.algorithm === 'alpha-beta' ? 'Alpha-Beta' : 'Minimax'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Nodes Evaluated:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {engineState.nodesEvaluated}
                    </span>
                  </div>
                  {engineState.algorithm === 'alpha-beta' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Nodes Pruned:</span>
                        <span className="font-semibold text-green-600">
                          {engineState.nodesPruned}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
                        <span className="font-semibold text-purple-600">
                          {engineState.nodesEvaluated + engineState.nodesPruned > 0
                            ? (
                                (engineState.nodesPruned /
                                  (engineState.nodesEvaluated + engineState.nodesPruned)) *
                                100
                              ).toFixed(1)
                            : '0'}
                          %
                        </span>
                      </div>
                    </>
                  )}
                  {engineState.bestMove !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Best Move:</span>
                      <span className="font-semibold text-amber-600">
                        Position {engineState.bestMove}
                      </span>
                    </div>
                  )}
                  {engineState.isAnimating && (
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Animation:</span>
                      <span className="font-semibold text-purple-600">
                        {engineState.animationStep} / {engineState.tree.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* How to Play */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                🎮 How to Play
              </h3>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li>• Click cells to play as X (human)</li>
                <li>• Click "AI Think" for AI move (O)</li>
                <li>• Click "Hint" to see best move</li>
                <li>
                  • <strong>Switch to Tree View</strong> to see algorithm exploration
                </li>
                <li>
                  • <strong>Click tree nodes</strong> to inspect board states
                </li>
                <li>
                  • <strong>Use animation controls</strong> to watch tree building
                </li>
                <li>• Try Alpha-Beta Pruning for efficiency comparison</li>
              </ul>
            </div>

            {/* Algorithm Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                🧠 About Minimax
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Minimax is a decision-making algorithm for adversarial games. It explores all
                possible moves, assuming both players play optimally. Alpha-Beta Pruning optimizes
                by eliminating branches that won't affect the final decision, significantly reducing
                computation.
              </p>
            </div>

            {/* History (Debug Mode) */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                  📜 History (Last 10)
                </h3>
                <div className="space-y-1 text-xs max-h-60 overflow-y-auto">
                  {engineState.history
                    .slice(-10)
                    .reverse()
                    .map((step) => (
                      <div
                        key={step.iteration}
                        className="p-1.5 bg-gray-50 dark:bg-gray-900 rounded"
                      >
                        <div className="font-mono text-gray-700 dark:text-gray-300">
                          #{step.iteration}: {step.description}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Related Algorithms Section - Coming Soon */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                🔗 Related Algorithms
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Coming soon: A* Pathfinding, Genetic Algorithms, Monte Carlo Tree Search
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
