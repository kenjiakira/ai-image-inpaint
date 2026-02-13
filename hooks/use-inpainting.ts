'use client'

import { useState, useCallback } from 'react'
import type { FalInpaintingOutput } from '@/lib/fal-inpainting'

export interface InpaintingParams {
  image: string
  mask: string
  prompt: string
  negative_prompt?: string
  image_size?: string
  num_inference_steps?: number
  guidance_scale?: number
  strength?: number
  seed?: number
  num_images?: number
  format?: 'jpeg' | 'png'
}

export interface UseInpaintingReturn {
  run: (params: InpaintingParams) => Promise<FalInpaintingOutput | null>
  isLoading: boolean
  error: string | null
  result: FalInpaintingOutput | null
  reset: () => void
}

export function useInpainting(): UseInpaintingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FalInpaintingOutput | null>(null)

  const run = useCallback(async (params: InpaintingParams) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/inpainting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: params.image,
          mask: params.mask,
          prompt: params.prompt,
          negative_prompt: params.negative_prompt,
          image_size: params.image_size,
          num_inference_steps: params.num_inference_steps,
          guidance_scale: params.guidance_scale,
          strength: params.strength,
          seed: params.seed,
          num_images: params.num_images,
          format: params.format,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data?.error ?? `Request failed (${res.status})`
        setError(msg)
        return null
      }

      setResult(data as FalInpaintingOutput)
      return data as FalInpaintingOutput
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network or server error'
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
  }, [])

  return { run, isLoading, error, result, reset }
}
