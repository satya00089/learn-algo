/**
 * Binary Search Engine with step-by-step visualization
 */

export interface ArrayElement {
  value: number
  index: number
  state: 'default' | 'searching' | 'current' | 'found' | 'excluded'
}

export interface BinarySearchStep {
  type: 'compare' | 'found' | 'notFound' | 'updateBounds'
  left: number
  right: number
  mid: number
  target: number
  message: string
}

export interface BinarySearchState {
  array: ArrayElement[]
  target: number
  left: number
  right: number
  mid: number
  comparisons: number
  isComplete: boolean
  found: boolean
  foundIndex: number
  currentStep: number
  steps: BinarySearchStep[]
  stepPhase: 'comparing' | 'found' | 'notFound' | 'updateBounds'
}

export class BinarySearchEngine {
  private state: BinarySearchState
  private originalArray: number[]

  constructor(array: number[], target: number) {
    this.originalArray = [...array].sort((a, b) => a - b) // Ensure sorted
    this.state = this.initializeState(target)
  }

  private initializeState(target: number): BinarySearchState {
    const array: ArrayElement[] = this.originalArray.map((value, index) => ({
      value,
      index,
      state: 'default' as const,
    }))

    // Compute all steps upfront
    const steps = this.computeSteps(target)

    return {
      array,
      target,
      left: 0,
      right: array.length - 1,
      mid: -1,
      comparisons: 0,
      isComplete: false,
      found: false,
      foundIndex: -1,
      currentStep: -1,
      steps,
      stepPhase: 'comparing',
    }
  }

  private computeSteps(target: number): BinarySearchStep[] {
    const steps: BinarySearchStep[] = []
    let left = 0
    let right = this.originalArray.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)

      // Compare step
      steps.push({
        type: 'compare',
        left,
        right,
        mid,
        target,
        message: `Comparing target ${target} with arr[${mid}] = ${this.originalArray[mid]}`,
      })

      if (this.originalArray[mid] === target) {
        // Found
        steps.push({
          type: 'found',
          left,
          right,
          mid,
          target,
          message: `✓ Target ${target} found at index ${mid}!`,
        })
        return steps
      }

      if (this.originalArray[mid] < target) {
        // Update bounds - search right half
        steps.push({
          type: 'updateBounds',
          left: mid + 1,
          right,
          mid,
          target,
          message: `arr[${mid}] < ${target}, searching right half [${mid + 1}, ${right}]`,
        })
        left = mid + 1
      } else {
        // Update bounds - search left half
        steps.push({
          type: 'updateBounds',
          left,
          right: mid - 1,
          mid,
          target,
          message: `arr[${mid}] > ${target}, searching left half [${left}, ${mid - 1}]`,
        })
        right = mid - 1
      }
    }

    // Not found
    steps.push({
      type: 'notFound',
      left,
      right,
      mid: -1,
      target,
      message: `✗ Target ${target} not found in array`,
    })

    return steps
  }

  init(): void {
    this.state = this.initializeState(this.state.target)
  }

  step(): void {
    if (this.state.isComplete) {
      return
    }

    // Move to next step
    if (this.state.currentStep < this.state.steps.length - 1) {
      this.state.currentStep++
      const currentStep = this.state.steps[this.state.currentStep]

      // Update state based on current step
      this.updateStateForStep(currentStep)

      // Check if we're done
      if (this.state.currentStep === this.state.steps.length - 1) {
        this.state.isComplete = true
      }
    }
  }

  private updateStateForStep(step: BinarySearchStep): void {
    // Reset all states
    this.state.array.forEach((el) => {
      el.state = 'default'
    })

    this.state.left = step.left
    this.state.right = step.right
    this.state.mid = step.mid

    // Set step phase based on type
    if (step.type === 'compare') {
      this.state.stepPhase = 'comparing'
    } else if (step.type === 'found') {
      this.state.stepPhase = 'found'
    } else if (step.type === 'notFound') {
      this.state.stepPhase = 'notFound'
    } else {
      this.state.stepPhase = 'updateBounds'
    }

    // Mark excluded elements
    for (let i = 0; i < this.state.array.length; i++) {
      if (i < step.left || i > step.right) {
        this.state.array[i].state = 'excluded'
      }
    }

    // Mark searching range
    for (let i = step.left; i <= step.right && i < this.state.array.length; i++) {
      this.state.array[i].state = 'searching'
    }

    // Mark current mid element
    if (step.mid >= 0) {
      this.state.array[step.mid].state = 'current'
      this.state.comparisons++
    }

    // Mark found element
    if (step.type === 'found') {
      this.state.array[step.mid].state = 'found'
      this.state.found = true
      this.state.foundIndex = step.mid
    }

    // Handle not found
    if (step.type === 'notFound') {
      this.state.found = false
      this.state.foundIndex = -1
    }
  }

  run(): void {
    while (!this.state.isComplete) {
      this.step()
    }
  }

  reset(): void {
    this.state.currentStep = -1
    this.state.comparisons = 0
    this.state.isComplete = false
    this.state.found = false
    this.state.foundIndex = -1
    this.state.left = 0
    this.state.right = this.state.array.length - 1
    this.state.mid = -1

    // Reset all array element states
    this.state.array.forEach((el) => {
      el.state = 'default'
    })
  }

  getState(): BinarySearchState {
    return { ...this.state }
  }

  updateTarget(target: number): void {
    this.state.target = target
    this.state.steps = this.computeSteps(target)
    this.reset()
  }

  updateArray(array: number[]): void {
    this.originalArray = [...array].sort((a, b) => a - b)
    this.state = this.initializeState(this.state.target)
  }
}
