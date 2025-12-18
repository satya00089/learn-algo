import type { ArrayElement, SortStep } from '../types'

/**
 * Heap Sort Engine with step-by-step debugging
 * Uses binary heap data structure for efficient sorting
 */

export interface HeapSortState {
  array: ArrayElement[]
  heapSize: number
  currentIndex: number
  parentIndex: number
  leftChild: number
  rightChild: number
  largestIndex: number
  comparisons: number
  swaps: number
  isSorted: boolean
  history: SortStep[]
  stepPhase: 'building' | 'heapifying' | 'extracting' | 'swapping' | 'complete'
  isHeapBuilt: boolean
}

export class HeapSortEngine {
  private state: HeapSortState
  private originalArray: number[]
  private isRunning: boolean = false

  constructor(array: number[]) {
    this.originalArray = [...array]
    this.state = this.initializeState()
  }

  private initializeState(): HeapSortState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    const n = array.length
    const startIndex = Math.floor(n / 2) - 1

    return {
      array,
      heapSize: n,
      currentIndex: startIndex,
      parentIndex: -1,
      leftChild: -1,
      rightChild: -1,
      largestIndex: -1,
      comparisons: 0,
      swaps: 0,
      isSorted: array.length <= 1,
      history: [],
      stepPhase: 'building',
      isHeapBuilt: false,
    }
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  step(): void {
    const { array, stepPhase } = this.state

    // Reset highlighting except sorted
    array.forEach((el) => {
      if (el.state !== 'sorted') {
        el.state = 'default'
      }
    })

    if (stepPhase === 'building') {
      this.buildHeapStep()
    } else if (stepPhase === 'heapifying') {
      this.heapifyStep()
    } else if (stepPhase === 'extracting') {
      this.extractStep()
    } else if (stepPhase === 'swapping') {
      this.swapStep()
    }
  }

  private buildHeapStep(): void {
    const { currentIndex } = this.state

    if (currentIndex < 0) {
      this.state.isHeapBuilt = true
      this.state.stepPhase = 'extracting'
      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [],
        swappingIndices: [],
        description: '🏗️ Max heap built! Starting extraction phase',
      })
      return
    }

    this.state.parentIndex = currentIndex
    this.state.largestIndex = currentIndex
    this.state.leftChild = 2 * currentIndex + 1
    this.state.rightChild = 2 * currentIndex + 2

    this.state.history.push({
      iteration: this.state.history.length,
      array: this.cloneArray(),
      comparingIndices: [currentIndex],
      swappingIndices: [],
      description: `🏗️ Building heap: heapify from index ${currentIndex}`,
    })

    this.state.stepPhase = 'heapifying'
  }

  private heapifyStep(): void {
    const { array, parentIndex, leftChild, rightChild, largestIndex, heapSize } = this.state

    // Find largest among parent, left child, and right child
    let largest = largestIndex

    if (leftChild < heapSize && array[leftChild].value > array[largest].value) {
      this.state.comparisons++
      largest = leftChild

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [largest, parentIndex],
        swappingIndices: [],
        description: `🔍 Left child ${array[leftChild].value} > parent ${array[parentIndex].value}`,
      })
    }

    if (rightChild < heapSize && array[rightChild].value > array[largest].value) {
      this.state.comparisons++
      largest = rightChild

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [largest, parentIndex],
        swappingIndices: [],
        description: `🔍 Right child ${array[rightChild].value} > current largest`,
      })
    }

    if (largest !== parentIndex) {
      // Swap and continue heapifying
      const temp = array[parentIndex].value
      array[parentIndex].value = array[largest].value
      array[largest].value = temp

      array[parentIndex].state = 'swapping'
      array[largest].state = 'swapping'
      this.state.swaps++

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [],
        swappingIndices: [parentIndex, largest],
        description: `🔄 Swap ${array[parentIndex].value} with ${array[largest].value}`,
      })

      // Continue heapifying down
      this.state.parentIndex = largest
      this.state.largestIndex = largest
      this.state.leftChild = 2 * largest + 1
      this.state.rightChild = 2 * largest + 2
    } else {
      // Heapify complete for this subtree
      if (this.state.isHeapBuilt) {
        // During extraction phase, go back to extracting
        this.state.stepPhase = 'extracting'
      } else {
        // During heap building, move to next element
        this.state.currentIndex--
        this.state.stepPhase = 'building'
      }
    }
  }

  private extractStep(): void {
    const { array, heapSize } = this.state

    if (heapSize <= 1) {
      this.state.isSorted = true
      this.state.stepPhase = 'complete'
      this.state.array.forEach((el) => (el.state = 'sorted'))

      this.state.history.push({
        iteration: this.state.history.length,
        array: this.cloneArray(),
        comparingIndices: [],
        swappingIndices: [],
        description: '✅ Heap sort complete!',
      })
      return
    }

    this.state.stepPhase = 'swapping'
  }

  private swapStep(): void {
    const { array, heapSize } = this.state

    // Move current root (maximum) to end
    const temp = array[0].value
    array[0].value = array[heapSize - 1].value
    array[heapSize - 1].value = temp

    array[0].state = 'swapping'
    array[heapSize - 1].state = 'sorted'
    this.state.swaps++

    this.state.history.push({
      iteration: this.state.history.length,
      array: this.cloneArray(),
      comparingIndices: [],
      swappingIndices: [0, heapSize - 1],
      description: `📤 Extract max ${array[heapSize - 1].value} to position ${heapSize - 1}`,
    })

    // Reduce heap size and heapify root
    this.state.heapSize--
    this.state.parentIndex = 0
    this.state.largestIndex = 0
    this.state.leftChild = 1
    this.state.rightChild = 2
    this.state.stepPhase = 'heapifying'
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

  getState(): HeapSortState {
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
