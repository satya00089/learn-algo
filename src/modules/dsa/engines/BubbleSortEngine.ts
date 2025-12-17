import type { ArrayElement, SortStep } from '../types'

/**
 * Bubble Sort Engine with step-by-step debugging
 * Implements DebuggableAlgorithm interface
 */

export interface BubbleSortState {
  array: ArrayElement[]
  currentPass: number
  currentIndex: number
  comparisons: number
  swaps: number
  isSorted: boolean
  history: SortStep[]
}

export class BubbleSortEngine {
  private state: BubbleSortState
  private originalArray: number[]
  private isRunning: boolean = false

  constructor(array: number[]) {
    this.originalArray = [...array]
    this.state = this.initializeState()
  }

  private initializeState(): BubbleSortState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    return {
      array,
      currentPass: 0,
      currentIndex: 0,
      comparisons: 0,
      swaps: 0,
      isSorted: false,
      history: [],
    }
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { array, currentPass, currentIndex } = this.state
    const n = array.length

    // Check if sorting is complete
    if (currentPass >= n - 1) {
      this.state.isSorted = true
      this.isRunning = false
      // Mark all as sorted
      this.state.array.forEach((el) => (el.state = 'sorted'))
      return
    }

    // Reset all states
    this.state.array.forEach((el) => {
      if (el.state !== 'sorted') {
        el.state = 'default'
      }
    })

    const maxIndex = n - currentPass - 1

    if (currentIndex < maxIndex) {
      // Compare adjacent elements
      this.state.comparisons++
      this.state.array[currentIndex].state = 'comparing'
      this.state.array[currentIndex + 1].state = 'comparing'

      if (array[currentIndex].value > array[currentIndex + 1].value) {
        // Swap
        ;[this.state.array[currentIndex], this.state.array[currentIndex + 1]] = [
          this.state.array[currentIndex + 1],
          this.state.array[currentIndex],
        ]
        this.state.swaps++
        this.state.array[currentIndex].state = 'swapping'
        this.state.array[currentIndex + 1].state = 'swapping'
      }

      // Record step
      this.state.history.push({
        iteration: this.state.history.length,
        array: JSON.parse(JSON.stringify(this.state.array)),
        comparingIndices: [currentIndex, currentIndex + 1],
        swappingIndices:
          array[currentIndex].value > array[currentIndex + 1].value
            ? [currentIndex, currentIndex + 1]
            : [],
        description: `Comparing indices ${currentIndex} and ${currentIndex + 1}`,
      })

      this.state.currentIndex++
    } else {
      // Mark the last element of this pass as sorted
      this.state.array[maxIndex].state = 'sorted'
      // Move to next pass
      this.state.currentPass++
      this.state.currentIndex = 0
    }
  }

  run(): void {
    this.isRunning = true
    while (!this.state.isSorted) {
      this.step()
    }
    this.isRunning = false
  }

  reset(): void {
    this.init()
  }

  getState(): BubbleSortState {
    return JSON.parse(JSON.stringify(this.state))
  }

  updateArray(array: number[]): void {
    this.originalArray = [...array]
    this.reset()
  }

  getIsRunning(): boolean {
    return this.isRunning
  }
}
