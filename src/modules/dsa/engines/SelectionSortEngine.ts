import type { ArrayElement, SortStep } from '../types'

/**
 * Selection Sort Engine with step-by-step debugging
 * Repeatedly finds minimum element and places it at the beginning
 */

export interface SelectionSortState {
  array: ArrayElement[]
  currentIndex: number
  minIndex: number
  searchIndex: number
  comparisons: number
  swaps: number
  isSorted: boolean
  history: SortStep[]
  stepPhase: 'finding' | 'comparing' | 'swapping' | 'complete'
}

export class SelectionSortEngine {
  private state: SelectionSortState
  private originalArray: number[]
  private isRunning: boolean = false

  constructor(array: number[]) {
    this.originalArray = [...array]
    this.state = this.initializeState()
  }

  private initializeState(): SelectionSortState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    return {
      array,
      currentIndex: 0,
      minIndex: 0,
      searchIndex: 0,
      comparisons: 0,
      swaps: 0,
      isSorted: array.length <= 1,
      history: [],
      stepPhase: 'finding',
    }
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { array, currentIndex, minIndex, searchIndex, stepPhase } = this.state
    const n = array.length

    // Reset highlighting except sorted
    array.forEach((el) => {
      if (el.state !== 'sorted') {
        el.state = 'default'
      }
    })

    // Check if sorting is complete
    if (currentIndex >= n - 1) {
      this.state.isSorted = true
      this.state.stepPhase = 'complete'
      this.state.array.forEach((el) => (el.state = 'sorted'))
      
      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [],
        swappingIndices: [],
        description: '✅ Array is fully sorted!',
      })
      
      return
    }

    if (stepPhase === 'finding') {
      // Start finding minimum in remaining array
      this.state.minIndex = currentIndex
      this.state.searchIndex = currentIndex + 1
      array[currentIndex].state = 'comparing'

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [currentIndex],
        swappingIndices: [],
        description: `🔍 Find minimum starting from index ${currentIndex}`,
      })

      if (this.state.searchIndex >= n) {
        this.state.stepPhase = 'swapping'
      } else {
        this.state.stepPhase = 'comparing'
      }
      return
    }

    if (stepPhase === 'comparing') {
      // Compare current search element with current minimum
      array[minIndex].state = 'comparing'
      array[searchIndex].state = 'comparing'
      this.state.comparisons++

      if (array[searchIndex].value < array[minIndex].value) {
        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [minIndex, searchIndex],
          swappingIndices: [],
          description: `🔽 New minimum found: ${array[searchIndex].value} < ${array[minIndex].value}`,
        })

        this.state.minIndex = searchIndex
      } else {
        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [minIndex, searchIndex],
          swappingIndices: [],
          description: `🔼 Keep current min: ${array[minIndex].value} ≤ ${array[searchIndex].value}`,
        })
      }

      this.state.searchIndex++

      if (this.state.searchIndex >= n) {
        this.state.stepPhase = 'swapping'
      }
      return
    }

    if (stepPhase === 'swapping') {
      // Swap minimum element with current position
      if (minIndex !== currentIndex) {
        const temp = array[currentIndex].value
        array[currentIndex].value = array[minIndex].value
        array[minIndex].value = temp

        array[currentIndex].state = 'swapping'
        array[minIndex].state = 'swapping'
        this.state.swaps++

        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [],
          swappingIndices: [currentIndex, minIndex],
          description: `🔄 Swap ${array[currentIndex].value} at index ${minIndex} with position ${currentIndex}`,
        })
      } else {
        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [],
          swappingIndices: [],
          description: `✓ Element ${array[currentIndex].value} already in correct position`,
        })
      }

      // Mark current position as sorted
      array[currentIndex].state = 'sorted'

      this.state.currentIndex++
      this.state.stepPhase = 'finding'
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

  getState(): SelectionSortState {
    return {
      ...this.state,
      array: this.cloneArray(),
      history: [...this.state.history],
    }
  }

  private cloneArray(): ArrayElement[] {
    return this.state.array.map((el) => ({ ...el }))
  }

  stop(): void {
    this.isRunning = false
  }
}
