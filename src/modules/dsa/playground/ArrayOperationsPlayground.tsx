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
  FaSearch,
  FaEdit,
  FaTrash,
  FaExchangeAlt,
  FaBroom,
} from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { Canvas, useCanvas } from '@/core/canvas'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { ArrayOperationsEngine } from '../engines/ArrayOperationsEngine'
import { useArrayOperationsPlayground } from '../hooks/useArrayOperationsPlayground'
import { drawArray } from '../visualizers/sortingVisualizer'

/**
 * Array Operations Playground
 * Visualizes common array/list operations
 */
export function ArrayOperationsPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const {
    arraySize,
    setArraySize,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    generateRandomArray,
  } = useArrayOperationsPlayground()

  const engineRef = useRef<ArrayOperationsEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    ArrayOperationsEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  // Operation inputs
  const [appendValue, setAppendValue] = useState('')
  const [insertIndex, setInsertIndex] = useState('')
  const [insertValue, setInsertValue] = useState('')
  const [deleteIndex, setDeleteIndex] = useState('')
  const [updateIndex, setUpdateIndex] = useState('')
  const [updateValue, setUpdateValue] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [indexSearchValue, setIndexSearchValue] = useState('')

  // Canvas configuration
  const canvasConfig = useMemo(
    () => ({
      width: 1200,
      height: 400,
      padding: { top: 40, right: 40, bottom: 80, left: 40 },
    }),
    []
  )

  // Initialize engine with random array
  useEffect(() => {
    const initialArray = generateRandomArray(arraySize)
    engineRef.current = new ArrayOperationsEngine(initialArray)
    setEngineState(engineRef.current.getState())
  }, [arraySize, generateRandomArray])

  // Draw function for canvas
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height, padding } = canvasConfig

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      if (!engineState) return

      // Draw array bars
      drawArray(ctx, engineState.array, {
        canvasWidth: width,
        canvasHeight: height,
        padding: padding.left,
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current)
      }
    }
  }, [])

  const handleGenerateNewArray = () => {
    const newArray = generateRandomArray(arraySize)
    if (engineRef.current) {
      engineRef.current.updateArray(newArray)
      setEngineState(engineRef.current.getState())
    }
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
    }
  }

  // Operation handlers
  const handleAppend = () => {
    const value = Number.parseInt(appendValue)
    if (Number.isNaN(value) || !engineRef.current) return

    engineRef.current.startAppend(value)
    setEngineState(engineRef.current.getState())
    setAppendValue('')
  }

  const handleInsert = () => {
    const index = Number.parseInt(insertIndex)
    const value = Number.parseInt(insertValue)
    if (Number.isNaN(index) || Number.isNaN(value) || !engineRef.current) return

    engineRef.current.startInsert(index, value)
    setEngineState(engineRef.current.getState())
    setInsertIndex('')
    setInsertValue('')
  }

  const handleDelete = () => {
    const index = Number.parseInt(deleteIndex)
    if (Number.isNaN(index) || !engineRef.current) return

    engineRef.current.startDelete(index)
    setEngineState(engineRef.current.getState())
    setDeleteIndex('')
  }

  const handleUpdate = () => {
    const index = Number.parseInt(updateIndex)
    const value = Number.parseInt(updateValue)
    if (Number.isNaN(index) || Number.isNaN(value) || !engineRef.current) return

    engineRef.current.startUpdate(index, value)
    setEngineState(engineRef.current.getState())
    setUpdateIndex('')
    setUpdateValue('')
  }

  const handleSearch = () => {
    const value = Number.parseInt(searchValue)
    if (Number.isNaN(value) || !engineRef.current) return

    engineRef.current.startSearch(value)
    setEngineState(engineRef.current.getState())
    setSearchValue('')
  }

  const handleIndexSearch = () => {
    const index = Number.parseInt(indexSearchValue)
    if (Number.isNaN(index) || !engineRef.current) return

    engineRef.current.startIndexSearch(index)
    setEngineState(engineRef.current.getState())
    setIndexSearchValue('')
  }

  const handleReverse = () => {
    if (!engineRef.current) return
    engineRef.current.startReverse()
    setEngineState(engineRef.current.getState())
  }

  const handleClear = () => {
    if (!engineRef.current) return
    engineRef.current.startClear()
    setEngineState(engineRef.current.getState())
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
      case 'idle':
        return '⏸️ Ready for operation'
      case 'searching':
        return '🔍 Searching for value'
      case 'found':
        return '✅ Element found'
      case 'notFound':
        return '❌ Element not found'
      case 'inserting':
        return '📥 Inserting element'
      case 'deleting':
        return '🗑️ Deleting element'
      case 'updating':
        return '✏️ Updating element'
      case 'shifting':
        return '↔️ Shifting elements'
      case 'complete':
        return '✅ Operation complete'
      default:
        return ''
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        {/* Header with Back Button and Theme Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Array Operations</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Explore common array/list operations: append, insert, delete, search, update, and more
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          {/* Left Side: Canvas with Controls on Top */}
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0 overflow-visible">
            {/* Playback Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Execution Buttons */}
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play'}>
                    <button
                      onClick={handlePlayPause}
                      disabled={engineState?.isOperationComplete}
                      className="w-8 h-8 flex items-center justify-center rounded bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                {/* Array Size Slider */}
                <div className="flex items-center gap-1.5">
                  <Tooltip text="Array Size">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Size:</span>
                  </Tooltip>
                  <input
                    type="number"
                    value={arraySize}
                    min={3}
                    max={20}
                    step={1}
                    onChange={(e) => setArraySize(Number.parseInt(e.target.value) || 3)}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Animation Speed Slider */}
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
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Debug Toggle */}
                <Tooltip text="Debug Mode">
                  <button
                    onClick={() => setIsDebugMode(!isDebugMode)}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                      isDebugMode
                        ? 'bg-cyan-600 border-cyan-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <VscDebugAltSmall size={16} />
                  </button>
                </Tooltip>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {/* Generate New Array Button */}
                <Tooltip text="Generate New Array">
                  <button
                    onClick={handleGenerateNewArray}
                    className="px-3 h-8 flex items-center gap-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs transition-colors"
                  >
                    <FaRandom size={12} />
                    New Array
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
                  <span className="text-xs text-gray-600 dark:text-gray-300">Default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Operating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500 border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300">Result</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Operation Controls and Info */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Current State */}
            {engineState && (
              <ControlGroup title="Current State">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Array Length:</span>
                  <span className="font-semibold text-right">{engineState.array.length}</span>

                  <span className="text-gray-600 dark:text-gray-400">Operation:</span>
                  <span className="font-semibold text-right">
                    {engineState.currentOperation || 'None'}
                  </span>

                  <span className="text-gray-600 dark:text-gray-400">Comparisons:</span>
                  <span className="font-semibold text-right">{engineState.comparisons}</span>

                  <span className="text-gray-600 dark:text-gray-400">Shifts:</span>
                  <span className="font-semibold text-right">{engineState.shifts}</span>

                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-semibold text-right">
                    {engineState.isOperationComplete ? '✓ Ready' : '⟳ Running'}
                  </span>
                </div>
              </ControlGroup>
            )}

            {/* Append Operation */}
            <ControlGroup title="Append (Add to End)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Add element to end - O(1)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={appendValue}
                    onChange={(e) => setAppendValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleAppend}
                    disabled={!appendValue || isPlaying}
                    className="px-3 py-1 flex items-center gap-1 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaPlus size={10} /> Append
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Insert Operation */}
            <ControlGroup title="Insert (Add at Index)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Insert at specific index - O(n)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={insertIndex}
                    onChange={(e) => setInsertIndex(e.target.value)}
                    placeholder="Index"
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="number"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleInsert}
                    disabled={!insertIndex || !insertValue || isPlaying}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Insert
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Delete Operation */}
            <ControlGroup title="Delete (Remove at Index)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Remove element at index - O(n)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={deleteIndex}
                    onChange={(e) => setDeleteIndex(e.target.value)}
                    placeholder="Index"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={!deleteIndex || isPlaying}
                    className="px-3 py-1 flex items-center gap-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaTrash size={10} /> Delete
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Update Operation */}
            <ControlGroup title="Update (Modify at Index)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Change value at index - O(1)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={updateIndex}
                    onChange={(e) => setUpdateIndex(e.target.value)}
                    placeholder="Index"
                    className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <input
                    type="number"
                    value={updateValue}
                    onChange={(e) => setUpdateValue(e.target.value)}
                    placeholder="New Value"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={!updateIndex || !updateValue || isPlaying}
                    className="px-3 py-1 flex items-center gap-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaEdit size={10} /> Update
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Search Operation */}
            <ControlGroup title="Search (Find Value)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Linear search for value - O(n)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Value"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={!searchValue || isPlaying}
                    className="px-3 py-1 flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaSearch size={10} /> Search
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Index Access Operation */}
            <ControlGroup title="Index Access (Get by Index)">
              <div className="space-y-2">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Direct access by index - O(1)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={indexSearchValue}
                    onChange={(e) => setIndexSearchValue(e.target.value)}
                    placeholder="Index"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleIndexSearch}
                    disabled={!indexSearchValue || isPlaying}
                    className="px-3 py-1 flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaSearch size={10} /> Get
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* Other Operations */}
            <ControlGroup title="Other Operations">
              <div className="space-y-2">
                <button
                  onClick={handleReverse}
                  disabled={isPlaying || !engineState || engineState.array.length === 0}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaExchangeAlt size={10} /> Reverse Array - O(n)
                </button>
                <button
                  onClick={handleClear}
                  disabled={isPlaying || !engineState || engineState.array.length === 0}
                  className="w-full px-3 py-2 flex items-center justify-center gap-2 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaBroom size={10} /> Clear Array - O(1)
                </button>
              </div>
            </ControlGroup>

            {/* Debug Mode Info */}
            {isDebugMode && engineState && (
              <ControlGroup title="Debug Details">
                <div className="space-y-2 text-xs">
                  {/* Current Phase */}
                  {!engineState.isOperationComplete && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                      <div className="font-semibold text-green-700 dark:text-green-300 mb-1">
                        Current Phase:
                      </div>
                      <div className="text-green-900 dark:text-green-100 text-[10px] font-semibold">
                        {getPhaseDescription()}
                      </div>
                      <div className="text-green-700 dark:text-green-300 text-[10px] mt-1">
                        Index: {engineState.currentIndex} | Target: {engineState.targetIndex}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Current Array:
                    </div>
                    <div className="font-mono text-[10px] text-gray-600 dark:text-gray-400 break-words">
                      [{engineState.array.map((el) => el.value).join(', ')}]
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

            {/* Complexity Reference */}
            <ControlGroup title="Time Complexity">
              <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Append:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">O(1)</span>
                </div>
                <div className="flex justify-between">
                  <span>Insert:</span>
                  <span className="font-mono text-orange-600 dark:text-orange-400">O(n)</span>
                </div>
                <div className="flex justify-between">
                  <span>Delete:</span>
                  <span className="font-mono text-orange-600 dark:text-orange-400">O(n)</span>
                </div>
                <div className="flex justify-between">
                  <span>Update:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">O(1)</span>
                </div>
                <div className="flex justify-between">
                  <span>Search:</span>
                  <span className="font-mono text-orange-600 dark:text-orange-400">O(n)</span>
                </div>
                <div className="flex justify-between">
                  <span>Index Access:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">O(1)</span>
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
                <RelatedAlgorithms route="array-operations" type="dsa" compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
