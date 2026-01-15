/**
 * Expectation Engine
 * Handles dice rolling simulations and expected value calculations
 */

export interface DiceRollResult {
  value: number // 1-6
  rollNumber: number
}

export interface DiceDistribution {
  face1: number
  face2: number
  face3: number
  face4: number
  face5: number
  face6: number
}

export interface ExpectationState {
  rolls: DiceRollResult[]
  faceCounts: Record<number, number> // Count of each face (1-6)
  totalRolls: number
  runningMean: number
  distribution: DiceDistribution
  theoreticalExpectation: number
}

export interface ExpectationConfig {
  distribution: DiceDistribution
}

export class ExpectationEngine {
  private config: ExpectationConfig
  private state: ExpectationState

  constructor(config: ExpectationConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): ExpectationState {
    return {
      rolls: [],
      faceCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      totalRolls: 0,
      runningMean: 0,
      distribution: { ...this.config.distribution },
      theoreticalExpectation: this.calculateTheoreticalExpectation(),
    }
  }

  /**
   * Calculate theoretical expectation E[X] = Σ(x * P(x))
   */
  private calculateTheoreticalExpectation(): number {
    const dist = this.config.distribution
    const total = dist.face1 + dist.face2 + dist.face3 + dist.face4 + dist.face5 + dist.face6

    if (total === 0) return 3.5 // Default to fair die

    const expectation =
      (1 * dist.face1 +
        2 * dist.face2 +
        3 * dist.face3 +
        4 * dist.face4 +
        5 * dist.face5 +
        6 * dist.face6) /
      total

    return expectation
  }

  /**
   * Get probability of each face
   */
  private getProbabilities(): Record<number, number> {
    const dist = this.config.distribution
    const total = dist.face1 + dist.face2 + dist.face3 + dist.face4 + dist.face5 + dist.face6

    if (total === 0) {
      return { 1: 1 / 6, 2: 1 / 6, 3: 1 / 6, 4: 1 / 6, 5: 1 / 6, 6: 1 / 6 }
    }

    return {
      1: dist.face1 / total,
      2: dist.face2 / total,
      3: dist.face3 / total,
      4: dist.face4 / total,
      5: dist.face5 / total,
      6: dist.face6 / total,
    }
  }

  /**
   * Roll the die once based on the current distribution
   */
  rollOnce(): DiceRollResult {
    const probabilities = this.getProbabilities()
    const random = Math.random()

    let cumulative = 0
    let face = 1

    for (let i = 1; i <= 6; i++) {
      cumulative += probabilities[i]
      if (random <= cumulative) {
        face = i
        break
      }
    }

    const roll: DiceRollResult = {
      value: face,
      rollNumber: this.state.totalRolls + 1,
    }

    this.state.rolls.push(roll)
    this.state.faceCounts[face]++
    this.state.totalRolls++

    // Update running mean
    const sum = this.state.rolls.reduce((acc, r) => acc + r.value, 0)
    this.state.runningMean = sum / this.state.totalRolls

    return roll
  }

  /**
   * Roll the die multiple times
   */
  rollMultiple(count: number): DiceRollResult[] {
    const results: DiceRollResult[] = []
    for (let i = 0; i < count; i++) {
      results.push(this.rollOnce())
    }
    return results
  }

  /**
   * Update the dice distribution (make it biased)
   */
  setDistribution(distribution: DiceDistribution): void {
    this.config.distribution = { ...distribution }
    this.state.distribution = { ...distribution }
    this.state.theoreticalExpectation = this.calculateTheoreticalExpectation()
  }

  /**
   * Reset to fair die
   */
  resetToFairDie(): void {
    this.setDistribution({
      face1: 1,
      face2: 1,
      face3: 1,
      face4: 1,
      face5: 1,
      face6: 1,
    })
  }

  /**
   * Get current state
   */
  getState(): ExpectationState {
    return { ...this.state }
  }

  /**
   * Get statistics
   */
  getStats() {
    const probabilities = this.getProbabilities()

    return {
      totalRolls: this.state.totalRolls,
      runningMean: this.state.runningMean,
      theoreticalExpectation: this.state.theoreticalExpectation,
      deviation: Math.abs(this.state.runningMean - this.state.theoreticalExpectation),
      faceCounts: { ...this.state.faceCounts },
      observedProbabilities: {
        1: this.state.totalRolls > 0 ? this.state.faceCounts[1] / this.state.totalRolls : 0,
        2: this.state.totalRolls > 0 ? this.state.faceCounts[2] / this.state.totalRolls : 0,
        3: this.state.totalRolls > 0 ? this.state.faceCounts[3] / this.state.totalRolls : 0,
        4: this.state.totalRolls > 0 ? this.state.faceCounts[4] / this.state.totalRolls : 0,
        5: this.state.totalRolls > 0 ? this.state.faceCounts[5] / this.state.totalRolls : 0,
        6: this.state.totalRolls > 0 ? this.state.faceCounts[6] / this.state.totalRolls : 0,
      },
      theoreticalProbabilities: probabilities,
    }
  }

  /**
   * Clear all rolls but keep the distribution
   */
  clearRolls(): void {
    this.state.rolls = []
    this.state.faceCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    this.state.totalRolls = 0
    this.state.runningMean = 0
  }

  /**
   * Reset everything
   */
  reset(): void {
    this.state = this.initializeState()
  }
}
