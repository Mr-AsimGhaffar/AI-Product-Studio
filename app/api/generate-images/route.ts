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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI image generation is not configured.' }, { status: 503 })
    }

    const colorText = colors.length ? colors.join(', ') : 'neutral'
    const count = Math.min(Math.max(photoSet, 1), 4)
    const prompt = `Create a polished e-commerce product photograph of a ${product}. Color direction: ${colorText}. Use a clean warm ivory studio background, soft directional editorial lighting, accurate material texture, centered composition, full product visible, no people, no logos, no text, no watermark. Each image should show a distinct professional catalog angle.`

    const payload = JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: count,
      size: '1024x1024',
      quality: 'medium',
    })
    let response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      })
    }

    const result = await response.json()
    if (!response.ok) {
      const message = result?.error?.message || 'OpenAI image generation failed.'
      const userMessage = response.status === 429
        ? 'OpenAI is rate-limiting image generation right now. Please wait a moment and try again.'
        : message
      return NextResponse.json({ error: userMessage }, { status: response.status })
    }

    const images = Array.isArray(result.data)
      ? result.data.filter((image: unknown): image is { b64_json: string } => Boolean(image && typeof image === 'object' && 'b64_json' in image && typeof image.b64_json === 'string')).map((image: { b64_json: string }) => ({
          base64: image.b64_json,
          mediaType: 'image/png',
        }))
      : []

    if (!images.length) {
      return NextResponse.json({ error: 'OpenAI returned no images. Please try again.' }, { status: 502 })
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('[v0] Image generation failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown image generation error.'
    return NextResponse.json({ error: `Image generation failed: ${message}` }, { status: 500 })
  }
}
