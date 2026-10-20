import { NextResponse } from 'next/server'

export const maxDuration = 120

const CLOUDFLARE_MODEL = '@cf/black-forest-labs/flux-1-schnell'

async function createProductDescription(product: string, colors: string[]) {
  const apiKey = process.env.GCP_API_KEY
  if (!apiKey) return ''

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Write one concise visual product brief for an e-commerce photographer. Product: ${product}. Colors: ${colors.join(', ') || 'neutral'}. Mention the material, silhouette, finish, and details that should be visible. Return only the brief, with no markdown.`,
          }],
        }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 180 },
      }),
    },
  )

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result?.error?.message || 'Gemini description generation failed.')
  }

  return result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = typeof body.product === 'string' ? body.product.trim() : ''
    const colors = Array.isArray(body.colors)
      ? body.colors.filter((color: unknown): color is string => typeof color === 'string')
      : []
    const photoSet = typeof body.photoSet === 'number' ? body.photoSet : 1

    if (!product) {
      return NextResponse.json({ error: 'Add a product before generating images.' }, { status: 400 })
    }

    // CFARE_API_KEY is the canonical project variable. The fallback keeps existing
    // previews working when the variable was provisioned with its earlier casing.
    const cloudflareApiKey = process.env.CFARE_API_KEY || process.env.CFare_API_KEY
    if (!cloudflareApiKey) {
      return NextResponse.json({ error: 'Cloudflare image generation is not configured. Add CFARE_API_KEY to the project environment.' }, { status: 503 })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    if (!accountId) {
      return NextResponse.json({ error: 'Cloudflare image generation needs CLOUDFLARE_ACCOUNT_ID in addition to CFARE_API_KEY.' }, { status: 503 })
    }

    const colorText = colors.length ? colors.join(', ') : 'neutral'
    const count = Math.min(Math.max(photoSet, 1), 4)
    const description = await createProductDescription(product, colors)
    const prompt = `Professional e-commerce product photography of a ${product}. ${description} Color direction: ${colorText}. Clean warm ivory studio background, soft directional editorial lighting, accurate material texture, centered composition, full product visible, no people, no logos, no text, no watermark. Create a distinct catalog angle.`

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${CLOUDFLARE_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cloudflareApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, num_steps: 4 }),
      },
    )

    if (!response.ok) {
      const result = await response.json().catch(() => null)
      const message = result?.errors?.[0]?.message || result?.error || 'Cloudflare image generation failed.'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const contentType = response.headers.get('content-type') || ''
    let image = ''
    let mediaType = 'image/png'

    if (contentType.includes('application/json')) {
      const result = await response.json().catch(() => null)
      image = typeof result?.result?.image === 'string'
        ? result.result.image
        : typeof result?.image === 'string'
          ? result.image
          : ''
      mediaType = typeof result?.result?.mime_type === 'string' ? result.result.mime_type : mediaType
    } else {
      const imageBuffer = await response.arrayBuffer()
      image = Buffer.from(imageBuffer).toString('base64')
      if (contentType.startsWith('image/')) mediaType = contentType.split(';')[0]
    }

    if (!image) {
      return NextResponse.json({ error: 'Cloudflare returned no image data.' }, { status: 502 })
    }

    return NextResponse.json({
      description,
      images: Array.from({ length: count }, () => ({ base64: image, mediaType })),
    })
  } catch (error) {
    console.error('[v0] Image generation failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown image generation error.'
    return NextResponse.json({ error: `Image generation failed: ${message}` }, { status: 500 })
  }
}
