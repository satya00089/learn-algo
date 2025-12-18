import type { ArrayElement, SortStep } from '../types'

/**
 * Quick Sort Engine with step-by-step debugging
 * Implements DebuggableAlgorithm interface
 */

export interface QuickSortState {
  array: ArrayElement[]
  comparisons: number
  swaps: number
  isSorted: boolean
  history: SortStep[]
  stepPhase: 'selecting' | 'comparing' | 'swapping' | 'pivoting' | 'recursing'
  currentPartition: { low: number; high: number } | null
  pivotIndex: number | null
  leftPointer: number | null
  rightPointer: number | null
  partitionStack: Array<{ low: number; high: number }>
  needsSwap: boolean
}

export class QuickSortEngine {
  private state: QuickSortState
  private originalArray: number[]
  private isRunning: boolean = false

  constructor(array: number[]) {
    this.originalArray = [...array]
    this.state = this.initializeState()
  }

  private initializeState(): QuickSortState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    return {
      array,
      comparisons: 0,
      swaps: 0,
      isSorted: false,
      history: [],
      stepPhase: 'selecting',
      currentPartition: { low: 0, high: array.length - 1 },
      pivotIndex: null,
      leftPointer: null,
      rightPointer: null,
      partitionStack: [{ low: 0, high: array.length - 1 }],
      needsSwap: false,
    }
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { array, stepPhase, partitionStack } = this.state

    // Check if sorting is complete
    if (partitionStack.length === 0) {
      this.state.isSorted = true
      this.isRunning = false
      // Mark all as sorted
      this.state.array.forEach((el) => (el.state = 'sorted'))
      return
    }

    if (stepPhase === 'selecting') {
      // SELECTING PHASE: Pick pivot and initialize pointers
      const partition = partitionStack[0]

      if (partition.low >= partition.high) {
        // Single element or invalid partition, mark as sorted
        if (partition.low === partition.high) {
          this.state.array[partition.low].state = 'sorted'
        }
        partitionStack.shift()
        return
      }

      this.state.currentPartition = partition
      // Use the last element as pivot
      this.state.pivotIndex = partition.high
      this.state.leftPointer = partition.low
      this.state.rightPointer = partition.high - 1

      // Reset all states in current partition
      for (let i = partition.low; i <= partition.high; i++) {
        if (this.state.array[i].state !== 'sorted') {
          this.state.array[i].state = 'default'
        }
      }

      // Highlight pivot
      this.state.array[partition.high].state = 'comparing'

      this.state.history.push({
        iteration: this.state.history.length,
        array: structuredClone(this.state.array),
        comparingIndices: [partition.high],
        swappingIndices: [],
        description: `Selected pivot: ${array[partition.high].value}`,
      })

      this.state.stepPhase = 'comparing'
    } else if (stepPhase === 'comparing') {
      // COMPARING PHASE: Compare left/right pointers with pivot
      const { leftPointer, rightPointer, pivotIndex, currentPartition } = this.state

      if (
        leftPointer === null ||
        rightPointer === null ||
        pivotIndex === null ||
        !currentPartition
      ) {
        return
      }

      // Reset states
      for (let i = currentPartition.low; i <= currentPartition.high; i++) {
        if (this.state.array[i].state !== 'sorted') {
          this.state.array[i].state = 'default'
        }
      }
      this.state.array[pivotIndex].state = 'comparing' // Keep pivot highlighted

      if (leftPointer > rightPointer) {
        // Pointers crossed, time to place pivot
        this.state.stepPhase = 'pivoting'
        return
      }

      // Check if left pointer needs to move
      const leftValue = array[leftPointer].value
      const pivotValue = array[pivotIndex].value

      this.state.comparisons++
      this.state.array[leftPointer].state = 'comparing'

      if (leftValue < pivotValue) {
        // Left element is in correct position, move left pointer
        this.state.history.push({
          iteration: this.state.history.length,
          array: structuredClone(this.state.array),
          comparingIndices: [leftPointer, pivotIndex],
          swappingIndices: [],
          description: `${leftValue} < ${pivotValue}, move left pointer`,
        })
        if (this.state.leftPointer !== null) {
          this.state.leftPointer++
        }
        return
      }

      // Check right pointer
      if (rightPointer >= leftPointer) {
        const rightValue = array[rightPointer].value
        this.state.comparisons++
        this.state.array[rightPointer].state = 'comparing'

        if (rightValue > pivotValue) {
          // Right element is in correct position, move right pointer
          this.state.history.push({
            iteration: this.state.history.length,
            array: structuredClone(this.state.array),
            comparingIndices: [leftPointer, rightPointer, pivotIndex],
            swappingIndices: [],
            description: `${rightValue} > ${pivotValue}, move right pointer`,
          })
          if (this.state.rightPointer !== null) {
            this.state.rightPointer--
          }
          return
        }

        // Both pointers found elements to swap
        this.state.needsSwap = true
        this.state.history.push({
          iteration: this.state.history.length,
          array: structuredClone(this.state.array),
          comparingIndices: [leftPointer, rightPointer, pivotIndex],
          swappingIndices: [],
          description: `Found elements to swap: ${leftValue} and ${rightValue}`,
        })
        this.state.stepPhase = 'swapping'
      }
    } else if (stepPhase === 'swapping') {
      // SWAPPING PHASE: Swap elements at left and right pointers
      const { leftPointer, rightPointer, currentPartition } = this.state

      if (leftPointer === null || rightPointer === null || !currentPartition) {
        return
      }

      // Perform swap
      ;[this.state.array[leftPointer], this.state.array[rightPointer]] = [
        this.state.array[rightPointer],
        this.state.array[leftPointer],
      ]
      this.state.swaps++

      // Show swapping state
      this.state.array[leftPointer].state = 'swapping'
      this.state.array[rightPointer].state = 'swapping'

      this.state.history.push({
        iteration: this.state.history.length,
        array: structuredClone(this.state.array),
        comparingIndices: [],
        swappingIndices: [leftPointer, rightPointer],
        description: `Swapped ${this.state.array[leftPointer].value} and ${this.state.array[rightPointer].value}`,
      })

      // Move pointers
      if (this.state.leftPointer !== null) {
        this.state.leftPointer++
      }
      if (this.state.rightPointer !== null) {
        this.state.rightPointer--
      }
      this.state.needsSwap = false
      this.state.stepPhase = 'comparing'
    } else if (stepPhase === 'pivoting') {
      // PIVOTING PHASE: Place pivot in correct position
      const { leftPointer, pivotIndex, currentPartition } = this.state

      if (leftPointer === null || pivotIndex === null || !currentPartition) {
        return
      }

      // Swap pivot with left pointer
      if (leftPointer === pivotIndex) {
        this.state.array[pivotIndex].state = 'sorted'
      } else {
        ;[this.state.array[leftPointer], this.state.array[pivotIndex]] = [
          this.state.array[pivotIndex],
          this.state.array[leftPointer],
        ]
        this.state.swaps++

        this.state.array[leftPointer].state = 'sorted'
        this.state.history.push({
          iteration: this.state.history.length,
          array: structuredClone(this.state.array),
          comparingIndices: [],
          swappingIndices: [leftPointer, pivotIndex],
          description: `Placed pivot ${this.state.array[leftPointer].value} at position ${leftPointer}`,
        })

        this.state.pivotIndex = leftPointer
      }

      this.state.stepPhase = 'recursing'
    } else if (stepPhase === 'recursing') {
      // RECURSING PHASE: Add sub-partitions to stack
      const { pivotIndex, currentPartition } = this.state

      if (pivotIndex === null || !currentPartition) {
        return
      }

      // Remove current partition from stack
      partitionStack.shift()

      // Add left and right sub-partitions
      if (pivotIndex - 1 > currentPartition.low) {
        partitionStack.unshift({ low: currentPartition.low, high: pivotIndex - 1 })
      }
      if (pivotIndex + 1 < currentPartition.high) {
        partitionStack.unshift({ low: pivotIndex + 1, high: currentPartition.high })
      }

      // Reset for next partition
      this.state.currentPartition = null
      this.state.pivotIndex = null
      this.state.leftPointer = null
      this.state.rightPointer = null
      this.state.stepPhase = 'selecting'
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

  updateArray(newArray: number[]): void {
    this.originalArray = [...newArray]
    this.reset()
  }

  getState(): QuickSortState {
    return structuredClone(this.state)
  }

  stop(): void {
    this.isRunning = false
  }
}
