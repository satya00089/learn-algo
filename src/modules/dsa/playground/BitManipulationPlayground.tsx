'use client'

import { useEffect, useRef, useState } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { ControlGroup } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { BitManipulationEngine } from '../engines/BitManipulationEngine'
import { useBitManipulationPlayground } from '../hooks/useBitManipulationPlayground'

export function BitManipulationPlayground() {
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const { animationSpeed, setAnimationSpeed, isDebugMode, setIsDebugMode } =
    useBitManipulationPlayground()

  const engineRef = useRef<BitManipulationEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    BitManipulationEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout>()

  const [num1Input, setNum1Input] = useState('15')
  const [num2Input, setNum2Input] = useState('10')
  const [bitPosInput, setBitPosInput] = useState('2')

  useEffect(() => {
    engineRef.current = new BitManipulationEngine()
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
    const n1 = Number.parseInt(num1Input) || 0
    const n2 = Number.parseInt(num2Input) || 0
    const pos = Number.parseInt(bitPosInput) || 0

    switch (op) {
      case 'AND':
        engineRef.current.startAND(n1, n2)
        break
      case 'OR':
        engineRef.current.startOR(n1, n2)
        break
      case 'XOR':
        engineRef.current.startXOR(n1, n2)
        break
      case 'NOT':
        engineRef.current.startNOT(n1)
        break
      case 'LEFT_SHIFT':
        engineRef.current.startLeftShift(n1, n2)
        break
      case 'RIGHT_SHIFT':
        engineRef.current.startRightShift(n1, n2)
        break
      case 'SET_BIT':
        engineRef.current.startSetBit(n1, pos)
        break
      case 'CLEAR_BIT':
        engineRef.current.startClearBit(n1, pos)
        break
      case 'TOGGLE_BIT':
        engineRef.current.startToggleBit(n1, pos)
        break
      case 'CHECK_BIT':
        engineRef.current.startCheckBit(n1, pos)
        break
      case 'COUNT_SET_BITS':
        engineRef.current.startCountSetBits(n1)
        break
      case 'IS_POWER_OF_TWO':
        engineRef.current.startIsPowerOfTwo(n1)
        break
    }
    setEngineState(engineRef.current.getState())
  }

  const renderBinary = (binary: string, label: string, highlightIndex?: number) => {
    return (
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</div>
        <div className="flex gap-1 justify-center">
          {binary.split('').map((bit, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm font-bold ${
                idx === highlightIndex
                  ? 'bg-yellow-400 text-gray-900'
                  : bit === '1'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {bit}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-1 px-1">
          <span>MSB</span>
          <span>LSB</span>
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bit Manipulation</h1>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Explore bitwise operations at the binary level - 8-bit visualization
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
                    onChange={(e) => setAnimationSpeed(Number.parseInt(e.target.value) || 500)}
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
              {engineState && engineState.operation ? (
                <div className="max-w-xl mx-auto">
                  {renderBinary(
                    engineState.num1Binary,
                    `Number 1: ${engineState.num1}`,
                    engineState.currentBitIndex
                  )}
                  {engineState.num2 > 0 &&
                    engineState.operation !== 'NOT' &&
                    renderBinary(
                      engineState.num2Binary,
                      `Number 2: ${engineState.num2}`,
                      engineState.currentBitIndex
                    )}
                  {engineState.operation && (
                    <div className="text-center text-2xl font-bold text-gray-700 dark:text-gray-300 my-4">
                      {engineState.operation}
                    </div>
                  )}
                  {renderBinary(
                    engineState.resultBinary,
                    `Result: ${engineState.result}`,
                    engineState.currentBitIndex
                  )}

                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      {engineState.message}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-400">
                      Phase: {engineState.phase}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💾</div>
                    <p className="text-gray-500 dark:text-gray-400">Select an operation to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Operations */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Inputs */}
            <ControlGroup title="Input Values">
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Number 1 (0-255)
                  </label>
                  <input
                    type="number"
                    value={num1Input}
                    onChange={(e) => setNum1Input(e.target.value)}
                    min={0}
                    max={255}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Number 2 / Shift Amount
                  </label>
                  <input
                    type="number"
                    value={num2Input}
                    onChange={(e) => setNum2Input(e.target.value)}
                    min={0}
                    max={255}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Bit Position (0-7)
                  </label>
                  <input
                    type="number"
                    value={bitPosInput}
                    onChange={(e) => setBitPosInput(e.target.value)}
                    min={0}
                    max={7}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Bitwise Operations */}
            <ControlGroup title="Bitwise Operations">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOperation('AND')}
                  disabled={isPlaying}
                  className="px-2 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                  AND (&)
                </button>
                <button
                  onClick={() => handleOperation('OR')}
                  disabled={isPlaying}
                  className="px-2 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                >
                  OR (|)
                </button>
                <button
                  onClick={() => handleOperation('XOR')}
                  disabled={isPlaying}
                  className="px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
                >
                  XOR (^)
                </button>
                <button
                  onClick={() => handleOperation('NOT')}
                  disabled={isPlaying}
                  className="px-2 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                >
                  NOT (~)
                </button>
              </div>
            </ControlGroup>

            {/* Shift Operations */}
            <ControlGroup title="Shift Operations">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOperation('LEFT_SHIFT')}
                  disabled={isPlaying}
                  className="px-2 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
                >
                  Left ({'<<'})
                </button>
                <button
                  onClick={() => handleOperation('RIGHT_SHIFT')}
                  disabled={isPlaying}
                  className="px-2 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
                >
                  Right ({'>>'})
                </button>
              </div>
            </ControlGroup>

            {/* Bit Manipulation */}
            <ControlGroup title="Bit Operations">
              <div className="space-y-2">
                <button
                  onClick={() => handleOperation('SET_BIT')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                >
                  Set Bit
                </button>
                <button
                  onClick={() => handleOperation('CLEAR_BIT')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                >
                  Clear Bit
                </button>
                <button
                  onClick={() => handleOperation('TOGGLE_BIT')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:opacity-50"
                >
                  Toggle Bit
                </button>
                <button
                  onClick={() => handleOperation('CHECK_BIT')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                >
                  Check Bit
                </button>
              </div>
            </ControlGroup>

            {/* Utilities */}
            <ControlGroup title="Utilities">
              <div className="space-y-2">
                <button
                  onClick={() => handleOperation('COUNT_SET_BITS')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50"
                >
                  Count Set Bits
                </button>
                <button
                  onClick={() => handleOperation('IS_POWER_OF_TWO')}
                  disabled={isPlaying}
                  className="w-full px-2 py-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50"
                >
                  Is Power of 2?
                </button>
              </div>
            </ControlGroup>

            {/* Debug Info */}
            {isDebugMode && engineState && engineState.history.length > 0 && (
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
                        {step.description}
                      </div>
                    ))}
                </div>
              </ControlGroup>
            )}
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
                <RelatedAlgorithms route="bit-manipulation" type="dsa" compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
