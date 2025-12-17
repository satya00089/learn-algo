// Core canvas types used across all visualizations

export interface Point {
  x: number
  y: number
}

export interface CanvasSize {
  width: number
  height: number
}

export interface CanvasConfig {
  width: number
  height: number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  backgroundColor?: string
  gridEnabled?: boolean
  axesEnabled?: boolean
}

export interface GridConfig {
  color: string
  lineWidth: number
  stepX: number
  stepY: number
}

export interface AxesConfig {
  color: string
  lineWidth: number
  showLabels: boolean
  labelFont: string
  labelColor: string
}

export interface CanvasTransform {
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
}
