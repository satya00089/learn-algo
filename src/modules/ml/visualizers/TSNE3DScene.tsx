// @ts-nocheck
'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { TSNEState } from '../engines/TSNEEngine'

interface TSNE3DSceneProps {
  readonly state: TSNEState
  readonly autoRotate?: boolean
  readonly showLabels?: boolean
}

function CategoryPoints({
  points,
  category,
  color,
}: {
  readonly points: Array<{ x: number; y: number; z?: number }>
  readonly category: string
  readonly color: string
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    if (!meshRef.current) return

    const tempObject = new THREE.Object3D()
    points.forEach((point, i) => {
      // Transform coordinates for 3D visualization
      tempObject.position.set(point.x, point.z || 0, -point.y)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [points])

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

function DataPoints({ points }: { readonly points: TSNEState['points'] }) {
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
  }

  // Group points by category
  const pointsByCategory = useMemo(() => {
    const grouped: Record<string, Array<{ x: number; y: number; z?: number }>> = {}

    points.forEach((point) => {
      const category = point.category || 'Unknown'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push({
        x: point.x,
        y: point.y,
        z: point.z || 0,
      })
    })

    return grouped
  }, [points])

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
}: {
  readonly state: TSNEState
  readonly autoRotate: boolean
  readonly showLabels: boolean
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
      <DataPoints points={state.points} />

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
        minDistance={5}
        maxDistance={40}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function TSNE3DScene({ state, autoRotate = false, showLabels = false }: TSNE3DSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [20, 15, 20],
          fov: 50,
        }}
      >
        <Scene state={state} autoRotate={autoRotate} showLabels={showLabels} />
      </Canvas>
    </div>
  )
}
