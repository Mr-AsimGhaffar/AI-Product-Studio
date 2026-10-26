import { NextResponse } from 'next/server'

const CF_MODEL = '@cf/black-forest-labs/flux-1-schnell'

async function generateWithCloudflare(prompt: string, accountId: string, token: string) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, steps: 6 }),
  })
  const data = await response.json().catch(() => null)
  const base64: string | undefined = data?.result?.image
  if (!response.ok || !base64) {
    throw new Error(`Cloudflare image generation failed (${response.status}): ${JSON.stringify(data?.errors ?? data)}`)
  }
  return { base64, mediaType: 'image/jpeg' }
}

export const maxDuration = 120

const allAngles = [
  { name: 'front view', model: 'Full-body shot from the front, facing the camera.', product: 'Front view, straight on.' },
  { name: 'back view', model: 'Full-body shot from directly behind, the model facing away from the camera so the back of the garment is fully visible.', product: 'Back view, showing the rear of the garment.' },
  { name: 'side profile', model: 'Full-body side profile shot, the model turned 90 degrees.', product: 'Side profile view.' },
  { name: 'three-quarter view', model: 'Full-body three-quarter angle shot.', product: 'Three-quarter angle view.' },
  { name: 'detail view', model: 'Close-up waist-up shot highlighting fabric, stitching and buttons.', product: 'Close-up detail of fabric, stitching and hardware.' },
  { name: 'lifestyle view', model: 'Relaxed walking pose, full body, slight angle.', product: 'Styled flat lay from above.' },
]

// One shared garment description keeps the design identical across every angle.
async function buildDesignSpec(brief: string, modelLook: string) {
  const fallback = { garment: brief, model: modelLook === 'Male model' ? 'a young man with short dark hair' : 'a young woman with shoulder-length brown hair' }
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return fallback

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Fix ONE precise design for this garment so every photo of it (front, back, side) shows the exact same item: "${brief}". Describe it in a single dense sentence (cut, fit, collar, closures, pockets, stitching, wash, hardware, color) covering both front and back details. Also describe one specific model (age, hair, skin tone, build) to appear in every photo.`,
        }],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'design_spec',
            strict: true,
            schema: { type: 'object', additionalProperties: false, required: ['garment', 'model'], properties: { garment: { type: 'string' }, model: { type: 'string' } } },
          },
        },
      }),
    })
    if (!response.ok) return fallback
    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return { garment: parsed.garment || fallback.garment, model: parsed.model || fallback.model }
  } catch {
    return fallback
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const product = typeof body.product === 'string' ? body.product.trim() : ''
    const colors = Array.isArray(body.colors) ? body.colors.filter((color: unknown): color is string => typeof color === 'string') : []
    const photoSet = typeof body.photoSet === 'number' ? body.photoSet : 1

    if (!product) {
      return NextResponse.json({ error: 'Add a product before generating images.' }, { status: 400 })
    }

    const colorText = colors.length ? colors[0] : 'neutral'
    const str = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value.trim() : fallback)
    const style = str(body.style, 'Casual')
    const material = str(body.material, 'Cotton')
    const extra = str(body.extra, '')
    const photoStyle = str(body.photoStyle, 'Studio')
    const modelLook = str(body.modelLook, 'Female model')
    const count = Math.min(Math.max(photoSet, 1), allAngles.length)

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const token = process.env.CFARE_API_KEY
    if (!accountId || !token) {
      return NextResponse.json(
        { error: 'Cloudflare is not configured. Set CLOUDFLARE_ACCOUNT_ID and CFARE_API_KEY in .env and restart the dev server.' },
        { status: 500 },
      )
    }

    const brief = `${style} ${material.toLowerCase()} ${product}, color ${colorText}${extra ? `, ${extra}` : ''}`
    const spec = await buildDesignSpec(brief, modelLook)
    const wearer = modelLook === 'Female model' || modelLook === 'Male model'
    const subject = wearer
      ? `a ${modelLook.toLowerCase()} (${spec.model}) wearing ${spec.garment}`
      : modelLook === 'Ghost mannequin'
        ? `${spec.garment}, shown on an invisible ghost mannequin`
        : `${spec.garment}, product only, no person`

    const angles = allAngles.slice(0, count)
    const images = await Promise.all(
      angles.map(async (angle) => {
        const view = wearer ? angle.model : angle.product
        const fullPrompt = `Professional ${photoStyle.toLowerCase()} e-commerce fashion photograph of ${subject}. ${view} Identical garment design in every photo of this set. Clean warm ivory studio background, soft directional lighting, sharp fabric texture, full garment visible, no text, no logos, no watermark.`
        const image = await generateWithCloudflare(fullPrompt, accountId, token)
        return { ...image, angle: angle.name, prompt: fullPrompt, model: CF_MODEL, createdAt: new Date().toISOString() }
      }),
    )

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Image generation failed:', error)
    const message = error instanceof Error ? error.message : 'Image generation failed. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
