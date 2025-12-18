import type { ArrayElement } from '../types'

export type StackOperationType = 'push' | 'pop' | 'peek' | 'clear' | 'isEmpty' | 'size'

export type OperationPhase =
  | 'idle'
  | 'pushing'
  | 'popping'
  | 'peeking'
  | 'complete'
  | 'empty'
  | 'overflow'

export interface HistoryStep {
  iteration: number
  description: string
  operation: StackOperationType
}

export interface StackState {
  stack: ArrayElement[]
  topIndex: number
  maxSize: number
  operationValue: number | null
  stepPhase: OperationPhase
  currentOperation: StackOperationType | null
  isOperationComplete: boolean
  history: HistoryStep[]
}

/**
 * StackEngine
 * Handles step-by-step visualization of stack operations (LIFO - Last In First Out)
 */
export class StackEngine {
  private state: StackState
  private initialStack: number[]
  private iteration: number

  constructor(maxSize = 10, initialStack: number[] = []) {
    this.initialStack = [...initialStack]
    this.iteration = 0
    this.state = {
      stack: initialStack.slice(0, maxSize).map((value, index) => ({
        value,
        index,
        state: 'default' as const,
      })),
      topIndex: initialStack.length - 1,
      maxSize,
      operationValue: null,
      stepPhase: 'idle',
      currentOperation: null,
      isOperationComplete: true,
      history: [],
    }
  }

  /**
   * Start a push operation
   */
  startPush(value: number): void {
    if (this.state.stack.length >= this.state.maxSize) {
      this.state.stepPhase = 'overflow'
      this.state.isOperationComplete = true
      this.addHistory(`Stack Overflow: Cannot push ${value}, stack is full`)
      return
    }

    this.resetOperation()
    this.state.currentOperation = 'push'
    this.state.operationValue = value
    this.state.stepPhase = 'pushing'
    this.state.isOperationComplete = false

    this.addHistory(`Starting push: Add ${value} to top of stack`)
  }

  /**
   * Start a pop operation
   */
  startPop(): void {
    if (this.state.stack.length === 0) {
      this.state.stepPhase = 'empty'
      this.state.isOperationComplete = true
      this.addHistory('Stack Underflow: Cannot pop, stack is empty')
      return
    }

    this.resetOperation()
    this.state.currentOperation = 'pop'
    this.state.stepPhase = 'popping'
    this.state.isOperationComplete = false

    const topValue = this.state.stack[this.state.topIndex].value
    this.addHistory(`Starting pop: Remove ${topValue} from top of stack`)
  }

  /**
   * Start a peek operation
   */
  startPeek(): void {
    if (this.state.stack.length === 0) {
      this.state.stepPhase = 'empty'
      this.state.isOperationComplete = true
      this.addHistory('Stack is empty: Nothing to peek')
      return
    }

    this.resetOperation()
    this.state.currentOperation = 'peek'
    this.state.stepPhase = 'peeking'
    this.state.isOperationComplete = false

    const topValue = this.state.stack[this.state.topIndex].value
    this.addHistory(`Peeking: Top element is ${topValue}`)
  }

  /**
   * Check if stack is empty
   */
  startIsEmpty(): void {
    this.resetOperation()
    this.state.currentOperation = 'isEmpty'
    const isEmpty = this.state.stack.length === 0
    this.state.stepPhase = isEmpty ? 'empty' : 'complete'
    this.state.isOperationComplete = true

    this.addHistory(`isEmpty: ${isEmpty} (size = ${this.state.stack.length})`)
  }

  /**
   * Get stack size
   */
  startSize(): void {
    this.resetOperation()
    this.state.currentOperation = 'size'
    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true

    this.addHistory(`Size: ${this.state.stack.length} elements in stack`)
  }

  /**
   * Clear the stack
   */
  startClear(): void {
    this.resetOperation()
    this.state.currentOperation = 'clear'
    this.state.stepPhase = 'complete'
    this.state.stack = []
    this.state.topIndex = -1
    this.state.isOperationComplete = true

    this.addHistory('Stack cleared: All elements removed')
  }

  /**
   * Execute one step of the current operation
   */
  step(): void {
    if (this.state.isOperationComplete) return

    switch (this.state.currentOperation) {
      case 'push':
        this.stepPush()
        break
      case 'pop':
        this.stepPop()
        break
      case 'peek':
        this.stepPeek()
        break
      default:
        break
    }

    this.updateElementStates()
  }

  private stepPush(): void {
    if (this.state.operationValue === null) return

    // Add element to top of stack
    this.state.stack.push({
      value: this.state.operationValue,
      index: this.state.stack.length,
      state: 'comparing',
    })

    this.state.topIndex = this.state.stack.length - 1

    this.addHistory(
      `Pushed ${this.state.operationValue} onto stack (size: ${this.state.stack.length})`
    )

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepPop(): void {
    if (this.state.stack.length === 0) return

    const poppedValue = this.state.stack[this.state.topIndex].value

    // Remove element from top
    this.state.stack.pop()
    this.state.topIndex = this.state.stack.length - 1

    this.addHistory(`Popped ${poppedValue} from stack (size: ${this.state.stack.length})`)

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepPeek(): void {
    if (this.state.stack.length === 0) return

    const topValue = this.state.stack[this.state.topIndex].value

    this.addHistory(`Peeked at top: ${topValue} (stack not modified)`)

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private updateElementStates(): void {
    // Reset all states
    this.state.stack.forEach((el) => {
      el.state = 'default'
    })

    // Highlight top element
    if (this.state.topIndex >= 0 && this.state.topIndex < this.state.stack.length) {
      this.state.stack[this.state.topIndex].state = 'sorted'
    }

    // Set states based on current operation
    switch (this.state.currentOperation) {
      case 'push':
        if (this.state.topIndex >= 0 && this.state.stepPhase === 'complete') {
          this.state.stack[this.state.topIndex].state = 'sorted'
        }
        break

      case 'pop':
        if (this.state.topIndex >= 0) {
          this.state.stack[this.state.topIndex].state = 'sorted'
        }
        break

      case 'peek':
        if (this.state.topIndex >= 0) {
          this.state.stack[this.state.topIndex].state = 'comparing'
        }
        break

      default:
        break
    }
  }

  private resetOperation(): void {
    this.state.operationValue = null
    this.state.stepPhase = 'idle'
    this.state.isOperationComplete = true

    // Reset all element states
    this.state.stack.forEach((el) => {
      el.state = 'default'
    })

    // Keep top element highlighted
    if (this.state.topIndex >= 0 && this.state.topIndex < this.state.stack.length) {
      this.state.stack[this.state.topIndex].state = 'sorted'
    }
  }

  private addHistory(description: string): void {
    this.iteration++
    this.state.history.push({
      iteration: this.iteration,
      description,
      operation: this.state.currentOperation!,
    })
  }

  /**
   * Run the current operation to completion
   */
  run(): void {
    while (!this.state.isOperationComplete) {
      this.step()
    }
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.iteration = 0
    this.state = {
      stack: this.initialStack.slice(0, this.state.maxSize).map((value, index) => ({
        value,
        index,
        state: 'default' as const,
      })),
      topIndex: this.initialStack.length - 1,
      maxSize: this.state.maxSize,
      operationValue: null,
      stepPhase: 'idle',
      currentOperation: null,
      isOperationComplete: true,
      history: [],
    }

    // Highlight top element
    if (this.state.topIndex >= 0) {
      this.state.stack[this.state.topIndex].state = 'sorted'
    }
  }

  /**
   * Update stack with new values
   */
  updateStack(newStack: number[]): void {
    this.initialStack = [...newStack]
    this.reset()
  }

  /**
   * Get current state
   */
  getState(): StackState {
    return {
      ...this.state,
      stack: this.state.stack.map((el, idx) => ({ ...el, index: idx })),
    }
  }
}
