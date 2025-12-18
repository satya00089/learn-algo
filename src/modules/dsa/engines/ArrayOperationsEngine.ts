import type { ArrayElement } from '../types'

export type ArrayOperationType =
  | 'append'
  | 'insert'
  | 'delete'
  | 'update'
  | 'search'
  | 'indexSearch'
  | 'reverse'
  | 'clear'

export type OperationPhase =
  | 'idle'
  | 'searching'
  | 'found'
  | 'notFound'
  | 'inserting'
  | 'deleting'
  | 'updating'
  | 'shifting'
  | 'complete'

export interface HistoryStep {
  iteration: number
  description: string
  operation: ArrayOperationType
}

export interface ArrayOperationsState {
  array: ArrayElement[]
  currentIndex: number
  targetIndex: number
  searchValue: number | null
  foundIndex: number | null
  stepPhase: OperationPhase
  currentOperation: ArrayOperationType | null
  operationValue: number | null
  comparisons: number
  shifts: number
  isOperationComplete: boolean
  history: HistoryStep[]
}

/**
 * ArrayOperationsEngine
 * Handles step-by-step visualization of array/list operations
 */
export class ArrayOperationsEngine {
  private state: ArrayOperationsState
  private initialArray: number[]
  private iteration: number

  constructor(array: number[]) {
    this.initialArray = [...array]
    this.iteration = 0
    this.state = {
      array: array.map((value, index) => ({
        value,
        index,
        state: 'default' as const,
      })),
      currentIndex: -1,
      targetIndex: -1,
      searchValue: null,
      foundIndex: null,
      stepPhase: 'idle',
      currentOperation: null,
      operationValue: null,
      comparisons: 0,
      shifts: 0,
      isOperationComplete: true,
      history: [],
    }
  }

  /**
   * Start an append operation
   */
  startAppend(value: number): void {
    this.resetOperation()
    this.state.currentOperation = 'append'
    this.state.operationValue = value
    this.state.stepPhase = 'inserting'
    this.state.isOperationComplete = false
    this.state.targetIndex = this.state.array.length
    
    this.addHistory(`Starting append: Add ${value} to end of array`)
  }

  /**
   * Start an insert operation at specific index
   */
  startInsert(index: number, value: number): void {
    if (index < 0 || index > this.state.array.length) {
      return
    }
    
    this.resetOperation()
    this.state.currentOperation = 'insert'
    this.state.operationValue = value
    this.state.targetIndex = index
    this.state.currentIndex = this.state.array.length - 1
    this.state.stepPhase = 'shifting'
    this.state.isOperationComplete = false
    
    this.addHistory(`Starting insert: Add ${value} at index ${index}`)
  }

  /**
   * Start a delete operation at specific index
   */
  startDelete(index: number): void {
    if (index < 0 || index >= this.state.array.length) {
      return
    }
    
    this.resetOperation()
    this.state.currentOperation = 'delete'
    this.state.targetIndex = index
    this.state.currentIndex = index
    this.state.stepPhase = 'deleting'
    this.state.isOperationComplete = false
    
    const value = this.state.array[index].value
    this.addHistory(`Starting delete: Remove element at index ${index} (value: ${value})`)
  }

  /**
   * Start an update operation
   */
  startUpdate(index: number, value: number): void {
    if (index < 0 || index >= this.state.array.length) {
      return
    }
    
    this.resetOperation()
    this.state.currentOperation = 'update'
    this.state.operationValue = value
    this.state.targetIndex = index
    this.state.currentIndex = index
    this.state.stepPhase = 'updating'
    this.state.isOperationComplete = false
    
    const oldValue = this.state.array[index].value
    this.addHistory(`Starting update: Change index ${index} from ${oldValue} to ${value}`)
  }

  /**
   * Start a search operation (linear search for value)
   */
  startSearch(value: number): void {
    this.resetOperation()
    this.state.currentOperation = 'search'
    this.state.searchValue = value
    this.state.currentIndex = 0
    this.state.stepPhase = 'searching'
    this.state.isOperationComplete = false
    this.state.foundIndex = null
    
    this.addHistory(`Starting search: Looking for value ${value}`)
  }

  /**
   * Start an index search operation (access by index)
   */
  startIndexSearch(index: number): void {
    if (index < 0 || index >= this.state.array.length) {
      this.state.stepPhase = 'notFound'
      this.state.isOperationComplete = true
      this.addHistory(`Index ${index} out of bounds`)
      return
    }
    
    this.resetOperation()
    this.state.currentOperation = 'indexSearch'
    this.state.targetIndex = index
    this.state.currentIndex = index
    this.state.stepPhase = 'found'
    this.state.isOperationComplete = false
    
    this.addHistory(`Starting index access: Getting element at index ${index}`)
  }

  /**
   * Start a reverse operation
   */
  startReverse(): void {
    this.resetOperation()
    this.state.currentOperation = 'reverse'
    this.state.currentIndex = 0
    this.state.targetIndex = this.state.array.length - 1
    this.state.stepPhase = 'shifting'
    this.state.isOperationComplete = false
    
    this.addHistory('Starting reverse: Swapping elements from both ends')
  }

  /**
   * Clear the array
   */
  startClear(): void {
    this.resetOperation()
    this.state.currentOperation = 'clear'
    this.state.stepPhase = 'complete'
    this.state.array = []
    this.state.isOperationComplete = true
    
    this.addHistory('Array cleared')
  }

  /**
   * Execute one step of the current operation
   */
  step(): void {
    if (this.state.isOperationComplete) return

    switch (this.state.currentOperation) {
      case 'append':
        this.stepAppend()
        break
      case 'insert':
        this.stepInsert()
        break
      case 'delete':
        this.stepDelete()
        break
      case 'update':
        this.stepUpdate()
        break
      case 'search':
        this.stepSearch()
        break
      case 'indexSearch':
        this.stepIndexSearch()
        break
      case 'reverse':
        this.stepReverse()
        break
      default:
        break
    }

    this.updateElementStates()
  }

  private stepAppend(): void {
    if (this.state.operationValue === null) return

    // Add element to end
    this.state.array.push({
      value: this.state.operationValue,
      index: this.state.array.length,
      state: 'comparing',
    })

    this.addHistory(
      `Appended ${this.state.operationValue} at index ${this.state.array.length - 1}`
    )

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepInsert(): void {
    if (this.state.operationValue === null) return

    if (this.state.stepPhase === 'shifting') {
      // Shift elements to make space
      if (this.state.currentIndex >= this.state.targetIndex) {
        this.state.shifts++
        
        if (this.state.currentIndex === this.state.array.length - 1) {
          // Add space at end
          this.state.array.push({
            value: this.state.array[this.state.currentIndex].value,
            index: this.state.currentIndex + 1,
            state: 'default',
          })
        } else {
          this.state.array[this.state.currentIndex + 1].value =
            this.state.array[this.state.currentIndex].value
        }

        this.addHistory(
          `Shifted element ${this.state.array[this.state.currentIndex].value} from index ${this.state.currentIndex} to ${this.state.currentIndex + 1}`
        )

        this.state.currentIndex--

        if (this.state.currentIndex < this.state.targetIndex) {
          this.state.stepPhase = 'inserting'
        }
      }
    } else if (this.state.stepPhase === 'inserting') {
      // Insert the new value
      this.state.array[this.state.targetIndex].value = this.state.operationValue
      this.addHistory(
        `Inserted ${this.state.operationValue} at index ${this.state.targetIndex}`
      )

      this.state.stepPhase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepDelete(): void {
    if (this.state.stepPhase === 'deleting') {
      const deletedValue = this.state.array[this.state.targetIndex].value
      
      this.addHistory(`Deleting element ${deletedValue} at index ${this.state.targetIndex}`)
      
      this.state.stepPhase = 'shifting'
      this.state.currentIndex = this.state.targetIndex + 1
    } else if (this.state.stepPhase === 'shifting') {
      // Shift elements left
      if (this.state.currentIndex < this.state.array.length) {
        this.state.array[this.state.currentIndex - 1].value =
          this.state.array[this.state.currentIndex].value
        this.state.shifts++
        
        this.addHistory(
          `Shifted element ${this.state.array[this.state.currentIndex].value} from index ${this.state.currentIndex} to ${this.state.currentIndex - 1}`
        )

        this.state.currentIndex++
      } else {
        // Remove last element
        this.state.array.pop()
        this.addHistory('Removed last element after shifting')
        
        this.state.stepPhase = 'complete'
        this.state.isOperationComplete = true
      }
    }
  }

  private stepUpdate(): void {
    if (this.state.operationValue === null) return

    const oldValue = this.state.array[this.state.targetIndex].value
    this.state.array[this.state.targetIndex].value = this.state.operationValue

    this.addHistory(
      `Updated index ${this.state.targetIndex}: ${oldValue} → ${this.state.operationValue}`
    )

    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepSearch(): void {
    if (this.state.searchValue === null) return

    if (this.state.currentIndex < this.state.array.length) {
      this.state.comparisons++
      const currentValue = this.state.array[this.state.currentIndex].value

      this.addHistory(
        `Comparing index ${this.state.currentIndex}: ${currentValue} ${currentValue === this.state.searchValue ? '==' : '!='} ${this.state.searchValue}`
      )

      if (currentValue === this.state.searchValue) {
        this.state.foundIndex = this.state.currentIndex
        this.state.stepPhase = 'found'
        this.state.isOperationComplete = true
        this.addHistory(`Found ${this.state.searchValue} at index ${this.state.currentIndex}`)
      } else {
        this.state.currentIndex++
        if (this.state.currentIndex >= this.state.array.length) {
          this.state.stepPhase = 'notFound'
          this.state.isOperationComplete = true
          this.addHistory(`Value ${this.state.searchValue} not found in array`)
        }
      }
    }
  }

  private stepIndexSearch(): void {
    const value = this.state.array[this.state.targetIndex].value
    this.addHistory(
      `Accessed index ${this.state.targetIndex}: value = ${value}`
    )
    this.state.stepPhase = 'complete'
    this.state.isOperationComplete = true
  }

  private stepReverse(): void {
    if (this.state.currentIndex < this.state.targetIndex) {
      // Swap elements
      const temp = this.state.array[this.state.currentIndex].value
      this.state.array[this.state.currentIndex].value =
        this.state.array[this.state.targetIndex].value
      this.state.array[this.state.targetIndex].value = temp

      this.addHistory(
        `Swapped indices ${this.state.currentIndex} and ${this.state.targetIndex}`
      )

      this.state.currentIndex++
      this.state.targetIndex--

      if (this.state.currentIndex >= this.state.targetIndex) {
        this.state.stepPhase = 'complete'
        this.state.isOperationComplete = true
        this.addHistory('Array reversed')
      }
    }
  }

  private updateElementStates(): void {
    // Reset all states
    this.state.array.forEach((el) => {
      el.state = 'default'
    })

    // Set states based on current operation
    switch (this.state.currentOperation) {
      case 'search':
        if (this.state.stepPhase === 'searching' && this.state.currentIndex >= 0) {
          this.state.array[this.state.currentIndex].state = 'comparing'
        }
        if (this.state.stepPhase === 'found' && this.state.foundIndex !== null) {
          this.state.array[this.state.foundIndex].state = 'sorted'
        }
        break

      case 'indexSearch':
        if (this.state.targetIndex >= 0 && this.state.targetIndex < this.state.array.length) {
          this.state.array[this.state.targetIndex].state = 'sorted'
        }
        break

      case 'insert':
        if (this.state.targetIndex >= 0 && this.state.targetIndex < this.state.array.length) {
          this.state.array[this.state.targetIndex].state = 'comparing'
        }
        if (this.state.currentIndex >= 0 && this.state.currentIndex < this.state.array.length) {
          this.state.array[this.state.currentIndex].state = 'swapping'
        }
        break

      case 'delete':
        if (this.state.targetIndex >= 0 && this.state.targetIndex < this.state.array.length) {
          this.state.array[this.state.targetIndex].state = 'swapping'
        }
        if (this.state.currentIndex >= 0 && this.state.currentIndex < this.state.array.length) {
          this.state.array[this.state.currentIndex].state = 'comparing'
        }
        break

      case 'update':
        if (this.state.targetIndex >= 0 && this.state.targetIndex < this.state.array.length) {
          this.state.array[this.state.targetIndex].state = 'sorted'
        }
        break

      case 'reverse':
        if (this.state.currentIndex >= 0 && this.state.currentIndex < this.state.array.length) {
          this.state.array[this.state.currentIndex].state = 'comparing'
        }
        if (this.state.targetIndex >= 0 && this.state.targetIndex < this.state.array.length) {
          this.state.array[this.state.targetIndex].state = 'swapping'
        }
        break

      default:
        break
    }
  }

  private resetOperation(): void {
    this.state.currentIndex = -1
    this.state.targetIndex = -1
    this.state.searchValue = null
    this.state.foundIndex = null
    this.state.operationValue = null
    this.state.comparisons = 0
    this.state.shifts = 0
    this.state.stepPhase = 'idle'
    this.state.isOperationComplete = true

    // Reset all element states
    this.state.array.forEach((el) => {
      el.state = 'default'
    })
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
      array: this.initialArray.map((value, index) => ({
        value,
        index,
        state: 'default' as const,
      })),
      currentIndex: -1,
      targetIndex: -1,
      searchValue: null,
      foundIndex: null,
      stepPhase: 'idle',
      currentOperation: null,
      operationValue: null,
      comparisons: 0,
      shifts: 0,
      isOperationComplete: true,
      history: [],
    }
  }

  /**
   * Update array with new values
   */
  updateArray(newArray: number[]): void {
    this.initialArray = [...newArray]
    this.reset()
  }

  /**
   * Get current state
   */
  getState(): ArrayOperationsState {
    return {
      ...this.state,
      array: this.state.array.map((el, idx) => ({ ...el, index: idx })),
    }
  }
}
