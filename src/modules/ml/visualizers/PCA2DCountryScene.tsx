'use client'

import { useEffect, useState } from 'react'
import type { CountryMetadata } from '../data/countryDataLoader'
import {
  countrySpriteBitmapCache,
  getCountrySpriteBitmap,
  getCountrySpriteDataUrl,
} from '../data/countryDataLoader'
import type { PCAState } from '../engines/PCAEngine'
import { PCA2DSpriteScene } from './PCA2DSpriteScene'

const REGION_COLORS: Record<string, string> = {
  Africa: '#ef4444',
  Asia: '#f59e0b',
  Europe: '#3b82f6',
  Oceania: '#10b981',
  'North America': '#8b5cf6',
  'South America': '#ec4899',
  Antarctica: '#9ca3af',
  Unknown: '#6b7280',
}

export interface PCA2DCountrySceneProps {
  readonly state: PCAState
  readonly theme: 'light' | 'dark'
}

function CountryDetailModal({ item, onClose }: { item: CountryMetadata; onClose: () => void }) {
  const [spriteSrc, setSpriteSrc] = useState<string | null>(null)

  const numberFormatter = new Intl.NumberFormat('en-US')
  const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  useEffect(() => {
    let cancelled = false
    getCountrySpriteDataUrl(item).then((dataUrl) => {
      if (!cancelled) setSpriteSrc(dataUrl)
    })
    return () => {
      cancelled = true
    }
  }, [item.cca3, item.spriteSheetUrl, item.spriteX, item.spriteY, item.spriteW, item.spriteH])

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-4">
          {spriteSrc ? (
            <img src={spriteSrc} alt={item.name} className="h-16 w-24 flex-shrink-0 rounded object-cover" />
          ) : (
            <div className="h-16 w-24 flex-shrink-0 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.officialName}</p>
            <div className="mt-3 space-y-1 text-sm">
              {item.capital && <p className="text-gray-700 dark:text-gray-200">Capital: {item.capital}</p>}
              <p className="text-gray-700 dark:text-gray-200">Region: {item.region || 'Unknown'}</p>
              <p className="text-gray-700 dark:text-gray-200">Subregion: {item.subregion || 'Unknown'}</p>
              <p className="text-gray-700 dark:text-gray-200">
                Code: {item.cca2 || '-'} / {item.cca3 || '-'}
              </p>
              <p className="text-gray-700 dark:text-gray-200">
                Coordinates: {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
              </p>
              {typeof item.population === 'number' && (
                <p className="text-gray-700 dark:text-gray-200">
                  Population: {numberFormatter.format(item.population)}
                </p>
              )}
              {typeof item.gdpCurrentUsd === 'number' && (
                <p className="text-gray-700 dark:text-gray-200">
                  GDP: ${compactCurrencyFormatter.format(item.gdpCurrentUsd)}
                </p>
              )}
              {item.languages && item.languages.length > 0 && (
                <p className="text-gray-700 dark:text-gray-200">
                  Languages: {item.languages.slice(0, 4).join(', ')}
                </p>
              )}
              {item.majorityReligion && (
                <p className="text-gray-700 dark:text-gray-200">
                  Majority religion: {item.majorityReligion}
                </p>
              )}
            </div>
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

export function PCA2DCountryScene({ state, theme }: PCA2DCountrySceneProps) {
  return (
    <PCA2DSpriteScene<CountryMetadata>
      state={state}
      theme={theme}
      spriteRect={{ width: 44, height: 26 }}
      getMetadata={(point) => point.metadata as CountryMetadata | undefined}
      getSpriteBitmap={(metadata) =>
        countrySpriteBitmapCache.get(metadata.cca3 || metadata.cca2 || metadata.name)
      }
      loadSpriteBitmap={getCountrySpriteBitmap}
      getFallbackColor={(metadata) => REGION_COLORS[metadata?.region || 'Unknown'] ?? '#9ca3af'}
      DetailModal={CountryDetailModal}
      emptyText="Run PCA to see the country sprites"
      clickHint="Scroll to zoom | Drag to pan | Click country for details"
      axisLabel="PC"
      title="Country sprites by region"
    />
  )
}
