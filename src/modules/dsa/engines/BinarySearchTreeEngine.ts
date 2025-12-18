/**
 * Binary Search Tree Engine with step-by-step debugging
 * Implements DebuggableAlgorithm interface
 */

export interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  x?: number // X position for rendering
  y?: number // Y position for rendering
  state: 'default' | 'comparing' | 'inserting' | 'deleting' | 'found' | 'notfound'
}

export interface TreeStep {
  iteration: number
  description: string
  currentNode: number | null
  path: number[] // Path taken to reach current node
}

export interface BSTState {
  root: TreeNode | null
  nodes: number[] // All node values in the tree
  comparisons: number
  insertions: number
  deletions: number
  history: TreeStep[]
  stepPhase: 'selecting' | 'comparing' | 'navigating' | 'inserting' | 'complete'
  currentOperation: 'insert' | 'search' | 'delete' | 'traverse' | null
  targetValue: number | null
  currentNode: TreeNode | null
  parentNode: TreeNode | null
  path: number[] // Current path being traversed
}

export class BinarySearchTreeEngine {
  private state: BSTState
  private isRunning: boolean = false

  constructor() {
    this.state = this.initializeState()
  }

  private initializeState(): BSTState {
    return {
      root: null,
      nodes: [],
      comparisons: 0,
      insertions: 0,
      deletions: 0,
      history: [],
      stepPhase: 'selecting',
      currentOperation: null,
      targetValue: null,
      currentNode: null,
      parentNode: null,
      path: [],
    }
  }

  private resetNodeStates(node: TreeNode | null): void {
    if (!node) return
    node.state = 'default'
    this.resetNodeStates(node.left)
    this.resetNodeStates(node.right)
  }

  init(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  // Insert operation
  startInsert(value: number): void {
    this.resetNodeStates(this.state.root)
    this.state.currentOperation = 'insert'
    this.state.targetValue = value
    this.state.currentNode = this.state.root
    this.state.parentNode = null
    this.state.path = []
    this.state.stepPhase = 'selecting'

    this.state.history.push({
      iteration: this.state.history.length,
      description: `Starting insert of value ${value}`,
      currentNode: null,
      path: [],
    })
  }

  // Search operation
  startSearch(value: number): void {
    this.resetNodeStates(this.state.root)
    this.state.currentOperation = 'search'
    this.state.targetValue = value
    this.state.currentNode = this.state.root
    this.state.parentNode = null
    this.state.path = []
    this.state.stepPhase = 'selecting'

    this.state.history.push({
      iteration: this.state.history.length,
      description: `Starting search for value ${value}`,
      currentNode: null,
      path: [],
    })
  }

  step(): void {
    const { currentOperation, targetValue } = this.state

    if (!currentOperation || targetValue === null) {
      return
    }

    if (currentOperation === 'insert') {
      this.stepInsert()
    } else if (currentOperation === 'search') {
      this.stepSearch()
    }
  }

  private stepInsert(): void {
    const { targetValue, currentNode, parentNode, stepPhase } = this.state

    if (targetValue === null) return

    if (stepPhase === 'selecting') {
      // Start at root or create root
      if (this.state.root === null) {
        this.state.stepPhase = 'inserting'
        return
      }
      this.state.currentNode = this.state.root
      this.state.stepPhase = 'comparing'
    } else if (stepPhase === 'comparing') {
      if (!currentNode) {
        this.state.stepPhase = 'inserting'
        return
      }

      // Highlight current node
      currentNode.state = 'comparing'
      this.state.comparisons++
      this.state.path.push(currentNode.value)

      this.state.history.push({
        iteration: this.state.history.length,
        description: `Comparing ${targetValue} with ${currentNode.value}`,
        currentNode: currentNode.value,
        path: [...this.state.path],
      })

      this.state.stepPhase = 'navigating'
    } else if (stepPhase === 'navigating') {
      if (!currentNode) return

      // Determine direction
      if (targetValue < currentNode.value) {
        // Go left
        if (currentNode.left === null) {
          // Found insertion point
          this.state.parentNode = currentNode
          this.state.currentNode = null
          this.state.stepPhase = 'inserting'

          this.state.history.push({
            iteration: this.state.history.length,
            description: `${targetValue} < ${currentNode.value}, insert as left child`,
            currentNode: currentNode.value,
            path: [...this.state.path],
          })
        } else {
          // Navigate left
          this.state.parentNode = currentNode
          this.state.currentNode = currentNode.left
          this.state.stepPhase = 'comparing'

          this.state.history.push({
            iteration: this.state.history.length,
            description: `${targetValue} < ${currentNode.value}, go left`,
            currentNode: currentNode.value,
            path: [...this.state.path],
          })
        }
      } else if (targetValue > currentNode.value) {
        // Go right
        if (currentNode.right === null) {
          // Found insertion point
          this.state.parentNode = currentNode
          this.state.currentNode = null
          this.state.stepPhase = 'inserting'

          this.state.history.push({
            iteration: this.state.history.length,
            description: `${targetValue} > ${currentNode.value}, insert as right child`,
            currentNode: currentNode.value,
            path: [...this.state.path],
          })
        } else {
          // Navigate right
          this.state.parentNode = currentNode
          this.state.currentNode = currentNode.right
          this.state.stepPhase = 'comparing'

          this.state.history.push({
            iteration: this.state.history.length,
            description: `${targetValue} > ${currentNode.value}, go right`,
            currentNode: currentNode.value,
            path: [...this.state.path],
          })
        }
      } else {
        // Value already exists
        currentNode.state = 'found'
        this.state.stepPhase = 'complete'

        this.state.history.push({
          iteration: this.state.history.length,
          description: `Value ${targetValue} already exists in tree`,
          currentNode: currentNode.value,
          path: [...this.state.path],
        })
      }
    } else if (stepPhase === 'inserting') {
      // Create new node
      const newNode: TreeNode = {
        value: targetValue,
        left: null,
        right: null,
        state: 'inserting',
      }

      if (this.state.root === null) {
        // Insert as root
        this.state.root = newNode
        this.state.history.push({
          iteration: this.state.history.length,
          description: `Inserted ${targetValue} as root`,
          currentNode: targetValue,
          path: [targetValue],
        })
      } else if (parentNode) {
        // Insert as child
        if (targetValue < parentNode.value) {
          parentNode.left = newNode
        } else {
          parentNode.right = newNode
        }

        this.state.history.push({
          iteration: this.state.history.length,
          description: `Inserted ${targetValue} as ${targetValue < parentNode.value ? 'left' : 'right'} child of ${parentNode.value}`,
          currentNode: targetValue,
          path: [...this.state.path, targetValue],
        })
      }

      this.state.nodes.push(targetValue)
      this.state.insertions++
      this.state.currentNode = newNode
      this.state.stepPhase = 'complete'

      // Calculate positions for rendering
      this.calculatePositions()
    } else if (stepPhase === 'complete') {
      // Operation complete, reset
      this.resetNodeStates(this.state.root)
      if (this.state.currentNode) {
        this.state.currentNode.state = 'default'
      }
      this.state.currentOperation = null
      this.state.targetValue = null
      this.state.currentNode = null
      this.state.parentNode = null
      this.state.path = []
    }
  }

  private stepSearch(): void {
    const { targetValue, currentNode, stepPhase } = this.state

    if (targetValue === null) return

    if (stepPhase === 'selecting') {
      if (this.state.root === null) {
        this.state.stepPhase = 'complete'
        this.state.history.push({
          iteration: this.state.history.length,
          description: 'Tree is empty',
          currentNode: null,
          path: [],
        })
        return
      }
      this.state.currentNode = this.state.root
      this.state.stepPhase = 'comparing'
    } else if (stepPhase === 'comparing') {
      if (!currentNode) {
        // Not found
        this.state.stepPhase = 'complete'
        this.state.history.push({
          iteration: this.state.history.length,
          description: `Value ${targetValue} not found in tree`,
          currentNode: null,
          path: [...this.state.path],
        })
        return
      }

      // Highlight current node
      currentNode.state = 'comparing'
      this.state.comparisons++
      this.state.path.push(currentNode.value)

      this.state.history.push({
        iteration: this.state.history.length,
        description: `Comparing ${targetValue} with ${currentNode.value}`,
        currentNode: currentNode.value,
        path: [...this.state.path],
      })

      this.state.stepPhase = 'navigating'
    } else if (stepPhase === 'navigating') {
      if (!currentNode) return

      if (targetValue === currentNode.value) {
        // Found!
        currentNode.state = 'found'
        this.state.stepPhase = 'complete'

        this.state.history.push({
          iteration: this.state.history.length,
          description: `Found ${targetValue}!`,
          currentNode: currentNode.value,
          path: [...this.state.path],
        })
      } else if (targetValue < currentNode.value) {
        // Go left
        this.state.currentNode = currentNode.left
        this.state.stepPhase = 'comparing'

        this.state.history.push({
          iteration: this.state.history.length,
          description: `${targetValue} < ${currentNode.value}, go left`,
          currentNode: currentNode.value,
          path: [...this.state.path],
        })
      } else {
        // Go right
        this.state.currentNode = currentNode.right
        this.state.stepPhase = 'comparing'

        this.state.history.push({
          iteration: this.state.history.length,
          description: `${targetValue} > ${currentNode.value}, go right`,
          currentNode: currentNode.value,
          path: [...this.state.path],
        })
      }
    } else if (stepPhase === 'complete') {
      // Operation complete, reset
      this.resetNodeStates(this.state.root)
      this.state.currentOperation = null
      this.state.targetValue = null
      this.state.currentNode = null
      this.state.path = []
    }
  }

  private calculatePositions(): void {
    if (!this.state.root) return

    const treeDepth = this.getTreeDepth(this.state.root)
    // Use a more conservative width calculation that scales better
    // Base width on actual node count and depth, with a max reasonable width
    const baseSpacing = 50 // Minimum horizontal spacing between nodes
    const maxWidth = 1100 // Max width to fit in canvas (with padding)

    // Calculate ideal width based on depth, but cap it at maxWidth
    const idealWidth = Math.min(Math.pow(2, treeDepth) * baseSpacing, maxWidth)

    this.assignPositions(this.state.root, idealWidth / 2, 50, idealWidth / 4, 0, treeDepth)
  }

  private assignPositions(
    node: TreeNode | null,
    x: number,
    y: number,
    offset: number,
    depth: number,
    maxDepth: number
  ): void {
    if (!node) return

    node.x = x
    node.y = y

    const nextY = y + 80
    const nextOffset = offset / 2

    if (node.left) {
      this.assignPositions(node.left, x - offset, nextY, nextOffset, depth + 1, maxDepth)
    }
    if (node.right) {
      this.assignPositions(node.right, x + offset, nextY, nextOffset, depth + 1, maxDepth)
    }
  }

  private getTreeDepth(node: TreeNode | null): number {
    if (!node) return 0
    return 1 + Math.max(this.getTreeDepth(node.left), this.getTreeDepth(node.right))
  }

  run(): void {
    this.isRunning = true
    while (this.state.stepPhase !== 'complete' && this.isRunning) {
      this.step()
    }
    this.isRunning = false
  }

  reset(): void {
    this.state = this.initializeState()
    this.isRunning = false
  }

  clear(): void {
    this.reset()
  }

  getState(): BSTState {
    return {
      ...this.state,
      root: this.state.root ? this.cloneTree(this.state.root) : null,
      nodes: [...this.state.nodes],
      history: [...this.state.history],
      path: [...this.state.path],
    }
  }

  private cloneTree(node: TreeNode): TreeNode {
    return {
      value: node.value,
      left: node.left ? this.cloneTree(node.left) : null,
      right: node.right ? this.cloneTree(node.right) : null,
      x: node.x,
      y: node.y,
      state: node.state,
    }
  }

  stop(): void {
    this.isRunning = false
  }

  // Helper method to get in-order traversal
  getInOrderTraversal(): number[] {
    const result: number[] = []
    this.inOrderHelper(this.state.root, result)
    return result
  }

  private inOrderHelper(node: TreeNode | null, result: number[]): void {
    if (!node) return
    this.inOrderHelper(node.left, result)
    result.push(node.value)
    this.inOrderHelper(node.right, result)
  }
}
