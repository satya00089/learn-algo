export interface HistoryStep {
  iteration: number
  description: string
  timestamp: number
  depth?: number
}

export type RecursionOperation =
  | 'FACTORIAL'
  | 'FIBONACCI'
  | 'TOWER_OF_HANOI'
  | 'POWER'
  | 'SUM_ARRAY'

export type RecursionPhase =
  | 'idle'
  | 'calling'
  | 'computing'
  | 'returning'
  | 'complete'

export interface RecursionCall {
  depth: number
  n: number
  result?: number
  state: 'active' | 'waiting' | 'complete'
}

export interface RecursionState {
  operation: RecursionOperation | null
  phase: RecursionPhase
  n: number
  result: number
  callStack: RecursionCall[]
  currentDepth: number
  maxDepth: number
  message: string
  history: HistoryStep[]
  isOperationComplete: boolean
  // For Tower of Hanoi
  towers?: {
    A: number[]
    B: number[]
    C: number[]
  }
  moves?: string[]
}

/**
 * Recursion Engine
 * Visualizes recursive algorithm execution with call stack
 */
export class RecursionEngine {
  private readonly state: RecursionState
  private iterationCount: number

  constructor() {
    this.state = {
      operation: null,
      phase: 'idle',
      n: 0,
      result: 0,
      callStack: [],
      currentDepth: 0,
      maxDepth: 0,
      message: 'Ready',
      history: [],
      isOperationComplete: true,
    }
    this.iterationCount = 0
  }

  private addHistory(description: string, depth?: number): void {
    this.iterationCount++
    this.state.history.push({
      iteration: this.iterationCount,
      description,
      timestamp: Date.now(),
      depth,
    })
  }

  // Factorial
  startFactorial(n: number): void {
    this.state.operation = 'FACTORIAL'
    this.state.n = n
    this.state.result = 0
    this.state.callStack = []
    this.state.currentDepth = 0
    this.state.maxDepth = n
    this.state.phase = 'calling'
    this.state.message = `Computing factorial of ${n}`
    this.state.isOperationComplete = false
    this.addHistory(`FACTORIAL(${n})`)
    this.state.callStack.push({ depth: 0, n, state: 'active' })
  }

  // Fibonacci
  startFibonacci(n: number): void {
    this.state.operation = 'FIBONACCI'
    this.state.n = n
    this.state.result = 0
    this.state.callStack = []
    this.state.currentDepth = 0
    this.state.maxDepth = n
    this.state.phase = 'calling'
    this.state.message = `Computing fibonacci(${n})`
    this.state.isOperationComplete = false
    this.addHistory(`FIBONACCI(${n})`)
    this.state.callStack.push({ depth: 0, n, state: 'active' })
  }

  // Tower of Hanoi
  startTowerOfHanoi(n: number): void {
    this.state.operation = 'TOWER_OF_HANOI'
    this.state.n = n
    this.state.result = 0
    this.state.callStack = []
    this.state.currentDepth = 0
    this.state.maxDepth = n
    this.state.phase = 'calling'
    this.state.message = `Solving Tower of Hanoi with ${n} disks`
    this.state.isOperationComplete = false
    this.state.towers = {
      A: Array.from({ length: n }, (_, i) => n - i),
      B: [],
      C: [],
    }
    this.state.moves = []
    this.addHistory(`TOWER_OF_HANOI(${n}, A, C, B)`)
  }

  // Power
  startPower(base: number, exp: number): void {
    this.state.operation = 'POWER'
    this.state.n = exp
    this.state.result = 0
    this.state.callStack = []
    this.state.currentDepth = 0
    this.state.maxDepth = exp
    this.state.phase = 'calling'
    this.state.message = `Computing ${base}^${exp}`
    this.state.isOperationComplete = false
    this.addHistory(`POWER(${base}, ${exp})`)
    this.state.callStack.push({ depth: 0, n: exp, state: 'active' })
  }

  step(): void {
    if (this.state.isOperationComplete) return

    switch (this.state.operation) {
      case 'FACTORIAL':
        this.stepFactorial()
        break
      case 'FIBONACCI':
        this.stepFibonacci()
        break
      case 'TOWER_OF_HANOI':
        this.stepTowerOfHanoi()
        break
      case 'POWER':
        this.stepPower()
        break
    }
  }

  private stepFactorial(): void {
    const { phase, callStack } = this.state

    if (phase === 'calling') {
      const current = callStack[callStack.length - 1]
      if (current.n <= 1) {
        current.result = 1
        current.state = 'complete'
        this.state.phase = 'returning'
        this.addHistory(`Base case: factorial(${current.n}) = 1`, current.depth)
      } else {
        const nextN = current.n - 1
        const nextDepth = current.depth + 1
        callStack.push({ depth: nextDepth, n: nextN, state: 'active' })
        current.state = 'waiting'
        this.addHistory(`Call: factorial(${nextN})`, nextDepth)
      }
      return
    }

    if (phase === 'returning') {
      if (callStack.length === 1) {
        this.state.result = callStack[0].result || 0
        this.state.phase = 'complete'
        this.state.message = `Result: ${this.state.result}`
        this.state.isOperationComplete = true
        this.addHistory(`Final result: ${this.state.result}`)
        return
      }

      const completed = callStack.pop()!
      const parent = callStack[callStack.length - 1]
      parent.result = parent.n * (completed.result || 1)
      parent.state = 'complete'
      this.addHistory(
        `Return: factorial(${parent.n}) = ${parent.n} × ${completed.result} = ${parent.result}`,
        parent.depth
      )
    }
  }

  private stepFibonacci(): void {
    const { phase, callStack } = this.state

    if (phase === 'calling') {
      const current = callStack[callStack.length - 1]
      if (current.n <= 1) {
        current.result = current.n
        current.state = 'complete'
        this.state.phase = 'returning'
        this.addHistory(`Base case: fib(${current.n}) = ${current.n}`, current.depth)
      } else {
        // Simplified: just compute iteratively for visualization
        let a = 0,
          b = 1
        for (let i = 2; i <= current.n; i++) {
          const temp = a + b
          a = b
          b = temp
        }
        current.result = b
        current.state = 'complete'
        this.state.phase = 'returning'
        this.addHistory(`Computed: fib(${current.n}) = ${b}`, current.depth)
      }
      return
    }

    if (phase === 'returning') {
      this.state.result = callStack[0].result || 0
      this.state.phase = 'complete'
      this.state.message = `Result: ${this.state.result}`
      this.state.isOperationComplete = true
      this.addHistory(`Final result: ${this.state.result}`)
    }
  }

  private stepTowerOfHanoi(): void {
    if (this.state.phase === 'calling') {
      // Solve iteratively and record moves
      this.solveTowerOfHanoi(this.state.n, 'A', 'C', 'B')
      this.state.phase = 'complete'
      this.state.result = this.state.moves?.length || 0
      this.state.message = `Solved in ${this.state.result} moves`
      this.state.isOperationComplete = true
      this.addHistory(`Total moves: ${this.state.result}`)
    }
  }

  private solveTowerOfHanoi(n: number, from: string, to: string, aux: string): void {
    if (n === 1) {
      this.moveDisk(from, to)
      return
    }
    this.solveTowerOfHanoi(n - 1, from, aux, to)
    this.moveDisk(from, to)
    this.solveTowerOfHanoi(n - 1, aux, to, from)
  }

  private moveDisk(from: string, to: string): void {
    const towers = this.state.towers!
    const disk = towers[from as keyof typeof towers].pop()!
    towers[to as keyof typeof towers].push(disk)
    const move = `Move disk ${disk} from ${from} to ${to}`
    this.state.moves?.push(move)
    this.addHistory(move)
  }

  private stepPower(): void {
    const { phase, callStack } = this.state

    if (phase === 'calling') {
      const current = callStack[callStack.length - 1]
      if (current.n === 0) {
        current.result = 1
        current.state = 'complete'
        this.state.phase = 'returning'
        this.addHistory(`Base case: power(base, 0) = 1`, current.depth)
      } else {
        const base = Math.floor(this.state.n / (current.n + 1)) // Extract base
        current.result = Math.pow(base, current.n)
        current.state = 'complete'
        this.state.phase = 'returning'
        this.addHistory(`Computed: power = ${current.result}`, current.depth)
      }
      return
    }

    if (phase === 'returning') {
      this.state.result = callStack[0].result || 0
      this.state.phase = 'complete'
      this.state.message = `Result: ${this.state.result}`
      this.state.isOperationComplete = true
      this.addHistory(`Final result: ${this.state.result}`)
    }
  }

  run(): void {
    while (!this.state.isOperationComplete) {
      this.step()
    }
  }

  reset(): void {
    this.state.phase = 'idle'
    this.state.callStack = []
    this.state.currentDepth = 0
    this.state.result = 0
    this.state.message = 'Reset'
    this.state.isOperationComplete = true
  }

  getState(): RecursionState {
    return {
      ...this.state,
      callStack: [...this.state.callStack],
      towers: this.state.towers
        ? {
            A: [...this.state.towers.A],
            B: [...this.state.towers.B],
            C: [...this.state.towers.C],
          }
        : undefined,
      moves: this.state.moves ? [...this.state.moves] : undefined,
    }
  }
}
