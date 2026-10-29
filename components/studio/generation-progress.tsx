'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STAGES = [
  'Composing your creative brief',
  'Rendering consistent product photography',
  'Matching colorways and angles',
  'Finishing touches and quality checks',
]

type GenerationProgressProps = { product: string; totalImages: number; onCancel: () => void }

export function GenerationProgress({ product, totalImages, onCancel }: GenerationProgressProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStage((current) => Math.min(current + 1, STAGES.length - 1)), 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <main id="main" className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-xl animate-fade-up text-center">
        <div aria-hidden className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="size-7 animate-shimmer" /></div>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">Creative engine</p>
        <h1 className="mt-3 text-balance font-serif text-3xl tracking-[-0.045em] sm:text-4xl">Building your product world.</h1>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          Creating {totalImages} image{totalImages === 1 ? '' : 's'} for {product || 'your product'} across the selected angles.
        </p>
        <div role="progressbar" aria-label="Generating images" className="relative mt-10 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="absolute inset-y-0 left-0 w-2/5 animate-indeterminate rounded-full bg-accent" />
        </div>
        <p role="status" className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span aria-hidden className="size-2 animate-shimmer rounded-full bg-accent" />
          {STAGES[stage]}…
        </p>
        <Button variant="ghost" size="xl" onClick={onCancel} className="mt-8 rounded-full text-muted-foreground">Cancel</Button>
      </div>
    </main>
  )
}
