import { NextRequest, NextResponse } from 'next/server'
import { runFalInpainting } from '@/lib/fal-inpainting'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      image,
      mask,
      prompt,
      negative_prompt,
      image_size,
      num_inference_steps,
      guidance_scale,
      strength,
      seed,
      num_images,
      format,
      acceleration,
    } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "image" (URL or base64 data URI)' },
        { status: 400 }
      )
    }
    if (!mask || typeof mask !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "mask" (URL or base64 data URI)' },
        { status: 400 }
      )
    }
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid "prompt"' },
        { status: 400 }
      )
    }

    const result = await runFalInpainting({
      image_url: image,
      mask_url: mask,
      prompt: prompt.trim(),
      ...(negative_prompt != null && { negative_prompt: String(negative_prompt) }),
      ...(image_size != null && { image_size }),
      ...(num_inference_steps != null && { num_inference_steps: Number(num_inference_steps) }),
      ...(guidance_scale != null && { guidance_scale: Number(guidance_scale) }),
      ...(strength != null && { strength: Number(strength) }),
      ...(seed != null && { seed: Number(seed) }),
      ...(num_images != null && { num_images: Number(num_images) }),
      ...(format != null && { output_format: format === 'png' ? 'png' : 'jpeg' }),
      ...(acceleration != null && ['none', 'regular', 'high'].includes(String(acceleration)) && { acceleration: acceleration as 'none' | 'regular' | 'high' }),
    })

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Inpainting failed'
    const status = message.includes('FAL_KEY') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
