import { NextResponse } from "next/server";

const CF_MODEL = "@cf/black-forest-labs/flux-1-schnell";

async function generateWithCloudflare(
  prompt: string,
  accountId: string,
  token: string,
) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, steps: 6 }),
    },
  );
  const data = await response.json().catch(() => null);
  const base64: string | undefined = data?.result?.image;
  if (!response.ok || !base64) {
    throw new Error(
      `Cloudflare image generation failed (${response.status}): ${JSON.stringify(data?.errors ?? data)}`,
    );
  }
  return { base64, mediaType: "image/jpeg" };
}

export const maxDuration = 120;

// Image models follow plain color words better than hex codes.
function describeColor(value: string) {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  if (!match) return value;
  const [r, g, b] = match.slice(1).map((part) => parseInt(part, 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  const tone = l < 0.2 ? "very dark " : l < 0.38 ? "dark " : l > 0.8 ? "light " : "";
  if (l < 0.08) return "black";
  if (l > 0.94) return "white";
  if (s < 0.12) return `${tone}${l < 0.5 ? "charcoal gray" : "gray"}`.trim();
  const names: [number, string][] = [
    [15, "red"],
    [40, "orange"],
    [65, "yellow"],
    [165, "green"],
    [200, "teal"],
    [255, "blue"],
    [290, "purple"],
    [335, "pink"],
    [361, "red"],
  ];
  const hue = names.find(([limit]) => h < limit)![1];
  return `${tone}${hue} (${value})`;
}

const allAngles = [
  {
    name: "front view",
    model:
      "Straight-on front view: a single model standing upright and symmetrical, chest and both shoulders squarely facing the camera, arms relaxed at the sides, looking directly into the lens, seen from a distance with the entire body from head to shoes in the frame including the full garment length to the hem.",
    product: "Front view, straight on.",
  },
  {
    name: "back view",
    model:
      "A single model standing alone, seen from behind with back turned to the camera, head to shoes in the frame, the whole back of the garment down to the hem visible.",
    product: "Back view, showing the rear of the garment.",
  },
  {
    name: "side profile",
    model: "Full-body side profile shot, the model turned 90 degrees.",
    product: "Side profile view.",
  },
  {
    name: "three-quarter view",
    model: "Full-body three-quarter angle shot.",
    product: "Three-quarter angle view.",
  },
  {
    name: "detail view",
    model:
      "Close-up of the garment itself from the shoulders down to the hips, fabric, stitching and buttons in focus, face out of frame.",
    product: "Close-up detail of fabric, stitching and hardware.",
  },
  {
    name: "lifestyle view",
    model: "Relaxed walking pose, full body, slight angle.",
    product: "Styled flat lay from above.",
  },
];

// One shared garment description keeps the design identical across every angle.
async function buildDesignSpec(brief: string, modelLook: string) {
  const fallback = {
    front: brief,
    back: brief,
    model:
      modelLook === "Male model"
        ? "a young man with short dark hair"
        : "a young woman with shoulder-length brown hair",
  };
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallback;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Fix ONE precise design for this garment: "${brief}". Return "front": a single dense sentence describing only what is visible on the FRONT of the garment (cut, fit, collar, closures, pockets, print placement, wash, hardware, color). Return "back": a single dense sentence describing only what is visible on the BACK of the same garment, consistent with the front. Neither sentence may mention the other side. Also describe one specific model (age, hair, skin tone, build).`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "design_spec",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["front", "back", "model"],
              properties: {
                front: { type: "string" },
                back: { type: "string" },
                model: { type: "string" },
              },
            },
          },
        },
      }),
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      front: parsed.front || fallback.front,
      back: parsed.back || parsed.front || fallback.back,
      model: parsed.model || fallback.model,
    };
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = typeof body.product === "string" ? body.product.trim() : "";
    const colors = Array.isArray(body.colors)
      ? body.colors.filter(
          (color: unknown): color is string => typeof color === "string",
        )
      : [];
    const photoSet = typeof body.photoSet === "number" ? body.photoSet : 1;

    if (!product) {
      return NextResponse.json(
        { error: "Add a product before generating images." },
        { status: 400 },
      );
    }

    const colorText = colors.length ? describeColor(colors[0]) : "neutral";
    const str = (value: unknown, fallback: string) =>
      typeof value === "string" && value.trim() ? value.trim() : fallback;
    const style = str(body.style, "Casual");
    const material = str(body.material, "Cotton");
    const extra = str(body.extra, "");
    const photoStyle = str(body.photoStyle, "Studio");
    const modelLook = str(body.modelLook, "Female model");
    const count = Math.min(Math.max(photoSet, 1), allAngles.length);

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const token = process.env.CFARE_API_KEY;
    if (!accountId || !token) {
      return NextResponse.json(
        {
          error:
            "Cloudflare is not configured. Set CLOUDFLARE_ACCOUNT_ID and CFARE_API_KEY in .env and restart the dev server.",
        },
        { status: 500 },
      );
    }

    const brief = `${style} ${material.toLowerCase()} ${product}, color ${colorText}${extra ? `, ${extra}` : ""}`;
    const spec = await buildDesignSpec(brief, modelLook);
    const wearer = modelLook === "Female model" || modelLook === "Male model";
    const buildSubject = (garment: string) =>
      wearer
        ? `a ${modelLook.toLowerCase()} (${spec.model}) wearing ${garment}`
        : modelLook === "Ghost mannequin"
          ? `${garment}, shown on an invisible ghost mannequin`
          : `${garment}, product only, no person`;

    const angles = allAngles.slice(0, count);
    // An identical prompt prefix keeps the garment as similar as possible across angles.
    const background = wearer
      ? "Real-world location background: a sunlit urban street with softly blurred buildings, natural daylight, shallow depth of field."
      : "Clean warm ivory studio background, soft directional lighting.";
    const images = await Promise.all(
      angles.map(async (angle) => {
        const view = wearer ? angle.model : angle.product;
        const garment =
          angle.name === "back view"
            ? spec.back
            : spec.front.replace(/[^.,;]*\b(back|rear|behind)\b[^.,;]*[.,;]?/gi, "");
        const fullPrompt = `${view} Professional ${photoStyle.toLowerCase()} e-commerce fashion photograph of ${buildSubject(garment)}. One single full-frame photograph of one subject. The entire garment is visible from top to hem. ${background} Sharp fabric texture.`;
        const image = await generateWithCloudflare(
          fullPrompt,
          accountId,
          token,
        );
        return {
          ...image,
          angle: angle.name,
          prompt: fullPrompt,
          model: CF_MODEL,
          createdAt: new Date().toISOString(),
        };
      }),
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Image generation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Image generation failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
