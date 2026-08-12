'use client'

import { useEffect, useState } from 'react'
import type { TSNEState } from '../engines/TSNEEngine'
import {
  cloudSpriteBitmapCache,
  getCloudSpriteBitmap,
  getCloudSpriteDataUrl,
  type CloudMetadata,
} from '../data/cloudDataLoader'
import { TSNESpriteScene } from './TSNESpriteScene'

const PROVIDER_COLORS: Record<string, string> = {
  aws: '#f59e0b',
  azure: '#2563eb',
  gcp: '#34a853',
  unknown: '#6b7280',
}

export interface TSNE2DCloudSceneProps {
  readonly state: TSNEState
  readonly theme: 'light' | 'dark'
}

function CloudDetailModal({ item, onClose }: { item: CloudMetadata; onClose: () => void }) {
  const [spriteSrc, setSpriteSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getCloudSpriteDataUrl(item).then((dataUrl) => {
      if (!cancelled) setSpriteSrc(dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [
    item.label,
    item.provider,
    item.spriteSheetUrl,
    item.spriteX,
    item.spriteY,
    item.spriteW,
    item.spriteH,
  ])

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-4">
          {spriteSrc ? (
            <img
              src={spriteSrc}
              alt={item.label}
              className="h-16 w-16 flex-shrink-0 rounded object-contain"
            />
          ) : (
            <div className="h-16 w-16 flex-shrink-0 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.label}</h3>
            <p className="mt-1 text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {item.provider}
            </p>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">{item.description}</p>
            {item.tags.length > 0 && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Tags: {item.tags.slice(0, 8).join(', ')}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export function TSNE2DCloudScene({ state, theme }: TSNE2DCloudSceneProps) {
  return (
    <TSNESpriteScene<CloudMetadata>
      state={state}
      theme={theme}
      spriteRect={{ width: 36, height: 36 }}
      getMetadata={(point) => point.metadata as CloudMetadata | undefined}
      getSpriteBitmap={(metadata) =>
        cloudSpriteBitmapCache.get(`${metadata.provider}:${metadata.label}`)
      }
      loadSpriteBitmap={getCloudSpriteBitmap}
      getFallbackColor={(metadata) => PROVIDER_COLORS[metadata?.provider || 'unknown'] ?? '#6b7280'}
      DetailModal={CloudDetailModal}
      clickHint="Scroll to zoom | Drag to pan | Click service for details"
      axisLabel="t-SNE"
      title="Cloud services by provider"
    />
  )
}
