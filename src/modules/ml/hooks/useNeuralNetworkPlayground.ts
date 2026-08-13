import { useState, useMemo } from 'react'
import {
  createBooleanCodec,
  createNumberCodec,
  createNumberArrayCodec,
  createStringCodec,
  useShareableQueryState,
  type QueryCodec,
} from '@/core/share/query-state'
import type { ActivationFunction, RegularizationType } from '../engines/NeuralNetworkEngine'
import type { NeuralNetworkDatasetType } from '../algorithms/neuralNetworkDatasets'

export function useNeuralNetworkPlayground() {
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [isDebugMode, setIsDebugMode] = useState(false)
  const [dataset, setDataset] = useState<NeuralNetworkDatasetType>('circle')
  const [noise, setNoise] = useState(0.1)
  const [learningRate, setLearningRate] = useState(0.1)
  const [activation, setActivation] = useState<ActivationFunction>('tanh')
  const [regularization, setRegularization] = useState<RegularizationType>('none')
  const [regularizationRate, setRegularizationRate] = useState(0)
  const [hiddenLayers, setHiddenLayers] = useState<number[]>([4, 2])
  const [testRatio, setTestRatio] = useState(0.5)

  useShareableQueryState(
    useMemo(
      () => [
        {
          key: 'speed',
          value: animationSpeed,
          defaultValue: 500,
          setValue: setAnimationSpeed,
          codec: createNumberCodec({ min: 50, max: 2000, step: 50 }),
        },
        {
          key: 'debug',
          value: isDebugMode,
          defaultValue: false,
          setValue: setIsDebugMode,
          codec: createBooleanCodec(),
        },
        {
          key: 'dataset',
          value: dataset,
          defaultValue: 'circle' as NeuralNetworkDatasetType,
          setValue: setDataset,
          codec: createStringCodec({
            allowedValues: ['circle', 'xor', 'gaussian', 'spiral'],
          }) as QueryCodec<NeuralNetworkDatasetType>,
        },
        {
          key: 'noise',
          value: noise,
          defaultValue: 0.1,
          setValue: setNoise,
          codec: createNumberCodec({ min: 0, max: 0.5, step: 0.05 }),
        },
        {
          key: 'lr',
          value: learningRate,
          defaultValue: 0.1,
          setValue: setLearningRate,
          codec: createNumberCodec({ min: 0.001, max: 1, step: 0.001 }),
        },
        {
          key: 'activation',
          value: activation,
          defaultValue: 'tanh' as ActivationFunction,
          setValue: setActivation,
          codec: createStringCodec({
            allowedValues: ['relu', 'tanh', 'sigmoid', 'linear'],
          }) as QueryCodec<ActivationFunction>,
        },
        {
          key: 'reg',
          value: regularization,
          defaultValue: 'none' as RegularizationType,
          setValue: setRegularization,
          codec: createStringCodec({
            allowedValues: ['none', 'l1', 'l2'],
          }) as QueryCodec<RegularizationType>,
        },
        {
          key: 'regRate',
          value: regularizationRate,
          defaultValue: 0,
          setValue: setRegularizationRate,
          codec: createNumberCodec({ min: 0, max: 0.1, step: 0.001 }),
        },
        {
          key: 'layers',
          value: hiddenLayers,
          defaultValue: [4, 2],
          setValue: setHiddenLayers,
          codec: createNumberArrayCodec({ min: 1, max: 8, maxLength: 6 }),
        },
        {
          key: 'testRatio',
          value: testRatio,
          defaultValue: 0.5,
          setValue: setTestRatio,
          codec: createNumberCodec({ min: 0.1, max: 0.9, step: 0.1 }),
        },
      ],
      [
        animationSpeed,
        isDebugMode,
        dataset,
        noise,
        learningRate,
        activation,
        regularization,
        regularizationRate,
        hiddenLayers,
        testRatio,
      ]
    )
  )

  return {
    animationSpeed,
    setAnimationSpeed,
    isDebugMode,
    setIsDebugMode,
    dataset,
    setDataset,
    noise,
    setNoise,
    learningRate,
    setLearningRate,
    activation,
    setActivation,
    regularization,
    setRegularization,
    regularizationRate,
    setRegularizationRate,
    hiddenLayers,
    setHiddenLayers,
    testRatio,
    setTestRatio,
  }
}
