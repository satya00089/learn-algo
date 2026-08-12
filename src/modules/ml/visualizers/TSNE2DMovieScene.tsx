'use client'

import { useEffect } from 'react'
import type { TSNEState } from '../engines/TSNEEngine'
import { bitmapCache, getPosterBitmap, loadManifest, MovieDetailModal } from './PCA3DScene'
import type { MovieMetadata } from '../data/movieDataLoader'
import { TSNESpriteScene } from './TSNESpriteScene'

loadManifest()

const GENRE_COLORS: Record<string, string> = {
  Action: '#ef4444',
  Adventure: '#f97316',
  Animation: '#eab308',
  Comedy: '#84cc16',
  Crime: '#dc2626',
  Documentary: '#6b7280',
  Drama: '#8b5cf6',
  Family: '#06b6d4',
  Fantasy: '#a855f7',
  History: '#7c3aed',
  Horror: '#991b1b',
  Music: '#ec4899',
  Mystery: '#0891b2',
  Romance: '#f43f5e',
  'Science Fiction': '#3b82f6',
  Thriller: '#d97706',
  War: '#78716c',
  Western: '#92400e',
  Unknown: '#9ca3af',
}

export interface TSNE2DMovieSceneProps {
  readonly state: TSNEState
  readonly theme: 'light' | 'dark'
}

function MovieDetailModalAdapter({ item, onClose }: { item: MovieMetadata; onClose: () => void }) {
  return <MovieDetailModal movie={item} onClose={onClose} />
}

export function TSNE2DMovieScene({ state, theme }: TSNE2DMovieSceneProps) {
  useEffect(() => {
    loadManifest()
  }, [])

  return (
    <TSNESpriteScene<MovieMetadata>
      state={state}
      theme={theme}
      spriteRect={{ width: 38, height: 57 }}
      getMetadata={(point) => point.metadata as MovieMetadata | undefined}
      getSpriteBitmap={(metadata) => bitmapCache.get(metadata.tmdbId)}
      loadSpriteBitmap={(metadata) => getPosterBitmap(metadata.tmdbId)}
      getFallbackColor={(metadata) => GENRE_COLORS[metadata?.genre || 'Unknown'] ?? '#9ca3af'}
      DetailModal={MovieDetailModalAdapter}
      emptyText="Initializing t-SNE..."
      clickHint="Scroll to zoom | Drag to pan | Click poster for details"
      axisLabel="t-SNE"
      title="Movie posters by genre"
    />
  )
}
