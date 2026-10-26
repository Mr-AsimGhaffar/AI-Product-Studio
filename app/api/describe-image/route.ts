import { NextResponse } from 'next/server'

export const maxDuration = 60

const schema = {
  type: 'OBJECT',
  required: ['title', 'tagline', 'description', 'features', 'materials', 'style', 'targetAudience', 'tags', 'keywords', 'altText', 'careInstructions', 'category'],
  properties: {
    title: { type: 'STRING' },
    tagline: { type: 'STRING' },
    description: { type: 'STRING' },
    features: { type: 'ARRAY', items: { type: 'STRING' } },
    materials: { type: 'ARRAY', items: { type: 'STRING' } },
    style: { type: 'STRING' },
    targetAudience: { type: 'STRING' },
    tags: { type: 'ARRAY', items: { type: 'STRING' } },
    keywords: { type: 'ARRAY', items: { type: 'STRING' } },
    altText: { type: 'STRING' },
    careInstructions: { type: 'STRING' },
    category: { type: 'STRING' },
  },
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini is not configured. Set GEMINI_API_KEY in .env and restart the dev server.' }, { status: 500 })
    }

    const body = await request.json()
    const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
    const product = str(body.product)
    const angle = str(body.angle)
    const platform = str(body.platform) || 'Amazon'
    const colors: string[] = Array.isArray(body.colors) ? body.colors.filter((c: unknown): c is string => typeof c === 'string') : []
    const base64 = str(body.base64)
    const mediaType = str(body.mediaType) || 'image/jpeg'

    if (!product) return NextResponse.json({ error: 'Product name is required.' }, { status: 400 })

    const instruction = `You are an expert e-commerce copywriter. Write accurate, polished listing content for this product photo.
Product: ${product}
Color direction: ${colors.join(', ') || 'neutral'}
Photo angle: ${angle || 'catalog view'}
Target marketplace: ${platform}
Base the content on what is visible in the image and the product name. Keep the description to 2-3 sentences, 4-6 features, 3-5 materials (best inference), 6-8 tags, 6-10 SEO keywords, a concise alt text, one care instruction sentence and a product category. Avoid unverifiable claims.`

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: instruction },
            ...(base64 ? [{ inlineData: { mimeType: mediaType, data: base64 } }] : []),
          ],
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status}): ${data?.error?.message ?? 'Unknown error'}`)
    }

    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: unknown }) => part.text)
      .find((text: unknown): text is string => typeof text === 'string')
    if (!content) {
      throw new Error('Gemini returned an empty response. Check that GEMINI_MODEL supports image input and structured output.')
    }
    const details = JSON.parse(content)
    return NextResponse.json({ details })
  } catch (error) {
    console.error('Image description failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not generate details.' }, { status: 500 })
  }
}
