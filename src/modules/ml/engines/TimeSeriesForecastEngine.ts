import type {
  TimeSeriesCleanConfig,
  TimeSeriesDataset,
  TimeSeriesEngineState,
  TimeSeriesForecastMetrics,
  TimeSeriesForecastModelId,
  TimeSeriesForecastResult,
  TimeSeriesPoint,
} from '../types'

type NumericPoint = TimeSeriesPoint & { value: number }

interface ForecastRun {
  predictions: number[]
  fitted: Array<number | null>
  notes: string[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function std(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)))
}

function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const position = (sorted.length - 1) * q
  const lower = Math.floor(position)
  const upper = Math.ceil(position)

  if (lower === upper) return sorted[lower]

  const weight = position - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

function fillMissingValues(
  points: TimeSeriesPoint[],
  strategy: TimeSeriesCleanConfig['missingValueStrategy']
) {
  const filled = points.map((point) => ({ ...point }))
  const notes: string[] = []

  if (strategy === 'drop') {
    const removedCount = filled.filter((point) => point.value == null).length
    if (removedCount > 0)
      notes.push(`Dropped ${removedCount} missing observations before modeling.`)
    return { points: filled.filter((point) => point.value != null), notes }
  }

  if (strategy === 'forward-fill') {
    let lastValue: number | null = null
    for (const point of filled) {
      if (point.value == null && lastValue != null) {
        point.value = lastValue
      } else if (point.value != null) {
        lastValue = point.value
      }
    }
    for (let index = filled.length - 1; index >= 0; index--) {
      if (
        filled[index].value == null &&
        index + 1 < filled.length &&
        filled[index + 1].value != null
      ) {
        filled[index].value = filled[index + 1].value
      }
    }
    notes.push('Missing values were filled using forward-fill with edge backfill.')
    return { points: filled.filter((point) => point.value != null), notes }
  }

  const values = filled.map((point) => point.value)
  let gapCount = 0

  for (let index = 0; index < values.length; index++) {
    if (values[index] != null) continue
    gapCount += 1

    let left = index - 1
    while (left >= 0 && values[left] == null) left -= 1

    let right = index + 1
    while (right < values.length && values[right] == null) right += 1

    if (left >= 0 && right < values.length && values[left] != null && values[right] != null) {
      const span = right - left
      const ratio = (index - left) / span
      values[index] = values[left]! + (values[right]! - values[left]!) * ratio
    } else if (left >= 0 && values[left] != null) {
      values[index] = values[left]
    } else if (right < values.length && values[right] != null) {
      values[index] = values[right]
    }
  }

  const result = filled.map((point, index) => ({ ...point, value: values[index] }))
  if (gapCount > 0)
    notes.push(`Interpolated ${gapCount} missing observations with linear interpolation.`)
  return { points: result.filter((point) => point.value != null), notes }
}

function clipOutliers(points: NumericPoint[], clipPercent: number) {
  if (clipPercent <= 0) {
    return { points, notes: [] as string[] }
  }

  const ratio = clamp(clipPercent / 100, 0, 0.2)
  const values = points.map((point) => point.value)
  const lower = quantile(values, ratio)
  const upper = quantile(values, 1 - ratio)
  let changed = 0

  const clipped = points.map((point) => {
    const nextValue = clamp(point.value, lower, upper)
    if (nextValue !== point.value) changed += 1
    return { ...point, value: nextValue }
  })

  const notes =
    changed > 0
      ? [
          `Clipped ${changed} outliers between the ${clipPercent}th and ${100 - clipPercent}th percentiles.`,
        ]
      : ([] as string[])

  return { points: clipped, notes }
}

function rollingMean(values: number[], window: number, centered: boolean): Array<number | null> {
  const safeWindow = clamp(Math.round(window), 1, Math.max(1, values.length))
  const result: Array<number | null> = Array(values.length).fill(null)

  for (let index = 0; index < values.length; index++) {
    const start = centered ? index - Math.floor(safeWindow / 2) : index - safeWindow + 1
    const end = centered ? start + safeWindow - 1 : index

    if (start < 0 || end >= values.length) continue
    result[index] = mean(values.slice(start, end + 1))
  }

  return result
}

function buildSeasonalProfile(
  values: number[],
  trend: Array<number | null>,
  seasonalPeriod: number
): number[] {
  const safePeriod = Math.max(1, seasonalPeriod)
  const buckets: number[][] = Array.from({ length: safePeriod }, () => [])

  values.forEach((value, index) => {
    const trendValue = trend[index]
    if (trendValue == null) return
    buckets[index % safePeriod].push(value - trendValue)
  })

  const profile = buckets.map((bucket) => (bucket.length > 0 ? mean(bucket) : 0))
  const profileMean = mean(profile)
  return profile.map((value) => value - profileMean)
}

function toMetrics(actual: number[], predicted: number[]): TimeSeriesForecastMetrics {
  const pairs = actual.map((value, index) => ({ actual: value, predicted: predicted[index] }))
  const mae = mean(pairs.map((pair) => Math.abs(pair.actual - pair.predicted)))
  const rmse = Math.sqrt(mean(pairs.map((pair) => (pair.actual - pair.predicted) ** 2)))
  const nonZeroPairs = pairs.filter((pair) => pair.actual !== 0)
  const mape =
    nonZeroPairs.length === 0
      ? 0
      : mean(nonZeroPairs.map((pair) => Math.abs((pair.actual - pair.predicted) / pair.actual))) *
        100

  return { mae, rmse, mape }
}

function buildBands(
  predictions: number[],
  residualStd: number
): { lowerBand: Array<number | null>; upperBand: Array<number | null> } {
  return {
    lowerBand: predictions.map(
      (prediction, index) => prediction - 1.96 * residualStd * Math.sqrt(index + 1)
    ),
    upperBand: predictions.map(
      (prediction, index) => prediction + 1.96 * residualStd * Math.sqrt(index + 1)
    ),
  }
}

function fitMeanModel(trainValues: number[], horizon: number): ForecastRun {
  const avg = mean(trainValues)
  return {
    predictions: Array(horizon).fill(avg),
    fitted: trainValues.map(() => avg),
    notes: ['Mean forecasting creates a flat baseline anchored to the training average.'],
  }
}

function fitNaiveModel(trainValues: number[], horizon: number): ForecastRun {
  const lastValue = trainValues.at(-1) ?? 0
  return {
    predictions: Array(horizon).fill(lastValue),
    fitted: trainValues.map((value, index) => (index === 0 ? value : trainValues[index - 1])),
    notes: ['Naive forecasting repeats the most recent observation across the holdout window.'],
  }
}

function fitSeasonalNaiveModel(
  trainValues: number[],
  horizon: number,
  seasonalPeriod: number
): ForecastRun {
  const notes: string[] = []
  const safePeriod = clamp(seasonalPeriod, 1, trainValues.length)

  if (trainValues.length < safePeriod * 2) {
    notes.push(
      'Seasonal naive fell back to naive behavior because there were not enough full seasons.'
    )
    return fitNaiveModel(trainValues, horizon)
  }

  const predictions = Array.from({ length: horizon }, (_, index) => {
    const sourceIndex = trainValues.length - safePeriod + (index % safePeriod)
    return trainValues[sourceIndex]
  })

  const fitted = trainValues.map((value, index) => {
    if (index < safePeriod) return value
    return trainValues[index - safePeriod]
  })

  notes.push('Seasonal naive repeats the last observed value from the matching seasonal position.')
  return { predictions, fitted, notes }
}

function fitMovingAverageModel(
  trainValues: number[],
  horizon: number,
  rollingWindow: number
): ForecastRun {
  const safeWindow = clamp(rollingWindow, 1, Math.max(1, Math.min(trainValues.length, 24)))
  const history = [...trainValues]
  const fitted = trainValues.map((value, index) => {
    if (index === 0) return value
    const start = Math.max(0, index - safeWindow)
    return mean(trainValues.slice(start, index))
  })

  const predictions: number[] = []
  for (let step = 0; step < horizon; step++) {
    const nextValue = mean(history.slice(-safeWindow))
    predictions.push(nextValue)
    history.push(nextValue)
  }

  return {
    predictions,
    fitted,
    notes: [
      `Moving average uses the most recent ${safeWindow} observations and gradually smooths volatility.`,
    ],
  }
}

function fitSimpleExponentialSmoothing(
  trainValues: number[],
  horizon: number,
  alpha: number
): ForecastRun {
  let level = trainValues[0] ?? 0
  const fitted = trainValues.map((value, index) => {
    if (index === 0) return value
    const fittedValue = level
    level = alpha * value + (1 - alpha) * level
    return fittedValue
  })

  return {
    predictions: Array(horizon).fill(level),
    fitted,
    notes: [
      'Simple exponential smoothing updates a single level estimate with exponentially decaying memory.',
    ],
  }
}

function fitHoltLinear(
  trainValues: number[],
  horizon: number,
  alpha: number,
  beta: number
): ForecastRun {
  let level = trainValues[0] ?? 0
  let trend = (trainValues[1] ?? trainValues[0] ?? 0) - (trainValues[0] ?? 0)
  const fitted = trainValues.map((value, index) => {
    if (index === 0) return value
    const previousLevel = level
    const previousTrend = trend
    const fittedValue = previousLevel + previousTrend

    level = alpha * value + (1 - alpha) * (previousLevel + previousTrend)
    trend = beta * (level - previousLevel) + (1 - beta) * previousTrend
    return fittedValue
  })

  const predictions = Array.from({ length: horizon }, (_, index) => level + (index + 1) * trend)
  return {
    predictions,
    fitted,
    notes: ['Holt linear smoothing tracks both the current level and a persistent additive trend.'],
  }
}

function fitHoltWintersAdditive(
  trainValues: number[],
  horizon: number,
  seasonalPeriod: number,
  alpha: number,
  beta: number,
  gamma: number
): ForecastRun {
  const notes: string[] = []
  const safePeriod = clamp(seasonalPeriod, 2, Math.max(2, Math.min(trainValues.length, 24)))

  if (trainValues.length < safePeriod * 2) {
    notes.push(
      'Holt-Winters fell back to Holt linear because the training data did not contain two full seasons.'
    )
    const fallback = fitHoltLinear(trainValues, horizon, alpha, beta)
    return { ...fallback, notes: [...fallback.notes, ...notes] }
  }

  const firstSeason = trainValues.slice(0, safePeriod)
  const secondSeason = trainValues.slice(safePeriod, safePeriod * 2)
  let level = mean(firstSeason)
  let trend = (mean(secondSeason) - mean(firstSeason)) / safePeriod
  const seasonals = firstSeason.map((value) => value - level)
  const fitted: Array<number | null> = Array(trainValues.length).fill(null)

  for (let index = 0; index < trainValues.length; index++) {
    const value = trainValues[index]
    const seasonIndex = index % safePeriod
    const season = seasonals[seasonIndex] ?? 0

    if (index < safePeriod) {
      fitted[index] = value
      continue
    }

    const previousLevel = level
    const previousTrend = trend
    fitted[index] = previousLevel + previousTrend + season

    level = alpha * (value - season) + (1 - alpha) * (previousLevel + previousTrend)
    trend = beta * (level - previousLevel) + (1 - beta) * previousTrend
    seasonals[seasonIndex] = gamma * (value - level) + (1 - gamma) * season
  }

  const predictions = Array.from({ length: horizon }, (_, index) => {
    const seasonIndex = (trainValues.length + index) % safePeriod
    return level + (index + 1) * trend + (seasonals[seasonIndex] ?? 0)
  })

  notes.push(
    'Holt-Winters additive captures level, trend, and a repeating additive seasonal profile.'
  )
  return { predictions, fitted, notes }
}

function runForecastModel(
  modelId: TimeSeriesForecastModelId,
  trainValues: number[],
  horizon: number,
  config: TimeSeriesCleanConfig
): ForecastRun {
  switch (modelId) {
    case 'mean':
      return fitMeanModel(trainValues, horizon)
    case 'naive':
      return fitNaiveModel(trainValues, horizon)
    case 'seasonal-naive':
      return fitSeasonalNaiveModel(trainValues, horizon, config.seasonalPeriod)
    case 'moving-average':
      return fitMovingAverageModel(trainValues, horizon, config.rollingWindow)
    case 'simple-exponential-smoothing':
      return fitSimpleExponentialSmoothing(trainValues, horizon, config.alpha)
    case 'holt-linear':
      return fitHoltLinear(trainValues, horizon, config.alpha, config.beta)
    case 'holt-winters-additive':
      return fitHoltWintersAdditive(
        trainValues,
        horizon,
        config.seasonalPeriod,
        config.alpha,
        config.beta,
        config.gamma
      )
    default:
      return fitNaiveModel(trainValues, horizon)
  }
}

export class TimeSeriesForecastEngine {
  private readonly dataset: TimeSeriesDataset
  private readonly config: TimeSeriesEngineState['config']

  constructor(
    dataset: TimeSeriesDataset,
    config: TimeSeriesCleanConfig & { modelId: TimeSeriesForecastModelId }
  ) {
    this.dataset = dataset
    this.config = config
  }

  getState(): TimeSeriesEngineState {
    const notes: string[] = []
    const filled = fillMissingValues(this.dataset.points, this.config.missingValueStrategy)
    notes.push(...filled.notes)

    const numericPoints = filled.points
      .filter((point): point is NumericPoint => typeof point.value === 'number')
      .map((point) => ({ ...point, value: Number(point.value) }))

    const clipped = clipOutliers(numericPoints, this.config.outlierClipPercent)
    notes.push(...clipped.notes)

    const cleanedSeries = clipped.points
    const values = cleanedSeries.map((point) => point.value)

    if (cleanedSeries.length === 0) {
      notes.push(
        'No usable numeric observations remained after preprocessing, so the source dataset is returned without a forecast.'
      )
      return {
        sourceSeries: this.dataset.points,
        cleanedSeries: [],
        trainSeries: [],
        testSeries: [],
        trendSeries: [],
        seasonalSeries: [],
        residualSeries: [],
        forecast: {
          modelId: this.config.modelId,
          predictions: [],
          fitted: [],
          lowerBand: [],
          upperBand: [],
          metrics: { mae: 0, rmse: 0, mape: 0 },
          notes: ['Add at least one numeric observation to run a forecast.'],
        },
        config: this.config,
        notes,
      }
    }

    if (cleanedSeries.length < 4) {
      const fallbackTrain = cleanedSeries.slice(0, Math.max(1, cleanedSeries.length - 1))
      const fallbackTest = cleanedSeries.slice(fallbackTrain.length)
      const fallbackValue = fallbackTrain.at(-1)?.value ?? cleanedSeries.at(-1)?.value ?? 0
      const fallbackActual = fallbackTest[0]?.value ?? fallbackValue
      const metrics = toMetrics([fallbackActual], [fallbackValue])

      notes.push(
        'Very short series detected, so the engine fell back to a one-step naive forecast.'
      )

      return {
        sourceSeries: this.dataset.points,
        cleanedSeries,
        trainSeries: fallbackTrain,
        testSeries:
          fallbackTest.length > 0
            ? fallbackTest
            : [{ ...cleanedSeries.at(-1)!, value: fallbackActual }],
        trendSeries: Array(cleanedSeries.length).fill(null),
        seasonalSeries: Array(cleanedSeries.length).fill(0),
        residualSeries: Array(cleanedSeries.length).fill(null),
        forecast: {
          modelId: this.config.modelId,
          predictions: [fallbackValue],
          fitted: fallbackTrain.map((point) => point.value),
          lowerBand: [fallbackValue],
          upperBand: [fallbackValue],
          metrics,
          notes: ['Very short inputs are evaluated with a one-step naive fallback.'],
        },
        config: this.config,
        notes,
      }
    }

    const minTrainSize = Math.max(
      this.config.seasonalPeriod * 2,
      this.dataset.frequency === 'monthly' ? 24 : 28
    )
    const maxHorizon = Math.max(1, cleanedSeries.length - minTrainSize)
    const horizon = clamp(this.config.forecastHorizon, 1, maxHorizon)

    if (horizon !== this.config.forecastHorizon) {
      notes.push(`Forecast horizon was adjusted to ${horizon} to preserve enough training history.`)
    }

    const splitIndex = cleanedSeries.length - horizon
    const trainSeries = cleanedSeries.slice(0, splitIndex)
    const testSeries = cleanedSeries.slice(splitIndex)
    const trainValues = trainSeries.map((point) => point.value)
    const actualValues = testSeries.map((point) => point.value)

    const trendSeries = rollingMean(values, this.config.rollingWindow, true)
    const seasonalProfile = buildSeasonalProfile(values, trendSeries, this.config.seasonalPeriod)
    const seasonalSeries = values.map(
      (_, index) => seasonalProfile[index % this.config.seasonalPeriod] ?? 0
    )
    const residualSeries = values.map((value, index) => {
      const trendValue = trendSeries[index]
      if (trendValue == null) return null
      return value - trendValue - seasonalSeries[index]
    })

    const forecastRun = runForecastModel(this.config.modelId, trainValues, horizon, this.config)
    const metrics = toMetrics(actualValues, forecastRun.predictions)
    const residualStd = std(
      trainValues
        .map((value, index) => {
          const fittedValue = forecastRun.fitted[index]
          return fittedValue == null ? null : value - fittedValue
        })
        .filter((value): value is number => value != null)
    )
    const bands = buildBands(forecastRun.predictions, residualStd)

    const forecast: TimeSeriesForecastResult = {
      modelId: this.config.modelId,
      predictions: forecastRun.predictions,
      fitted: forecastRun.fitted,
      lowerBand: bands.lowerBand,
      upperBand: bands.upperBand,
      metrics,
      notes: forecastRun.notes,
    }

    return {
      sourceSeries: this.dataset.points,
      cleanedSeries,
      trainSeries,
      testSeries,
      trendSeries,
      seasonalSeries,
      residualSeries,
      forecast,
      config: this.config,
      notes: [...notes, ...forecastRun.notes],
    }
  }
}
