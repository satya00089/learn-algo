'use client'

import { useEffect, useRef, useState } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { VscDebugAltSmall } from 'react-icons/vsc'
import { GiBookCover } from 'react-icons/gi'
import { ControlGroup, Tooltip, Button } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { RelatedAlgorithms } from '@/components/RelatedAlgorithms'
import { TheoryModal } from '@/components/TheoryModal'
import { StringOperationsEngine } from '../engines/StringOperationsEngine'
import { useStringOperationsPlayground } from '../hooks/useStringOperationsPlayground'

export function StringOperationsPlayground() {
  const { animationSpeed, setAnimationSpeed, isDebugMode, setIsDebugMode } =
    useStringOperationsPlayground()
  const [isRelatedOpen, setIsRelatedOpen] = useState(false)
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )

  const engineRef = useRef<StringOperationsEngine | null>(null)
  const [engineState, setEngineState] = useState<ReturnType<
    StringOperationsEngine['getState']
  > | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const [str1Input, setStr1Input] = useState('racecar')
  const [str2Input, setStr2Input] = useState('carecar')
  const [patternInput, setPatternInput] = useState('ace')

  useEffect(() => {
    engineRef.current = new StringOperationsEngine()
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

    switch (op) {
      case 'REVERSE':
        engineRef.current.startReverse(str1Input)
        break
      case 'PALINDROME':
        engineRef.current.startPalindrome(str1Input)
        break
      case 'ANAGRAM':
        engineRef.current.startAnagram(str1Input, str2Input)
        break
      case 'SUBSTRING_SEARCH':
        engineRef.current.startSubstringSearch(str1Input, patternInput)
        break
      case 'CHAR_FREQUENCY':
        engineRef.current.startCharFrequency(str1Input)
        break
      case 'REMOVE_DUPLICATES':
        engineRef.current.startRemoveDuplicates(str1Input)
        break
    }
    setEngineState(engineRef.current.getState())
  }

  const renderStringChars = (chars: any[], label: string) => {
    if (chars.length === 0) return null

    return (
      <div className="mb-4">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{label}</div>
        <div className="flex flex-wrap gap-1 justify-center">
          {chars.map((charObj, idx) => {
            let bgColor = 'bg-gray-200 dark:bg-gray-700'
            let textColor = 'text-gray-800 dark:text-gray-200'

            if (charObj.state === 'comparing') {
              bgColor = 'bg-yellow-400'
              textColor = 'text-gray-900'
            } else if (charObj.state === 'matched') {
              bgColor = 'bg-green-500'
              textColor = 'text-white'
            } else if (charObj.state === 'processed') {
              bgColor = 'bg-blue-500'
              textColor = 'text-white'
            }

            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded font-mono text-sm font-bold ${bgColor} ${textColor}`}
                >
                  {charObj.char}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">{idx}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 flex items-center">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">String Operations</h1>
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
          Visualize string manipulation algorithms step-by-step
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden min-h-0">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
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
              {engineState?.operation ? (
                <div className="max-w-4xl mx-auto">
                  {renderStringChars(engineState.str1Chars, `String 1: "${engineState.str1}"`)}

                  {engineState.str2Chars.length > 0 &&
                    renderStringChars(engineState.str2Chars, `String 2: "${engineState.str2}"`)}

                  {engineState.operation && (
                    <div className="text-center text-xl font-bold text-gray-700 dark:text-gray-300 my-4">
                      {engineState.operation.replace('_', ' ')}
                    </div>
                  )}

                  {engineState.result && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                        Result:
                      </div>
                      <div className="text-lg font-mono text-green-700 dark:text-green-400">
                        {engineState.result}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      {engineState.message}
                    </div>
                  </div>

                  {/* Character Frequency Display */}
                  {engineState.charFrequency && engineState.charFrequency.size > 0 && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                        Character Frequency:
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from(engineState.charFrequency.entries()).map(([char, count]) => (
                          <div key={char} className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                              &apos;{char}&apos;
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">: {count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-500 dark:text-gray-400">Select an operation to begin</p>
                  </div>
                </div>
              )}
            </div>

            {/* Color Legend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <span className="text-gray-600 dark:text-gray-300">Default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span className="text-gray-600 dark:text-gray-300">Comparing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Matched</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Processed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Operations */}
          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            {/* Inputs */}
            <ControlGroup title="Input Strings">
              <div className="space-y-2">
                <div>
                  <label htmlFor="str1-input" className="text-xs text-gray-600 dark:text-gray-400">
                    String 1
                  </label>
                  <input
                    id="str1-input"
                    type="text"
                    value={str1Input}
                    onChange={(e) => setStr1Input(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="str2-input" className="text-xs text-gray-600 dark:text-gray-400">
                    String 2 (for comparison)
                  </label>
                  <input
                    id="str2-input"
                    type="text"
                    value={str2Input}
                    onChange={(e) => setStr2Input(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pattern-input"
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    Pattern (for search)
                  </label>
                  <input
                    id="pattern-input"
                    type="text"
                    value={patternInput}
                    onChange={(e) => setPatternInput(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </ControlGroup>

            {/* Basic Operations */}
            <ControlGroup title="Basic Operations">
              <div className="space-y-2">
                <button
                  onClick={() => handleOperation('REVERSE')}
                  disabled={isPlaying || !str1Input}
                  className="w-full px-2 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🔄 Reverse String
                </button>
                <button
                  onClick={() => handleOperation('REMOVE_DUPLICATES')}
                  disabled={isPlaying || !str1Input}
                  className="w-full px-2 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🧹 Remove Duplicates
                </button>
              </div>
            </ControlGroup>

            {/* Checking Operations */}
            <ControlGroup title="Checking Operations">
              <div className="space-y-2">
                <button
                  onClick={() => handleOperation('PALINDROME')}
                  disabled={isPlaying || !str1Input}
                  className="w-full px-2 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  ↔️ Check Palindrome
                </button>
                <button
                  onClick={() => handleOperation('ANAGRAM')}
                  disabled={isPlaying || !str1Input || !str2Input}
                  className="w-full px-2 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🔀 Check Anagram
                </button>
              </div>
            </ControlGroup>

            {/* Search & Analysis */}
            <ControlGroup title="Search & Analysis">
              <div className="space-y-2">
                <button
                  onClick={() => handleOperation('SUBSTRING_SEARCH')}
                  disabled={isPlaying || !str1Input || !patternInput}
                  className="w-full px-2 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  🔍 Substring Search
                </button>
                <button
                  onClick={() => handleOperation('CHAR_FREQUENCY')}
                  disabled={isPlaying || !str1Input}
                  className="w-full px-2 py-2 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded disabled:opacity-50 font-semibold"
                >
                  📊 Character Frequency
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

            {/* About */}
            <ControlGroup title="About">
              <div className="text-[10px] text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Reverse:</strong> O(n)
                </p>
                <p>
                  <strong>Palindrome:</strong> O(n)
                </p>
                <p>
                  <strong>Anagram:</strong> O(n log n)
                </p>
                <p>
                  <strong>Search:</strong> O(n*m)
                </p>
                <p>
                  <strong>Frequency:</strong> O(n)
                </p>
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
                <RelatedAlgorithms route="strings" type="dsa" compact />
              </div>
            )}
          </div>
        </div>
      </div>

      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/dsa/strings.md"
        title="Understanding String Operations"
      />
    </div>
  )
}
