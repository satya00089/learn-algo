/**
 * Variance Engine
 * Handles card drawing simulations and variance calculations
 */

export interface CardDrawResult {
  value: number // 1-10 (Ace through 10)
  drawNumber: number
}

export interface CardDeck {
  card1: boolean // Ace
  card2: boolean
  card3: boolean
  card4: boolean
  card5: boolean
  card6: boolean
  card7: boolean
  card8: boolean
  card9: boolean
  card10: boolean
}

export interface VarianceState {
  draws: CardDrawResult[]
  cardCounts: Record<number, number> // Count of each card (1-10)
  totalDraws: number
  runningVariance: number
  deck: CardDeck
  theoreticalVariance: number
  theoreticalExpectation: number
  squaredDifferences: number[] // For visualization
}

export interface VarianceConfig {
  deck: CardDeck
}

export class VarianceEngine {
  private config: VarianceConfig
  private state: VarianceState

  constructor(config: VarianceConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): VarianceState {
    const theoreticalExpectation = this.calculateTheoreticalExpectation()
    return {
      draws: [],
      cardCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
      totalDraws: 0,
      runningVariance: 0,
      deck: { ...this.config.deck },
      theoreticalVariance: this.calculateTheoreticalVariance(theoreticalExpectation),
      theoreticalExpectation,
      squaredDifferences: [],
    }
  }

  /**
   * Get list of available cards in the deck
   */
  private getAvailableCards(): number[] {
    const cards: number[] = []
    const deck = this.config.deck

    if (deck.card1) cards.push(1)
    if (deck.card2) cards.push(2)
    if (deck.card3) cards.push(3)
    if (deck.card4) cards.push(4)
    if (deck.card5) cards.push(5)
    if (deck.card6) cards.push(6)
    if (deck.card7) cards.push(7)
    if (deck.card8) cards.push(8)
    if (deck.card9) cards.push(9)
    if (deck.card10) cards.push(10)

    return cards
  }

  /**
   * Calculate theoretical expectation E[X]
   */
  private calculateTheoreticalExpectation(): number {
    const cards = this.getAvailableCards()

    if (cards.length === 0) return 5.5 // Default to all cards

    const sum = cards.reduce((acc, card) => acc + card, 0)
    return sum / cards.length
  }

  /**
   * Calculate theoretical variance Var(X) = E[(X - E[X])²]
   */
  private calculateTheoreticalVariance(expectation: number): number {
    const cards = this.getAvailableCards()

    if (cards.length === 0) {
      // Default to all cards (1-10)
      const allCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const defaultExpectation = 5.5
      const sumSquaredDiffs = allCards.reduce(
        (acc, card) => acc + Math.pow(card - defaultExpectation, 2),
        0
      )
      return sumSquaredDiffs / allCards.length
    }

    const sumSquaredDiffs = cards.reduce((acc, card) => acc + Math.pow(card - expectation, 2), 0)

    return sumSquaredDiffs / cards.length
  }

  /**
   * Draw one card randomly from the available cards in the deck
   */
  drawCard(): CardDrawResult {
    const cards = this.getAvailableCards()

    if (cards.length === 0) {
      throw new Error('No cards available in the deck')
    }

    // Random card from available cards
    const randomIndex = Math.floor(Math.random() * cards.length)
    const cardValue = cards[randomIndex]

    // Update state
    this.state.totalDraws++
    this.state.cardCounts[cardValue]++

    const drawResult: CardDrawResult = {
      value: cardValue,
      drawNumber: this.state.totalDraws,
    }

    this.state.draws.push(drawResult)

    // Calculate squared difference from expectation
    const diff = cardValue - this.state.theoreticalExpectation
    const squaredDiff = diff * diff
    this.state.squaredDifferences.push(squaredDiff)

    // Update running variance (average of squared differences)
    const sumSquaredDiffs = this.state.squaredDifferences.reduce((a, b) => a + b, 0)
    this.state.runningVariance = sumSquaredDiffs / this.state.totalDraws

    return drawResult
  }

  /**
   * Draw multiple cards
   */
  drawMultiple(count: number): CardDrawResult[] {
    const results: CardDrawResult[] = []
    for (let i = 0; i < count; i++) {
      results.push(this.drawCard())
    }
    return results
  }

  /**
   * Update the deck configuration
   */
  setDeck(deck: CardDeck): void {
    this.config.deck = deck
    this.reset()
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Get current state
   */
  getState(): VarianceState {
    return { ...this.state }
  }

  /**
   * Get statistics for display
   */
  getStats() {
    const cards = this.getAvailableCards()

    return {
      totalDraws: this.state.totalDraws,
      runningVariance: this.state.runningVariance,
      theoreticalVariance: this.state.theoreticalVariance,
      theoreticalExpectation: this.state.theoreticalExpectation,
      availableCards: cards.length,
      cardCounts: { ...this.state.cardCounts },
      observedProbabilities: this.getObservedProbabilities(),
      theoreticalProbabilities: this.getTheoreticalProbabilities(),
    }
  }

  /**
   * Get observed probabilities based on actual draws
   */
  private getObservedProbabilities(): Record<number, number> {
    const probs: Record<number, number> = {}

    if (this.state.totalDraws === 0) {
      for (let i = 1; i <= 10; i++) {
        probs[i] = 0
      }
      return probs
    }

    for (let i = 1; i <= 10; i++) {
      probs[i] = this.state.cardCounts[i] / this.state.totalDraws
    }

    return probs
  }

  /**
   * Get theoretical probabilities (uniform for available cards)
   */
  private getTheoreticalProbabilities(): Record<number, number> {
    const probs: Record<number, number> = {}
    const cards = this.getAvailableCards()
    const prob = cards.length > 0 ? 1 / cards.length : 0

    for (let i = 1; i <= 10; i++) {
      probs[i] = this.config.deck[`card${i}` as keyof CardDeck] ? prob : 0
    }

    return probs
  }
}
