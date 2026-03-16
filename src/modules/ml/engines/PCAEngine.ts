import type { DataPoint } from '../types'

/**
 * PCA Engine
 * Implements Principal Component Analysis for dimensionality reduction
 */

export interface PCAPoint extends DataPoint {
  original: DataPoint // Original high-dimensional point
  transformed: DataPoint // Transformed low-dimensional point
  reconstructionError?: number // Distance from original after reconstruction
}

export interface PCAComponent {
  eigenvector: number[] // Direction vector
  eigenvalue: number // Amount of variance explained
  explainedVariance: number // Percentage of total variance
  cumulativeVariance: number // Cumulative percentage
}

export interface PCAState {
  points: PCAPoint[]
  originalPoints: DataPoint[] // Original data
  centeredPoints: DataPoint[] // Mean-centered data
  components: PCAComponent[]
  numComponents: number // Number of components to use
  isComplete: boolean
  currentStep: number
  totalSteps: number
  stepDescription: string
  // Computed values
  mean: DataPoint & { std?: number[] } // Mean with optional std for standardization
  covarianceMatrix: number[][]
  eigenvalues: number[]
  eigenvectors: number[][]
  explainedVariance: number[]
  cumulativeVariance: number[]
  totalVariance: number
}

export interface PCAConfig {
  points: DataPoint[]
  numComponents: number
}

export class PCAEngine {
  private state: PCAState

  constructor(config: PCAConfig) {
    this.state = this.initializeState(config)
  }

  private initializeState(config: PCAConfig): PCAState {
    console.log(`🚀 PCA: Initializing with ${config.points.length} points`)
    const firstPoint = config.points[0]
    if (firstPoint?.embeddings) {
      console.log(`📊 PCA: Data has embeddings array with ${firstPoint.embeddings.length} dimensions`)
      console.log(`📊 PCA: First point embeddings (first 5):`, firstPoint.embeddings.slice(0, 5))
    } else {
      console.log(`📊 PCA: Low-dimensional data (x, y, z only)`)
    }
    const points = config.points.map((p) => ({
      ...p,
      original: { ...p },
      transformed: { x: 0, y: 0 }, // Will be updated
    }))

    return {
      points,
      originalPoints: config.points,
      centeredPoints: [],
      components: [],
      numComponents: config.numComponents,
      isComplete: false,
      currentStep: 0,
      totalSteps: 5, // Center, Covariance, Eigen, Select, Transform
      stepDescription: 'Ready to start PCA',
      mean: { x: 0, y: 0 },
      covarianceMatrix: [],
      eigenvalues: [],
      eigenvectors: [],
      explainedVariance: [],
      cumulativeVariance: [],
      totalVariance: 0,
    }
  }

  // Helper to extract features from a data point
  private extractFeatures(point: DataPoint): number[] {
    // If point has embeddings array, use it (high-dimensional data)
    if (point.embeddings && Array.isArray(point.embeddings)) {
      return point.embeddings
    }
    // Otherwise use x, y, z (low-dimensional data)
    const features = [point.x, point.y]
    if (point.z !== undefined) features.push(point.z)
    return features
  }

  // Check if data is high-dimensional (has embeddings)
  private isHighDimensional(): boolean { 
    return this.state.originalPoints.length > 0 && 
           this.state.originalPoints[0].embeddings !== undefined
  }

  getState(): PCAState {
    // Return a new points array so React useMemo deps see a reference change
    // (points are mutated in-place during each step; a shallow spread would miss that)
    return {
      ...this.state,
      points: this.state.points.map((p) => ({
        ...p,
        transformed: { ...p.transformed },
      })),
    }
  }

  reset(): void {
    this.state.currentStep = 0
    this.state.isComplete = false
    this.state.stepDescription = 'Ready to start PCA'
    this.state.points.forEach((p) => {
      p.transformed = { x: 0, y: 0 }
    })
  }

  step(): boolean {
    if (this.state.isComplete) return false

    this.state.currentStep++

    switch (this.state.currentStep) {
      case 1:
        this.centerData()
        break
      case 2:
        this.computeCovariance()
        break
      case 3:
        this.computeEigen()
        break
      case 4:
        this.selectComponents()
        break
      case 5:
        this.transformData()
        this.state.isComplete = true
        break
    }

    return !this.state.isComplete
  }

  run(): void {
    while (this.step()) {
      // Continue until complete
    }
  }

  private centerData(): void {
    this.state.stepDescription = 'Centering data by subtracting mean'

    const n = this.state.originalPoints.length
    const isHighDim = this.isHighDimensional()

    if (isHighDim) {
      // High-dimensional data: compute mean of embeddings
      const firstFeatures = this.extractFeatures(this.state.originalPoints[0])
      const dim = firstFeatures.length
      const meanVector = new Array(dim).fill(0)

      // Sum all feature vectors
      for (const point of this.state.originalPoints) {
        const features = this.extractFeatures(point)
        for (let i = 0; i < dim; i++) {
          meanVector[i] += features[i]
        }
      }

      // Divide by n to get mean
      for (let i = 0; i < dim; i++) {
        meanVector[i] /= n
      }
      console.log(`📈 PCA: Computed mean vector, dim=${dim}, mean (first 5):`, meanVector.slice(0, 5))

      // Compute standard deviation for each dimension
      const stdVector = new Array(dim).fill(0)
      for (const point of this.state.originalPoints) {
        const features = this.extractFeatures(point)
        for (let i = 0; i < dim; i++) {
          const diff = features[i] - meanVector[i]
          stdVector[i] += diff * diff
        }
      }
      for (let i = 0; i < dim; i++) {
        stdVector[i] = Math.sqrt(stdVector[i] / n)
        // Avoid division by zero for constant features
        if (stdVector[i] < 1e-10) stdVector[i] = 1
      }
      console.log(`📊 PCA: Computed std vector (first 5):`, stdVector.slice(0, 5))

      // Store mean (use first 3 dims for x, y, z compatibility)
      this.state.mean = {
        x: meanVector[0] || 0,
        y: meanVector[1] || 0,
        z: meanVector[2] || 0,
        embeddings: meanVector,
        std: stdVector, // Store std for later use
      }

      // Center and standardize the data
      this.state.centeredPoints = this.state.originalPoints.map((p) => {
        const features = this.extractFeatures(p)
        const standardized = features.map((val, i) => (val - meanVector[i]) / stdVector[i])
        return {
          x: standardized[0] || 0,
          y: standardized[1] || 0,
          z: standardized[2] || 0,
          embeddings: standardized,
        }
      })
    } else {
      // Low-dimensional data: original logic
      const sum = this.state.originalPoints.reduce(
        (acc, p) => ({
          x: acc.x + p.x,
          y: acc.y + p.y,
          z: (acc.z || 0) + (p.z || 0),
        }),
        { x: 0, y: 0, z: 0 }
      )
      this.state.mean = {
        x: sum.x / n,
        y: sum.y / n,
        z: (sum.z || 0) / n,
      }

      // Center the data
      this.state.centeredPoints = this.state.originalPoints.map((p) => ({
        x: p.x - this.state.mean.x,
        y: p.y - this.state.mean.y,
        z: (p.z || 0) - (this.state.mean.z || 0),
      }))
    }
  }

  private computeCovariance(): void {
    this.state.stepDescription = 'Computing covariance matrix'

    const n = this.state.centeredPoints.length
    const isHighDim = this.isHighDimensional()

    if (isHighDim) {
      // High-dimensional covariance: use embeddings
      const firstFeatures = this.extractFeatures(this.state.centeredPoints[0])
      const dim = firstFeatures.length

      // Initialize covariance matrix
      this.state.covarianceMatrix = Array.from({ length: dim }, () => new Array(dim).fill(0))

      // Compute covariance: cov(i,j) = sum(x_i * x_j) / n
      for (const point of this.state.centeredPoints) {
        const features = this.extractFeatures(point)
        for (let i = 0; i < dim; i++) {
          for (let j = i; j < dim; j++) {
            const cov = (features[i] * features[j]) / n
            this.state.covarianceMatrix[i][j] += cov
            if (i !== j) {
              this.state.covarianceMatrix[j][i] += cov // Symmetric
            }
          }
        }
      }
      return
    }

    // Low-dimensional covariance: original logic
    const hasZ = this.state.centeredPoints.some((p) => p.z !== undefined && p.z !== 0)

    if (hasZ) {
      // 3D covariance matrix
      let sumXX = 0,
        sumXY = 0,
        sumXZ = 0
      let sumYY = 0,
        sumYZ = 0,
        sumZZ = 0

      for (const p of this.state.centeredPoints) {
        const z = p.z || 0
        sumXX += p.x * p.x
        sumXY += p.x * p.y
        sumXZ += p.x * z
        sumYY += p.y * p.y
        sumYZ += p.y * z
        sumZZ += z * z
      }

      this.state.covarianceMatrix = [
        [sumXX / n, sumXY / n, sumXZ / n],
        [sumXY / n, sumYY / n, sumYZ / n],
        [sumXZ / n, sumYZ / n, sumZZ / n],
      ]
    } else {
      // 2D covariance matrix
      let sumXX = 0,
        sumXY = 0,
        sumYY = 0

      for (const p of this.state.centeredPoints) {
        sumXX += p.x * p.x
        sumXY += p.x * p.y
        sumYY += p.y * p.y
      }

      this.state.covarianceMatrix = [
        [sumXX / n, sumXY / n],
        [sumXY / n, sumYY / n],
      ]
    }
  }

  private computeEigen(): void {
    this.state.stepDescription = 'Finding eigenvalues and eigenvectors'

    const dim = this.state.covarianceMatrix.length

    if (dim === 2) {
      // 2D case - analytical solution
      const [[a, b], [c, d]] = this.state.covarianceMatrix

      const trace = a + d
      const det = a * d - b * c

      const discriminant = trace * trace - 4 * det
      const sqrtD = Math.sqrt(Math.max(0, discriminant))

      const lambda1 = (trace + sqrtD) / 2
      const lambda2 = (trace - sqrtD) / 2

      this.state.eigenvalues = [lambda1, lambda2]
      this.state.totalVariance = lambda1 + lambda2

      // Compute eigenvectors
      this.state.eigenvectors = []

      for (const lambda of this.state.eigenvalues) {
        const matrix = [
          [a - lambda, b],
          [c, d - lambda],
        ]

        let v1 = 1,
          v2 = 0
        if (Math.abs(matrix[0][0]) > 1e-10) {
          v2 = -matrix[0][1] / matrix[0][0]
        } else if (Math.abs(matrix[1][0]) > 1e-10) {
          v2 = -matrix[1][1] / matrix[1][0]
        }

        const norm = Math.hypot(v1, v2)
        this.state.eigenvectors.push([v1 / norm, v2 / norm])
      }
    } else {
      // 3D or higher-dimensional case - use power iteration method
      this.state.eigenvectors = []
      this.state.eigenvalues = []

      const A = this.state.covarianceMatrix
      let totalVariance = 0

      // Find principal components using deflation
      // For high-dimensional data, find only as many as we need (up to numComponents)
      const numToCompute = Math.min(this.state.numComponents, dim)
      
      for (let comp = 0; comp < numToCompute; comp++) {
        const { eigenvalue, eigenvector } = this.powerIteration(A, comp)
        this.state.eigenvalues.push(eigenvalue)
        this.state.eigenvectors.push(eigenvector)
        totalVariance += eigenvalue
      }

      this.state.totalVariance = totalVariance
    }
  }

  // Power iteration method for finding dominant eigenvector
  private powerIteration(
    matrix: number[][],
    deflationCount: number
  ): { eigenvalue: number; eigenvector: number[] } {
    const dim = matrix.length

    // Create a deep copy of the matrix to avoid mutating the original
    const deflatedMatrix = matrix.map((row) => [...row])

    // Deflate for previously found eigenvectors
    for (let i = 0; i < deflationCount && i < this.state.eigenvectors.length; i++) {
      const prevEigvec = this.state.eigenvectors[i]
      const prevEigval = this.state.eigenvalues[i]

      // Deflation: A' = A - λ * v * v^T
      for (let row = 0; row < dim; row++) {
        for (let col = 0; col < dim; col++) {
          deflatedMatrix[row][col] -= prevEigval * prevEigvec[row] * prevEigvec[col]
        }
      }
    }

    let v = Array.from({ length: dim }, () => Math.random())

    // Power iteration
    for (let iter = 0; iter < 100; iter++) {
      // Multiply matrix by vector
      const newV = new Array(dim).fill(0)
      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          newV[i] += deflatedMatrix[i][j] * v[j]
        }
      }

      // Normalize
      const norm = Math.sqrt(newV.reduce((sum, val) => sum + val * val, 0))
      if (norm < 1e-10) break

      v = newV.map((val) => val / norm)
    }

    // Calculate eigenvalue (Rayleigh quotient)
    const Av = new Array(dim).fill(0)
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        Av[i] += deflatedMatrix[i][j] * v[j]
      }
    }
    const eigenvalue = v.reduce((sum, val, i) => sum + val * Av[i], 0)

    return { eigenvalue, eigenvector: v }
  }

  private selectComponents(): void {
    this.state.stepDescription = `Selecting top ${this.state.numComponents} components`

    // Sort by eigenvalue (descending)
    const indices = this.state.eigenvalues
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val)
      .map((item) => item.idx)

    this.state.components = []
    let cumulative = 0

    for (let i = 0; i < this.state.numComponents; i++) {
      const idx = indices[i]
      const eigenvalue = this.state.eigenvalues[idx]
      const eigenvector = this.state.eigenvectors[idx]
      const explained = eigenvalue / this.state.totalVariance
      cumulative += explained

      this.state.components.push({
        eigenvector: eigenvector,
        eigenvalue: eigenvalue,
        explainedVariance: explained,
        cumulativeVariance: cumulative,
      })
    }

    this.state.explainedVariance = this.state.components.map((c) => c.explainedVariance)
    this.state.cumulativeVariance = this.state.components.map((c) => c.cumulativeVariance)
  }

  private transformData(): void {
    console.log('🎯 PCA: Step 5 - Transforming data')
    this.state.stepDescription = 'Transforming data to lower dimensions'

    const isHighDim = this.isHighDimensional()
    console.log(`🔍 PCA: Using high-dimensional transform = ${isHighDim}`)

    if (isHighDim) {
      // High-dimensional transformation: project standardized embeddings onto principal components
      const meanVector = this.state.mean.embeddings || []
      const stdVector = this.state.mean.std || meanVector.map(() => 1)
      console.log(`📊 PCA: Mean vector length = ${meanVector.length}`)

      // First pass: compute all projections
      const allProjections: number[][] = []
      for (const point of this.state.points) {
        const originalFeatures = this.extractFeatures(point.original)

        if (this.state.points.indexOf(point) === 0) {
          console.log(`📍 First point original features (length=${originalFeatures.length}, first 5):`, originalFeatures.slice(0, 5))
        }

        // Standardize features: (val - mean) / std (same as during centering)
        const standardizedFeatures = originalFeatures.map((val, i) => (val - meanVector[i]) / stdVector[i])

        // Project onto each principal component (dot product)
        const projections: number[] = []
        for (let i = 0; i < Math.min(this.state.numComponents, this.state.components.length); i++) {
          const eigenvector = this.state.components[i].eigenvector

          if (this.state.points.indexOf(point) === 0 && i === 0) {
            console.log(`📐 PC${i+1} eigenvector (length=${eigenvector.length}, first 5):`, eigenvector.slice(0, 5))
          }

          let projection = 0
          for (let j = 0; j < standardizedFeatures.length; j++) {
            projection += standardizedFeatures[j] * eigenvector[j]
          }
          projections.push(projection)

          if (this.state.points.indexOf(point) === 0) {
            console.log(`📐 First point PC${i+1} projection = ${projection.toFixed(4)}`)
          }
        }
        allProjections.push(projections)
      }

      // Find range for normalization to fit 3D scene scale [-4, 4]
      const numComps = allProjections[0]?.length || 0
      const mins = new Array(numComps).fill(Infinity)
      const maxs = new Array(numComps).fill(-Infinity)
      for (const proj of allProjections) {
        for (let i = 0; i < numComps; i++) {
          if (proj[i] < mins[i]) mins[i] = proj[i]
          if (proj[i] > maxs[i]) maxs[i] = proj[i]
        }
      }
      const ranges = maxs.map((max, i) => max - mins[i] || 1)
      const TARGET_SCALE = 8 // maps to [-4, 4] range
      console.log(`📐 PCA projection ranges:`, ranges.slice(0, 3).map(r => r.toFixed(2)))

      // Second pass: normalize and assign transformed coordinates
      this.state.points.forEach((point, idx) => {
        const projections = allProjections[idx]
        point.transformed = {
          x: numComps > 0 ? ((projections[0] - mins[0]) / ranges[0] - 0.5) * TARGET_SCALE : 0,
          y: numComps > 1 ? ((projections[1] - mins[1]) / ranges[1] - 0.5) * TARGET_SCALE : 0,
          z: numComps > 2 ? ((projections[2] - mins[2]) / ranges[2] - 0.5) * TARGET_SCALE : 0,
        }

        if (idx === 0) {
          console.log(`✅ First point normalized to: (${point.transformed.x.toFixed(3)}, ${point.transformed.y.toFixed(3)}, ${(point.transformed.z ?? 0).toFixed(3)})`)
        }
      })
      return
    }

    // Low-dimensional transformation: original logic
    const dim = this.state.covarianceMatrix.length
    const hasZ = dim === 3

    for (const point of this.state.points) {
      const centered = {
        x: point.original.x - this.state.mean.x,
        y: point.original.y - this.state.mean.y,
        z: hasZ ? (point.original.z || 0) - (this.state.mean.z || 0) : 0,
      }

      // Project onto principal components
      let transformedX = 0,
        transformedY = 0,
        transformedZ = 0

      if (this.state.components.length > 0) {
        const pc1 = this.state.components[0]
        if (hasZ && pc1.eigenvector.length === 3) {
          transformedX =
            centered.x * pc1.eigenvector[0] +
            centered.y * pc1.eigenvector[1] +
            centered.z * pc1.eigenvector[2]
        } else {
          transformedX = centered.x * pc1.eigenvector[0] + centered.y * pc1.eigenvector[1]
        }
      }

      if (this.state.components.length > 1) {
        const pc2 = this.state.components[1]
        if (hasZ && pc2.eigenvector.length === 3) {
          transformedY =
            centered.x * pc2.eigenvector[0] +
            centered.y * pc2.eigenvector[1] +
            centered.z * pc2.eigenvector[2]
        } else {
          transformedY = centered.x * pc2.eigenvector[0] + centered.y * pc2.eigenvector[1]
        }
      }

      if (this.state.components.length > 2 && hasZ) {
        const pc3 = this.state.components[2]
        transformedZ =
          centered.x * pc3.eigenvector[0] +
          centered.y * pc3.eigenvector[1] +
          centered.z * pc3.eigenvector[2]
      }

      point.transformed = { x: transformedX, y: transformedY, z: hasZ ? transformedZ : undefined }

      // Calculate reconstruction error (optional)
      if (this.state.numComponents >= 2) {
        let reconstructedX = this.state.mean.x
        let reconstructedY = this.state.mean.y
        let reconstructedZ = this.state.mean.z || 0

        for (let i = 0; i < Math.min(this.state.numComponents, this.state.components.length); i++) {
          const comp = this.state.components[i]
          const projValue = i === 0 ? transformedX : i === 1 ? transformedY : transformedZ

          if (hasZ && comp.eigenvector.length === 3) {
            reconstructedX += projValue * comp.eigenvector[0]
            reconstructedY += projValue * comp.eigenvector[1]
            reconstructedZ += projValue * comp.eigenvector[2]
          } else {
            reconstructedX += projValue * comp.eigenvector[0]
            reconstructedY += projValue * comp.eigenvector[1]
          }
        }

        const dx = point.original.x - reconstructedX
        const dy = point.original.y - reconstructedY
        const dz = hasZ ? (point.original.z || 0) - reconstructedZ : 0

        point.reconstructionError = Math.sqrt(dx * dx + dy * dy + dz * dz)
      }
    }
  }

  updateConfig(config: Partial<PCAConfig>): void {
    if (config.numComponents !== undefined) {
      this.state.numComponents = config.numComponents
    }
    if (config.points !== undefined) {
      this.state = this.initializeState({
        points: config.points,
        numComponents: this.state.numComponents,
      })
    }
  }
}
