// @ts-nocheck
'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
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

// Movie poster sprite component
function MoviePosterSprite({
  position,
  posterUrl,
  title,
  onHover,
  onClick,
}: {
  position: [number, number, number]
  posterUrl: string
  title: string
  onHover?: (hovered: boolean) => void
  onClick?: () => void
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  // Load texture
  useEffect(() => {
    if (!posterUrl) return

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      posterUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.warn(`Failed to load poster: ${posterUrl}`, error)
      }
    )
  }, [posterUrl])

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

// Movie posters as sprites
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

  return (
    <>
      {points.map((point, index) => {
        const metadata = point.metadata as MovieMetadata
        if (!metadata?.posterUrl) return null

        return (
          <MoviePosterSprite
            key={`poster-${metadata.tmdbId || index}`}
            position={[point.x, point.z || 0, -point.y]}
            posterUrl={metadata.posterUrl}
            title={metadata.title}
            onHover={(hovered) => setHoveredIndex(hovered ? index : null)}
            onClick={() => metadata && onPosterClick?.(metadata)}
          />
        )
      })}
      {/* Tooltip for hovered poster */}
      {hoveredIndex !== null && points[hoveredIndex]?.metadata && (
        <Html
          position={[points[hoveredIndex].x, points[hoveredIndex].z || 0, -points[hoveredIndex].y]}
        >
          <div className="pointer-events-none bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl transform -translate-y-16">
            <div className="font-semibold">
              {(points[hoveredIndex].metadata as MovieMetadata).title}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {(points[hoveredIndex].metadata as MovieMetadata).year} ·{' '}
              {(points[hoveredIndex].metadata as MovieMetadata).genre}
            </div>
            <div className="text-xs text-gray-400">
              ⭐ {(points[hoveredIndex].metadata as MovieMetadata).rating.toFixed(1)} · 💰 $
              {(points[hoveredIndex].metadata as MovieMetadata).boxOffice.toFixed(0)}M
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

        const mappedX = vx * length
        const mappedY = vz * length
        const mappedZ = -vy * length

        const direction = new THREE.Vector3(mappedX, mappedY, mappedZ)
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())

        return (
          <group key={`pc-${index}`}>
            <mesh position={[mappedX / 2, mappedY / 2, mappedZ / 2]} quaternion={quaternion}>
              <cylinderGeometry args={[0.02, 0.02, length, 8]} />
              <meshStandardMaterial color={colors[index]} />
            </mesh>
            <mesh position={[mappedX, mappedY, mappedZ]} quaternion={quaternion}>
              <coneGeometry args={[0.08, 0.15, 8]} />
              <meshStandardMaterial color={colors[index]} />
            </mesh>
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

  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  const originalPoints = useMemo(
    () => state.points.map((p) => ({ ...p.original, metadata: (p as any).metadata })),
    [state.points]
  )

  const transformedPoints = useMemo(
    () =>
      state.points.map((p) => ({
        x: p.transformed.x,
        y: p.transformed.y,
        z: p.transformed.z || 0,
        metadata: (p as any).metadata,
      })),
    [state.points]
  )

  const has3DComponents = state.components.length >= 3

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[-10, -10, -10]} intensity={0.4} />

      <group ref={groupRef}>
        {/* Original data points */}
        {showOriginal && !usePosterSprites && (
          <DataPoints points={originalPoints} color="#94a3b8" opacity={0.4} />
        )}

        {/* Transformed points - spheres or movie posters */}
        {showTransformed && (
          <>
            {usePosterSprites ? (
              <MoviePosterPoints points={transformedPoints} onPosterClick={onPosterClick} />
            ) : (
              <DataPoints points={transformedPoints} color="#3b82f6" opacity={1} />
            )}
          </>
        )}

        {/* Principal component vectors */}
        {showComponents && state.components.length > 0 && (
          <ComponentVectors components={state.components} />
        )}

        {/* 3D Grid */}
        {has3DComponents && (
          <>
            <Grid args={[10, 10]} cellColor="#64748b" sectionColor="#475569" />
            <AxisLabels />
          </>
        )}
      </group>

      <OrbitControls
        makeDefault
        autoRotate={false}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />
    </>
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

  const bgColor = theme === 'dark' ? '#0f172a' : '#f8fafc'

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={[bgColor]} />
        <Scene
          state={state}
          showOriginal={showOriginal}
          showTransformed={showTransformed}
          showComponents={showComponents}
          autoRotate={autoRotate}
          usePosterSprites={usePosterSprites}
          onPosterClick={setSelectedMovie}
        />
      </Canvas>

      {/* Movie details modal */}
      {selectedMovie && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-4">
              {selectedMovie.posterUrl && (
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-24 h-36 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedMovie.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {selectedMovie.year} · {selectedMovie.allGenres}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-200">
                    ⭐ Rating: {selectedMovie.rating}/10
                  </p>
                  <p className="text-gray-700 dark:text-gray-200">
                    💰 Box Office: ${selectedMovie.boxOffice.toFixed(0)}M
                  </p>
                  <p className="text-gray-700 dark:text-gray-200">
                    💵 Budget: ${selectedMovie.budget.toFixed(0)}M
                  </p>
                  <p className="text-gray-700 dark:text-gray-200">
                    ⏱️ Runtime: {selectedMovie.runtime} min
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedMovie(null)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
