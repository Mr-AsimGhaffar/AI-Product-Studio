"use client";

import { useCallback, useRef, useState } from "react";
import type { GeneratedImage } from "@/components/image-detail";
import { api, type ProjectWithImages } from "@/lib/api";
import type { Brief } from "@/lib/brief";

const FALLBACK_ERROR = "Image generation failed.";

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  // Keeps generated images when saving fails so a retry doesn't pay for generation again.
  const pending = useRef<{ key: string; images: GeneratedImage[] } | null>(
    null,
  );

  const generate = useCallback(
    async (brief: Brief): Promise<ProjectWithImages | null> => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      setError("");
      setIsGenerating(true);
      try {
        const {
          product,
          colors,
          photoSet,
          style,
          material,
          extra,
          photoStyle,
          modelLook,
        } = brief;
        const payload = {
          product,
          colors,
          photoSet,
          style,
          material,
          extra,
          photoStyle,
          modelLook,
        };
        const key = JSON.stringify(payload);

        let images =
          pending.current?.key === key ? pending.current.images : null;
        if (!images) {
          const response = await fetch("/api/generate-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: abort.signal,
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || FALLBACK_ERROR);
          images = (data.images || []) as GeneratedImage[];
          pending.current = { key, images };
        }

        const name = product.trim();
        const saved = await api.createProject({
          name: brief.projectName.trim() || name,
          product: name,
          colors,
          platform: brief.platform,
          brief: {
            ...payload,
            country: brief.country,
            language: brief.language,
          },
          images: images.map(({ base64, mediaType, angle, prompt, model }) => ({
            base64,
            mediaType,
            angle,
            prompt,
            model,
          })),
        });
        pending.current = null;
        return saved;
      } catch (err) {
        if (!abort.signal.aborted)
          setError(err instanceof Error ? err.message : FALLBACK_ERROR);
        return null;
      } finally {
        if (controller.current === abort) setIsGenerating(false);
      }
    },
    [],
  );

  const cancel = useCallback(() => {
    controller.current?.abort();
    setIsGenerating(false);
  }, []);

  return { isGenerating, error, generate, cancel };
}
