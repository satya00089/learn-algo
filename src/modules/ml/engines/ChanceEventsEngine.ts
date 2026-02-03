/**
 * Chance Events Engine (Basic Probability)
 * Handles coin flip simulations and probability calculations
 */

export interface CoinFlipResult {
  outcome: 'heads' | 'tails'
  flipNumber: number
}

export interface ProbabilityState {
  flips: CoinFlipResult[]
  headsCount: number
  tailsCount: number
  totalFlips: number
  currentProbability: number // observed frequency
  trueProbability: number // actual coin weight (0 to 1, where 0.5 is fair)
}

export interface DebugMetrics {
  // Convergence Analysis
  absoluteDeviation: number
  relativeDeviation: number
  convergenceRate: number

  // Statistical Tests
  zScore: number
  pValue: number
  chiSquare: number
  chiSquarePValue: number

  // Variance & Distribution
  variance: number
  standardDeviation: number
  standardError: number
  confidenceInterval95: { lower: number; upper: number }

  // Streak Analysis
  currentStreak: { type: 'heads' | 'tails'; count: number }
  longestHeadsStreak: number
  longestTailsStreak: number

  // Sample Size
  requiredSampleSize: number
  isStatisticallySignificant: boolean

  // Performance
  timestamp: number
}

export interface ProbabilityConfig {
  trueProbability: number // 0 to 1, where 0.5 is fair coin
}

export class ChanceEventsEngine {
  private readonly config: ProbabilityConfig
  private state: ProbabilityState

  constructor(config: ProbabilityConfig) {
    this.config = config
    this.state = this.initializeState()
  }

  private initializeState(): ProbabilityState {
    return {
      flips: [],
      headsCount: 0,
      tailsCount: 0,
      totalFlips: 0,
      currentProbability: 0,
      trueProbability: this.config.trueProbability,
    }
  }

  /**
   * Reset the engine to initial state
   */
  reset(): void {
    this.state = this.initializeState()
  }

  /**
   * Update the true probability (coin weight)
   */
  setTrueProbability(probability: number): void {
    this.config.trueProbability = Math.max(0, Math.min(1, probability))
    this.state.trueProbability = this.config.trueProbability
  }

  /**
   * Perform a single coin flip
   */
  flipOnce(): CoinFlipResult {
    const random = Math.random()
    const outcome = random < this.config.trueProbability ? 'heads' : 'tails'

    const flip: CoinFlipResult = {
      outcome,
      flipNumber: this.state.totalFlips + 1,
    }

    this.state.flips.push(flip)
    this.state.totalFlips++

    if (outcome === 'heads') {
      this.state.headsCount++
    } else {
      this.state.tailsCount++
    }

    this.state.currentProbability =
      this.state.totalFlips > 0 ? this.state.headsCount / this.state.totalFlips : 0

    return flip
  }

  /**
   * Perform multiple coin flips
   */
  flipMultiple(count: number): CoinFlipResult[] {
    const results: CoinFlipResult[] = []
    for (let i = 0; i < count; i++) {
      results.push(this.flipOnce())
    }
    return results
  }

  /**
   * Get current state
   */
  getState(): ProbabilityState {
    return { ...this.state }
  }

  /**
   * Calculate advanced debug metrics including statistical tests and convergence analysis
   */
  getDebugMetrics(): DebugMetrics {
    const n = this.state.totalFlips
    const observed = this.state.currentProbability
    const expected = this.state.trueProbability

    if (n === 0) {
      return this.getEmptyDebugMetrics()
    }

    // Convergence Analysis
    const absoluteDeviation = Math.abs(observed - expected)
    const relativeDeviation = expected === 0 ? 0 : (absoluteDeviation / expected) * 100
    const convergenceRate = n > 1 ? absoluteDeviation / Math.sqrt(n) : absoluteDeviation

    // Statistical Tests
    // Z-score for proportion test
    const p0 = expected
    const pHat = observed
    const standardError = Math.sqrt((p0 * (1 - p0)) / n)
    const zScore = standardError === 0 ? 0 : (pHat - p0) / standardError

    // P-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)))

    // Chi-square goodness of fit test
    const expectedHeads = n * expected
    const expectedTails = n * (1 - expected)
    const chiSquare =
      Math.pow(this.state.headsCount - expectedHeads, 2) / expectedHeads +
      Math.pow(this.state.tailsCount - expectedTails, 2) / expectedTails
    const chiSquarePValue = 1 - this.chiSquareCDF(chiSquare, 1)

    // Variance & Distribution
    const variance = expected * (1 - expected)
    const standardDeviation = Math.sqrt(variance)
    const se = Math.sqrt(variance / n)

    // 95% Confidence Interval for proportion
    const z95 = 1.96
    const marginOfError = z95 * se
    const confidenceInterval95 = {
      lower: Math.max(0, observed - marginOfError),
      upper: Math.min(1, observed + marginOfError),
    }

    // Streak Analysis
    const streaks = this.calculateStreaks()

    // Required Sample Size (for 95% confidence, 5% margin of error)
    const marginOfErrorTarget = 0.05
    const requiredSampleSize = Math.ceil(
      (Math.pow(z95, 2) * expected * (1 - expected)) / Math.pow(marginOfErrorTarget, 2)
    )

    // Statistical Significance (at α = 0.05)
    const isStatisticallySignificant = pValue < 0.05

    return {
      absoluteDeviation,
      relativeDeviation,
      convergenceRate,
      zScore,
      pValue,
      chiSquare,
      chiSquarePValue,
      variance,
      standardDeviation,
      standardError: se,
      confidenceInterval95,
      currentStreak: streaks.current,
      longestHeadsStreak: streaks.longestHeads,
      longestTailsStreak: streaks.longestTails,
      requiredSampleSize,
      isStatisticallySignificant,
      timestamp: Date.now(),
    }
  }

  /**
   * Calculate streak statistics
   */
  private calculateStreaks() {
    let currentStreak = { type: 'heads' as 'heads' | 'tails', count: 0 }
    let longestHeads = 0
    let longestTails = 0
    let tempHeads = 0
    let tempTails = 0

    for (const flip of this.state.flips) {
      if (flip.outcome === 'heads') {
        tempHeads++
        tempTails = 0
        longestHeads = Math.max(longestHeads, tempHeads)
      } else {
        tempTails++
        tempHeads = 0
        longestTails = Math.max(longestTails, tempTails)
      }
    }

    if (this.state.flips.length > 0) {
      const lastOutcome = this.state.flips.at(-1)!.outcome
      currentStreak = {
        type: lastOutcome,
        count: lastOutcome === 'heads' ? tempHeads : tempTails,
      }
    }

    return {
      current: currentStreak,
      longestHeads,
      longestTails,
    }
  }

  /**
   * Normal CDF approximation (cumulative distribution function)
   */
  private normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x))
    const d = 0.3989423 * Math.exp((-x * x) / 2)
    const prob =
      d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return x > 0 ? 1 - prob : prob
  }

  /**
   * Chi-square CDF approximation (for df=1)
   */
  private chiSquareCDF(x: number, df: number): number {
    if (x <= 0) return 0
    if (df === 1) {
      return 2 * this.normalCDF(Math.sqrt(x)) - 1
    }
    return 0.5 // Simplified for df=1
  }

  /**
   * Return empty debug metrics when no flips have been made
   */
  private getEmptyDebugMetrics(): DebugMetrics {
    return {
      absoluteDeviation: 0,
      relativeDeviation: 0,
      convergenceRate: 0,
      zScore: 0,
      pValue: 1,
      chiSquare: 0,
      chiSquarePValue: 1,
      variance: 0,
      standardDeviation: 0,
      standardError: 0,
      confidenceInterval95: { lower: 0, upper: 1 },
      currentStreak: { type: 'heads', count: 0 },
      longestHeadsStreak: 0,
      longestTailsStreak: 0,
      requiredSampleSize: 0,
      isStatisticallySignificant: false,
      timestamp: Date.now(),
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      headsCount: this.state.headsCount,
      tailsCount: this.state.tailsCount,
      totalFlips: this.state.totalFlips,
      headsPercentage:
        this.state.totalFlips > 0 ? (this.state.headsCount / this.state.totalFlips) * 100 : 0,
      tailsPercentage:
        this.state.totalFlips > 0 ? (this.state.tailsCount / this.state.totalFlips) * 100 : 0,
      observedProbability: this.state.currentProbability,
      trueProbability: this.state.trueProbability,
      deviation: Math.abs(this.state.currentProbability - this.state.trueProbability),
    }
  }

  /**
   * Clear all flips but keep the configuration
   */
  clearFlips(): void {
    this.state.flips = []
    this.state.headsCount = 0
    this.state.tailsCount = 0
    this.state.totalFlips = 0
    this.state.currentProbability = 0
  }
}
