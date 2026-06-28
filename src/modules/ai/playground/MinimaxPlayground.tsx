'use client'

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { FaRedo, FaLightbulb, FaPlay, FaPause, FaStepForward } from 'react-icons/fa'
import { GiBookCover } from 'react-icons/gi'
import { Canvas, useCanvas } from '@/core/canvas'
import { Tooltip, Button, ShareButton } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { TheoryModal } from '@/components/TheoryModal'
import { MinimaxEngine } from '../engines/MinimaxEngine'
import { useMinimaxPlayground } from '../hooks/useMinimaxPlayground'
import type { MinimaxNode } from '../types'
import {
  drawBoard,
  drawTree,
  drawStatistics,
  calculateTreeLayout,
} from '../visualizers/minimaxVisualizer'

export function MinimaxPlayground() {
  const { isDebugMode } = useMinimaxPlayground()
  const [isDark, setIsDark] = useState<boolean>(false)
  const engineRef = useRef<MinimaxEngine | null>(null)
  const [engineState, setEngineState] = useState<any>(null)
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<boolean>(false)
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const [showExplanation, setShowExplanation] = useState<boolean>(false)

  const canvasConfig = useMemo(
    () => ({
      width: 1000,
      // reduced default height to avoid overflowing small screens
      height: 420,
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
    }),
    [isDark]
  )

  useEffect(() => {
    engineRef.current = new MinimaxEngine()
    // Generate initial tree so visualization is populated from the start
    engineRef.current.findBestMove()
    setEngineState(engineRef.current.getState())

    let cleanup = () => {}

    // detect dark mode preference
    if (typeof globalThis !== 'undefined' && globalThis.window && globalThis.window.matchMedia) {
      const mq = globalThis.window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mq.matches)
      const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsDark((e as MediaQueryList).matches)
      if ('addEventListener' in mq) mq.addEventListener('change', handler as any)
      else (mq as any).addListener?.(handler)

      cleanup = () => {
        if ('removeEventListener' in mq) mq.removeEventListener('change', handler as any)
        else (mq as any).removeListener?.(handler)
      }
    }

    return cleanup
  }, [])

  // Responsive containers: measure container sizes (Tailwind handles layout)
  const boardContainerRef = useRef<HTMLButtonElement | null>(null)
  const treeContainerRef = useRef<HTMLButtonElement | null>(null)

  const [boardDims, setBoardDims] = useState({
    width: Math.floor(canvasConfig.width * 0.4),
    height: canvasConfig.height,
  })
  const [treeDims, setTreeDims] = useState({
    width: Math.floor(canvasConfig.width * 0.6),
    height: canvasConfig.height,
  })

  const [topNodesCount, setTopNodesCount] = useState<number | 'all'>(10)

  const boardConfig = useMemo(() => ({ ...canvasConfig, width: boardDims.width, height: boardDims.height }), [canvasConfig, boardDims])
  const treeConfig = useMemo(() => ({ ...canvasConfig, width: treeDims.width, height: treeDims.height }), [canvasConfig, treeDims])

  useEffect(() => {
    const measure = () => {
      // Measure final container dimensions (Tailwind CSS handles sizing)
      if (boardContainerRef.current) {
        const r = boardContainerRef.current.getBoundingClientRect()
        setBoardDims({ width: Math.max(200, Math.floor(r.width)), height: Math.max(200, Math.floor(r.height)) })
      }
      if (treeContainerRef.current) {
        const r = treeContainerRef.current.getBoundingClientRect()
        setTreeDims({ width: Math.max(200, Math.floor(r.width)), height: Math.max(200, Math.floor(r.height)) })
      }
    }

    if (typeof globalThis !== 'undefined' && 'ResizeObserver' in (globalThis as any)) {
      const ro = new (globalThis as any).ResizeObserver(() => measure())
      if (boardContainerRef.current) ro.observe(boardContainerRef.current)
      if (treeContainerRef.current) ro.observe(treeContainerRef.current)
      measure()
      return () => ro.disconnect()
    }

    // Fallback: window resize
    measure()
    globalThis.addEventListener('resize', measure)
    return () => globalThis.removeEventListener('resize', measure)
  }, [])

  const drawBoardCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = boardConfig
      ctx.clearRect(0, 0, width, height)
      if (!engineState) return

      // Draw main game board centered in left canvas
      const boardSize = Math.min(width, height) * 0.9
      const boardX = (width - boardSize) / 2
      const boardY = (height - boardSize) / 2
      drawBoard(ctx, engineState.board, boardX, boardY, boardSize, isDark, engineState.bestMove)

      // Draw current player indicator when game active
      if (!engineState.winner) {
        const playerText = `Current Player: ${engineState.currentPlayer}`
        const subText = engineState.currentPlayer === 'O' ? '(AI is thinking...)' : '(Your turn)'
        ctx.fillStyle = engineState.currentPlayer === 'X' ? '#EF4444' : '#3B82F6'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(playerText, width / 2, 8)
        ctx.fillStyle = isDark ? '#9CA3AF' : '#6B7280'
        ctx.font = '12px sans-serif'
        ctx.fillText(subText, width / 2, 32)
      }

      // Draw game over overlay on board canvas if ended
      if (engineState.winner) {
        const message = engineState.winner === 'Draw' ? 'Game Over: Draw!' : `Game Over: ${engineState.winner} Wins!`
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)'
        ctx.fillRect(width / 2 - 180, height / 2 - 60, 360, 120)
        let borderColor = '#9CA3AF'
        if (engineState.winner === 'X') borderColor = '#EF4444'
        else if (engineState.winner === 'O') borderColor = '#3B82F6'
        let textColor = '#111827'
        if (engineState.winner === 'X') textColor = '#EF4444'
        else if (engineState.winner === 'O') textColor = '#3B82F6'
        ctx.strokeStyle = borderColor
        ctx.lineWidth = 3
        ctx.strokeRect(width / 2 - 180, height / 2 - 60, 360, 120)
        ctx.fillStyle = textColor
        ctx.font = 'bold 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(message, width / 2, height / 2 - 8)
        ctx.fillStyle = isDark ? '#D1D5DB' : '#6B7280'
        ctx.font = '14px sans-serif'
        ctx.fillText('Click Reset to play again', width / 2, height / 2 + 28)
      }
    },
    [boardConfig, engineState, isDark]
  )

  const drawTreeCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = treeConfig
      ctx.clearRect(0, 0, width, height)
      if (!engineState) return

      if (engineState.tree.length === 0) return

      // Determine which nodes to highlight based on topNodesCount
      const allNodes = engineState.tree
      let highlightIds: Set<string> | null = null
      if (topNodesCount !== 'all') {
        const scored = allNodes.filter((n: any) => n.score !== null && n.score !== undefined)
        scored.sort((a: any, b: any) => (b.score as number) - (a.score as number))
        const top = scored.slice(0, topNodesCount).map((n: any) => n.id)
        // Include each top node and its ancestor chain so the highlighted nodes stay connected
        highlightIds = new Set<string>()
        top.forEach((id: string) => {
          let currentId: string | undefined | null = id
          while (currentId) {
            highlightIds!.add(currentId)
            const parentNode = allNodes.find((n: any) => n.id === currentId)?.parent
            currentId = parentNode ?? null
          }
        })
      }

      const visibleNodes = engineState.isAnimating ? engineState.tree.slice(0, engineState.animationStep + 1) : engineState.tree
      // If highlighting a subset, compute layout only for the highlighted nodes so they are centered
      let layoutNodes = visibleNodes
      if (highlightIds !== null) {
        layoutNodes = visibleNodes.filter((n: any) => highlightIds.has(n.id))
      }
      const layout = calculateTreeLayout(layoutNodes, width, height - 80)
      drawTree(ctx, visibleNodes, layout, isDark, engineState.currentNode, engineState.selectedNodeId, highlightIds, true)

      // Draw statistics at bottom
      drawStatistics(ctx, engineState.nodesEvaluated, engineState.nodesPruned, 10, height - 40, isDark)
    },
    [treeConfig, engineState, isDark, topNodesCount]
  )

  const { canvasRef: boardCanvasRef, redraw: redrawBoard } = useCanvas({ config: boardConfig, draw: drawBoardCanvas, animate: false })
  const { canvasRef: treeCanvasRef, redraw: redrawTree } = useCanvas({ config: treeConfig, draw: drawTreeCanvas, animate: false })

  // Redraw both canvases when state changes
  useEffect(() => {
    redrawBoard()
    redrawTree()
  }, [engineState, redrawBoard, redrawTree])

  // Control handlers
  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset()
      // Generate tree after reset so it's visible
      engineRef.current.findBestMove()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleAlgorithmChange = (algorithm: 'minimax' | 'alpha-beta') => {
    if (engineRef.current) {
      engineRef.current.setAlgorithm(algorithm)
      // Regenerate tree with new algorithm
      engineRef.current.findBestMove()
      setEngineState(engineRef.current.getState())
    }
  }

  const handleHint = () => {
    if (!engineRef.current) return
    engineRef.current.findBestMove()
    setEngineState(engineRef.current.getState())
  }

  const handleAIMove = () => {
    if (!engineRef.current || !engineState) return

    if (engineState.winner) {
      return
    }

    // Use the already-generated tree to get best move
    // Don't regenerate tree - keep showing AI's thinking
    const currentState = engineRef.current.getState()
    
    if (currentState.bestMove !== null) {
      setTimeout(() => {
        if (engineRef.current) {
          const bestMove = engineRef.current.getState().bestMove
          if (bestMove !== null) {
            // Preserve the tree before making the move
            const treeBeforeMove = engineRef.current.getState().tree
            
            engineRef.current.makeMove(bestMove, 'O')
            const newState = engineRef.current.getState()
            
            // Restore the tree so it remains visible
            setEngineState({
              ...newState,
              tree: treeBeforeMove
            })
          }
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
      
      // Generate tree after user move to show AI's thinking
      engineRef.current.findBestMove()
      const newState = engineRef.current.getState()
      setEngineState(newState)

      // Automatically trigger AI move after human plays
      // Tree is already generated, AI will use it without regenerating
      if (!newState.winner && newState.currentPlayer === 'O') {
        setTimeout(() => {
          handleAIMove()
        }, 500)
      }
    }
  }

  const handleBoardClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!boardCanvasRef.current || !engineState) return

    const canvas = boardCanvasRef.current
    const rect = canvas.getBoundingClientRect()

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    // Board area is full canvas for left
    const boardSize = Math.min(canvas.width, canvas.height) * 0.9
    const boardX = (canvas.width - boardSize) / 2
    const boardY = (canvas.height - boardSize) / 2

    if (x >= boardX && x <= boardX + boardSize && y >= boardY && y <= boardY + boardSize) {
      const cellSize = boardSize / 3
      const col = Math.floor((x - boardX) / cellSize)
      const row = Math.floor((y - boardY) / cellSize)
      const index = row * 3 + col
      if (index >= 0 && index < 9) handleCellClick(index)
    }
  }

  const handleTreeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!treeCanvasRef.current || !engineState) return

    const canvas = treeCanvasRef.current
    const rect = canvas.getBoundingClientRect()

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    if (engineState.tree.length > 0) {
      const layout = calculateTreeLayout(engineState.tree, treeConfig.width, treeConfig.height - 80)
      const clickedNode = findNodeAtPosition(x, y, engineState.tree, layout)
      if (clickedNode && engineRef.current) {
        engineRef.current.selectNode(clickedNode.id)
        setEngineState(engineRef.current.getState())
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
        const distance = Math.hypot(x - pos.x, y - pos.y)
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

  // Status helpers removed — canvas is primary status display

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Minimax Algorithm</h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
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
          AI decision-making for Tic-Tac-Toe using Minimax with Alpha-Beta Pruning optimization
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden min-h-0">
          {/* Left Side: Canvas with Controls */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            {/* Controls Above Canvas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Algorithm selection */}
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Algorithm selection"
                    value={engineState?.algorithm || 'minimax'}
                    onChange={(e) => handleAlgorithmChange(e.target.value as 'minimax' | 'alpha-beta')}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="minimax">Minimax</option>
                    <option value="alpha-beta">Alpha-Beta Pruning</option>
                  </select>
                </div>

                {/* Top nodes selector */}
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Show top nodes"
                    value={topNodesCount}
                    onChange={(e) => {
                      const v = e.target.value
                      setTopNodesCount(v === 'all' ? 'all' : Number.parseInt(v, 10))
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none"
                  >
                    <option value="all">Show: All</option>
                    <option value="5">Top 5</option>
                    <option value="10">Top 10</option>
                  </select>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Tooltip text="Hint">
                    <button
                      onClick={handleHint}
                      disabled={!!engineState?.winner || engineState?.currentPlayer === 'O'}
                      aria-label="Hint"
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaLightbulb size={12} />
                    </button>
                  </Tooltip>

                  <Tooltip text="Reset Game">
                    <button
                      onClick={handleReset}
                      aria-label="Reset Game"
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>

                </div>

                {/* Animation Controls (only show when tree exists) */}
                {engineState && engineState.tree.length > 0 && (
                  <>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                    <div className="flex gap-1">
                      <Tooltip text={isAnimationPlaying ? 'Pause Animation' : 'Play Animation'}>
                        <button
                          onClick={handlePlayPauseAnimation}
                          aria-label="Play/Pause Animation"
                          className="w-8 h-8 flex items-center justify-center rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                        >
                          {isAnimationPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                        </button>
                      </Tooltip>
                      <Tooltip text="Step Forward">
                        <button
                          onClick={handleStepAnimation}
                          disabled={isAnimationPlaying}
                          aria-label="Step Animation"
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaStepForward size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip text="Reset Animation">
                        <button
                          onClick={handleResetAnimation}
                          disabled={!engineState.isAnimating && engineState.animationStep === 0}
                          aria-label="Reset Animation"
                          className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaRedo size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Canvas split: left = board (40%), right = tree (60%) */}
            <div className="flex-1 flex gap-3 min-h-0">
              {/* Board (left) - 40% */}
              <button
                type="button"
                ref={boardContainerRef}
                className="w-[40%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center justify-center overflow-hidden"
                onClick={handleBoardClick}
                aria-label="Tic Tac Toe board - click to play"
              >
                <Canvas canvasRef={boardCanvasRef} config={boardConfig} className="cursor-pointer" />
              </button>

              {/* Tree (right) - 60% */}
              <button
                type="button"
                ref={treeContainerRef}
                className="w-[60%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden flex items-center justify-center"
                onClick={handleTreeClick}
                aria-label="Minimax tree visualization - click nodes to inspect"
              >
                <Canvas canvasRef={treeCanvasRef} config={treeConfig} className="cursor-pointer" />
              </button>
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
                <li>• Click cells on the board to play as X (human)</li>
                <li>• AI (O) automatically plays after your move</li>
                <li>• Click "AI Move" button to force AI move when it&apos;s AI&apos;s turn</li>
                <li>• Click "Hint" button to see the best move suggestion</li>
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
                    .map((step: any) => (
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

      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/minimax.md"
        title="Understanding Minimax Algorithm"
      />
    </div>
  )
}
