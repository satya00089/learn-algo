import { useState, useCallback, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  useShareableQueryState,
} from '@/core/share/query-state'
import { createSeededRandom, generateRandomSeed } from '@/core/utils'

export function useBinarySearchPlayground() {
  const [arraySize, setArraySize] = useState(15)
  const [target, setTarget] = useState(50)
  const [animationSpeed, setAnimationSpeed] = useState(800)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [seed, setSeed] = useState(() => generateRandomSeed())

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'size',
          value: arraySize,
          defaultValue: 15,
          setValue: setArraySize,
          codec: createNumberCodec({ min: 5, max: 30, step: 1 }),
        },
        {
          key: 'target',
          value: target,
          defaultValue: 50,
          setValue: setTarget,
          codec: createNumberCodec({ min: 1, max: 100, step: 1 }),
        },
        {
          key: 'speed',
          value: animationSpeed,
          defaultValue: 800,
          setValue: setAnimationSpeed,
          codec: createNumberCodec({ min: 50, max: 1000, step: 50 }),
        },
        {
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
        {
          key: 'seed',
          value: seed,
          defaultValue: seed,
          setValue: setSeed,
          codec: createNumberCodec({ min: 1, max: 2147483647, step: 1 }),
          includeDefaultInUrl: true,
        },
      ],
      [animationSpeed, arraySize, isDebugMode, seed, target]
    )
  )

  const generateSortedArray = useCallback((size: number): number[] => {
    const random = createSeededRandom(seed)
    const arr: number[] = []
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(random() * 100) + 1)
    }
    return arr.sort((a, b) => a - b)
  }, [seed])

  return {
    arraySize,
    setArraySize,
    target,
    setTarget,
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    seed,
    setSeed,
    generateSortedArray,
  }
}
