/**
 * Movie Dataset Loader for PCA and t-SNE
 *
 * Fetches pre-computed embeddings and metadata from S3
 * for movie dataset visualization with PCA and t-SNE
 */

import Papa from 'papaparse'
import type { DataPoint } from '../types'
import type { TSNEPoint } from '../engines/TSNEEngine'

export interface MovieMetadata {
  tmdbId: number
  title: string
  year: number
  genre: string
  allGenres: string
  posterUrl: string
  budget: number
  boxOffice: number
  runtime: number
  rating: number
  votes: number
  popularity: number
  keywords: string
}

export interface MovieDataPoint extends DataPoint {
  metadata?: MovieMetadata
}

export interface MoviesDataset {
  points: MovieDataPoint[]
  metadata: MovieMetadata[]
  numFeatures: number
  featureNames: string[]
}

// Cache to avoid re-fetching
let cachedDataset: MoviesDataset | null = null
let loadingPromise: Promise<MoviesDataset> | null = null

/**
 * Load movies dataset with embeddings from S3
 */
export async function loadMoviesDataset(): Promise<MoviesDataset> {
  // Return cached data if available
  if (cachedDataset) {
    return cachedDataset
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise
  }

  // Start loading
  loadingPromise = fetchAndParseMoviesDataset()

  try {
    const dataset = await loadingPromise
    cachedDataset = dataset
    return dataset
  } finally {
    loadingPromise = null
  }
}

async function fetchAndParseMoviesDataset(): Promise<MoviesDataset> {
  const csvUrl = process.env.NEXT_PUBLIC_MOVIES_EMBEDDINGS_URL

  if (!csvUrl) {
    throw new Error(
      'NEXT_PUBLIC_MOVIES_EMBEDDINGS_URL environment variable is not set. ' +
        'Please run the Python embedding script and configure your .env.local file.'
    )
  }

  try {
    // Fetch CSV from S3
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch movies dataset: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()

    // Parse CSV
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
      throw new Error('No data found in movies CSV')
    }

    // Extract embedding columns (emb_0, emb_1, emb_2, ...)
    const firstRow = rows[0]
    const embeddingCols = Object.keys(firstRow).filter((col) => col.startsWith('emb_'))
    const numFeatures = embeddingCols.length

    if (numFeatures === 0) {
      throw new Error('No embedding columns found in CSV (expected emb_0, emb_1, ...)')
    }

    console.log(`Loaded movies dataset: ${rows.length} movies × ${numFeatures} features`)

    // Parse each row into DataPoint with metadata
    const points: MovieDataPoint[] = []
    const metadata: MovieMetadata[] = []

    for (const row of rows) {
      // Extract embeddings as array
      const embeddings = embeddingCols.map((col) => Number.parseFloat(row[col]) || 0)

      // For PCA input, we'll use the first 3 embedding dimensions as x, y, z
      // (PCA will recompute these, but we need initial values)
      const point: MovieDataPoint = {
        x: embeddings[0] || 0,
        y: embeddings[1] || 0,
        z: embeddings[2] || 0,
        // Store all embeddings for PCA computation
        embeddings,
      }

      // Extract metadata
      const meta: MovieMetadata = {
        tmdbId: Number.parseInt(row.tmdb_id) || 0,
        title: row.title || 'Unknown',
        year: Number.parseInt(row.year) || 0,
        genre: row.genre || '',
        allGenres: row.all_genres || '',
        posterUrl: row.s3_poster_url || '',
        budget: Number.parseFloat(row.budget_million) || 0,
        boxOffice: Number.parseFloat(row.box_office_million) || 0,
        runtime: Number.parseInt(row.runtime_min) || 0,
        rating: Number.parseFloat(row.imdb_rating) || 0,
        votes: Number.parseFloat(row.imdb_votes_million) || 0,
        popularity: Number.parseFloat(row.popularity) || 0,
        keywords: row.keywords || '',
      }

      point.metadata = meta
      points.push(point)
      metadata.push(meta)
    }

    return {
      points,
      metadata,
      numFeatures,
      featureNames: embeddingCols,
    }
  } catch (error) {
    console.error('Error loading movies dataset:', error)
    throw new Error(
      `Failed to load movies dataset: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Clear cached dataset (useful for testing/development)
 */
export function clearMoviesDatasetCache() {
  cachedDataset = null
  loadingPromise = null
}

/**
 * Check if movies dataset is configured and accessible
 */
export async function checkMoviesDatasetAvailability(): Promise<{
  available: boolean
  error?: string
}> {
  const csvUrl = process.env.NEXT_PUBLIC_MOVIES_EMBEDDINGS_URL

  if (!csvUrl) {
    return {
      available: false,
      error: 'NEXT_PUBLIC_MOVIES_EMBEDDINGS_URL not configured',
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

// ─── t-SNE Movies Input ───────────────────────────────────────────────────────

let tsneMoviesCache: { tsnePoints: TSNEPoint[]; highDimData: number[][] } | null = null

/** Z-score normalize each column so every feature has zero mean, unit variance. */
function zScoreNormalize(data: number[][]): number[][] {
  if (data.length === 0) return data
  const n = data.length
  const d = data[0].length
  const means = new Array<number>(d).fill(0)
  const stds = new Array<number>(d).fill(0)
  for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) means[j] += data[i][j]
  for (let j = 0; j < d; j++) means[j] /= n
  for (let i = 0; i < n; i++) for (let j = 0; j < d; j++) stds[j] += (data[i][j] - means[j]) ** 2
  for (let j = 0; j < d; j++) stds[j] = Math.sqrt(stds[j] / n) || 1
  return data.map((row) => row.map((v, j) => (v - means[j]) / stds[j]))
}

/**
 * One-hot encode primary genres.
 * Returns a feature matrix (n × numGenres) and the ordered genre labels.
 */
function buildGenreOneHot(genres: string[]): { features: number[][]; labels: string[] } {
  const unique = [...new Set(genres)].filter(Boolean).sort((a, b) => a.localeCompare(b))
  const features = genres.map((g) => unique.map((u) => (g === u ? 1 : 0)))
  return { features, labels: unique }
}

/** Common English stop words to exclude from keyword TF-IDF. */
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'as',
  'is',
  'was',
  'are',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'not',
  'no',
  'that',
  'this',
  'these',
  'those',
  'it',
  'its',
  'he',
  'she',
  'they',
  'we',
  'you',
])

/**
 * Compute TF-IDF feature matrix over the provided text documents.
 * Matches sklearn TfidfVectorizer with smooth IDF.
 */
function computeKeywordsTFIDF(documents: string[], maxFeatures: number): number[][] {
  const tokenize = (text: string): string[] =>
    text
      .toLowerCase()
      .replaceAll('_', ' ')
      .split(/\W+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  const tokenizedDocs = documents.map(tokenize)

  // Document frequency
  const dfMap = new Map<string, number>()
  for (const tokens of tokenizedDocs) {
    for (const t of new Set(tokens)) dfMap.set(t, (dfMap.get(t) || 0) + 1)
  }

  // Take top maxFeatures terms by document frequency
  const vocab = [...dfMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxFeatures)
    .map(([term]) => term)

  const N = documents.length
  return tokenizedDocs.map((tokens) => {
    const tfMap = new Map<string, number>()
    for (const t of tokens) tfMap.set(t, (tfMap.get(t) || 0) + 1)
    const docLen = tokens.length || 1
    return vocab.map((term) => {
      const tf = (tfMap.get(term) || 0) / docLen
      const idf = Math.log((N + 1) / ((dfMap.get(term) || 0) + 1)) + 1 // smooth IDF
      return tf * idf
    })
  })
}

/**
 * Load movies for t-SNE using the same feature engineering as the reference notebook:
 * numeric metadata (7 cols) + derived features (ROI, box_per_min)
 * + genre one-hot + keyword TF-IDF (30 cols), all z-score normalised.
 *
 * Reuses `loadMoviesDataset()` so there is only one S3 fetch shared with PCA.
 */
export async function loadMoviesForTSNE(): Promise<{
  tsnePoints: TSNEPoint[]
  highDimData: number[][]
}> {
  if (tsneMoviesCache) return tsneMoviesCache

  const dataset = await loadMoviesDataset()
  const metas = dataset.metadata

  // ── 1. Numeric + derived features (matches notebook Section 3a) ──────────────
  const numericMatrix = metas.map((m) => [
    m.year,
    m.budget,
    m.boxOffice,
    m.runtime,
    m.rating,
    m.votes,
    m.popularity,
    m.budget > 0 ? m.boxOffice / m.budget : 0, // ROI
    m.runtime > 0 ? m.boxOffice / m.runtime : 0, // box_per_min
  ])

  // ── 2. Genre one-hot (matches notebook Section 3b) ───────────────────────────
  const primaryGenres = metas.map((m) => m.genre || 'Unknown')
  const { features: genreFeatures } = buildGenreOneHot(primaryGenres)

  // ── 3. Keyword TF-IDF top-30 (matches notebook Section 3c) ──────────────────
  const kwFeatures = computeKeywordsTFIDF(
    metas.map((m) => m.keywords || ''),
    30
  )

  // ── 4. Concatenate and z-score normalise (matches notebook Section 3d) ───────
  const rawHighDim = numericMatrix.map((nums, i) => [
    ...nums,
    ...genreFeatures[i],
    ...kwFeatures[i],
  ])
  const highDimData = zScoreNormalize(rawHighDim)

  const tsnePoints: TSNEPoint[] = dataset.points.map((p, i) => ({
    x: 0,
    y: 0,
    z: undefined,
    originalIndex: i,
    label: p.metadata?.title,
    category: p.metadata?.genre || 'Unknown',
    metadata: p.metadata as Record<string, unknown> | undefined,
  }))

  console.log(
    `[t-SNE] Feature matrix: ${tsnePoints.length} movies × ${highDimData[0]?.length} features`,
    `(genre sample: ${(tsnePoints[0]?.category as string) ?? '?'})`
  )

  tsneMoviesCache = { tsnePoints, highDimData }
  return tsneMoviesCache
}

export function clearTSNEMoviesCache(): void {
  tsneMoviesCache = null
}
