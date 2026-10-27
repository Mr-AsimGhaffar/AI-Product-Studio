"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Maximize2,
  RefreshCw,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  api,
  imageDownloadUrl,
  imageUrl,
  type ProductDetails,
  type StoredImage,
} from "@/lib/api";

export type GeneratedImage = {
  base64: string;
  mediaType: string;
  angle?: string;
  prompt?: string;
  model?: string;
  createdAt?: string;
};

export type GenerationContext = {
  product: string;
  colors: string[];
  platform: string;
};

const colorValues: Record<string, string> = {
  Ink: "#20242a",
  Bone: "#e7dfd0",
  Cobalt: "#3158bd",
  Rust: "#b9553b",
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

function formatBytes(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function useCopy() {
  const [copied, setCopied] = useState("");
  const copy = useCallback((key: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    });
  }, []);
  return { copied, copy };
}

type ImageDetailProps = {
  images: StoredImage[];
  index: number;
  context: GenerationContext;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  onImageUpdated: (image: StoredImage) => void;
};

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.readAsDataURL(blob);
  });

export function ImageDetail({
  images,
  index,
  context,
  onIndexChange,
  onBack,
  onImageUpdated,
}: ImageDetailProps) {
  const image = images[index];
  const src = imageUrl(image.id);

  const [details, setDetails] = useState<ProductDetails | null>(image.details);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [dimensions, setDimensions] = useState("");
  const { copied, copy } = useCopy();

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const file = await fetch(src);
      if (!file.ok) throw new Error("Could not load the stored image.");
      const base64 = await toBase64(await file.blob());
      const response = await fetch("/api/describe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: context.product,
          colors: context.colors,
          platform: context.platform,
          angle: image.angle,
          base64,
          mediaType: image.mediaType,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not generate details.");
      setDetails(data.details);
      onImageUpdated(
        await api.updateImage(image.id, { details: data.details }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate details.",
      );
    } finally {
      setLoading(false);
    }
  }, [context, image, src, onImageUpdated]);

  useEffect(() => {
    setDimensions("");
    setZoomed(false);
    setError("");
    setDetails(image.details);
    if (!image.details) loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.id]);

  const step = useCallback(
    (direction: number) =>
      onIndexChange((index + direction + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") viewer ? setViewer(false) : onBack();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, step, onBack]);

  const bytes = image.sizeBytes;
  const created = image.createdAt
    ? new Date(image.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Just now";
  const specs: Array<[string, string]> = [
    ["Product", context.product || "Untitled product"],
    [
      "Camera angle",
      image.angle ? titleCase(image.angle) : `Angle ${index + 1}`,
    ],
    ["Resolution", dimensions || "—"],
    ["Format", image.mediaType.replace("image/", "").toUpperCase()],
    ["File size", formatBytes(bytes)],
    ["Model", image.model?.split("/").pop() ?? "Cloudflare Workers AI"],
    ["Marketplace", context.platform],
    ["Created", created],
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#20211f]">
      <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#deded7] bg-[#f7f6f2]/90 px-5 backdrop-blur md:px-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#777871] transition hover:text-[#20211f]"
        >
          <ArrowLeft className="size-4" /> Image library
        </button>
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden text-sm text-[#85867f] sm:block">
            {index + 1} / {images.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => step(-1)}
            disabled={images.length < 2}
            aria-label="Previous image"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => step(1)}
            disabled={images.length < 2}
            aria-label="Next image"
          >
            <ChevronRight />
          </Button>
          <a
            href={imageDownloadUrl(image.id)}
            className="ml-2 inline-flex h-9 items-center gap-2 rounded-full bg-[#20211f] px-4 text-sm font-medium text-white transition hover:bg-[#343531]"
          >
            <Download className="size-4" /> Download
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1280px] gap-10 px-5 py-8 md:px-10 md:py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className="lg:sticky lg:top-[108px] lg:self-start">
          <button
            onClick={() => setViewer(true)}
            className="group relative block w-full overflow-hidden rounded-2xl border border-[#deded7] bg-[#edeae2] shadow-sm"
            aria-label="Open image viewer"
          >
            <img
              src={src}
              alt={
                details?.altText ??
                `${context.product} generated view ${index + 1}`
              }
              onLoad={(e) =>
                setDimensions(
                  `${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}`,
                )
              }
              className="aspect-square w-full object-cover"
            />
            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-[#20211f]/85 px-4 py-2 text-xs font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Maximize2 className="size-3.5" /> Open viewer
            </span>
          </button>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {images.map((item, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === index ? "border-[#a0785d]" : "border-transparent opacity-60 hover:opacity-100"}`}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={imageUrl(item.id)}
                  alt=""
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a0785d]">
            {details?.category ?? "Image details"}
          </p>
          {loading && !details ? (
            <div className="mt-4 space-y-3" aria-busy="true">
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-[#e5e4dc]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#e5e4dc]" />
              <div className="h-24 animate-pulse rounded-xl bg-[#e5e4dc]" />
              <p className="flex items-center gap-2 pt-2 text-sm text-[#85867f]">
                <Sparkles className="size-4 animate-pulse text-[#a0785d]" />{" "}
                Writing product details with AI…
              </p>
            </div>
          ) : (
            <>
              <h1 className="mt-3 font-serif text-4xl tracking-[-0.045em]">
                {details?.title ??
                  titleCase(context.product || "Product image")}
              </h1>
              {details && (
                <p className="mt-2 text-lg text-[#777871]">{details.tagline}</p>
              )}
            </>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-3 rounded-2xl border border-[#e8c9bd] bg-[#fbefe9] p-4 text-[#7a3b27]"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3d6c9]">
                <AlertTriangle className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  We couldn’t write the product details
                </p>
                <p className="mt-1 break-words text-sm text-[#8f5440]">
                  {error}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadDetails}
                className="rounded-full border-[#e0b9a9] bg-transparent"
              >
                <RefreshCw data-icon="inline-start" /> Retry
              </Button>
            </div>
          )}

          {details && (
            <>
              <Block
                title="Description"
                action={
                  <CopyButton
                    active={copied === "description"}
                    onClick={() => copy("description", details.description)}
                  />
                }
              >
                <p className="leading-relaxed text-[#4d4e48]">
                  {details.description}
                </p>
              </Block>
              <Block title="Key features">
                <ul className="space-y-2.5">
                  {details.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 text-sm text-[#4d4e48]"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-[#a0785d]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Block>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Fact label="Materials" value={details.materials.join(", ")} />
                <Fact label="Style" value={details.style} />
                <Fact label="Target audience" value={details.targetAudience} />
                <Fact label="Care" value={details.careInstructions} />
              </div>
              <Block
                title="Tags & SEO keywords"
                action={
                  <CopyButton
                    active={copied === "keywords"}
                    onClick={() =>
                      copy("keywords", details.keywords.join(", "))
                    }
                  />
                }
              >
                <div className="flex flex-wrap gap-2">
                  {details.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#20211f] px-3 py-1 text-xs text-[#f7f6f2]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {details.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-[#d6d5cd] bg-white px-3 py-1 text-xs text-[#656660]"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </Block>
              <Block
                title="Alt text"
                action={
                  <CopyButton
                    active={copied === "alt"}
                    onClick={() => copy("alt", details.altText)}
                  />
                }
              >
                <p className="text-sm text-[#4d4e48]">{details.altText}</p>
              </Block>
              <button
                onClick={loadDetails}
                disabled={loading}
                className="mt-4 flex items-center gap-2 text-sm text-[#a0785d] disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />{" "}
                Regenerate details
              </button>
            </>
          )}

          <Block title="Image specifications">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {specs.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-[#85867f]">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{value}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-xs text-[#85867f]">Colorways</dt>
                <dd className="mt-1.5 flex flex-wrap gap-2">
                  {context.colors.map((name) => (
                    <span
                      key={name}
                      className="flex items-center gap-2 rounded-full border border-[#deded7] bg-white px-3 py-1 text-xs"
                    >
                      <span
                        className="size-3 rounded-full border border-black/10"
                        style={{ background: colorValues[name] ?? "#ccc" }}
                      />
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </Block>
        </section>
      </main>

      {viewer && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#111210]/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <p className="truncate text-sm text-white/70">
              {details?.title ?? context.product} ·{" "}
              {image.angle ? titleCase(image.angle) : `Angle ${index + 1}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomed((z) => !z)}
                className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
              >
                {zoomed ? (
                  <ZoomOut className="size-4" />
                ) : (
                  <ZoomIn className="size-4" />
                )}
              </button>
              <a
                href={imageDownloadUrl(image.id)}
                className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Download"
              >
                <Download className="size-4" />
              </a>
              <button
                onClick={() => setViewer(false)}
                className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                aria-label="Close viewer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4"
            onClick={(e) => e.target === e.currentTarget && setViewer(false)}
          >
            {images.length > 1 && (
              <button
                onClick={() => step(-1)}
                className="fixed left-4 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft />
              </button>
            )}
            <img
              src={src}
              alt={details?.altText ?? ""}
              onClick={() => setZoomed((z) => !z)}
              className={`rounded-lg shadow-2xl transition-all ${zoomed ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain"}`}
            />
            {images.length > 1 && (
              <button
                onClick={() => step(1)}
                className="fixed right-4 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Block({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-[#deded7] bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#deded7] bg-white p-5">
      <p className="text-xs text-[#85867f]">{label}</p>
      <p className="mt-1.5 text-sm">{value}</p>
    </div>
  );
}

function CopyButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-[#a0785d]"
    >
      {active ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {active ? "Copied" : "Copy"}
    </button>
  );
}
