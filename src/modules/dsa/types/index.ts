// DSA types

export interface ArrayElement {
  value: number
  index: number
  state: 'default' | 'comparing' | 'swapping' | 'sorted'
}

export interface SortStep {
  iteration: number
  array: ArrayElement[]
  comparingIndices: number[]
  swappingIndices: number[]
  description: string
}
