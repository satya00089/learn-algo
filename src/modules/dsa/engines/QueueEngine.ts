import type { ArrayElement } from '../types'

export type QueueOperationType = 'enqueue' | 'dequeue' | 'peek' | 'clear' | 'isEmpty' | 'size'

export type OperationPhase =
  | 'idle'
  | 'enqueueing'
  | 'dequeueing'
  | 'peeking'
  | 'shifting'
  | 'complete'
  | 'empty'
  | 'overflow'

export interface HistoryStep {
  iteration: number
  description: string
  operation: QueueOperationType
}

export interface QueueState {
  queue: ArrayElement[]
  frontIndex: number
  rearIndex: number
  maxSize: number
  operationValue: number | null
  stepPhase: OperationPhase
  currentOperation: QueueOperationType | null
  isOperationComplete: boolean
  history: HistoryStep[]
}

/**
 * QueueEngine
 * Handles step-by-step visualization of queue operations (FIFO - First In First Out)
 */
export class QueueEngine {
  private state: QueueState
  private initialQueue: number[]
  private iteration: number

  constructor(maxSize = 10, initialQueue: number[] = []) {
    this.initialQueue = [...initialQueue]
    this.iteration = 0
    this.state = {
      queue: initialQueue.slice(0, maxSize).map((value, index) => ({
        value,
        index,
        state: 'default' as const,
      })),
      frontIndex: initialQueue.length > 0 ? 0 : -1,
      rearIndex: initialQueue.length - 1,
      maxSize,
      operationValue: null,
      stepPhase: 'idle',
      currentOperation: null,
      isOperationComplete: true,
      history: [],
    }
  }

  /**
   * Start an enqueue operation (add to rear)
   */
  startEnqueue(value: number): void {
    if (this.state.queue.length >= this.state.maxSize) {
      this.state.stepPhase = 'overflow'
      this.state.isOperationComplete = true
      this.addHistory(`Queue Overflow: Cannot enqueue ${value}, queue is full`)
      return
    }

    this.resetOperation()
    this.state.currentOperation = 'enqueue'
    this.state.operationValue = value
    this.state.stepPhase = 'enqueueing'
    this.state.isOperationComplete = false

    this.addHistory(`Starting enqueue: Add ${value} to rear of queue`)
  }

  /**
   * Start a dequeue operation (remove from front)
   */
  startDequeue(): void {
    if (this.state.queue.length === 0) {
      this.state.stepPhase = 'empty'
      this.state.isOperationComplete = true
      this.addHistory('Queue Underflow: Cannot dequeue, queue is empty')
      return
    }

    this.resetOperation()
    this.state.currentOperation = 'dequeue'
    this.state.stepPhase = 'dequeueing'
    this.state.isOperationComplete = false

    const frontValue = this.state.queue[this.state.frontIndex].value
    this.addHistory(`Starting dequeue: Remove ${frontValue} from front of queue`)
  }

  /**
   * Start a peek operation (view front element)
   */
  startPeek(): void {
    if (this.state.queue.length === 0) {
      this.state.stepPhase = 'empty'
      this.state.isOperationComplete = true
      this.addHistory('Queue is empty: Nothing to peek')
      return
    }

    this.resetOperation()
    this.state.currentOperation = 'peek'
    this.state.stepPhase = 'peeking'
    this.state.isOperationComplete = false

    const frontValue = this.state.queue[this.state.frontIndex].value
    this.addHistory(`Peeking: Front element is ${frontValue}`)
  }

  /**
   * Check if queue is empty
   */
  startIsEmpty(): void {
    this.resetOperation()
    this.state.currentOperation = 'isEmpty'
    const isEmpty = this.state.queue.length === 0
    this.state.stepPhase = isEmpty ? 'empty' : 'complete'
    this.state.isOperationComplete = true

    this.addHistory(`isEmpty: ${isEmpty} (size = ${this.state.queue.length})`)
  }

  /**
   * Get queue size
   */
  startSize(): void {
    this.resetOperation()
    this.state.currentOperation = 'size'
    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true

    this.addHistory(`Size: ${this.state.queue.length} elements in queue`)
  }

  /**
   * Clear the queue
   */
  startClear(): void {
    this.resetOperation()
    this.state.currentOperation = 'clear'
    this.state.stepPhase = 'complete'
    this.state.queue = []
    this.state.frontIndex = -1
    this.state.rearIndex = -1
    this.state.isOperationComplete = true

    this.addHistory('Queue cleared: All elements removed')
  }

  /**
   * Execute one step of the current operation
   */
  step(): void {
    if (this.state.isOperationComplete) return

    switch (this.state.currentOperation) {
      case 'enqueue':
        this.stepEnqueue()
        break
      case 'dequeue':
        this.stepDequeue()
        break
      case 'peek':
        this.stepPeek()
        break
      default:
        break
    }

    this.updateElementStates()
  }

  private stepEnqueue(): void {
    if (this.state.operationValue === null) return

    // Add element to rear of queue
    this.state.queue.push({
      value: this.state.operationValue,
      index: this.state.queue.length,
      state: 'comparing',
    })

    this.state.rearIndex = this.state.queue.length - 1
    if (this.state.frontIndex === -1) {
      this.state.frontIndex = 0
    }

    this.addHistory(
      `Enqueued ${this.state.operationValue} to queue (size: ${this.state.queue.length})`
    )

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepDequeue(): void {
    if (this.state.queue.length === 0) return

    const dequeuedValue = this.state.queue[this.state.frontIndex].value

    // Remove element from front
    this.state.queue.shift()

    if (this.state.queue.length === 0) {
      this.state.frontIndex = -1
      this.state.rearIndex = -1
    } else {
      this.state.rearIndex = this.state.queue.length - 1
    }

    this.addHistory(`Dequeued ${dequeuedValue} from queue (size: ${this.state.queue.length})`)

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepPeek(): void {
    if (this.state.queue.length === 0) return

    const frontValue = this.state.queue[this.state.frontIndex].value

    this.addHistory(`Peeked at front: ${frontValue} (queue not modified)`)

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private updateElementStates(): void {
    // Reset all states
    this.state.queue.forEach((el) => {
      el.state = 'default'
    })

    // Highlight front and rear elements
    if (this.state.frontIndex >= 0 && this.state.frontIndex < this.state.queue.length) {
      this.state.queue[this.state.frontIndex].state = 'sorted'
    }
    if (
      this.state.rearIndex >= 0 &&
      this.state.rearIndex < this.state.queue.length &&
      this.state.rearIndex !== this.state.frontIndex
    ) {
      this.state.queue[this.state.rearIndex].state = 'comparing'
    }

    // Set states based on current operation
    switch (this.state.currentOperation) {
      case 'enqueue':
        if (this.state.rearIndex >= 0 && this.state.stepPhase === 'complete') {
          this.state.queue[this.state.rearIndex].state = 'comparing'
        }
        break

      case 'dequeue':
        if (this.state.frontIndex >= 0) {
          this.state.queue[this.state.frontIndex].state = 'sorted'
        }
        break

      case 'peek':
        if (this.state.frontIndex >= 0) {
          this.state.queue[this.state.frontIndex].state = 'comparing'
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
    this.state.queue.forEach((el) => {
      el.state = 'default'
    })

    // Keep front and rear highlighted
    if (this.state.frontIndex >= 0 && this.state.frontIndex < this.state.queue.length) {
      this.state.queue[this.state.frontIndex].state = 'sorted'
    }
    if (
      this.state.rearIndex >= 0 &&
      this.state.rearIndex < this.state.queue.length &&
      this.state.rearIndex !== this.state.frontIndex
    ) {
      this.state.queue[this.state.rearIndex].state = 'comparing'
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
      queue: this.initialQueue.slice(0, this.state.maxSize).map((value, index) => ({
        value,
        index,
        state: 'default' as const,
      })),
      frontIndex: this.initialQueue.length > 0 ? 0 : -1,
      rearIndex: this.initialQueue.length - 1,
      maxSize: this.state.maxSize,
      operationValue: null,
      stepPhase: 'idle',
      currentOperation: null,
      isOperationComplete: true,
      history: [],
    }

    // Highlight front and rear
    if (this.state.frontIndex >= 0) {
      this.state.queue[this.state.frontIndex].state = 'sorted'
    }
    if (this.state.rearIndex >= 0 && this.state.rearIndex !== this.state.frontIndex) {
      this.state.queue[this.state.rearIndex].state = 'comparing'
    }
  }

  /**
   * Update queue with new values
   */
  updateQueue(newQueue: number[]): void {
    this.initialQueue = [...newQueue]
    this.reset()
  }

  /**
   * Get current state
   */
  getState(): QueueState {
    return {
      ...this.state,
      queue: this.state.queue.map((el, idx) => ({ ...el, index: idx })),
    }
  }
}
