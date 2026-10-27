"use client";

import { useCallback, useMemo, useState } from "react";
import { countImages, DEFAULT_BRIEF, type Brief } from "@/lib/brief";

export function useBrief() {
  const [brief, setBrief] = useState<Brief>(DEFAULT_BRIEF);

  const update = useCallback(
    <K extends keyof Brief>(key: K, value: Brief[K]) => {
      setBrief((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const toggleColor = useCallback((name: string) => {
    setBrief((current) => ({
      ...current,
      colors: current.colors.includes(name)
        ? current.colors.filter((color) => color !== name)
        : [...current.colors, name],
    }));
  }, []);

  const totalImages = useMemo(() => countImages(brief), [brief]);

  const reset = useCallback(() => setBrief(DEFAULT_BRIEF), []);

  return { brief, update, toggleColor, totalImages, reset };
}
