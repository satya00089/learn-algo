import Papa from 'papaparse'
import type { DataPoint } from '../types'
import type { TSNEPoint } from '../engines/TSNEEngine'

export interface CloudMetadata {
  provider: string
  label: string
  description: string
  tags: string[]
  spriteSheetUrl: string
  spriteX: number
  spriteY: number
  spriteW: number
  spriteH: number
}

export interface CloudDataPoint extends DataPoint {
  metadata?: CloudMetadata
}

export interface CloudDataset {
  points: CloudDataPoint[]
  metadata: CloudMetadata[]
  numFeatures: number
  featureNames: string[]
}

let cachedDataset: CloudDataset | null = null
let loadingPromise: Promise<CloudDataset> | null = null
let tsneCloudCache: { tsnePoints: TSNEPoint[]; highDimData: number[][] } | null = null

export async function loadCloudDataset(): Promise<CloudDataset> {
  if (cachedDataset) return cachedDataset
  if (loadingPromise) return loadingPromise

  loadingPromise = fetchAndParseCloudDataset()

  try {
    const dataset = await loadingPromise
    cachedDataset = dataset
    return dataset
  } finally {
    loadingPromise = null
  }
}

async function fetchAndParseCloudDataset(): Promise<CloudDataset> {
  const csvUrl = process.env.NEXT_PUBLIC_CLOUD_EMBEDDINGS_URL

  if (!csvUrl) {
    throw new Error(
      'NEXT_PUBLIC_CLOUD_EMBEDDINGS_URL environment variable is not set. ' +
        'Please configure your .env.local file with the cloud embeddings URL.'
    )
  }

  const response = await fetch(csvUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch cloud dataset: ${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()
  const parseResult = await new Promise<Papa.ParseResult<Record<string, string>>>((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject,
    })
  })

  const rows = parseResult.data
  if (rows.length === 0) {
    throw new Error('No data found in cloud CSV')
  }

  const firstRow = rows[0]
  const embeddingCols = Object.keys(firstRow).filter((column) => column.startsWith('emb_'))
  const numFeatures = embeddingCols.length

  if (numFeatures === 0) {
    throw new Error('No embedding columns found in CSV (expected emb_0, emb_1, ...)')
  }

  const points: CloudDataPoint[] = []
  const metadata: CloudMetadata[] = []

  for (const row of rows) {
    const embeddings = embeddingCols.map((column) => Number.parseFloat(row[column]) || 0)
    const meta: CloudMetadata = {
      provider: String(row.provider || 'unknown'),
      label: String(row.label || 'Unknown'),
      description: String(row.description || ''),
      tags: parsePipeList(row.tags),
      spriteSheetUrl: String(row.sprite_sheet_url || ''),
      spriteX: Number.parseInt(row.sprite_x) || 0,
      spriteY: Number.parseInt(row.sprite_y) || 0,
      spriteW: Number.parseInt(row.sprite_w) || 0,
      spriteH: Number.parseInt(row.sprite_h) || 0,
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

  return data.map((row) => row.map((value, index) => (value - means[index]) / stds[index]))
}

export async function loadCloudForTSNE(): Promise<{
  tsnePoints: TSNEPoint[]
  highDimData: number[][]
}> {
  if (tsneCloudCache) return tsneCloudCache

  const dataset = await loadCloudDataset()
  const highDimData = zScoreNormalize(dataset.points.map((point) => point.embeddings ?? []))

  const tsnePoints: TSNEPoint[] = dataset.points.map((point, index) => ({
    x: 0,
    y: 0,
    z: undefined,
    originalIndex: index,
    label: point.metadata?.label,
    category: point.metadata?.provider || 'unknown',
    metadata: point.metadata as Record<string, unknown> | undefined,
  }))

  tsneCloudCache = { tsnePoints, highDimData }
  return tsneCloudCache
}

export function clearCloudTSNECache(): void {
  tsneCloudCache = null
  cachedDataset = null
  loadingPromise = null
  clearCloudSpriteCache()
}

export function clearCloudDatasetCache(): void {
  cachedDataset = null
  loadingPromise = null
  clearCloudSpriteCache()
}

function parsePipeList(value: unknown): string[] {
  return String(value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

const cloudSpriteSheetCache = new Map<string, HTMLImageElement>()
export const cloudSpriteBitmapCache = new Map<string, ImageBitmap>()

function getCloudSpriteKey(metadata: CloudMetadata): string {
  return `${metadata.provider}:${metadata.label}`
}

function loadSheetImage(sheetUrl: string): Promise<HTMLImageElement> {
  if (cloudSpriteSheetCache.has(sheetUrl)) {
    return Promise.resolve(cloudSpriteSheetCache.get(sheetUrl)!)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      cloudSpriteSheetCache.set(sheetUrl, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = sheetUrl
  })
}

export async function getCloudSpriteBitmap(metadata: CloudMetadata): Promise<ImageBitmap | null> {
  const cacheKey = getCloudSpriteKey(metadata)
  if (cloudSpriteBitmapCache.has(cacheKey)) {
    return cloudSpriteBitmapCache.get(cacheKey)!
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
    cloudSpriteBitmapCache.set(cacheKey, bitmap)
    return bitmap
  } catch (error) {
    console.warn(`Failed to load cloud sprite: ${metadata.label}`, error)
    return null
  }
}

export async function getCloudSpriteDataUrl(metadata: CloudMetadata): Promise<string | null> {
  const bitmap = await getCloudSpriteBitmap(metadata)
  if (!bitmap) return null

  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(bitmap, 0, 0)
  return canvas.toDataURL('image/png')
}

export function clearCloudSpriteCache(): void {
  cloudSpriteSheetCache.clear()
  cloudSpriteBitmapCache.clear()
}
