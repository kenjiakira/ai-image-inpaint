'use client'

import React from "react"

import { forwardRef, useEffect, useRef, useState } from 'react'

interface CanvasProps {
  baseImage: string | null
  brushSize: number
  isEraser: boolean
  isLoading: boolean
}

export interface CanvasRef {
  getMask: () => string | null
}

const VISUAL_BRUSH_ALPHA = 0.4
const BRUSH_VISUAL_COLOR = { r: 0, g: 255, b: 0 }

const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ baseImage, brushSize, isEraser, isLoading }, ref) => {
    const displayCanvasRef = useRef<HTMLCanvasElement>(null)
    const maskBufferRef = useRef<Uint8ClampedArray | null>(null)
    const maskWidthRef = useRef<number>(0)
    const maskHeightRef = useRef<number>(0)
    const baseImageRef = useRef<HTMLImageElement | null>(null)
    const baseImageDataRef = useRef<ImageData | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const lastPosRef = useRef<{ x: number; y: number } | null>(null)
    const canvasRef = ref; 
    const renderAnimationFrameRef = useRef<number | null>(null)
    const needsRenderRef = useRef<boolean>(false)

    useEffect(() => {
      const canvas = displayCanvasRef.current
      if (!canvas || !baseImage) return

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        baseImageRef.current = img

        maskBufferRef.current = new Uint8ClampedArray(img.width * img.height)
        maskWidthRef.current = img.width
        maskHeightRef.current = img.height

        ctx.drawImage(img, 0, 0)
        
        baseImageDataRef.current = ctx.getImageData(0, 0, img.width, img.height)
      }
      img.src = baseImage
    }, [baseImage])

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!displayCanvasRef.current || isLoading) return
      setIsDrawing(true)
      const pos = getCanvasCoordinates(e)
      lastPosRef.current = pos
      drawBrush(pos.x, pos.y)
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !displayCanvasRef.current || !lastPosRef.current) return
      const pos = getCanvasCoordinates(e)
      interpolateAndDraw(lastPosRef.current, pos)
      lastPosRef.current = pos
    }

    const handleMouseUp = () => {
      setIsDrawing(false)
      lastPosRef.current = null
      scheduleRender(true)
    }

    const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = displayCanvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY
      return { x, y }
    }

    const interpolateAndDraw = (
      from: { x: number; y: number },
      to: { x: number; y: number }
    ) => {
      const distance = Math.sqrt(
        Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
      )
      const steps = Math.ceil(distance / (brushSize / 4))

      for (let i = 0; i <= steps; i++) {
        const t = steps > 0 ? i / steps : 0
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t
        drawBrush(x, y)
      }
    }

    const scheduleRender = (force = false) => {
      needsRenderRef.current = true
      
      if (force || renderAnimationFrameRef.current === null) {
        if (renderAnimationFrameRef.current !== null) {
          cancelAnimationFrame(renderAnimationFrameRef.current)
        }
        
        renderAnimationFrameRef.current = requestAnimationFrame(() => {
          if (needsRenderRef.current) {
            renderOverlay()
            needsRenderRef.current = false
          }
          renderAnimationFrameRef.current = null
        })  
      }
    }

    const drawBrush = (x: number, y: number) => {
      if (!displayCanvasRef.current || !maskBufferRef.current) return

      const radius = brushSize / 2
      const outerRadius = radius
      const innerRadius = radius * 0.6

      for (let dy = -outerRadius; dy <= outerRadius; dy++) {
        for (let dx = -outerRadius; dx <= outerRadius; dx++) {
          const distSq = dx * dx + dy * dy
          const dist = Math.sqrt(distSq)

          if (dist <= outerRadius) {
            const px = Math.floor(x + dx)
            const py = Math.floor(y + dy)

            if (
              px >= 0 &&
              px < maskWidthRef.current &&
              py >= 0 &&
              py < maskHeightRef.current
            ) {
              const idx = py * maskWidthRef.current + px
              
              let opacity = 255
              if (dist > innerRadius) {
                const falloff = (dist - innerRadius) / (outerRadius - innerRadius)
                opacity = Math.round(255 * Math.max(0, 1 - falloff))
              }

              if (isEraser) {
                maskBufferRef.current[idx] = Math.max(
                  0,
                  maskBufferRef.current[idx] - opacity
                )
              } else {
                maskBufferRef.current[idx] = Math.max(
                  maskBufferRef.current[idx],
                  opacity
                )
              }
            }
          }
        }
      }

      scheduleRender()
    }

    const renderOverlay = () => {
      const canvas = displayCanvasRef.current
      const ctx = canvas?.getContext('2d', { willReadFrequently: true })
      if (!ctx || !baseImageDataRef.current || !maskBufferRef.current) return

      const imageData = new ImageData(
        new Uint8ClampedArray(baseImageDataRef.current.data),
        maskWidthRef.current,
        maskHeightRef.current
      )
      const data = imageData.data

      for (let i = 0; i < maskBufferRef.current.length; i++) {
        const maskValue = maskBufferRef.current[i]
        if (maskValue > 0) {
          const pixelIdx = i * 4
          const pixelAlpha = maskValue / 255
          const blendAlpha = pixelAlpha * VISUAL_BRUSH_ALPHA

          data[pixelIdx] = Math.round(
            data[pixelIdx] * (1 - blendAlpha) + BRUSH_VISUAL_COLOR.r * blendAlpha
          )
          data[pixelIdx + 1] = Math.round(
            data[pixelIdx + 1] * (1 - blendAlpha) + BRUSH_VISUAL_COLOR.g * blendAlpha
          )
          data[pixelIdx + 2] = Math.round(
            data[pixelIdx + 2] * (1 - blendAlpha) + BRUSH_VISUAL_COLOR.b * blendAlpha
          )
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    useEffect(() => {
      return () => {
        if (renderAnimationFrameRef.current !== null) {
          cancelAnimationFrame(renderAnimationFrameRef.current)
        }
      }
    }, [])

    useEffect(() => {
      if (ref && typeof ref !== 'function') {
        ref.current = {
          getMask: () => {
            if (maskBufferRef.current) {
              const canvas = document.createElement('canvas')
              canvas.width = maskWidthRef.current
              canvas.height = maskHeightRef.current
              const ctx = canvas.getContext('2d')
              if (!ctx) return null

              const imageData = ctx.createImageData(
                maskWidthRef.current,
                maskHeightRef.current
              )
              const data = imageData.data

              for (let i = 0; i < maskBufferRef.current.length; i++) {
                const value = maskBufferRef.current[i]
                const idx = i * 4
                data[idx] = value
                data[idx + 1] = value
                data[idx + 2] = value
                data[idx + 3] = 255
              }

              ctx.putImageData(imageData, 0, 0)
              return canvas.toDataURL('image/png')
            }
            return null
          }
        }
      }
    }, [ref])

    return (
      <div
        ref={containerRef}
        className="relative flex-1 bg-zinc-100 rounded border border-zinc-200 overflow-auto flex items-center justify-center"
      >
        {!baseImage ? (
          <div className="text-center text-zinc-500 py-12">
            <p className="text-sm">Upload an image to start</p>
          </div>
        ) : (
          <canvas
            ref={displayCanvasRef}
            className="max-w-full max-h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ pointerEvents: isLoading ? 'none' : 'auto' }}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded gap-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Processing...</p>
          </div>
        )}
      </div>
    )
  }
)

Canvas.displayName = 'Canvas'

export default Canvas
