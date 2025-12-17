/**
 * Pure Bubble Sort algorithm
 * NO UI, NO Canvas, NO side effects
 * Returns sorted array and comparison/swap counts
 */

export interface BubbleSortResult {
  sortedArray: number[]
  comparisons: number
  swaps: number
}

export function bubbleSort(arr: number[]): BubbleSortResult {
  const array = [...arr]
  let comparisons = 0
  let swaps = 0
  const n = array.length

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++
      if (array[j] > array[j + 1]) {
        // Swap
        ;[array[j], array[j + 1]] = [array[j + 1], array[j]]
        swaps++
      }
    }
  }

  return { sortedArray: array, comparisons, swaps }
}

/**
 * Checks if array is sorted
 */
export function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false
    }
  }
  return true
}
