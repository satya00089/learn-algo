import { useEffect, useRef, useCallback } from 'react'
import type { CanvasConfig } from './types'

interface UseCanvasOptions {
  config: CanvasConfig
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void
  animate?: boolean
}

/**
 * Custom hook for managing canvas rendering
 * Handles setup, cleanup, and animation loop
 */
export function useCanvas({ config, draw, animate = false }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameCountRef = useRef(0)
  const animationFrameIdRef = useRef<number | undefined>(undefined)

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = config.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, config.width, config.height)

    // Call the draw function provided by the consumer
    draw(ctx, frameCountRef.current)

    frameCountRef.current++
  }, [config, draw])

  const animationLoop = useCallback(() => {
    renderFrame()
    if (animate) {
      animationFrameIdRef.current = requestAnimationFrame(animationLoop)
    }
  }, [renderFrame, animate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = config.width
    canvas.height = config.height

    // Start rendering
    if (animate) {
      animationLoop()
    } else {
      renderFrame()
    }

    // Cleanup
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
    }
  }, [config, animate, animationLoop, renderFrame])

  const redraw = useCallback(() => {
    frameCountRef.current = 0
    renderFrame()
  }, [renderFrame])

  return { canvasRef, redraw }
}
