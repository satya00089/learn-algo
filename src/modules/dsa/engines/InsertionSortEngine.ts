import type { ArrayElement, SortStep } from '../types'

/**
 * Insertion Sort Engine with step-by-step debugging
 * Builds sorted array one element at a time by inserting into correct position
 */

export interface InsertionSortState {
  array: ArrayElement[]
  currentIndex: number
  insertIndex: number
  keyValue: number | null
  comparisons: number
  shifts: number
  isSorted: boolean
  history: SortStep[]
  stepPhase: 'selecting' | 'comparing' | 'shifting' | 'inserting' | 'complete'
}

export class InsertionSortEngine {
  private state: InsertionSortState
  private originalArray: number[]
  private isRunning: boolean = false

  constructor(array: number[]) {
    this.originalArray = [...array]
    this.state = this.initializeState()
  }

  private initializeState(): InsertionSortState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    // Mark first element as sorted
    if (array.length > 0) {
      array[0].state = 'sorted'
    }

    return {
      array,
      currentIndex: 1,
      insertIndex: 0,
      keyValue: null,
      comparisons: 0,
      shifts: 0,
      isSorted: array.length <= 1,
      history: [],
      stepPhase: 'selecting',
    }
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { array, currentIndex, insertIndex, stepPhase, keyValue } = this.state
    const n = array.length

    // Reset highlighting except sorted
    array.forEach((el) => {
      if (el.state !== 'sorted') {
        el.state = 'default'
      }
    })

    // Check if sorting is complete
    if (currentIndex >= n) {
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

    if (stepPhase === 'selecting') {
      // Select the key element to insert
      this.state.keyValue = array[currentIndex].value
      this.state.insertIndex = currentIndex - 1
      array[currentIndex].state = 'comparing'

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [currentIndex],
        swappingIndices: [],
        description: `🔑 Select key element ${this.state.keyValue} at index ${currentIndex}`,
      })

      this.state.stepPhase = 'comparing'
      return
    }

    if (stepPhase === 'comparing') {
      // Compare with previous elements
      if (insertIndex >= 0 && array[insertIndex].value > keyValue!) {
        array[insertIndex].state = 'comparing'
        this.state.comparisons++

        this.state.history.push({
          iteration: this.state.history.length,
          array: this.cloneArray(),
          comparingIndices: [insertIndex],
          swappingIndices: [],
          description: `🔍 Compare: ${array[insertIndex].value} > ${keyValue} ? Yes, shift right`,
        })

        this.state.stepPhase = 'shifting'
      } else {
        // Found the insertion position
        if (insertIndex >= 0) {
          this.state.history.push({
            iteration: this.state.history.length,
            array: this.cloneArray(),
            comparingIndices: [insertIndex],
            swappingIndices: [],
            description: `🔍 Compare: ${array[insertIndex].value} > ${keyValue} ? No, found position`,
          })
        }

        this.state.stepPhase = 'inserting'
      }
      return
    }

    if (stepPhase === 'shifting') {
      // Shift element to the right
      array[insertIndex + 1].value = array[insertIndex].value
      array[insertIndex + 1].state = 'swapping'
      this.state.shifts++

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [],
        swappingIndices: [insertIndex, insertIndex + 1],
        description: `➡️ Shift ${array[insertIndex + 1].value} from index ${insertIndex} to ${insertIndex + 1}`,
      })

      this.state.insertIndex--
      this.state.stepPhase = 'comparing'
      return
    }

    if (stepPhase === 'inserting') {
      // Insert the key at the correct position
      const insertPos = insertIndex + 1
      array[insertPos].value = keyValue!
      array[insertPos].state = 'swapping'

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [],
        swappingIndices: [insertPos],
        description: `📍 Insert ${keyValue} at index ${insertPos}`,
      })

      // Mark elements up to currentIndex as sorted
      for (let i = 0; i <= currentIndex; i++) {
        array[i].state = 'sorted'
      }

      this.state.currentIndex++
      this.state.keyValue = null
      this.state.stepPhase = 'selecting'
      return
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

  getState(): InsertionSortState {
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
