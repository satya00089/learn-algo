/**
 * Pure Binary Search algorithm
 * NO UI, NO Canvas, NO side effects
 * Returns search result and comparison count
 */

export interface BinarySearchResult {
  found: boolean
  index: number
  comparisons: number
}

/**
 * Iterative binary search
 */
export function binarySearch(arr: number[], target: number): BinarySearchResult {
  let left = 0
  let right = arr.length - 1
  let comparisons = 0

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    comparisons++

    if (arr[mid] === target) {
      return { found: true, index: mid, comparisons }
    }

    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return { found: false, index: -1, comparisons }
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

/**
 * Generate random sorted array
 */
export function generateSortedArray(size: number, min: number = 1, max: number = 100): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return arr.sort((a, b) => a - b)
}
