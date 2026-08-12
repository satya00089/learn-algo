/* eslint-disable unicorn/no-zero-fractions */
import type { TSNEPoint } from '../engines/TSNEEngine'

/**
 * Generate authentic high-dimensional data for t-SNE visualization
 * Uses realistic MNIST-style digit patterns to demonstrate dimensionality reduction
 */

interface DatasetMetadata {
  name: string
  description: string
  inputDimensions: number
  numPoints: number
  categories: string[]
  features: string[]
  realWorldContext: string
}

export const datasetMetadata: Record<string, DatasetMetadata> = {
  'mnist-digits': {
    name: 'Handwritten Digits (MNIST-style)',
    description: 'Simplified version of handwritten digits 0-9 with realistic pixel patterns',
    inputDimensions: 64,
    numPoints: 300,
    categories: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    features: ['pixel_intensities', 'edge_features', 'curvature', 'symmetry'],
    realWorldContext:
      'Each point represents an 8x8 grayscale image. t-SNE reveals which digits look similar.',
  },
}

/**
 * Generate realistic digit patterns for MNIST-style visualization
 * Creates authentic patterns that mimic how real handwritten digits cluster
 */
export function generateMNISTStyleData(numPoints: number = 300): {
  points: TSNEPoint[]
  highDimData: number[][]
} {
  const points: TSNEPoint[] = []
  const highDimData: number[][] = []
  const dims = 64 // 8x8 image = 64 pixels
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  // Create realistic digit templates with characteristic features
  const digitTemplates: Record<string, number[]> = {
    '0': createCircularPattern(),
    '1': createVerticalPattern(),
    '2': createSPattern(),
    '3': createCurvedPattern(),
    '4': createAngularPattern(),
    '5': createTopHeavyPattern(),
    '6': createBottomHeavyPattern(),
    '7': createDiagonalPattern(),
    '8': createFigureEightPattern(),
    '9': createInvertedSixPattern(),
  }

  // Generate samples for each digit with natural variation
  digits.forEach((digit) => {
    const template = digitTemplates[digit]
    const samplesPerDigit = Math.floor(numPoints / digits.length)

    for (let i = 0; i < samplesPerDigit; i++) {
      // Add natural handwriting variation (reduced variance for better clustering)
      const variance = 0.08 + Math.random() * 0.04 // 8-12% variance
      const highDim = template.map((val) => {
        const noise = (Math.random() - 0.5) * variance
        return Math.max(0, Math.min(1, val + noise))
      })

      // Add occasional random noise to 1-2 pixels (very sparse)
      if (Math.random() < 0.1) {
        const idx = Math.floor(Math.random() * dims)
        highDim[idx] = Math.random() * 0.2
      }

      highDimData.push(highDim)
      points.push({
        x: 0,
        y: 0,
        originalIndex: highDimData.length - 1,
        label: `${digit}`,
        category: digit,
        metadata: {
          digit: Number.parseInt(digit, 10),
          strokeWidth: 1 + Math.random() * 2,
          clarity: 0.7 + Math.random() * 0.3,
        },
      })
    }
  })

  return { points, highDimData }
}

// Helper functions to create authentic digit patterns (8x8 grid)
function createCircularPattern(): number[] {
  // Digit 0: circular/oval shape (more binary)
  const pattern = [
    0, 0, 0.9, 1, 1, 0.9, 0, 0, 0, 0.9, 1, 0, 0, 1, 0.9, 0, 0.9, 1, 0, 0, 0, 0, 1, 0.9, 1, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0.9, 1, 0, 0, 0, 0, 1, 0.9, 0, 0.9, 1, 0, 0, 1, 0.9, 0, 0,
    0, 0.9, 1, 1, 0.9, 0, 0,
  ]
  return pattern
}

function createVerticalPattern(): number[] {
  // Digit 1: vertical line with slight angle (more binary)
  const pattern = [
    0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,
  ]
  return pattern
}

function createSPattern(): number[] {
  // Digit 2: S-shaped curve (more binary)
  const pattern = [
    0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0,
  ]
  return pattern
}

function createCurvedPattern(): number[] {
  // Digit 3: two curves stacked (more binary)
  const pattern = [
    0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0,
  ]
  return pattern
}

function createAngularPattern(): number[] {
  // Digit 4: angular, crossing lines (more binary)
  const pattern = [
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
  ]
  return pattern
}

function createTopHeavyPattern(): number[] {
  // Digit 5: horizontal top, curved bottom (more binary)
  const pattern = [
    1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0,
  ]
  return pattern
}

function createBottomHeavyPattern(): number[] {
  // Digit 6: circular bottom, small top (more binary)
  const pattern = [
    0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0,
    1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0,
  ]
  return pattern
}

function createDiagonalPattern(): number[] {
  // Digit 7: horizontal top, diagonal line (more binary)
  const pattern = [
    1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
  ]
  return pattern
}

function createFigureEightPattern(): number[] {
  // Digit 8: two circles stacked (more binary)
  const pattern = [
    0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0,
  ]
  return pattern
}

function createInvertedSixPattern(): number[] {
  // Digit 9: circular top, small bottom (more binary)
  const pattern = [
    0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0,
  ]
  return pattern
}

/**
 * Generate dataset by type
 */
export function generateTSNEDataset(
  _type: 'mnist-digits',
  numPoints?: number
): { points: TSNEPoint[]; highDimData: number[][] } {
  return generateMNISTStyleData(numPoints)
}
