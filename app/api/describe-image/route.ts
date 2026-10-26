import { NextResponse } from 'next/server'

export const maxDuration = 60

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'tagline', 'description', 'features', 'materials', 'style', 'targetAudience', 'tags', 'keywords', 'altText', 'careInstructions', 'category'],
  properties: {
    title: { type: 'string' },
    tagline: { type: 'string' },
    description: { type: 'string' },
    features: { type: 'array', items: { type: 'string' } },
    materials: { type: 'array', items: { type: 'string' } },
    style: { type: 'string' },
    targetAudience: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    keywords: { type: 'array', items: { type: 'string' } },
    altText: { type: 'string' },
    careInstructions: { type: 'string' },
    category: { type: 'string' },
  },
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI is not configured. Set OPENAI_API_KEY in .env and restart the dev server.' }, { status: 500 })
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

    const content: Array<Record<string, unknown>> = [{ type: 'text', text: instruction }]
    if (base64) content.push({ type: 'image_url', image_url: { url: `data:${mediaType};base64,${base64}`, detail: 'low' } })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content }],
        response_format: { type: 'json_schema', json_schema: { name: 'product_details', strict: true, schema } },
      }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(`OpenAI request failed (${response.status}): ${data?.error?.message ?? 'Unknown error'}`)
    }

    const details = JSON.parse(data.choices[0].message.content)
    return NextResponse.json({ details })
  } catch (error) {
    console.error('Image description failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not generate details.' }, { status: 500 })
  }
}
