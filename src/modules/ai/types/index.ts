// AI Algorithm types

export type Player = 'X' | 'O'
export type Cell = Player | null

export interface GameBoard {
  cells: Cell[]
  size: number // 3 for Tic-Tac-Toe
}

export interface MinimaxNode {
  id: string
  board: Cell[]
  depth: number
  score: number | null
  move: number | null
  isMax: boolean
  alpha?: number
  beta?: number
  state: 'exploring' | 'evaluated' | 'pruned' | 'best-path'
  children: MinimaxNode[]
  parent: string | null
}

export interface MinimaxState {
  board: Cell[]
  currentPlayer: Player
  phase: 'idle' | 'thinking' | 'evaluating' | 'backpropagating' | 'complete'
  tree: MinimaxNode[]
  currentNode: string | null
  bestMove: number | null
  nodesEvaluated: number
  nodesPruned: number
  maxDepth: number
  message: string
  history: HistoryStep[]
  isComplete: boolean
  winner: Player | 'Draw' | null
  algorithm: 'minimax' | 'alpha-beta'
  visualizationMode: 'tree' | 'board'
  selectedNodeId: string | null // For interactive tree exploration
  isAnimating: boolean // For step-by-step animation
  animationStep: number // Current step in animation
}

export interface HistoryStep {
  iteration: number
  description: string
  timestamp: number
  nodeId?: string
  score?: number
  move?: number
  alpha?: number
  beta?: number
}

export interface Position {
  x: number
  y: number
}

export interface TreeNodeLayout {
  x: number
  y: number
}
