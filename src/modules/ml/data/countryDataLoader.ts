/**
 * Country Dataset Loader for PCA and t-SNE
 *
 * Fetches country embeddings and sprite-sheet metadata from S3.
 */

import Papa from 'papaparse'
import type { DataPoint } from '../types'
import type { TSNEPoint } from '../engines/TSNEEngine'

export interface CountryMetadata {
  cca2: string
  cca3: string
  name: string
  officialName: string
  capital: string
  region: string
  subregion: string
  latitude: number
  longitude: number
  population?: number
  areaKm2?: number
  populationDensity?: number
  gdpCurrentUsd?: number
  gdpPerCapitaUsd?: number
  incomeGroup?: string
  lifeExpectancy?: number
  urbanPopulationPct?: number
  literacyPct?: number
  languages?: string[]
  majorityReligion?: string
  religionBreakdown?: string
  foodTags?: string[]
  sourceYear?: string
  sourceName?: string
  spriteSheetUrl: string
  spriteX: number
  spriteY: number
  spriteW: number
  spriteH: number
  spriteManifestUrl: string
}

export interface CountryDataPoint extends DataPoint {
  metadata?: CountryMetadata
}

export interface CountriesDataset {
  points: CountryDataPoint[]
  metadata: CountryMetadata[]
  numFeatures: number
  featureNames: string[]
}

let cachedDataset: CountriesDataset | null = null
let loadingPromise: Promise<CountriesDataset> | null = null

export async function loadCountriesDataset(): Promise<CountriesDataset> {
  if (cachedDataset) return cachedDataset
  if (loadingPromise) return loadingPromise

  loadingPromise = fetchAndParseCountriesDataset()

  try {
    const dataset = await loadingPromise
    cachedDataset = dataset
    return dataset
  } finally {
    loadingPromise = null
  }
}

async function fetchAndParseCountriesDataset(): Promise<CountriesDataset> {
  const csvUrl = process.env.NEXT_PUBLIC_COUNTRIES_EMBEDDINGS_URL

  if (!csvUrl) {
    throw new Error(
      'NEXT_PUBLIC_COUNTRIES_EMBEDDINGS_URL environment variable is not set. ' +
        'Please configure your .env.local file with the countries embeddings URL.'
    )
  }

  try {
    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch countries dataset: ${response.status} ${response.statusText}`
      )
    }

    const csvText = await response.text()
    const parseResult = await new Promise<Papa.ParseResult<Record<string, string>>>(
      (resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: resolve,
          error: reject,
        })
      }
    )

    if (parseResult.errors.length > 0) {
      console.warn('CSV parsing warnings:', parseResult.errors)
    }

    const rows = parseResult.data
    if (rows.length === 0) {
      throw new Error('No data found in countries CSV')
    }

    const firstRow = rows[0]
    const embeddingCols = Object.keys(firstRow).filter((col) => col.startsWith('emb_'))
    const numFeatures = embeddingCols.length

    if (numFeatures === 0) {
      throw new Error('No embedding columns found in CSV (expected emb_0, emb_1, ...)')
    }

    console.log(`Loaded countries dataset: ${rows.length} countries × ${numFeatures} features`)

    const points: CountryDataPoint[] = []
    const metadata: CountryMetadata[] = []

    for (const row of rows) {
      const embeddings = embeddingCols.map((col) => Number.parseFloat(row[col]) || 0)

      const meta: CountryMetadata = {
        cca2: String(row.cca2 || ''),
        cca3: String(row.cca3 || ''),
        name: String(row.name || 'Unknown'),
        officialName: String(row.official_name || row.name || 'Unknown'),
        capital: String(row.capital || ''),
        region: String(row.region || ''),
        subregion: String(row.subregion || ''),
        latitude: Number.parseFloat(row.latitude_num) || 0,
        longitude: Number.parseFloat(row.longitude_num) || 0,
        population: parseOptionalNumber(row.population),
        areaKm2: parseOptionalNumber(row.area_km2),
        populationDensity: parseOptionalNumber(row.population_density),
        gdpCurrentUsd: parseOptionalNumber(row.gdp_current_usd),
        gdpPerCapitaUsd: parseOptionalNumber(row.gdp_per_capita_usd),
        incomeGroup: String(row.income_group || ''),
        lifeExpectancy: parseOptionalNumber(row.life_expectancy),
        urbanPopulationPct: parseOptionalNumber(row.urban_population_pct),
        literacyPct: parseOptionalNumber(row.literacy_pct),
        languages: parsePipeList(row.languages),
        majorityReligion: String(row.majority_religion || ''),
        religionBreakdown: String(row.religion_breakdown || ''),
        foodTags: parsePipeList(row.food_tags),
        sourceYear: String(row.source_year || ''),
        sourceName: String(row.source_name || ''),
        spriteSheetUrl: String(row.sprite_sheet_url || ''),
        spriteX: Number.parseInt(row.sprite_x) || 0,
        spriteY: Number.parseInt(row.sprite_y) || 0,
        spriteW: Number.parseInt(row.sprite_w) || 0,
        spriteH: Number.parseInt(row.sprite_h) || 0,
        spriteManifestUrl: String(row.sprite_manifest_url || ''),
      }

      points.push({
        x: embeddings[0] || 0,
        y: embeddings[1] || 0,
        z: embeddings[2] || 0,
        embeddings,
        metadata: meta,
      })
      metadata.push(meta)
    }

    return {
      points,
      metadata,
      numFeatures,
      featureNames: embeddingCols,
    }
  } catch (error) {
    console.error('Error loading countries dataset:', error)
    throw new Error(
      `Failed to load countries dataset: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export function clearCountriesDatasetCache() {
  cachedDataset = null
  loadingPromise = null
  clearCountrySpriteCache()
}

export async function checkCountriesDatasetAvailability(): Promise<{
  available: boolean
  error?: string
}> {
  const csvUrl = process.env.NEXT_PUBLIC_COUNTRIES_EMBEDDINGS_URL

  if (!csvUrl) {
    return {
      available: false,
      error: 'NEXT_PUBLIC_COUNTRIES_EMBEDDINGS_URL not configured',
    }
  }

  try {
    const response = await fetch(csvUrl, { method: 'HEAD' })
    if (!response.ok) {
      return {
        available: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
    return { available: true }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

function zScoreNormalize(data: number[][]): number[][] {
  if (data.length === 0) return data
  const n = data.length
  const d = data[0].length
  const means = new Array<number>(d).fill(0)
  const stds = new Array<number>(d).fill(0)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) means[j] += data[i][j]
  }
  for (let j = 0; j < d; j++) means[j] /= n

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) stds[j] += (data[i][j] - means[j]) ** 2
  }
  for (let j = 0; j < d; j++) stds[j] = Math.sqrt(stds[j] / n) || 1

  return data.map((row) => row.map((v, j) => (v - means[j]) / stds[j]))
}

let tsneCountriesCache: { tsnePoints: TSNEPoint[]; highDimData: number[][] } | null = null

export async function loadCountriesForTSNE(): Promise<{
  tsnePoints: TSNEPoint[]
  highDimData: number[][]
}> {
  if (tsneCountriesCache) return tsneCountriesCache

  const dataset = await loadCountriesDataset()
  const highDimData = zScoreNormalize(dataset.points.map((point) => point.embeddings ?? []))

  const tsnePoints: TSNEPoint[] = dataset.points.map((point, index) => ({
    x: 0,
    y: 0,
    z: undefined,
    originalIndex: index,
    label: point.metadata?.name,
    category: point.metadata?.region || point.metadata?.subregion || 'Unknown',
    metadata: point.metadata as Record<string, unknown> | undefined,
  }))

  console.log(
    `[t-SNE] Feature matrix: ${tsnePoints.length} countries × ${highDimData[0]?.length} features`,
    `(region sample: ${(tsnePoints[0]?.category as string) ?? '?'})`
  )

  tsneCountriesCache = { tsnePoints, highDimData }
  return tsneCountriesCache
}

export function clearCountriesTSNECache(): void {
  tsneCountriesCache = null
  clearCountrySpriteCache()
}

function parseOptionalNumber(value: unknown): number | undefined {
  const parsed = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : undefined
}

function parsePipeList(value: unknown): string[] {
  return String(value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

// Country sprite cache helpers
const countrySpriteSheetCache = new Map<string, HTMLImageElement>()
export const countrySpriteBitmapCache = new Map<string, ImageBitmap>()

function getCountrySpriteKey(metadata: CountryMetadata): string {
  return metadata.cca3 || metadata.cca2 || metadata.name
}

function loadSheetImage(sheetUrl: string): Promise<HTMLImageElement> {
  if (countrySpriteSheetCache.has(sheetUrl)) {
    return Promise.resolve(countrySpriteSheetCache.get(sheetUrl)!)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      countrySpriteSheetCache.set(sheetUrl, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = sheetUrl
  })
}

export async function getCountrySpriteBitmap(
  metadata: CountryMetadata
): Promise<ImageBitmap | null> {
  const cacheKey = getCountrySpriteKey(metadata)
  if (countrySpriteBitmapCache.has(cacheKey)) {
    return countrySpriteBitmapCache.get(cacheKey)!
  }

  if (!metadata.spriteSheetUrl) return null

  try {
    const img = await loadSheetImage(metadata.spriteSheetUrl)
    const canvas = document.createElement('canvas')
    canvas.width = metadata.spriteW
    canvas.height = metadata.spriteH
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(
      img,
      metadata.spriteX,
      metadata.spriteY,
      metadata.spriteW,
      metadata.spriteH,
      0,
      0,
      metadata.spriteW,
      metadata.spriteH
    )

    const bitmap = await createImageBitmap(canvas)
    countrySpriteBitmapCache.set(cacheKey, bitmap)
    return bitmap
  } catch (error) {
    console.warn(`Failed to load country sprite: ${metadata.name}`, error)
    return null
  }
}

export async function getCountrySpriteDataUrl(metadata: CountryMetadata): Promise<string | null> {
  const cacheKey = getCountrySpriteKey(metadata)
  if (countrySpriteBitmapCache.has(cacheKey)) {
    const bitmap = countrySpriteBitmapCache.get(cacheKey)!
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0)
    return canvas.toDataURL('image/png')
  }

  if (!metadata.spriteSheetUrl) return null

  try {
    const img = await loadSheetImage(metadata.spriteSheetUrl)
    const canvas = document.createElement('canvas')
    canvas.width = metadata.spriteW
    canvas.height = metadata.spriteH
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(
      img,
      metadata.spriteX,
      metadata.spriteY,
      metadata.spriteW,
      metadata.spriteH,
      0,
      0,
      metadata.spriteW,
      metadata.spriteH
    )

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.warn(`Failed to create country sprite preview: ${metadata.name}`, error)
    return null
  }
}

export function clearCountrySpriteCache(): void {
  countrySpriteSheetCache.clear()
  countrySpriteBitmapCache.clear()
}
