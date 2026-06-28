// @ts-nocheck
'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { TSNEState, TSNEPoint } from '../engines/TSNEEngine'
import { loadPosterTexture, MovieDetailModal } from './PCA3DScene'
import type { MovieMetadata } from '../data/movieDataLoader'
import {
  getCountrySpriteDataUrl,
  type CountryMetadata,
} from '../data/countryDataLoader'
import {
  getCloudSpriteDataUrl,
  type CloudMetadata,
} from '../data/cloudDataLoader'

interface TSNE3DSceneProps {
  readonly state: TSNEState
  readonly autoRotate?: boolean
  readonly showLabels?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  Tech: '#3b82f6',
  Politics: '#dc2626',
  Entertainment: '#f59e0b',
  Sports: '#10b981',
  Business: '#8b5cf6',
  Science: '#06b6d4',
  Gaming: '#ec4899',
  Art: '#f97316',
  Bitcoin: '#f7931a',
  Ethereum: '#627eea',
  DeFi: '#00d4aa',
  'Meme Coins': '#ff6b9d',
  Stablecoins: '#26a17b',
  NFT: '#ff4785',
  Layer2: '#a855f7',
  Technology: '#3b82f6',
  Health: '#10b981',
  Climate: '#059669',
  Economy: '#8b5cf6',
  Pop: '#ff6b9d',
  Rock: '#ef4444',
  'Hip-Hop': '#f59e0b',
  Electronic: '#8b5cf6',
  Classical: '#0891b2',
  Jazz: '#d97706',
  Country: '#ea580c',
  'R&B': '#ec4899',
  Web: '#3b82f6',
  'ML/AI': '#8b5cf6',
  DevOps: '#10b981',
  Mobile: '#f59e0b',
  Data: '#06b6d4',
  Security: '#dc2626',
  Blockchain: '#f7931a',
  'Point Guards': '#3b82f6',
  'Shooting Guards': '#ef4444',
  'Small Forwards': '#10b981',
  'Power Forwards': '#f59e0b',
  Centers: '#8b5cf6',
  Shooters: '#ec4899',
  Defenders: '#14b8a6',
  Playmakers: '#f97316',
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
  Africa: '#ef4444',
  Asia: '#f59e0b',
  Europe: '#3b82f6',
  Oceania: '#10b981',
  'North America': '#8b5cf6',
  'South America': '#ec4899',
  Antarctica: '#9ca3af',
  aws: '#f59e0b',
  azure: '#2563eb',
  gcp: '#34a853',
  Unknown: '#9ca3af',
}

const countryTextureCache = new Map<string, THREE.Texture>()
const cloudTextureCache = new Map<string, THREE.Texture>()

function isMoviePoint(point: TSNEPoint): boolean {
  return typeof point.metadata?.tmdbId === 'number'
}

function isCountryPoint(point: TSNEPoint): boolean {
  return !!point.metadata?.cca3 || !!point.metadata?.cca2
}

function isCloudPoint(point: TSNEPoint): boolean {
  return typeof point.metadata?.provider === 'string' && typeof point.metadata?.description === 'string'
}

function getCountryTextureKey(metadata: CountryMetadata): string {
  return metadata.cca3 || metadata.cca2 || metadata.name
}

async function loadCountrySpriteTexture(metadata: CountryMetadata): Promise<THREE.Texture | null> {
  const cacheKey = getCountryTextureKey(metadata)
  if (countryTextureCache.has(cacheKey)) {
    return countryTextureCache.get(cacheKey) ?? null
  }

  const dataUrl = await getCountrySpriteDataUrl(metadata)
  if (!dataUrl) return null

  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      dataUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.needsUpdate = true
        countryTextureCache.set(cacheKey, texture)
        resolve(texture)
      },
      undefined,
      () => resolve(null)
    )
  })
}

function getCloudTextureKey(metadata: CloudMetadata): string {
  return `${metadata.provider}:${metadata.label}`
}

async function loadCloudSpriteTexture(metadata: CloudMetadata): Promise<THREE.Texture | null> {
  const cacheKey = getCloudTextureKey(metadata)
  if (cloudTextureCache.has(cacheKey)) {
    return cloudTextureCache.get(cacheKey) ?? null
  }

  const dataUrl = await getCloudSpriteDataUrl(metadata)
  if (!dataUrl) return null

  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      dataUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.needsUpdate = true
        cloudTextureCache.set(cacheKey, texture)
        resolve(texture)
      },
      undefined,
      () => resolve(null)
    )
  })
}

function TSNESpriteBillboard({
  point,
  fallbackColor,
  kind,
  onHover,
  onClick,
}: {
  readonly point: TSNEPoint
  readonly fallbackColor: string
  readonly kind: 'movie' | 'country' | 'cloud'
  readonly onHover?: (pt: TSNEPoint | null) => void
  readonly onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let alive = true

    async function loadTexture() {
      if (kind === 'movie') {
        const tmdbId = point.metadata?.tmdbId as number | undefined
        if (!tmdbId) return
        const tex = await loadPosterTexture(tmdbId)
        if (alive && tex) setTexture(tex)
        return
      }

      if (kind === 'cloud') {
        const metadata = point.metadata as CloudMetadata | undefined
        if (!metadata) return
        const tex = await loadCloudSpriteTexture(metadata)
        if (alive && tex) setTexture(tex)
        return
      }

      const metadata = point.metadata as CountryMetadata | undefined
      if (!metadata) return
      const tex = await loadCountrySpriteTexture(metadata)
      if (alive && tex) setTexture(tex)
    }

    setTexture(null)
    void loadTexture()

    return () => {
      alive = false
    }
  }, [kind, point.metadata])

  useFrame(({ camera }) => {
    if (!meshRef.current) return
    meshRef.current.position.set(point.x, point.z ?? 0, -point.y)
    meshRef.current.lookAt(camera.position)
    const target = hovered ? 1.5 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15)
  })

  const geometryArgs =
    kind === 'movie' ? [0.8, 1.2] : kind === 'country' ? [1.1, 0.7] : [0.8, 0.8]

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        onHover?.(point)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        onHover?.(null)
        document.body.style.cursor = 'default'
      }}
      onClick={(event) => {
        event.stopPropagation()
        onClick?.()
      }}
    >
      <planeGeometry args={geometryArgs} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
      ) : (
        <meshStandardMaterial color={fallbackColor} />
      )}
    </mesh>
  )
}

function MovieHoverTooltip({ point }: { readonly point: TSNEPoint }) {
  const groupRef = useRef<THREE.Group>(null)
  const meta = point.metadata as MovieMetadata

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(point.x, (point.z ?? 0) + 1.8, -point.y)
  })

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.88)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '160px',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{meta?.title ?? '-'}</div>
          <div style={{ color: '#d1d5db', fontSize: '11px' }}>
            {meta?.year} · {meta?.genre}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: 2 }}>
            Rating {meta?.rating?.toFixed(1)} · Box office ${meta?.boxOffice?.toFixed(0)}M
          </div>
          <div style={{ color: '#6b7280', fontSize: '10px', marginTop: 2 }}>Click for details</div>
        </div>
      </Html>
    </group>
  )
}

function CountryHoverTooltip({ point }: { readonly point: TSNEPoint }) {
  const groupRef = useRef<THREE.Group>(null)
  const meta = point.metadata as CountryMetadata

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(point.x, (point.z ?? 0) + 1.4, -point.y)
  })

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.88)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '160px',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{meta?.name ?? point.label ?? '-'}</div>
          <div style={{ color: '#d1d5db', fontSize: '11px' }}>
            {meta?.region || 'Unknown region'}
            {meta?.subregion ? ` · ${meta.subregion}` : ''}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: 2 }}>
            {meta?.cca2 || '--'} / {meta?.cca3 || '---'}
          </div>
          <div style={{ color: '#6b7280', fontSize: '10px', marginTop: 2 }}>Click for details</div>
        </div>
      </Html>
    </group>
  )
}

function CloudHoverTooltip({ point }: { readonly point: TSNEPoint }) {
  const groupRef = useRef<THREE.Group>(null)
  const meta = point.metadata as CloudMetadata

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.position.set(point.x, (point.z ?? 0) + 1.4, -point.y)
  })

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={12} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.88)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '180px',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{meta?.label ?? point.label ?? '-'}</div>
          <div style={{ color: '#d1d5db', fontSize: '11px', textTransform: 'uppercase' }}>
            {meta?.provider || 'Unknown provider'}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: 2 }}>
            {meta?.tags?.slice(0, 4).join(', ')}
          </div>
          <div style={{ color: '#6b7280', fontSize: '10px', marginTop: 2 }}>Click for details</div>
        </div>
      </Html>
    </group>
  )
}

function CountryDetailModal({
  country,
  onClose,
}: {
  readonly country: CountryMetadata
  readonly onClose: () => void
}) {
  const numberFormatter = new Intl.NumberFormat('en-US')
  const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  })

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{country.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{country.officialName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {country.capital && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">Capital</div>
              <div className="font-semibold text-gray-900 dark:text-white">{country.capital}</div>
            </div>
          )}
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">CCA2</div>
            <div className="font-semibold text-gray-900 dark:text-white">{country.cca2 || '--'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">CCA3</div>
            <div className="font-semibold text-gray-900 dark:text-white">{country.cca3 || '---'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Region</div>
            <div className="font-semibold text-gray-900 dark:text-white">{country.region || 'Unknown'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Subregion</div>
            <div className="font-semibold text-gray-900 dark:text-white">{country.subregion || 'Unknown'}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Latitude</div>
            <div className="font-semibold text-gray-900 dark:text-white">{country.latitude}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Longitude</div>
            <div className="font-semibold text-gray-900 dark:text-white">{country.longitude}</div>
          </div>
          {typeof country.population === 'number' && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">Population</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {numberFormatter.format(country.population)}
              </div>
            </div>
          )}
          {typeof country.gdpCurrentUsd === 'number' && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">GDP</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                ${compactCurrencyFormatter.format(country.gdpCurrentUsd)}
              </div>
            </div>
          )}
          {country.languages && country.languages.length > 0 && (
            <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">Languages</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {country.languages.join(', ')}
              </div>
            </div>
          )}
          {country.majorityReligion && (
            <div className="col-span-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">Majority religion</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {country.majorityReligion}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CloudDetailModal({
  item,
  onClose,
}: {
  readonly item: CloudMetadata
  readonly onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{item.label}</h2>
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.provider}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">Description</div>
            <div className="font-semibold text-gray-900 dark:text-white">{item.description}</div>
          </div>
          {item.tags.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="text-gray-500 dark:text-gray-400">Tags</div>
              <div className="font-semibold text-gray-900 dark:text-white">{item.tags.join(', ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryPoints({
  points,
  color,
}: {
  readonly points: TSNEState['points']
  readonly color: string
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const tempObject = new THREE.Object3D()
    points.forEach((point, index) => {
      tempObject.position.set(point.x, point.z ?? 0, -point.y)
      tempObject.updateMatrix()
      meshRef.current?.setMatrixAt(index, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  )
}

function DataPoints({
  points,
  onClickMovie,
  onClickCountry,
  onClickCloud,
}: {
  readonly points: TSNEState['points']
  readonly onClickMovie?: (meta: MovieMetadata) => void
  readonly onClickCountry?: (meta: CountryMetadata) => void
  readonly onClickCloud?: (meta: CloudMetadata) => void
}) {
  const [hoveredPoint, setHoveredPoint] = useState<TSNEPoint | null>(null)

  const pointKind = useMemo<'movie' | 'country' | 'cloud' | 'default'>(() => {
    if (points.length === 0) return 'default'
    if (isMoviePoint(points[0])) return 'movie'
    if (isCountryPoint(points[0])) return 'country'
    if (isCloudPoint(points[0])) return 'cloud'
    return 'default'
  }, [points])

  const pointsByCategory = useMemo(() => {
    if (pointKind !== 'default') return {}
    const grouped: Record<string, TSNEState['points']> = {}
    for (const point of points) {
      const category = point.category || 'Unknown'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(point)
    }
    return grouped
  }, [points, pointKind])

  if (pointKind === 'movie') {
    return (
      <>
        {points.map((point) => (
          <TSNESpriteBillboard
            key={point.originalIndex}
            point={point}
            kind="movie"
            fallbackColor={CATEGORY_COLORS[point.category || 'Unknown'] || '#6b7280'}
            onHover={setHoveredPoint}
            onClick={() => onClickMovie?.(point.metadata as MovieMetadata)}
          />
        ))}
        {hoveredPoint && <MovieHoverTooltip point={hoveredPoint} />}
      </>
    )
  }

  if (pointKind === 'country') {
    return (
      <>
        {points.map((point) => (
          <TSNESpriteBillboard
            key={point.originalIndex}
            point={point}
            kind="country"
            fallbackColor={CATEGORY_COLORS[point.category || 'Unknown'] || '#6b7280'}
            onHover={setHoveredPoint}
            onClick={() => onClickCountry?.(point.metadata as CountryMetadata)}
          />
        ))}
        {hoveredPoint && <CountryHoverTooltip point={hoveredPoint} />}
      </>
    )
  }

  if (pointKind === 'cloud') {
    return (
      <>
        {points.map((point) => (
          <TSNESpriteBillboard
            key={point.originalIndex}
            point={point}
            kind="cloud"
            fallbackColor={CATEGORY_COLORS[point.category || 'Unknown'] || '#6b7280'}
            onHover={setHoveredPoint}
            onClick={() => onClickCloud?.(point.metadata as CloudMetadata)}
          />
        ))}
        {hoveredPoint && <CloudHoverTooltip point={hoveredPoint} />}
      </>
    )
  }

  return (
    <>
      {Object.entries(pointsByCategory).map(([category, categoryPoints]) => (
        <CategoryPoints
          key={`category-${category}`}
          points={categoryPoints}
          color={CATEGORY_COLORS[category] || '#6b7280'}
        />
      ))}
    </>
  )
}

function AxisLabels() {
  return (
    <>
      <Text position={[15, 0, 0]} fontSize={0.8} color="#ef4444" anchorX="center" anchorY="middle">
        t-SNE 1
      </Text>
      <Text position={[0, 15, 0]} fontSize={0.8} color="#10b981" anchorX="center" anchorY="middle">
        t-SNE 3
      </Text>
      <Text position={[0, 0, 15]} fontSize={0.8} color="#3b82f6" anchorX="center" anchorY="middle">
        t-SNE 2
      </Text>
    </>
  )
}

function PointLabels({
  points,
  showLabels,
}: {
  readonly points: TSNEState['points']
  readonly showLabels: boolean
}) {
  if (!showLabels) return null

  const labeledPoints = points.filter((point) => point.label && (point.originalIndex < 30 || point.metadata?.verified))

  return (
    <>
      {labeledPoints.map((point, index) => (
        <Text
          key={`label-${index}`}
          position={[point.x, (point.z || 0) + 0.3, -point.y]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {point.label}
        </Text>
      ))}
    </>
  )
}

function Scene({
  state,
  autoRotate,
  showLabels,
  onClickMovie,
  onClickCountry,
  onClickCloud,
}: {
  readonly state: TSNEState
  readonly autoRotate: boolean
  readonly showLabels: boolean
  readonly onClickMovie?: (meta: MovieMetadata) => void
  readonly onClickCountry?: (meta: CountryMetadata) => void
  readonly onClickCloud?: (meta: CloudMetadata) => void
}) {
  const controlsRef = useRef<any>(null)

  useFrame(() => {
    if (autoRotate && controlsRef.current) {
      controlsRef.current.autoRotate = true
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} />

      <DataPoints
        points={state.points}
        onClickMovie={onClickMovie}
        onClickCountry={onClickCountry}
        onClickCloud={onClickCloud}
      />

      <PointLabels points={state.points} showLabels={showLabels} />
      <axesHelper args={[12]} />
      <AxisLabels />
      <gridHelper args={[30, 30, '#444444', '#222222']} />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        minDistance={1}
        maxDistance={200}
        zoomSpeed={1.5}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function TSNE3DScene({ state, autoRotate = false, showLabels = false }: TSNE3DSceneProps) {
  const [selectedMovie, setSelectedMovie] = useState<MovieMetadata | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryMetadata | null>(null)
  const [selectedCloud, setSelectedCloud] = useState<CloudMetadata | null>(null)

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: [35, 25, 35],
          fov: 60,
          near: 0.01,
          far: 1000,
        }}
      >
        <Scene
          state={state}
          autoRotate={autoRotate}
          showLabels={showLabels}
          onClickMovie={setSelectedMovie}
          onClickCountry={setSelectedCountry}
          onClickCloud={setSelectedCloud}
        />
      </Canvas>
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
      {selectedCountry && (
        <CountryDetailModal country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      )}
      {selectedCloud && (
        <CloudDetailModal item={selectedCloud} onClose={() => setSelectedCloud(null)} />
      )}
    </div>
  )
}
