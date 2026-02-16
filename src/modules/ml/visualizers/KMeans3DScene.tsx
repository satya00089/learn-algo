'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { KMeansState } from '../engines/KMeansClusteringEngine'

interface KMeans3DSceneProps {
  readonly state: KMeansState
  readonly showPoints: boolean
  readonly showCentroids: boolean
  readonly showTrajectories: boolean
  readonly theme: 'light' | 'dark'
  readonly autoRotate?: boolean
}

function ClusterPoints({
  points,
  clusterId,
  opacity = 1,
}: {
  readonly points: Array<{ x: number; y: number; z?: number }>
  readonly clusterId: number
  readonly opacity?: number
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Cluster colors matching the 2D visualization
  const clusterColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ]

  const color = clusterColors[clusterId % clusterColors.length] || '#gray'

  useEffect(() => {
    if (!meshRef.current) return

    const tempObject = new THREE.Object3D()
    points.forEach((point, i) => {
      // Coordinate transformation for intuitive 3D visualization:
      // Data x → Three.js x (horizontal axis)
      // Data y → Three.js -z (depth axis, negated for proper orientation)
      // Data z → Three.js y (vertical axis)
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

function DataPoints({
  points,
  opacity = 1,
}: {
  readonly points: Array<{ x: number; y: number; z?: number; clusterId: number }>
  readonly opacity?: number
}) {
  // Group points by cluster
  const pointsByCluster = useMemo(() => {
    const grouped: Record<number, Array<{ x: number; y: number; z?: number }>> = {}
    points.forEach(point => {
      const clusterId = point.clusterId
      if (!grouped[clusterId]) {
        grouped[clusterId] = []
      }
      grouped[clusterId].push({ x: point.x, y: point.y, z: point.z || 0 })
    })
    return grouped
  }, [points])

  return (
    <>
      {Object.entries(pointsByCluster).map(([clusterIdStr, clusterPoints]) => {
        const clusterId = Number.parseInt(clusterIdStr)
        return (
          <ClusterPoints
            key={`cluster-${clusterId}`}
            points={clusterPoints}
            clusterId={clusterId}
            opacity={opacity}
          />
        )
      })}
    </>
  )
}

function Centroids({
  centroids,
}: {
  readonly centroids: Array<{ x: number; y: number; z?: number; clusterId: number }>
}) {
  // Cluster colors matching the 2D visualization
  const clusterColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ]

  return (
    <>
      {centroids.map((centroid, index) => {
        const color = clusterColors[centroid.clusterId % clusterColors.length] || '#gray'

        return (
          <mesh key={`centroid-${centroid.clusterId}-${index}`} position={[centroid.x, centroid.z || 0, -centroid.y]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} transparent opacity={0.8} />
          </mesh>
        )
      })}
    </>
  )
}

function CentroidTrajectories({
  trajectories,
}: {
  readonly trajectories: Map<number, Array<{ x: number; y: number; z?: number }>>
}) {
  const clusterColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ]

  return (
    <>
      {Array.from(trajectories.entries()).map(([clusterId, points]) => {
        if (points.length < 2) return null

        const transformedPoints = points.map(point => new THREE.Vector3(point.x, point.z || 0, -point.y))
        const geometry = new THREE.BufferGeometry().setFromPoints(transformedPoints)

        return (
          <line key={`trajectory-${clusterId}`}>
            <primitive object={geometry} />
            <lineBasicMaterial
              color={clusterColors[clusterId % clusterColors.length]}
              opacity={0.6}
              transparent
            />
          </line>
        )
      })}
    </>
  )
}

function AxisLabels() {
  return (
    <>
      <Text position={[3, 0, 0]} fontSize={0.2} color="#ef4444">
        X
      </Text>
      <Text position={[0, 3, 0]} fontSize={0.2} color="#10b981">
        Y
      </Text>
      <Text position={[0, 0, 3]} fontSize={0.2} color="#3b82f6">
        Z
      </Text>
    </>
  )
}

function Scene({
  state,
  showPoints,
  showCentroids,
  showTrajectories,
  autoRotate = false,
}: Omit<KMeans3DSceneProps, 'theme'>) {
  const groupRef = useRef<THREE.Group>(null)

  // Auto-rotate the scene slowly (only if enabled)
  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  const clusteredPoints = useMemo(
    () => state.points.map((p) => ({ x: p.x, y: p.y, z: p.z || 0, clusterId: p.clusterId })),
    [state.points]
  )

  const centroidPoints = useMemo(
    () => state.centroids.map((c) => ({ x: c.x, y: c.y, z: c.z || 0, clusterId: c.clusterId })),
    [state.centroids]
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

      {/* Data points */}
      {showPoints && <DataPoints points={clusteredPoints} opacity={0.8} />}

      {/* Centroids */}
      {showCentroids && <Centroids centroids={centroidPoints} />}

      {/* Centroid trajectories */}
      {showTrajectories && state.centroidTrajectories && (
        <CentroidTrajectories trajectories={state.centroidTrajectories} />
      )}
    </group>
  )
}

export function KMeans3DScene({
  state,
  showPoints,
  showCentroids,
  showTrajectories,
  theme,
  autoRotate = false,
}: KMeans3DSceneProps) {
  const backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }} style={{ background: backgroundColor }}>
        <Scene
          state={state}
          showPoints={showPoints}
          showCentroids={showCentroids}
          showTrajectories={showTrajectories}
          autoRotate={autoRotate}
        />
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={20} />
      </Canvas>

      {/* Step info overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
        Iteration {state.iteration}/{state.isConverged ? 'Converged' : 'Running'} • Phase: {state.phase}
      </div>

      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm font-mono">
        3D K-Means Clustering - Drag to rotate, scroll to zoom
      </div>
    </div>
  )
}