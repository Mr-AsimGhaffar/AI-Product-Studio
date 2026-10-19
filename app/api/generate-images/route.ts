import { generateImage } from 'ai'
import { NextResponse } from 'next/server'

export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = typeof body.product === 'string' ? body.product.trim() : ''
    const colors = Array.isArray(body.colors) ? body.colors.filter((color: unknown): color is string => typeof color === 'string') : []
    const photoSet = typeof body.photoSet === 'number' ? body.photoSet : 1

    if (!product) {
      return NextResponse.json({ error: 'Add a product before generating images.' }, { status: 400 })
    }

    const colorText = colors.length ? colors.join(', ') : 'neutral'
    const count = Math.min(Math.max(photoSet, 1), 4)
    const prompt = `Create a polished e-commerce product photograph of a ${product}. Color direction: ${colorText}. Use a clean warm ivory studio background, soft directional editorial lighting, accurate material texture, centered composition, full product visible, no people, no logos, no text, no watermark. Generate a distinct professional catalog angle for this image.`

    const result = await generateImage({
      model: 'google/gemini-3.1-flash-image',
      prompt,
      n: count,
      aspectRatio: '1:1',
      size: '1024x1024',
    })

    return NextResponse.json({
      images: result.images.map((image) => ({
        base64: image.base64,
        mediaType: image.mediaType,
      })),
    })
  } catch (error) {
    console.error('[v0] Image generation failed:', error)
    return NextResponse.json({ error: 'Image generation failed. Please try again.' }, { status: 500 })
  }
}
