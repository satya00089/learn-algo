import type { Cell, Player, MinimaxNode, MinimaxState } from '../types'

/**
 * Minimax Engine
 * Implements the Minimax algorithm with Alpha-Beta pruning for game AI
 */
export class MinimaxEngine {
  private state: MinimaxState
  private iterationCount: number
  private nodeIdCounter: number

  constructor(algorithm: 'minimax' | 'alpha-beta' = 'minimax') {
    this.state = {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      phase: 'idle',
      tree: [],
      currentNode: null,
      bestMove: null,
      nodesEvaluated: 0,
      nodesPruned: 0,
      maxDepth: 0,
      message: 'Ready. Make a move or let AI play.',
      history: [],
      isComplete: false,
      winner: null,
      algorithm,
      visualizationMode: 'tree',
      selectedNodeId: null,
      isAnimating: false,
      animationStep: 0,
    }
    this.iterationCount = 0
    this.nodeIdCounter = 0
  }

  private addHistory(
    description: string,
    nodeId?: string,
    score?: number,
    move?: number,
    alpha?: number,
    beta?: number
  ): void {
    this.iterationCount++
    this.state.history.push({
      iteration: this.iterationCount,
      description,
      timestamp: Date.now(),
      nodeId,
      score,
      move,
      alpha,
      beta,
    })
  }

  private generateNodeId(): string {
    return `node-${this.nodeIdCounter++}`
  }

  /**
   * Check if there's a winner on the board
   */
  private checkWinner(board: Cell[]): Player | 'Draw' | null {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    // Check for draw
    if (board.every((cell) => cell !== null)) {
      return 'Draw'
    }

    return null
  }

  /**
   * Get available moves
   */
  private getAvailableMoves(board: Cell[]): number[] {
    return board.map((cell, idx) => (cell === null ? idx : -1)).filter((idx) => idx !== -1)
  }

  /**
   * Evaluate board state (terminal node)
   */
  private evaluateBoard(board: Cell[]): number {
    const winner = this.checkWinner(board)
    if (winner === 'O') return 10 // AI (maximizing player) wins
    if (winner === 'X') return -10 // Human (minimizing player) wins
    return 0 // Draw or non-terminal
  }

  /**
   * Minimax algorithm (without pruning)
   */
  private minimax(
    board: Cell[],
    depth: number,
    isMaximizing: boolean,
    parentId: string | null
  ): { score: number; move: number | null; nodeId: string } {
    const nodeId = this.generateNodeId()
    this.state.nodesEvaluated++

    // Check terminal state
    const winner = this.checkWinner(board)
    if (winner !== null) {
      const score = this.evaluateBoard(board)
      const node: MinimaxNode = {
        id: nodeId,
        board: [...board],
        depth,
        score,
        move: null,
        isMax: isMaximizing,
        state: 'evaluated',
        children: [],
        parent: parentId,
      }
      this.state.tree.push(node)
      this.addHistory(
        `Terminal node: ${winner === 'Draw' ? 'Draw' : `${winner} wins`} | Score: ${score}`,
        nodeId,
        score
      )
      return { score, move: null, nodeId }
    }

    // Check depth limit (for performance)
    if (depth >= 9) {
      const score = this.evaluateBoard(board)
      const node: MinimaxNode = {
        id: nodeId,
        board: [...board],
        depth,
        score,
        move: null,
        isMax: isMaximizing,
        state: 'evaluated',
        children: [],
        parent: parentId,
      }
      this.state.tree.push(node)
      return { score, move: null, nodeId }
    }

    const moves = this.getAvailableMoves(board)
    const player: Player = isMaximizing ? 'O' : 'X'

    // Create node
    const node: MinimaxNode = {
      id: nodeId,
      board: [...board],
      depth,
      score: null,
      move: null,
      isMax: isMaximizing,
      state: 'exploring',
      children: [],
      parent: parentId,
    }
    this.state.tree.push(node)

    if (isMaximizing) {
      let maxScore = -Infinity
      let bestMoveIdx: number | null = null

      for (const move of moves) {
        const newBoard = [...board]
        newBoard[move] = player

        this.addHistory(`Trying move ${move} (O) at depth ${depth}`, nodeId)

        const result = this.minimax(newBoard, depth + 1, false, nodeId)

        if (result.score > maxScore) {
          maxScore = result.score
          bestMoveIdx = move
        }
      }

      node.score = maxScore
      node.move = bestMoveIdx
      node.state = 'evaluated'

      this.addHistory(
        `Max node evaluated: score=${maxScore}, bestMove=${bestMoveIdx}`,
        nodeId,
        maxScore,
        bestMoveIdx ?? undefined
      )

      return { score: maxScore, move: bestMoveIdx, nodeId }
    } else {
      let minScore = Infinity
      let bestMoveIdx: number | null = null

      for (const move of moves) {
        const newBoard = [...board]
        newBoard[move] = player

        this.addHistory(`Trying move ${move} (X) at depth ${depth}`, nodeId)

        const result = this.minimax(newBoard, depth + 1, true, nodeId)

        if (result.score < minScore) {
          minScore = result.score
          bestMoveIdx = move
        }
      }

      node.score = minScore
      node.move = bestMoveIdx
      node.state = 'evaluated'

      this.addHistory(
        `Min node evaluated: score=${minScore}, bestMove=${bestMoveIdx}`,
        nodeId,
        minScore,
        bestMoveIdx ?? undefined
      )

      return { score: minScore, move: bestMoveIdx, nodeId }
    }
  }

  /**
   * Minimax with Alpha-Beta pruning
   */
  private minimaxAlphaBeta(
    board: Cell[],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    parentId: string | null
  ): { score: number; move: number | null; nodeId: string } {
    const nodeId = this.generateNodeId()
    this.state.nodesEvaluated++

    // Check terminal state
    const winner = this.checkWinner(board)
    if (winner !== null) {
      const score = this.evaluateBoard(board)
      const node: MinimaxNode = {
        id: nodeId,
        board: [...board],
        depth,
        score,
        move: null,
        isMax: isMaximizing,
        alpha,
        beta,
        state: 'evaluated',
        children: [],
        parent: parentId,
      }
      this.state.tree.push(node)
      this.addHistory(
        `Terminal: ${winner === 'Draw' ? 'Draw' : `${winner} wins`} | Score: ${score}`,
        nodeId,
        score
      )
      return { score, move: null, nodeId }
    }

    const moves = this.getAvailableMoves(board)
    const player: Player = isMaximizing ? 'O' : 'X'

    // Create node
    const node: MinimaxNode = {
      id: nodeId,
      board: [...board],
      depth,
      score: null,
      move: null,
      isMax: isMaximizing,
      alpha,
      beta,
      state: 'exploring',
      children: [],
      parent: parentId,
    }
    this.state.tree.push(node)

    if (isMaximizing) {
      let maxScore = -Infinity
      let bestMoveIdx: number | null = null

      for (const move of moves) {
        const newBoard = [...board]
        newBoard[move] = player

        this.addHistory(
          `Trying move ${move} (O) | α=${alpha}, β=${beta}`,
          nodeId,
          undefined,
          move,
          alpha,
          beta
        )

        const result = this.minimaxAlphaBeta(newBoard, depth + 1, alpha, beta, false, nodeId)

        if (result.score > maxScore) {
          maxScore = result.score
          bestMoveIdx = move
        }

        alpha = Math.max(alpha, maxScore)

        // Beta cutoff (pruning)
        if (beta <= alpha) {
          this.state.nodesPruned++
          this.addHistory(
            `Beta cutoff! Pruning remaining branches | α=${alpha}, β=${beta}`,
            nodeId,
            maxScore,
            bestMoveIdx ?? undefined,
            alpha,
            beta
          )
          node.state = 'pruned'
          break
        }
      }

      node.score = maxScore
      node.move = bestMoveIdx
      node.alpha = alpha
      node.state = node.state === 'pruned' ? 'pruned' : 'evaluated'

      if (node.state !== 'pruned') {
        this.addHistory(
          `Max evaluated: score=${maxScore}, bestMove=${bestMoveIdx} | α=${alpha}`,
          nodeId,
          maxScore,
          bestMoveIdx ?? undefined,
          alpha
        )
      }

      return { score: maxScore, move: bestMoveIdx, nodeId }
    } else {
      let minScore = Infinity
      let bestMoveIdx: number | null = null

      for (const move of moves) {
        const newBoard = [...board]
        newBoard[move] = player

        this.addHistory(
          `Trying move ${move} (X) | α=${alpha}, β=${beta}`,
          nodeId,
          undefined,
          move,
          alpha,
          beta
        )

        const result = this.minimaxAlphaBeta(newBoard, depth + 1, alpha, beta, true, nodeId)

        if (result.score < minScore) {
          minScore = result.score
          bestMoveIdx = move
        }

        beta = Math.min(beta, minScore)

        // Alpha cutoff (pruning)
        if (beta <= alpha) {
          this.state.nodesPruned++
          this.addHistory(
            `Alpha cutoff! Pruning remaining branches | α=${alpha}, β=${beta}`,
            nodeId,
            minScore,
            bestMoveIdx ?? undefined,
            alpha,
            beta
          )
          node.state = 'pruned'
          break
        }
      }

      node.score = minScore
      node.move = bestMoveIdx
      node.beta = beta
      node.state = node.state === 'pruned' ? 'pruned' : 'evaluated'

      if (node.state !== 'pruned') {
        this.addHistory(
          `Min evaluated: score=${minScore}, bestMove=${bestMoveIdx} | β=${beta}`,
          nodeId,
          minScore,
          bestMoveIdx ?? undefined,
          undefined,
          beta
        )
      }

      return { score: minScore, move: bestMoveIdx, nodeId }
    }
  }

  /**
   * Find best move for AI
   */
  findBestMove(): void {
    if (this.state.winner) {
      this.state.message = 'Game is already over!'
      return
    }

    this.state.phase = 'thinking'
    this.state.tree = []
    this.state.nodesEvaluated = 0
    this.state.nodesPruned = 0
    this.nodeIdCounter = 0
    this.iterationCount = 0
    this.state.history = []

    this.addHistory(
      `Starting ${this.state.algorithm === 'alpha-beta' ? 'Alpha-Beta Minimax' : 'Minimax'} algorithm...`
    )

    const result =
      this.state.algorithm === 'alpha-beta'
        ? this.minimaxAlphaBeta(this.state.board, 0, -Infinity, Infinity, true, null)
        : this.minimax(this.state.board, 0, true, null)

    this.state.bestMove = result.move
    this.state.phase = 'complete'
    this.state.isComplete = true

    // Mark best path
    this.markBestPath(result.nodeId)

    this.addHistory(
      `Best move found: ${result.move} with score ${result.score} | Nodes evaluated: ${this.state.nodesEvaluated}${this.state.algorithm === 'alpha-beta' ? ` | Nodes pruned: ${this.state.nodesPruned}` : ''}`
    )

    this.state.message = `AI suggests move: ${result.move} (Score: ${result.score})`
  }

  /**
   * Mark the best path in the tree
   */
  private markBestPath(nodeId: string): void {
    let current: MinimaxNode | undefined = this.state.tree.find((n) => n.id === nodeId)

    while (current) {
      if (current.state !== 'pruned') {
        current.state = 'best-path'
      }
      current = current.parent ? this.state.tree.find((n) => n.id === current!.parent) : undefined
    }
  }

  /**
   * Make a move on the board
   */
  makeMove(position: number, player: Player): void {
    if (this.state.board[position] !== null) {
      this.state.message = 'Invalid move! Cell is already occupied.'
      return
    }

    this.state.board[position] = player
    this.state.currentPlayer = player === 'X' ? 'O' : 'X'

    // Check winner
    this.state.winner = this.checkWinner(this.state.board)
    if (this.state.winner) {
      this.state.isComplete = true
      this.state.message =
        this.state.winner === 'Draw' ? 'Game ended in a draw!' : `${this.state.winner} wins!`
    }

    this.state.tree = []
    this.state.bestMove = null
    this.addHistory(`${player} played at position ${position}`)
  }

  /**
   * Reset the game
   */
  reset(): void {
    this.state.board = Array(9).fill(null)
    this.state.currentPlayer = 'X'
    this.state.phase = 'idle'
    this.state.tree = []
    this.state.currentNode = null
    this.state.bestMove = null
    this.state.nodesEvaluated = 0
    this.state.nodesPruned = 0
    this.state.message = 'Ready. Make a move or let AI play.'
    this.state.history = []
    this.state.isComplete = false
    this.state.winner = null
    this.iterationCount = 0
    this.nodeIdCounter = 0
    this.state.selectedNodeId = null
    this.state.isAnimating = false
    this.state.animationStep = 0
  }

  /**
   * Set algorithm type
   */
  setAlgorithm(algorithm: 'minimax' | 'alpha-beta'): void {
    this.state.algorithm = algorithm
    this.reset()
  }

  /**
   * Toggle visualization mode
   */
  toggleVisualizationMode(): void {
    this.state.visualizationMode = this.state.visualizationMode === 'tree' ? 'board' : 'tree'
  }

  /**
   * Select a node for exploration
   */
  selectNode(nodeId: string | null): void {
    this.state.selectedNodeId = nodeId
  }

  /**
   * Start animation mode
   */
  startAnimation(): void {
    this.state.isAnimating = true
    this.state.animationStep = 0
    this.state.currentNode = this.state.tree.length > 0 ? this.state.tree[0].id : null
  }

  /**
   * Step through animation
   */
  stepAnimation(): boolean {
    if (!this.state.isAnimating || this.state.animationStep >= this.state.tree.length) {
      this.state.isAnimating = false
      return false
    }

    this.state.animationStep++
    if (this.state.animationStep < this.state.tree.length) {
      this.state.currentNode = this.state.tree[this.state.animationStep].id
    }

    return this.state.animationStep < this.state.tree.length
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    this.state.isAnimating = false
    this.state.currentNode = null
  }

  /**
   * Get current state
   */
  getState(): MinimaxState {
    return { ...this.state }
  }
}
