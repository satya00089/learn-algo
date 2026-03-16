/**
 * Movie Dataset Loader for PCA
 * 
 * Fetches pre-computed embeddings and metadata from S3
 * for movie dataset visualization with PCA
 */

import Papa from 'papaparse'
import type { DataPoint } from '../types'

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
      const embeddings = embeddingCols.map((col) => parseFloat(row[col] as string) || 0)

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
        tmdbId: parseInt(row.tmdb_id as string) || 0,
        title: (row.title as string) || 'Unknown',
        year: parseInt(row.year as string) || 0,
        genre: (row.genre as string) || '',
        allGenres: (row.all_genres as string) || '',
        posterUrl: (row.s3_poster_url as string) || '',
        budget: parseFloat(row.budget_million as string) || 0,
        boxOffice: parseFloat(row.box_office_million as string) || 0,
        runtime: parseInt(row.runtime_min as string) || 0,
        rating: parseFloat(row.imdb_rating as string) || 0,
        votes: parseFloat(row.imdb_votes_million as string) || 0,
        popularity: parseFloat(row.popularity as string) || 0,
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
