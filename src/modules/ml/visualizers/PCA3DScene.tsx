// @ts-nocheck
'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PCAState } from '../engines/PCAEngine'
import type { MovieMetadata } from '../data/movieDataLoader'

interface PCA3DSceneProps {
  readonly state: PCAState
  readonly showOriginal: boolean
  readonly showTransformed: boolean
  readonly showComponents: boolean
  readonly theme: 'light' | 'dark'
  readonly autoRotate?: boolean
  readonly usePosterSprites?: boolean // Toggle between spheres and movie posters
}

// ─── Sprite Sheet System ──────────────────────────────────────────────────────
// 1. Fetch manifest.json once  → maps tmdbId → {sheet_url, x, y, w, h}
// 2. Fetch each sheet image once → browser caches it (6 requests for 561 movies)
// 3. Per sprite: canvas-crop the poster rect from the cached sheet HTMLImageElement
// Net result: 6 S3 GETs instead of 500+; zero GPU texture duplication.

interface SpriteEntry {
  sheet_url: string
  x: number
  y: number
  w: number
  h: number
  sheet_index: number
}

// Module-level singletons — survive re-renders and HMR
const spriteManifest = new Map<string, SpriteEntry>()        // tmdbId str → entry
const sheetImageCache = new Map<string, HTMLImageElement>()  // sheet_url  → img
const posterTextureCache = new Map<number, THREE.Texture>()  // tmdbId num → texture

let manifestPromise: Promise<void> | null = null

function loadManifest(): Promise<void> {
  if (manifestPromise) return manifestPromise
  const url = process.env.NEXT_PUBLIC_SPRITE_MANIFEST_URL
  if (!url) { manifestPromise = Promise.resolve(); return manifestPromise }
  manifestPromise = fetch(url)
    .then((r) => r.json())
    .then((data: Record<string, SpriteEntry>) => {
      for (const [id, entry] of Object.entries(data)) {
        spriteManifest.set(id, entry)
      }
      const sheets = new Set([...spriteManifest.values()].map((e) => e.sheet_url)).size
      console.log(`🎬 Sprite manifest: ${spriteManifest.size} movies across ${sheets} sheets`)
    })
    .catch((e) => console.error('Failed to load sprite manifest', e))
  return manifestPromise
}

function loadSheetImage(sheetUrl: string): Promise<HTMLImageElement> {
  if (sheetImageCache.has(sheetUrl)) return Promise.resolve(sheetImageCache.get(sheetUrl)!)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      sheetImageCache.set(sheetUrl, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = sheetUrl
  })
}

async function loadPosterTexture(tmdbId: number): Promise<THREE.Texture | null> {
  if (posterTextureCache.has(tmdbId)) return posterTextureCache.get(tmdbId)!
  await loadManifest()
  const entry = spriteManifest.get(String(tmdbId))
  if (!entry) return null
  const img = await loadSheetImage(entry.sheet_url)
  const canvas = document.createElement('canvas')
  canvas.width = entry.w
  canvas.height = entry.h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, entry.x, entry.y, entry.w, entry.h, 0, 0, entry.w, entry.h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  posterTextureCache.set(tmdbId, tex)
  return tex
}

// Eagerly kick off manifest fetch the moment this module is parsed
loadManifest()

// Movie poster sprite component
function MoviePosterSprite({
  position,
  tmdbId,
  title,
  onHover,
  onClick,
}: {
  position: [number, number, number]
  tmdbId: number
  title: string
  onHover?: (hovered: boolean) => void
  onClick?: () => void
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  // Crop poster from shared cached sheet image — no individual S3 requests
  useEffect(() => {
    if (!tmdbId) return
    let cancelled = false
    loadPosterTexture(tmdbId).then((tex) => {
      if (!cancelled && tex) setTexture(tex)
    })
    return () => { cancelled = true }
  }, [tmdbId])

  // Billboard effect - always face camera
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
  })

  const handlePointerOver = () => {
    setHovered(true)
    onHover?.(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    onHover?.(false)
    document.body.style.cursor = 'default'
  }

  const scale = hovered ? 0.35 : 0.3 // Poster size (width scale)

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={onClick}
    >
      {/* Poster plane with 2:3 aspect ratio */}
      <planeGeometry args={[scale, scale * 1.5]} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
      ) : (
        // Fallback for missing posters
        <meshStandardMaterial
          color={hovered ? '#60a5fa' : '#3b82f6'}
          emissive={hovered ? '#1e40af' : '#1e3a8a'}
          emissiveIntensity={0.3}
        />
      )}
      {/* Border highlight when hovered */}
      {hovered && (
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(scale, scale * 1.5)]} />
          <lineBasicMaterial attach="material" color="#fbbf24" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  )
}

// Standard sphere data points
function DataPoints({
  points,
  color,
  opacity = 1,
}: {
  readonly points: Array<{ x: number; y: number; z?: number }>
  readonly color: string
  readonly opacity?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    if (!meshRef.current) return

    const tempObject = new THREE.Object3D()
    points.forEach((point, i) => {
      // Coordinate transformation for intuitive 3D visualization:
      // Data x → Three.js x (horizontal axis)
      // Data y → Three.js -z (depth axis, negated for proper orientation)
      // Data z → Three.js y (vertical axis)
      // This ensures PC1/PC2/PC3 align naturally with x/y/z axes for better understanding
      tempObject.position.set(point.x, point.z || 0, -point.y)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [points])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </instancedMesh>
  )
}

// Movie posters as sprites — no poster cap; sheets are shared and browser-cached
function MoviePosterPoints({
  points,
  onPosterClick,
}: {
  readonly points: Array<{
    x: number
    y: number
    z?: number
    metadata?: MovieMetadata
  }>
  readonly onPosterClick?: (metadata: MovieMetadata) => void
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // All movies with a tmdbId — manifest lookup is O(1), sheets shared across sprites
  const visiblePoints = useMemo(() => {
    const withMeta = points.filter((p) => (p.metadata as MovieMetadata)?.tmdbId)
    withMeta.sort((a, b) => {
      const ma = a.metadata as MovieMetadata
      const mb = b.metadata as MovieMetadata
      return (mb.popularity || 0) - (ma.popularity || 0)
    })
    return withMeta
  }, [points])

  return (
    <>
      {visiblePoints.map((point, index) => {
        const metadata = point.metadata as MovieMetadata
        return (
          <MoviePosterSprite
            key={`poster-${metadata.tmdbId || index}`}
            position={[point.x, point.z || 0, -point.y]}
            tmdbId={metadata.tmdbId}
            title={metadata.title}
            onHover={(hovered) => setHoveredIndex(hovered ? index : null)}
            onClick={() => metadata && onPosterClick?.(metadata)}
          />
        )
      })}
      {/* Tooltip for hovered poster */}
      {hoveredIndex !== null && visiblePoints[hoveredIndex]?.metadata && (
        <Html position={[visiblePoints[hoveredIndex].x, visiblePoints[hoveredIndex].z || 0, -visiblePoints[hoveredIndex].y]}>
          <div className="pointer-events-none bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl transform -translate-y-16">
            <div className="font-semibold">{(visiblePoints[hoveredIndex].metadata as MovieMetadata).title}</div>
            <div className="text-xs text-gray-300 mt-1">
              {(visiblePoints[hoveredIndex].metadata as MovieMetadata).year} · {(visiblePoints[hoveredIndex].metadata as MovieMetadata).genre}
            </div>
            <div className="text-xs text-gray-400">
              ⭐ {(visiblePoints[hoveredIndex].metadata as MovieMetadata).rating.toFixed(1)} · 💰 $
              {(visiblePoints[hoveredIndex].metadata as MovieMetadata).boxOffice.toFixed(0)}M
            </div>
          </div>
        </Html>
      )}
    </>
  )
}

function ComponentVectors({
  components,
}: {
  readonly components: Array<{
    eigenvector: number[]
    eigenvalue: number
    explainedVariance: number
  }>
}) {
  const colors = ['#10b981', '#f59e0b', '#ef4444']

  return (
    <>
      {components.map((component, index) => {
        const [vx, vy, vz = 0] = component.eigenvector
        const length = Math.sqrt(component.eigenvalue) * 2

        // Apply same coordinate transformation as data points for consistent visualization
        // Data eigenvector x → Three.js x, y → -z, z → y
        const mappedX = vx * length
        const mappedY = vz * length
        const mappedZ = -vy * length

        // For cylinder rotation, we need to align it with the vector direction
        const direction = new THREE.Vector3(mappedX, mappedY, mappedZ)
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0), // cylinder default orientation
          direction.clone().normalize()
        )

        return (
          <group key={`pc-${index}`}>
            {/* Arrow shaft - positioned and rotated */}
            <mesh position={[mappedX / 2, mappedY / 2, mappedZ / 2]} quaternion={quaternion}>
              <cylinderGeometry args={[0.02, 0.02, length, 8]} />
              <meshStandardMaterial color={colors[index]} />
            </mesh>

            {/* Arrow head - positioned and rotated */}
            <mesh position={[mappedX, mappedY, mappedZ]} quaternion={quaternion}>
              <coneGeometry args={[0.08, 0.15, 8]} />
              <meshStandardMaterial color={colors[index]} />
            </mesh>

            {/* Label */}
            <Text
              position={[mappedX + 0.2, mappedY + 0.2, mappedZ + 0.2]}
              fontSize={0.15}
              color={colors[index]}
              anchorX="center"
              anchorY="middle"
            >
              PC{index + 1} ({(component.explainedVariance * 100).toFixed(1)}%)
            </Text>
          </group>
        )
      })}
    </>
  )
}

function AxisLabels() {
  return (
    <>
      <Text position={[2.5, 0, 0]} fontSize={0.2} color="#ef4444">
        X
      </Text>
      <Text position={[0, 2.5, 0]} fontSize={0.2} color="#10b981">
        Y
      </Text>
      <Text position={[0, 0, 2.5]} fontSize={0.2} color="#3b82f6">
        Z
      </Text>
    </>
  )
}

function Scene({
  state,
  showOriginal,
  showTransformed,
  showComponents,
  autoRotate = false,
  usePosterSprites = false,
  onPosterClick,
}: Omit<PCA3DSceneProps, 'theme'> & {
  onPosterClick?: (metadata: MovieMetadata) => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  // Auto-rotate the scene slowly (only if enabled)
  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  const originalPoints = useMemo(
    () => state.points.map((p) => ({ ...p.original, metadata: (p as any).metadata })),
    [state]
  )

  const transformedPoints = useMemo(
    () =>
      state.points.map((p) => ({
        x: p.transformed.x,
        y: p.transformed.y,
        z: p.transformed.z || 0,
        metadata: (p as any).metadata,
      })),
    [state]
  )

  return (
    <group ref={groupRef}>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <directionalLight position={[-10, -10, -5]} intensity={0.4} />

      {/* Grid */}
      <Grid
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#9ca3af"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Axes */}
      <axesHelper args={[2]} />
      <AxisLabels />

      {/* Original data points */}
      {showOriginal && !usePosterSprites && (
        <DataPoints points={originalPoints} color="#3b82f6" opacity={0.6} />
      )}

      {/* Transformed points - spheres or movie posters */}
      {showTransformed && (
        <>
          {usePosterSprites ? (
            <MoviePosterPoints points={transformedPoints} onPosterClick={onPosterClick} />
          ) : (
            <DataPoints points={transformedPoints} color="#ef4444" opacity={1} />
          )}
        </>
      )}

      {/* Component vectors */}
      {showComponents && state.components.length > 0 && (
        <ComponentVectors components={state.components} />
      )}
    </group>
  )
}

// Modal that crops the poster from the sprite sheet (same source as 3D sprites)
function MovieDetailModal({ movie, onClose }: { movie: MovieMetadata; onClose: () => void }) {
  const [posterSrc, setPosterSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadManifest().then(() => {
      const entry = spriteManifest.get(String(movie.tmdbId))
      if (!entry) return
      // Sheet may already be loaded; if not, loadSheetImage fetches it once
      loadSheetImage(entry.sheet_url).then((img) => {
        if (cancelled) return
        const canvas = document.createElement('canvas')
        canvas.width = entry.w
        canvas.height = entry.h
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, entry.x, entry.y, entry.w, entry.h, 0, 0, entry.w, entry.h)
        setPosterSrc(canvas.toDataURL('image/jpeg', 0.92))
      })
    })
    return () => { cancelled = true }
  }, [movie.tmdbId])

  return (
    <div
      className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          {posterSrc ? (
            <img src={posterSrc} alt={movie.title} className="w-24 h-36 object-cover rounded flex-shrink-0" />
          ) : (
            <div className="w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 animate-pulse" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{movie.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {movie.year} · {movie.allGenres}
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-gray-700 dark:text-gray-200">⭐ Rating: {movie.rating}/10</p>
              <p className="text-gray-700 dark:text-gray-200">💰 Box Office: ${movie.boxOffice.toFixed(0)}M</p>
              <p className="text-gray-700 dark:text-gray-200">💵 Budget: ${movie.budget.toFixed(0)}M</p>
              <p className="text-gray-700 dark:text-gray-200">⏱️ Runtime: {movie.runtime} min</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export function PCA3DScene({
  state,
  showOriginal,
  showTransformed,
  showComponents,
  theme,
  autoRotate = false,
  usePosterSprites = false,
}: PCA3DSceneProps) {
  const [selectedMovie, setSelectedMovie] = useState<MovieMetadata | null>(null)
  const backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }} style={{ background: backgroundColor }}>
        <Scene
          state={state}
          showOriginal={showOriginal}
          showTransformed={showTransformed}
          showComponents={showComponents}
          autoRotate={autoRotate}
          usePosterSprites={usePosterSprites}
          onPosterClick={setSelectedMovie}
        />
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={20} />
      </Canvas>

      {/* Step info overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
        Step {state.currentStep}/{state.totalSteps}: {state.stepDescription}
      </div>

      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm font-mono">
        3D Interactive View - Drag to rotate, scroll to zoom
      </div>

      {/* Movie details modal */}
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  )
}
