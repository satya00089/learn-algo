'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { PCAState } from '../engines/PCAEngine'

interface PCA3DSceneProps {
  readonly state: PCAState
  readonly showOriginal: boolean
  readonly showTransformed: boolean
  readonly showComponents: boolean
  readonly theme: 'light' | 'dark'
  readonly autoRotate?: boolean
}

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

function ComponentVectors({
  components,
}: {
  readonly components: Array<{ eigenvector: number[]; eigenvalue: number; explainedVariance: number }>
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
}: Omit<PCA3DSceneProps, 'theme'>) {
  const groupRef = useRef<THREE.Group>(null)

  // Auto-rotate the scene slowly (only if enabled)
  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.001
    }
  })

  const originalPoints = useMemo(
    () => state.points.map((p) => ({ x: p.original.x, y: p.original.y, z: p.original.z || 0 })),
    [state.points]
  )

  const transformedPoints = useMemo(
    () =>
      state.points.map((p) => ({
        x: p.transformed.x,
        y: p.transformed.y,
        z: p.transformed.z || 0,
      })),
    [state.points]
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
      {showOriginal && <DataPoints points={originalPoints} color="#3b82f6" opacity={0.6} />}
      {showTransformed && <DataPoints points={transformedPoints} color="#ef4444" opacity={1} />}

      {/* Component vectors */}
      {showComponents && state.components.length > 0 && (
        <ComponentVectors components={state.components} />
      )}
    </group>
  )
}

export function PCA3DScene({
  state,
  showOriginal,
  showTransformed,
  showComponents,
  theme,
  autoRotate = false,
}: PCA3DSceneProps) {
  const backgroundColor = theme === 'dark' ? '#1f2937' : '#ffffff'

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [3, 3, 3], fov: 50 }} style={{ background: backgroundColor }}>
        <Scene
          state={state}
          showOriginal={showOriginal}
          showTransformed={showTransformed}
          showComponents={showComponents}
          autoRotate={autoRotate}
        />
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={10} />
      </Canvas>

      {/* Step info overlay */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
        Step {state.currentStep}/{state.totalSteps}: {state.stepDescription}
      </div>

      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm font-mono">
        3D Interactive View - Drag to rotate, scroll to zoom
      </div>
    </div>
  )
}
