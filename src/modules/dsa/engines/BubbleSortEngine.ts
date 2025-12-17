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
  stepPhase: 'comparing' | 'swapping' | 'moving' // Track the current phase of the step
  needsSwap: boolean // Track if current comparison needs a swap
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
      stepPhase: 'comparing',
      needsSwap: false,
    }
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { array, currentPass, currentIndex, stepPhase } = this.state
    const n = array.length

    // Check if sorting is complete
    if (currentPass >= n - 1) {
      this.state.isSorted = true
      this.isRunning = false
      // Mark all as sorted
      this.state.array.forEach((el) => (el.state = 'sorted'))
      return
    }

    const maxIndex = n - currentPass - 1

    // Check if we need to move to next pass
    if (currentIndex >= maxIndex) {
      // Mark the last element of this pass as sorted
      this.state.array[maxIndex].state = 'sorted'
      // Move to next pass
      this.state.currentPass++
      this.state.currentIndex = 0
      this.state.stepPhase = 'comparing'
      
      // Reset all non-sorted states
      this.state.array.forEach((el) => {
        if (el.state !== 'sorted') {
          el.state = 'default'
        }
      })
      return
    }

    if (stepPhase === 'comparing') {
      // COMPARING PHASE: Show comparison
      // Reset all states except sorted
      this.state.array.forEach((el) => {
        if (el.state !== 'sorted') {
          el.state = 'default'
        }
      })

      // Highlight the elements being compared
      this.state.array[currentIndex].state = 'comparing'
      this.state.array[currentIndex + 1].state = 'comparing'
      this.state.comparisons++

      // Check if swap is needed
      this.state.needsSwap = array[currentIndex].value > array[currentIndex + 1].value

      // Record comparison
      this.state.history.push({
        iteration: this.state.history.length,
        array: structuredClone(this.state.array),
        comparingIndices: [currentIndex, currentIndex + 1],
        swappingIndices: [],
        description: `Comparing ${array[currentIndex].value} and ${array[currentIndex + 1].value}`,
      })

      // Move to swapping phase (or moving if no swap needed)
      this.state.stepPhase = this.state.needsSwap ? 'swapping' : 'moving'
    } else if (stepPhase === 'swapping') {
      // SWAPPING PHASE: Perform the swap
      // Swap the elements
      ;[this.state.array[currentIndex], this.state.array[currentIndex + 1]] = [
        this.state.array[currentIndex + 1],
        this.state.array[currentIndex],
      ]
      this.state.swaps++

      // Show swapping state
      this.state.array[currentIndex].state = 'swapping'
      this.state.array[currentIndex + 1].state = 'swapping'

      // Record swap
      this.state.history.push({
        iteration: this.state.history.length,
        array: structuredClone(this.state.array),
        comparingIndices: [],
        swappingIndices: [currentIndex, currentIndex + 1],
        description: `Swapped ${this.state.array[currentIndex].value} and ${this.state.array[currentIndex + 1].value}`,
      })

      // Move to next comparison
      this.state.stepPhase = 'moving'
    } else if (stepPhase === 'moving') {
      // MOVING PHASE: Move to next pair
      // Reset states
      this.state.array.forEach((el) => {
        if (el.state !== 'sorted') {
          el.state = 'default'
        }
      })

      // Move to next index
      this.state.currentIndex++
      this.state.stepPhase = 'comparing'
      this.state.needsSwap = false
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
    return structuredClone(this.state)
  }

  updateArray(array: number[]): void {
    this.originalArray = [...array]
    this.reset()
  }

  getIsRunning(): boolean {
    return this.isRunning
  }
}
