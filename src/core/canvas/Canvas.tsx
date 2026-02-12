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
export function Canvas({ canvasRef, config, className = '' }: CanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      width={config.width}
      height={config.height}
      className={`border border-gray-300 rounded-lg ${className}`}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  )
}
