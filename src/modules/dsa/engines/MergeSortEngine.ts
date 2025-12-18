import type { ArrayElement, SortStep } from '../types'

/**
 * Merge Sort Engine with step-by-step debugging
 * Implements divide-and-conquer approach with visual merge steps
 */

interface MergeOperation {
  start: number
  mid: number
  end: number
  leftArray: number[]
  rightArray: number[]
  leftIndex: number
  rightIndex: number
  mergeIndex: number
}

export interface MergeSortState {
  array: ArrayElement[]
  comparisons: number
  merges: number
  isSorted: boolean
  history: SortStep[]
  stepPhase: 'dividing' | 'merging' | 'comparing' | 'placing' | 'complete'
  currentOperation: MergeOperation | null
  recursionStack: Array<{ start: number; end: number }>
  mergeStack: Array<{ start: number; mid: number; end: number }>
  auxiliaryArray: number[]
}

export class MergeSortEngine {
  private state: MergeSortState
  private originalArray: number[]
  private isRunning: boolean = false

  constructor(array: number[]) {
    this.originalArray = [...array]
    this.state = this.initializeState()
  }

  private initializeState(): MergeSortState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    // Build the merge operations stack (bottom-up approach for visualization)
    const mergeStack = this.buildMergeStack(array.length)

    return {
      array,
      comparisons: 0,
      merges: 0,
      isSorted: false,
      history: [],
      stepPhase: 'dividing',
      currentOperation: null,
      recursionStack: [],
      mergeStack,
      auxiliaryArray: [],
    }
  }

  /**
   * Build the sequence of merge operations for bottom-up merge sort
   * This creates a clear visualization of the divide-and-conquer process
   */
  private buildMergeStack(n: number): Array<{ start: number; mid: number; end: number }> {
    const operations: Array<{ start: number; mid: number; end: number }> = []

    // Bottom-up merge sort: start with size 1, then 2, 4, 8...
    for (let size = 1; size < n; size *= 2) {
      for (let start = 0; start < n; start += 2 * size) {
        const mid = Math.min(start + size - 1, n - 1)
        const end = Math.min(start + 2 * size - 1, n - 1)

        if (mid < end) {
          operations.push({ start, mid, end })
        }
      }
    }

    return operations
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { stepPhase, currentOperation, mergeStack } = this.state

    // Reset all highlighting
    this.state.array.forEach((el) => {
      if (el.state !== 'sorted') {
        el.state = 'default'
      }
    })

    if (stepPhase === 'dividing' || stepPhase === 'complete') {
      // Start next merge operation
      if (mergeStack.length === 0) {
        this.state.isSorted = true
        this.state.stepPhase = 'complete'
        this.state.array.forEach((el) => (el.state = 'sorted'))

        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [],
          swappingIndices: [],
          description: '✅ Sorting complete!',
        })
        return
      }

      // Pop next merge operation
      const operation = mergeStack.shift()!
      const { start, mid, end } = operation

      // Create left and right subarrays
      const leftArray = this.state.array.slice(start, mid + 1).map((el) => el.value)
      const rightArray = this.state.array.slice(mid + 1, end + 1).map((el) => el.value)

      this.state.currentOperation = {
        start,
        mid,
        end,
        leftArray,
        rightArray,
        leftIndex: 0,
        rightIndex: 0,
        mergeIndex: start,
      }

      this.state.stepPhase = 'merging'

      // Highlight the range being merged
      for (let i = start; i <= end; i++) {
        this.state.array[i].state = 'comparing'
      }

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: Array.from({ length: end - start + 1 }, (_, i) => start + i),
        swappingIndices: [],
        description: `📊 Merging subarrays [${start}..${mid}] and [${mid + 1}..${end}]`,
      })

      return
    }

    if (stepPhase === 'merging' && currentOperation) {
      const { leftArray, rightArray, leftIndex, rightIndex, mergeIndex, start, end } =
        currentOperation

      // Check if merge is complete
      if (leftIndex >= leftArray.length && rightIndex >= rightArray.length) {
        // Merge complete, mark as sorted if this is the final merge
        if (start === 0 && end === this.state.array.length - 1) {
          this.state.stepPhase = 'complete'
        } else {
          this.state.stepPhase = 'dividing'
        }

        this.state.currentOperation = null

        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [],
          swappingIndices: [],
          description: `✓ Merged [${start}..${end}]`,
        })

        return
      }

      // Determine which element to place
      let valueToPlace: number
      let fromLeft: boolean

      if (leftIndex >= leftArray.length) {
        // Left exhausted, take from right
        valueToPlace = rightArray[rightIndex]
        currentOperation.rightIndex++
        fromLeft = false
      } else if (rightIndex >= rightArray.length) {
        // Right exhausted, take from left
        valueToPlace = leftArray[leftIndex]
        currentOperation.leftIndex++
        fromLeft = true
      } else {
        // Compare and take smaller
        this.state.comparisons++

        if (leftArray[leftIndex] <= rightArray[rightIndex]) {
          valueToPlace = leftArray[leftIndex]
          currentOperation.leftIndex++
          fromLeft = true
        } else {
          valueToPlace = rightArray[rightIndex]
          currentOperation.rightIndex++
          fromLeft = false
        }
      }

      // Place the value
      this.state.array[mergeIndex].value = valueToPlace
      this.state.array[mergeIndex].state = 'swapping'
      this.state.merges++

      const leftIdx = leftIndex < leftArray.length ? start + leftIndex : -1
      const rightIdx = rightIndex < rightArray.length ? currentOperation.mid + 1 + rightIndex : -1
      const comparingIndices = [leftIdx, rightIdx].filter((idx) => idx >= 0)

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices,
        swappingIndices: [mergeIndex],
        description: `${fromLeft ? '⬅️' : '➡️'} Place ${valueToPlace} at position ${mergeIndex}`,
      })

      currentOperation.mergeIndex++
    }
  }

  run(): void {
    this.isRunning = true
    while (!this.state.isSorted && this.isRunning) {
      this.step()
    }
    this.isRunning = false
  }

  reset(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  updateArray(array: number[]): void {
    this.originalArray = [...array]
    this.reset()
  }

  getState(): MergeSortState {
    return {
      ...this.state,
      array: this.cloneArray(),
      history: [...this.state.history],
      mergeStack: [...this.state.mergeStack],
    }
  }

  private cloneArray(): ArrayElement[] {
    return this.state.array.map((el) => ({ ...el }))
  }

  stop(): void {
    this.isRunning = false
  }
}
