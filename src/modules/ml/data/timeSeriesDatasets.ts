import type { TimeSeriesDataset, TimeSeriesPoint } from '../types'

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function createMonthlySalesDataset(): TimeSeriesDataset {
  const points: TimeSeriesPoint[] = []

  for (let monthIndex = 0; monthIndex < 72; monthIndex++) {
    const date = new Date(Date.UTC(2018, monthIndex, 1))
    const month = date.getUTCMonth()
    const yearOffset = Math.floor(monthIndex / 12)

    const base = 6800 + yearOffset * 420
    const seasonality =
      [0, -180, 120, 280, 460, 720, 860, 810, 430, 250, 520, 1180][month] ?? 0
    const cyclic = Math.sin(monthIndex / 3) * 140 + Math.cos(monthIndex / 5) * 90

    let value = Math.round(base + seasonality + cyclic)

    if (monthIndex === 15 || monthIndex === 44) value = Math.round(value * 0.58)
    if (monthIndex === 26 || monthIndex === 61) value = Math.round(value * 1.22)

    points.push({
      timestamp: toIsoDate(date),
      value,
      label: date.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
    })
  }

  points[9].value = null
  points[37].value = null

  return {
    id: 'monthly-sales',
    name: 'Monthly Fashion Sales',
    description: 'Six years of monthly sales with trend, seasonality, a few gaps, and anomalies.',
    frequency: 'monthly',
    defaultSeasonLength: 12,
    points,
  }
}

function createDailyVisitorsDataset(): TimeSeriesDataset {
  const points: TimeSeriesPoint[] = []
  const holidayOffsets = new Set([12, 33, 61, 77, 96, 124, 137])

  for (let dayIndex = 0; dayIndex < 154; dayIndex++) {
    const date = new Date(Date.UTC(2025, 0, 1 + dayIndex))
    const weekday = date.getUTCDay()
    const isWeekend = weekday === 0 || weekday === 6
    const isHoliday = holidayOffsets.has(dayIndex)

    const base = 210 + Math.floor(dayIndex / 28) * 8
    const weeklyPattern = [18, 12, 8, 10, 25, 72, 64][weekday] ?? 0
    const pulse = Math.sin(dayIndex / 6) * 12 + Math.cos(dayIndex / 11) * 8
    const holidayBoost = isHoliday ? 44 : 0

    let value = Math.round(base + weeklyPattern + pulse + holidayBoost)

    if (dayIndex === 47 || dayIndex === 102) value = Math.round(value * 0.55)
    if (dayIndex === 89) value = Math.round(value * 1.28)

    points.push({
      timestamp: toIsoDate(date),
      value,
      label: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      isHoliday,
      isWeekend,
    })
  }

  points[18].value = null
  points[84].value = null
  points[118].value = null

  return {
    id: 'daily-visitors',
    name: 'Daily Store Visitors',
    description: 'Roughly five months of daily visitors with weekly seasonality and holiday markers.',
    frequency: 'daily',
    defaultSeasonLength: 7,
    points,
  }
}

export const timeSeriesDatasets: TimeSeriesDataset[] = [
  createMonthlySalesDataset(),
  createDailyVisitorsDataset(),
]

export function getTimeSeriesDataset(datasetId: string): TimeSeriesDataset {
  return timeSeriesDatasets.find((dataset) => dataset.id === datasetId) ?? timeSeriesDatasets[0]
}
