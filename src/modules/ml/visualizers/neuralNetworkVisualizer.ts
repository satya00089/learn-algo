/** TensorFlow Playground's own diverging palette: orange (negative) / blue (positive). */
export const NEGATIVE_COLOR = { r: 245, g: 147, b: 34 } // #f59322
export const POSITIVE_COLOR = { r: 8, g: 119, b: 189 } // #0877bd

/**
 * Shared diverging color scale used across the page — the output heatmap,
 * per-neuron tiles, and weight lines all read from this one scale so the
 * whole page reads as one consistent color language.
 */
export function divergingColor(value: number, maxAbs: number, alpha: number = 1): string {
  const t = maxAbs > 1e-9 ? Math.max(-1, Math.min(1, value / maxAbs)) : 0
  const target = t >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR
  const s = Math.abs(t)
  const r = Math.round(255 + (target.r - 255) * s)
  const g = Math.round(255 + (target.g - 255) * s)
  const b = Math.round(255 + (target.b - 255) * s)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** [col][row] grid of raw activation values for one neuron, row 0 = top of tile. */
export type NeuronTileGrid = number[][]
