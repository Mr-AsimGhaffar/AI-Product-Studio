'use client'

import { useCallback, useRef, useState } from 'react'
import type { GeneratedImage, GenerationContext } from '@/components/image-detail'
import type { Brief } from '@/lib/brief'

const FALLBACK_ERROR = 'Image generation failed.'

export function useImageGeneration() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [context, setContext] = useState<GenerationContext>({ product: '', colors: [], platform: 'Amazon' })
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)

  const generate = useCallback(async (brief: Brief): Promise<boolean> => {
    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setError('')
    setIsGenerating(true)
    try {
      const { product, colors, photoSet, style, material, extra, photoStyle, modelLook } = brief
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, colors, photoSet, style, material, extra, photoStyle, modelLook }),
        signal: abort.signal,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || FALLBACK_ERROR)
      setImages(data.images || [])
      setContext({ product: product.trim(), colors, platform: brief.platform })
      return true
    } catch (err) {
      if (!abort.signal.aborted) setError(err instanceof Error ? err.message : FALLBACK_ERROR)
      return false
    } finally {
      if (controller.current === abort) setIsGenerating(false)
    }
  }, [])

  const cancel = useCallback(() => {
    controller.current?.abort()
    setIsGenerating(false)
  }, [])

  return { images, context, isGenerating, error, generate, cancel }
}
