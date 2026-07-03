'use client'

import React from 'react'
import type { CanvasConfig } from './types'

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  config: CanvasConfig
  className?: string
}

/**
 * Reusable Canvas component
 * Pure presentation - receives ref from useCanvas hook
 */
export function Canvas({ canvasRef, config, className = '' }: Readonly<CanvasProps>) {
  return (
    <canvas
      ref={canvasRef}
      width={config?.width}
      height={config?.height}
      className={`border border-gray-300 rounded-lg ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        backgroundColor: config?.backgroundColor ?? 'transparent',
      }}
      data-grid-enabled={config?.gridEnabled ? '1' : '0'}
      data-tour="playground-visualization"
    />
  )
}
