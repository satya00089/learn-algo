// @ts-nocheck
'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { TSNEState, TSNEPoint } from '../engines/TSNEEngine'
import { loadPosterTexture, MovieDetailModal } from './PCA3DScene'
import type { MovieMetadata } from '../data/movieDataLoader'

interface TSNE3DSceneProps {
  readonly state: TSNEState
  readonly autoRotate?: boolean
  readonly showLabels?: boolean
}

/* --- Movie poster billboard — follows live t-SNE position every frame --- */
function TSNEMoviePoster({
  point,
  fallbackColor,
  onHover,
  onClick,
}: {
  readonly point: TSNEPoint
  readonly fallbackColor: string
  readonly onHover?: (pt: TSNEPoint | null) => void
  readonly onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const tmdbId = point.metadata?.tmdbId as number | undefined
    if (!tmdbId) return
    let alive = true
    loadPosterTexture(tmdbId).then((tex) => {
      if (alive && tex) setTexture(tex)
    })
    return () => {
      alive = false
    }
  }, [point.metadata?.tmdbId])

  // Update position, face camera, and apply hover scale every frame
  useFrame(({ camera }) => {
    if (!meshRef.current) return
    meshRef.current.position.set(point.x, point.z ?? 0, -point.y)
    meshRef.current.lookAt(camera.position)
    const target = hovered ? 1.5 : 1
    meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15)
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        onHover?.(point)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        onHover?.(null)
        document.body.style.cursor = 'default'
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      <planeGeometry args={[0.8, 1.2]} />
      {texture ? (
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
      ) : (
        <meshStandardMaterial color={fallbackColor} />
      )}
    </mesh>
  )
}

/* --- Tooltip that tracks a live-animated TSNEPoint position --- */
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
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{meta?.title ?? '—'}</div>
          <div style={{ color: '#d1d5db', fontSize: '11px' }}>
            {meta?.year} · {meta?.genre}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: 2 }}>
            ⭐ {meta?.rating?.toFixed(1)} · 💰 ${meta?.boxOffice?.toFixed(0)}M
          </div>
          <div style={{ color: '#6b7280', fontSize: '10px', marginTop: 2 }}>
            Click for details
          </div>
        </div>
      </Html>
    </group>
  )
}

function CategoryPoints({
  points,
  category,
  color,
}: {
  readonly points: TSNEState['points']
  readonly category: string
  readonly color: string
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // useFrame runs every RAF — reads the CURRENT (mutated) x/y/z from TSNEPoint
  // objects directly, so the 3D scene updates every frame without needing React
  // state/props changes to trigger a re-render.
  useFrame(() => {
    if (!meshRef.current) return
    const tempObject = new THREE.Object3D()
    points.forEach((point, i) => {
      tempObject.position.set(point.x, point.z ?? 0, -point.y)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
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
}: {
  readonly points: TSNEState['points']
  readonly onClickMovie?: (meta: MovieMetadata) => void
}) {
  const [hoveredPoint, setHoveredPoint] = useState<TSNEPoint | null>(null)
  // Define category colors
  const categoryColors: Record<string, string> = {
    // Twitter
    Tech: '#3b82f6',
    Politics: '#dc2626',
    Entertainment: '#f59e0b',
    Sports: '#10b981',
    Business: '#8b5cf6',
    Science: '#06b6d4',
    Gaming: '#ec4899',
    Art: '#f97316',
    // Crypto
    Bitcoin: '#f7931a',
    Ethereum: '#627eea',
    DeFi: '#00d4aa',
    'Meme Coins': '#ff6b9d',
    Stablecoins: '#26a17b',
    NFT: '#ff4785',
    Layer2: '#a855f7',
    // News
    Technology: '#3b82f6',
    Health: '#10b981',
    Climate: '#059669',
    Economy: '#8b5cf6',
    // Music
    Pop: '#ff6b9d',
    Rock: '#ef4444',
    'Hip-Hop': '#f59e0b',
    Electronic: '#8b5cf6',
    Classical: '#0891b2',
    Jazz: '#d97706',
    Country: '#ea580c',
    'R&B': '#ec4899',
    // GitHub
    Web: '#3b82f6',
    'ML/AI': '#8b5cf6',
    DevOps: '#10b981',
    Mobile: '#f59e0b',
    Data: '#06b6d4',
    Security: '#dc2626',
    Blockchain: '#f7931a',
    // NBA
    'Point Guards': '#3b82f6',
    'Shooting Guards': '#ef4444',
    'Small Forwards': '#10b981',
    'Power Forwards': '#f59e0b',
    Centers: '#8b5cf6',
    Shooters: '#ec4899',
    Defenders: '#14b8a6',
    Playmakers: '#f97316',
    // Movies (TMDB genres)
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

  // Group points by category — store actual TSNEPoint references so useFrame
  // can read live (mutated) x/y/z values without stale coordinate copies.
  // useMemo runs once (categories are fixed for a given dataset run).
  const isMovieData = useMemo(
    () => points.length > 0 && !!points[0].metadata?.tmdbId,
    [points],
  )

  const pointsByCategory = useMemo(() => {
    if (isMovieData) return {} // not needed for movie poster rendering
    const grouped: Record<string, TSNEState['points']> = {}
    for (const point of points) {
      const category = point.category || 'Unknown'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(point) // push TSNEPoint reference, not a copy
    }
    return grouped
  }, [points, isMovieData])

  // Movie data: render individual poster billboard sprites
  if (isMovieData) {
    return (
      <>
        {points.map((point) => (
          <TSNEMoviePoster
            key={point.originalIndex}
            point={point}
            fallbackColor={categoryColors[point.category || 'Unknown'] || '#6b7280'}
            onHover={setHoveredPoint}
            onClick={() => onClickMovie?.(point.metadata as MovieMetadata)}
          />
        ))}
        {hoveredPoint && <MovieHoverTooltip point={hoveredPoint} />}
      </>
    )
  }

  // MNIST / other: instanced sphere rendering grouped by category
  return (
    <>
      {Object.entries(pointsByCategory).map(([category, categoryPoints]) => {
        const color = categoryColors[category] || '#6b7280'
        return (
          <CategoryPoints
            key={`category-${category}`}
            points={categoryPoints}
            category={category}
            color={color}
          />
        )
      })}
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

  // Only show labels for named points
  const labeledPoints = points.filter(
    (p) => p.label && (p.originalIndex < 30 || p.metadata?.verified)
  )

  return (
    <>
      {labeledPoints.map((point, idx) => (
        <Text
          key={`label-${idx}`}
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
}: {
  readonly state: TSNEState
  readonly autoRotate: boolean
  readonly showLabels: boolean
  readonly onClickMovie?: (meta: MovieMetadata) => void
}) {
  const controlsRef = useRef<any>(null)

  useFrame(() => {
    if (autoRotate && controlsRef.current) {
      controlsRef.current.autoRotate = true
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} />

      {/* Data points */}
      <DataPoints points={state.points} onClickMovie={onClickMovie} />

      {/* Point labels */}
      <PointLabels points={state.points} showLabels={showLabels} />

      {/* Axes */}
      <axesHelper args={[12]} />
      <AxisLabels />

      {/* Grid */}
      <gridHelper args={[30, 30, '#444444', '#222222']} />

      {/* Camera controls */}
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

  return (
    <div className="w-full h-full relative">
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
        />
      </Canvas>
      {selectedMovie && (
        <MovieDetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  )
}
