import { NeuralNetworkEngine, type NeuralNetworkSnapshot } from '../engines/NeuralNetworkEngine'

type NeuralNetworkRunRequest = {
  type: 'run'
  snapshot: NeuralNetworkSnapshot
}

type NeuralNetworkRunResponse =
  | {
      type: 'done'
      state: ReturnType<NeuralNetworkEngine['getState']>
    }
  | {
      type: 'error'
      error: string
    }

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<NeuralNetworkRunRequest>) => void) | null
  postMessage: (message: NeuralNetworkRunResponse) => void
}

workerScope.onmessage = (event: MessageEvent<NeuralNetworkRunRequest>) => {
  const { data } = event

  if (data.type !== 'run') return

  try {
    const engine = NeuralNetworkEngine.fromSnapshot(data.snapshot)
    engine.run()

    const response: NeuralNetworkRunResponse = {
      type: 'done',
      state: engine.getState(),
    }
    workerScope.postMessage(response)
  } catch (error) {
    const response: NeuralNetworkRunResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown neural network worker error',
    }
    workerScope.postMessage(response)
  }
}

export {}
