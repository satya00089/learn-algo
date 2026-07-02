'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FaPlay, FaPause, FaStepForward, FaFastForward, FaRedo } from 'react-icons/fa'
import { GiBookCover } from 'react-icons/gi'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { TheoryModal } from '@/components/TheoryModal'
import { ControlGroup, Tooltip, Button, ShareButton } from '@/core/controls'
import { ThemeToggle } from '@/core/theme'
import { getTimeSeriesDataset, timeSeriesDatasets } from '../data/timeSeriesDatasets'
import { TimeSeriesForecastEngine } from '../engines/TimeSeriesForecastEngine'
import type {
  TimeSeriesDataset,
  TimeSeriesEngineState,
  TimeSeriesForecastModelId,
  TimeSeriesMissingValueStrategy,
  TimeSeriesPoint,
} from '../types'

type PlotLine = {
  label: string
  values: Array<number | null>
  color: string
  width: number
  dash?: string
  opacity?: number
}

type WalkthroughStage = {
  title: string
  caption: string
  explanation: string
}

const MODEL_OPTIONS: Array<{ id: TimeSeriesForecastModelId; label: string; note: string }> = [
  { id: 'mean', label: 'Mean', note: 'A flat baseline around the training average.' },
  { id: 'naive', label: 'Naive', note: 'Repeats the latest observed value.' },
  { id: 'seasonal-naive', label: 'Seasonal Naive', note: 'Repeats the last matching season.' },
  { id: 'moving-average', label: 'Moving Average', note: 'Smooths recent history into a forecast.' },
  {
    id: 'simple-exponential-smoothing',
    label: 'SES',
    note: 'Uses an exponentially weighted level estimate.',
  },
  { id: 'holt-linear', label: 'Holt Linear', note: 'Tracks level plus additive trend.' },
  {
    id: 'holt-winters-additive',
    label: 'Holt-Winters',
    note: 'Tracks level, trend, and additive seasonality.',
  },
]

const WALKTHROUGH: WalkthroughStage[] = [
  {
    title: 'Source Signal',
    caption: 'Look at the raw timeline first.',
    explanation:
      'Time series work starts with the original signal. We want to spot gaps, spikes, drift, and whether the series feels seasonal before we trust any model.',
  },
  {
    title: 'Cleaned Signal',
    caption: 'Fill gaps and soften anomalies.',
    explanation:
      'Missing values are interpolated or dropped, then extreme points can be clipped. This stage shows the series the forecast model actually receives.',
  },
  {
    title: 'Trend View',
    caption: 'Separate slow movement from short noise.',
    explanation:
      'A centered rolling average acts like a trend line. Wider windows produce steadier trends, while shorter windows react more quickly to local variation.',
  },
  {
    title: 'Seasonality View',
    caption: 'Check repeated structure.',
    explanation:
      'After trend is estimated, the engine builds a repeating seasonal profile. This helps explain why seasonal-naive and Holt-Winters behave differently from flat baselines.',
  },
  {
    title: 'Forecast View',
    caption: 'Compare the holdout against the chosen model.',
    explanation:
      'The final stage overlays the holdout forecast, confidence guide rails, and the train/test split so you can judge whether the model captured level, trend, and seasonality well.',
  },
]

function formatMetric(value: number): string {
  if (!Number.isFinite(value)) return '--'
  return value.toFixed(value >= 100 ? 1 : 2)
}

function formatPointLabel(point: TimeSeriesPoint): string {
  return point.label || point.timestamp
}

function makeFullSeries(length: number, offset: number, values: number[]): Array<number | null> {
  const full = Array<number | null>(length).fill(null)
  values.forEach((value, index) => {
    const targetIndex = offset + index
    if (targetIndex < full.length) full[targetIndex] = value
  })
  return full
}

function buildPath(
  values: Array<number | null>,
  width: number,
  height: number,
  minValue: number,
  maxValue: number
): string {
  const safeMax = maxValue === minValue ? maxValue + 1 : maxValue
  const xStep = values.length <= 1 ? width : width / (values.length - 1)
  let path = ''
  let segmentOpen = false

  values.forEach((value, index) => {
    if (value == null) {
      segmentOpen = false
      return
    }
    const x = index * xStep
    const ratio = (value - minValue) / (safeMax - minValue)
    const y = height - ratio * height
    path += segmentOpen ? ` L ${x.toFixed(2)} ${y.toFixed(2)}` : ` M ${x.toFixed(2)} ${y.toFixed(2)}`
    segmentOpen = true
  })

  return path.trim()
}

function parseCustomSeriesInput(
  input: string,
  frequency: TimeSeriesDataset['frequency']
): { dataset: TimeSeriesDataset; notes: string[] } {
  const rows = input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const notes: string[] = []
  const points: TimeSeriesPoint[] = []
  let skipped = 0

  rows.forEach((row) => {
    const [dateToken, valueToken, tagToken] = row.split(',').map((cell) => cell.trim())
    const parsedDate = new Date(dateToken)
    if (Number.isNaN(parsedDate.getTime())) {
      skipped += 1
      return
    }

    const parsedValue =
      !valueToken || valueToken.toLowerCase() === 'null' ? null : Number(valueToken)

    if (parsedValue != null && Number.isNaN(parsedValue)) {
      skipped += 1
      return
    }

    const weekday = parsedDate.getUTCDay()
    const normalizedTag = (tagToken || '').toLowerCase()
    points.push({
      timestamp: parsedDate.toISOString().split('T')[0],
      value: parsedValue,
      label:
        frequency === 'monthly'
          ? parsedDate.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
          : parsedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
            }),
      isHoliday: normalizedTag.includes('holiday'),
      isWeekend: frequency === 'daily' ? weekday === 0 || weekday === 6 : false,
    })
  })

  if (skipped > 0) notes.push(`Skipped ${skipped} malformed rows from custom input.`)
  if (points.length === 0) {
    notes.push('Custom input was empty, so the monthly sample dataset is shown instead.')
    return { dataset: getTimeSeriesDataset('monthly-sales'), notes }
  }

  points.sort((left, right) => left.timestamp.localeCompare(right.timestamp))

  return {
    dataset: {
      id: 'custom-series',
      name: 'Custom Series',
      description: 'User-provided series pasted directly into the playground.',
      frequency,
      defaultSeasonLength: frequency === 'monthly' ? 12 : 7,
      points,
    },
    notes,
  }
}

function ForecastChart({
  title,
  subtitle,
  labels,
  lines,
  splitIndex,
  markers,
}: {
  title: string
  subtitle: string
  labels: string[]
  lines: PlotLine[]
  splitIndex?: number
  markers?: Array<{ index: number; color: string; title: string }>
}) {
  const width = 1120
  const height = 420
  const numericValues = lines.flatMap((line) => line.values.filter((value): value is number => value != null))
  const minValue = numericValues.length > 0 ? Math.min(...numericValues) : 0
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 1
  const xStep = labels.length <= 1 ? width : width / (labels.length - 1)

  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 overflow-hidden relative">
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-gray-600 dark:text-gray-400">
            {lines.map((line) => (
              <span key={line.label} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                {line.label}
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = height - tick * height
              const label = minValue + (maxValue - minValue) * tick
              return (
                <g key={tick}>
                  <line x1="0" x2={width} y1={y} y2={y} stroke="rgba(148,163,184,0.18)" />
                  <text x="0" y={Math.max(12, y - 6)} fontSize="11" fill="#94a3b8">
                    {label.toFixed(0)}
                  </text>
                </g>
              )
            })}

            {splitIndex != null && splitIndex > 0 && splitIndex < labels.length && (
              <g>
                <line
                  x1={splitIndex * xStep}
                  x2={splitIndex * xStep}
                  y1="0"
                  y2={height}
                  stroke="#f97316"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />
                <text x={splitIndex * xStep + 6} y="16" fontSize="11" fill="#fb923c">
                  holdout
                </text>
              </g>
            )}

            {markers?.map((marker) => (
              <circle
                key={`${marker.index}-${marker.title}`}
                cx={marker.index * xStep}
                cy={height - 10}
                r="3"
                fill={marker.color}
              >
                <title>{marker.title}</title>
              </circle>
            ))}

            {lines.map((line) => (
              <path
                key={line.label}
                d={buildPath(line.values, width, height, minValue, maxValue)}
                fill="none"
                stroke={line.color}
                strokeWidth={line.width}
                strokeDasharray={line.dash}
                opacity={line.opacity ?? 1}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      </div>
    </div>
  )
}

export function TimeSeriesForecastingPlayground() {
  const [showExplanation, setShowExplanation] = useState(
    process.env.NEXT_PUBLIC_SHOW_THEORY_MODAL_BY_DEFAULT === 'true'
  )
  const [datasetId, setDatasetId] = useState('monthly-sales')
  const [useCustomInput, setUseCustomInput] = useState(false)
  const [customFrequency, setCustomFrequency] = useState<TimeSeriesDataset['frequency']>('monthly')
  const [customInput, setCustomInput] = useState(
    [
      '2024-01-01,1200',
      '2024-02-01,1310',
      '2024-03-01,1280',
      '2024-04-01,1425',
      '2024-05-01,1500',
      '2024-06-01,',
      '2024-07-01,1710',
      '2024-08-01,1880',
    ].join('\n')
  )
  const [modelId, setModelId] = useState<TimeSeriesForecastModelId>('holt-winters-additive')
  const [missingValueStrategy, setMissingValueStrategy] =
    useState<TimeSeriesMissingValueStrategy>('linear-interpolate')
  const [outlierClipPercent, setOutlierClipPercent] = useState(2)
  const [rollingWindow, setRollingWindow] = useState(12)
  const [seasonalPeriod, setSeasonalPeriod] = useState(12)
  const [forecastHorizon, setForecastHorizon] = useState(12)
  const [alpha, setAlpha] = useState(0.35)
  const [beta, setBeta] = useState(0.2)
  const [gamma, setGamma] = useState(0.25)
  const [showConfidenceBands, setShowConfidenceBands] = useState(true)
  const [showCustomPanel, setShowCustomPanel] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(700)
  const playIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const selectedDataset = useMemo(() => getTimeSeriesDataset(datasetId), [datasetId])

  const datasetResult = useMemo(() => {
    if (!useCustomInput) return { dataset: selectedDataset, notes: [] as string[] }
    return parseCustomSeriesInput(customInput, customFrequency)
  }, [customFrequency, customInput, selectedDataset, useCustomInput])

  const engineState = useMemo<TimeSeriesEngineState>(() => {
    const engine = new TimeSeriesForecastEngine(datasetResult.dataset, {
      modelId,
      missingValueStrategy,
      outlierClipPercent,
      rollingWindow,
      seasonalPeriod,
      forecastHorizon,
      alpha,
      beta,
      gamma,
    })

    const state = engine.getState()
    return { ...state, notes: [...datasetResult.notes, ...state.notes] }
  }, [
    alpha,
    beta,
    datasetResult,
    forecastHorizon,
    gamma,
    missingValueStrategy,
    modelId,
    outlierClipPercent,
    rollingWindow,
    seasonalPeriod,
  ])

  const selectedModel = MODEL_OPTIONS.find((model) => model.id === modelId)
  const labels = engineState.cleanedSeries.map(formatPointLabel)
  const rawValues = engineState.sourceSeries.map((point) => point.value)
  const cleanedValues = engineState.cleanedSeries.map((point) => point.value)
  const seasonalDisplay = engineState.seasonalSeries
  const residualDisplay = engineState.residualSeries
  const predictionSeries = makeFullSeries(
    cleanedValues.length,
    engineState.trainSeries.length,
    engineState.forecast.predictions
  )
  const lowerBandSeries = makeFullSeries(
    cleanedValues.length,
    engineState.trainSeries.length,
    engineState.forecast.lowerBand.filter((value): value is number => value != null)
  )
  const upperBandSeries = makeFullSeries(
    cleanedValues.length,
    engineState.trainSeries.length,
    engineState.forecast.upperBand.filter((value): value is number => value != null)
  )

  const chartMarkers = engineState.cleanedSeries.flatMap((point, index) => {
    const markers: Array<{ index: number; color: string; title: string }> = []
    if (point.isHoliday) {
      markers.push({ index, color: '#ef4444', title: `${formatPointLabel(point)} holiday` })
    } else if (point.isWeekend) {
      markers.push({ index, color: '#8b5cf6', title: `${formatPointLabel(point)} weekend` })
    }
    return markers
  })

  const stageChart = useMemo(() => {
    const stage = WALKTHROUGH[currentStage]

    if (currentStage === 0) {
      return {
        title: stage.title,
        subtitle: 'Raw observations with gaps still visible.',
        lines: [{ label: 'source', values: rawValues, color: '#3b82f6', width: 2.5 }] as PlotLine[],
      }
    }

    if (currentStage === 1) {
      return {
        title: stage.title,
        subtitle: 'Cleaned series after interpolation and optional clipping.',
        lines: [{ label: 'cleaned', values: cleanedValues, color: '#3b82f6', width: 2.5 }] as PlotLine[],
      }
    }

    if (currentStage === 2) {
      return {
        title: stage.title,
        subtitle: 'Observed series plus the centered rolling trend estimate.',
        lines: [
          { label: 'cleaned', values: cleanedValues, color: '#3b82f6', width: 2.5, opacity: 0.6 },
          { label: 'trend', values: engineState.trendSeries, color: '#f97316', width: 3, dash: '8 5' },
        ] as PlotLine[],
      }
    }

    if (currentStage === 3) {
      return {
        title: stage.title,
        subtitle: 'Trend-removed seasonal profile and leftover residual movement.',
        lines: [
          { label: 'seasonal', values: seasonalDisplay, color: '#8b5cf6', width: 2.5 },
          { label: 'residual', values: residualDisplay, color: '#ef4444', width: 2, opacity: 0.8 },
        ] as PlotLine[],
      }
    }

    return {
      title: stage.title,
      subtitle: `${selectedModel?.label ?? 'Forecast'} on the holdout window.`,
      lines: [
        { label: 'cleaned', values: cleanedValues, color: '#3b82f6', width: 2.5 },
        ...(showConfidenceBands
          ? [
              { label: 'lower band', values: lowerBandSeries, color: '#fdba74', width: 1.5, dash: '4 4', opacity: 0.8 },
              { label: 'upper band', values: upperBandSeries, color: '#fdba74', width: 1.5, dash: '4 4', opacity: 0.8 },
            ]
          : []),
        { label: 'forecast', values: predictionSeries, color: '#f97316', width: 3 },
      ] as PlotLine[],
    }
  }, [
    cleanedValues,
    currentStage,
    engineState.trendSeries,
    lowerBandSeries,
    predictionSeries,
    rawValues,
    residualDisplay,
    seasonalDisplay,
    selectedModel,
    showConfidenceBands,
    upperBandSeries,
  ])

  const stopPlayback = () => {
    setIsPlaying(false)
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current)
      playIntervalRef.current = undefined
    }
  }

  const handleStep = () => {
    setCurrentStage((previous) => Math.min(previous + 1, WALKTHROUGH.length - 1))
  }

  const handleReset = () => {
    stopPlayback()
    setCurrentStage(0)
  }

  const handleRun = () => {
    stopPlayback()
    setCurrentStage(WALKTHROUGH.length - 1)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    if (currentStage >= WALKTHROUGH.length - 1) {
      setCurrentStage(0)
    }

    setIsPlaying(true)
    playIntervalRef.current = setInterval(() => {
      setCurrentStage((previous) => {
        if (previous >= WALKTHROUGH.length - 1) {
          stopPlayback()
          return previous
        }
        return previous + 1
      })
    }, animationSpeed)
  }

  useEffect(() => {
    return () => stopPlayback()
  }, [])

  const sourceMissingCount = datasetResult.dataset.points.filter((point) => point.value == null).length
  const currentWalkthrough = WALKTHROUGH[currentStage]

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Breadcrumbs />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Time-Series Forecasting
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <Button
              onClick={() => setShowExplanation(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <GiBookCover className="w-4 h-4" />
              How It Works
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
          Forecasting: clean a real-world signal, inspect trend and seasonality, then compare
          classical models against a holdout window.
        </p>

        <div className="flex-1 grid lg:grid-cols-4 gap-3 overflow-hidden">
          <div className="lg:col-span-3 flex flex-col space-y-3 min-h-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <Tooltip text={isPlaying ? 'Pause' : 'Play Walkthrough'}>
                    <button
                      onClick={handlePlayPause}
                      className="w-8 h-8 flex items-center justify-center rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                    </button>
                  </Tooltip>
                  <Tooltip text="Step Forward">
                    <button
                      onClick={handleStep}
                      disabled={isPlaying || currentStage >= WALKTHROUGH.length - 1}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaStepForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Jump to Forecast">
                    <button
                      onClick={handleRun}
                      disabled={currentStage >= WALKTHROUGH.length - 1}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaFastForward size={12} />
                    </button>
                  </Tooltip>
                  <Tooltip text="Reset Walkthrough">
                    <button
                      onClick={handleReset}
                      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <FaRedo size={12} />
                    </button>
                  </Tooltip>
                </div>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Speed:</span>
                  <input
                    type="number"
                    value={animationSpeed}
                    min={250}
                    max={3000}
                    step={100}
                    onChange={(event) => setAnimationSpeed(Number.parseInt(event.target.value) || 700)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">ms/stage</span>
                </div>

                <div className="ml-auto flex items-center gap-4 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    Stage:{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {currentStage + 1} / {WALKTHROUGH.length}
                    </span>
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    Model:{' '}
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {selectedModel?.label}
                    </span>
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    MAPE:{' '}
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatMetric(engineState.forecast.metrics.mape)}%
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <ForecastChart
              title={stageChart.title}
              subtitle={stageChart.subtitle}
              labels={labels}
              lines={stageChart.lines}
              splitIndex={currentStage >= 4 ? engineState.trainSeries.length : undefined}
              markers={currentStage === 0 || currentStage === 1 || currentStage === 4 ? chartMarkers : undefined}
            />

          </div>

          <div className="space-y-3 overflow-y-auto min-h-0 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
            <ControlGroup title="Datasets">
              <div className="grid grid-cols-2 gap-2">
                {timeSeriesDatasets.map((dataset) => (
                  <button
                    key={dataset.id}
                    onClick={() => {
                      setUseCustomInput(false)
                      setShowCustomPanel(false)
                      setDatasetId(dataset.id)
                      setSeasonalPeriod(dataset.defaultSeasonLength)
                      setRollingWindow(dataset.defaultSeasonLength)
                      setForecastHorizon(dataset.frequency === 'monthly' ? 12 : 14)
                      setCurrentStage(0)
                    }}
                    className={`w-full px-3 py-1.5 text-xs rounded transition-colors ${
                      !useCustomInput && datasetId === dataset.id
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'font-semibold bg-orange-100 text-orange-700 border border-orange-700'
                    }`}
                  >
                    {dataset.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setUseCustomInput(!useCustomInput)
                  setShowCustomPanel(!showCustomPanel)
                  setSeasonalPeriod(customFrequency === 'monthly' ? 12 : 7)
                  setRollingWindow(customFrequency === 'monthly' ? 12 : 7)
                  setForecastHorizon(customFrequency === 'monthly' ? 6 : 10)
                  setCurrentStage(0)
                }}
                className={`w-full px-3 py-1.5 text-xs rounded transition-colors ${
                  useCustomInput
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {useCustomInput ? 'Using Custom Series' : 'Use Custom Series'}
              </button>

              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400">
                {datasetResult.dataset.description}
                <div className="mt-2 font-medium text-gray-700 dark:text-gray-300">
                  Source points: {datasetResult.dataset.points.length} | Missing values: {sourceMissingCount}
                </div>
              </div>

              {showCustomPanel && (
                <div className="space-y-2">
                  <select
                    value={customFrequency}
                    onChange={(event) => {
                      const nextFrequency = event.target.value as TimeSeriesDataset['frequency']
                      setCustomFrequency(nextFrequency)
                      setSeasonalPeriod(nextFrequency === 'monthly' ? 12 : 7)
                      setRollingWindow(nextFrequency === 'monthly' ? 12 : 7)
                      setForecastHorizon(nextFrequency === 'monthly' ? 6 : 10)
                    }}
                    className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                  </select>
                  <textarea
                    value={customInput}
                    onChange={(event) => {
                      setCustomInput(event.target.value)
                      setCurrentStage(0)
                    }}
                    className="w-full min-h-32 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-[11px] font-mono text-gray-700 dark:text-gray-200"
                  />
                </div>
              )}
            </ControlGroup>

            <ControlGroup title="Forecast Model">
              <div className="space-y-1.5">
                {MODEL_OPTIONS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setModelId(model.id)
                      setCurrentStage(4)
                    }}
                    disabled={isPlaying}
                    className={`w-full px-3 py-1.5 text-xs rounded transition-colors ${
                      modelId === model.id
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'font-semibold bg-orange-100 text-orange-700 border border-orange-700'
                    }`}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            </ControlGroup>

            <ControlGroup title="Walkthrough Focus">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <p className="font-semibold text-orange-600 dark:text-orange-400">
                  {currentWalkthrough.caption}
                </p>
                <p className="text-[10px] leading-relaxed">{currentWalkthrough.explanation}</p>
              </div>
            </ControlGroup>

            <ControlGroup title="Forecast Metrics">
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div>
                  <div className="text-[10px] uppercase">MAE</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatMetric(engineState.forecast.metrics.mae)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">RMSE</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatMetric(engineState.forecast.metrics.rmse)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase">MAPE</div>
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {formatMetric(engineState.forecast.metrics.mape)}%
                  </div>
                </div>
              </div>
            </ControlGroup>

            <ControlGroup title="Signal Controls">
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Missing values</label>
                  <select
                    value={missingValueStrategy}
                    onChange={(event) => {
                      setMissingValueStrategy(event.target.value as TimeSeriesMissingValueStrategy)
                      setCurrentStage(1)
                    }}
                    className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-700 dark:text-gray-200"
                  >
                    <option value="linear-interpolate">Linear interpolate</option>
                    <option value="forward-fill">Forward fill</option>
                    <option value="drop">Drop rows</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Outlier clipping: {outlierClipPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={outlierClipPercent}
                    onChange={(event) => {
                      setOutlierClipPercent(Number(event.target.value))
                      setCurrentStage(1)
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400">Rolling window: {rollingWindow}</label>
                  <input
                    type="range"
                    min="2"
                    max={datasetResult.dataset.frequency === 'monthly' ? 24 : 28}
                    step="1"
                    value={rollingWindow}
                    onChange={(event) => {
                      setRollingWindow(Number(event.target.value))
                      setCurrentStage(2)
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Seasonal period: {seasonalPeriod}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max={datasetResult.dataset.frequency === 'monthly' ? 18 : 14}
                    step="1"
                    value={seasonalPeriod}
                    onChange={(event) => {
                      setSeasonalPeriod(Number(event.target.value))
                      setCurrentStage(3)
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <label className="text-gray-600 dark:text-gray-400">
                    Holdout horizon: {forecastHorizon}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={datasetResult.dataset.frequency === 'monthly' ? 18 : 21}
                    step="1"
                    value={forecastHorizon}
                    onChange={(event) => {
                      setForecastHorizon(Number(event.target.value))
                      setCurrentStage(4)
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={showConfidenceBands}
                    onChange={(event) => setShowConfidenceBands(event.target.checked)}
                  />
                  Show confidence guide rails
                </label>
              </div>
            </ControlGroup>

            <ControlGroup title="Smoothing Parameters">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Alpha</label>
                  <input
                    type="number"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={alpha}
                    onChange={(event) => setAlpha(Number(event.target.value))}
                    className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Beta</label>
                  <input
                    type="number"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={beta}
                    onChange={(event) => setBeta(Number(event.target.value))}
                    className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-gray-600 dark:text-gray-400">Gamma</label>
                  <input
                    type="number"
                    min="0.05"
                    max="0.95"
                    step="0.05"
                    value={gamma}
                    onChange={(event) => setGamma(Number(event.target.value))}
                    className="w-full mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </ControlGroup>

            <ControlGroup title="Current Notes">
              <div className="space-y-2 text-[11px] text-gray-600 dark:text-gray-400">
                {engineState.notes.slice(0, 4).map((note, index) => (
                  <div
                    key={`${note}-${index}`}
                    className="rounded bg-gray-50 p-2 dark:bg-gray-900"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </ControlGroup>
          </div>
        </div>

      </div>

      <TheoryModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        theoryFile="/theory/ml/time-series-forecasting.md"
        title="Understanding Time-Series Forecasting"
      />
    </div>
  )
}
