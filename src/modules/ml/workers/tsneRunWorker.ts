import { TSNEEngine, type TSNESnapshot } from '../engines/TSNEEngine'

type TSNERunRequest = {
  type: 'run'
  snapshot: TSNESnapshot
}

type TSNERunResponse =
  | {
      type: 'done'
      state: ReturnType<TSNEEngine['getState']>
    }
  | {
      type: 'error'
      error: string
    }

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<TSNERunRequest>) => void) | null
  postMessage: (message: TSNERunResponse) => void
}

workerScope.onmessage = (event: MessageEvent<TSNERunRequest>) => {
  const { data } = event

  if (data.type !== 'run') return

  try {
    const engine = TSNEEngine.fromSnapshot(data.snapshot)
    engine.run()

    const response: TSNERunResponse = {
      type: 'done',
      state: engine.getState(),
    }
    workerScope.postMessage(response)
  } catch (error) {
    const response: TSNERunResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown t-SNE worker error',
    }
    workerScope.postMessage(response)
  }
}

export {}
