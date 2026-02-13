/**
 * Fal AI Inpainting – Qwen Image Edit.
 * @see document.doc (fal-ai/qwen-image-edit/inpaint)
 */

export const FAL_INPAINTING_MODEL = 'fal-ai/qwen-image-edit/inpaint' as const

export type FalImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9'
  | { width: number; height: number }

export type FalAcceleration = 'none' | 'regular' | 'high'

export interface FalInpaintingInput {
  image_url: string
  mask_url: string
  prompt: string
  negative_prompt?: string
  image_size?: FalImageSize
  num_inference_steps?: number
  guidance_scale?: number
  strength?: number
  seed?: number
  num_images?: number
  enable_safety_checker?: boolean
  output_format?: 'jpeg' | 'png'
  acceleration?: FalAcceleration
}

export interface FalInpaintingImage {
  url: string
  width?: number
  height?: number
  content_type?: string
}

export interface FalInpaintingOutput {
  images: FalInpaintingImage[]
  timings?: { inference: number }
  seed?: number
  has_nsfw_concepts?: boolean[]
  prompt?: string
}

export async function runFalInpainting(
  input: FalInpaintingInput
): Promise<FalInpaintingOutput> {
  const key = process.env.FAL_KEY
  if (!key) {
    throw new Error('FAL_KEY is not set. Add it in .env or environment.')
  }

  const { fal } = await import('@fal-ai/client')
  fal.config({ credentials: key })

  const result = await fal.subscribe(FAL_INPAINTING_MODEL, {
    input: {
      prompt: input.prompt,
      image_url: input.image_url,
      mask_url: input.mask_url,
      negative_prompt: input.negative_prompt ?? ' ',
      num_inference_steps: input.num_inference_steps ?? 30,
      guidance_scale: input.guidance_scale ?? 4,
      strength: input.strength ?? 0.93,
      num_images: input.num_images ?? 1,
      enable_safety_checker: input.enable_safety_checker ?? true,
      output_format: input.output_format ?? 'png',
      acceleration: input.acceleration ?? 'regular',
      ...(input.image_size != null && { image_size: input.image_size }),
      ...(input.seed != null && { seed: input.seed }),
    },
    logs: false,
  })

  return result.data as FalInpaintingOutput
}
