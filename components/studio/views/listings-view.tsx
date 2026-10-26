'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLATFORMS } from '@/lib/studio-data'
import { ChoiceChip } from '../shared/choice-chip'
import { TextAreaField, TextField } from '../shared/field'
import { PageHeading } from '../shared/page-heading'

type ListingsViewProps = { platform: string; onPlatformChange: (platform: string) => void }
type Status = 'idle' | 'working' | 'done'

const INITIAL_DRAFT = {
  title: 'Structured leather jacket — relaxed fit, everyday outerwear',
  description: 'A considered outer layer cut from supple leather with a relaxed shape and refined utility details. Designed for daily wear.',
  keywords: 'leather jacket, relaxed fit, autumn outerwear, everyday jacket',
}

/** Simulates an async action and exposes a short-lived status for button feedback. */
function useActionStatus(duration: number, resetAfter?: number) {
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const run = () => {
    clearTimeout(timer.current)
    setStatus('working')
    timer.current = setTimeout(() => {
      setStatus('done')
      if (resetAfter) timer.current = setTimeout(() => setStatus('idle'), resetAfter)
    }, duration)
  }
  return [status, run] as const
}

export default function ListingsView({ platform, onPlatformChange }: ListingsViewProps) {
  const [draft, setDraft] = useState(INITIAL_DRAFT)
  const [saveStatus, save] = useActionStatus(700, 2000)
  const [regenerateStatus, regenerate] = useActionStatus(1200, 0)
  const setField = (key: keyof typeof INITIAL_DRAFT) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((current) => ({ ...current, [key]: event.target.value }))

  return (
    <>
      <PageHeading eyebrow="Copy studio" title="Marketplace listings" description="One product brief, shaped for every marketplace." />

      <div role="group" aria-label="Marketplace" className="mt-9 flex flex-wrap gap-2 border-b pb-4">
        {PLATFORMS.map((name) => (
          <ChoiceChip key={name} tone="light" selected={name === platform} onClick={() => onPlatformChange(name)} className="rounded-full">{name}</ChoiceChip>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form onSubmit={(event) => { event.preventDefault(); save() }} className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-medium">{platform} listing draft</h2>
              <p className="mt-1 text-sm text-muted-foreground">Autumn outerwear / 01 · Draft v2</p>
            </div>
            <Button type="button" variant="outline" size="lg" onClick={regenerate} disabled={regenerateStatus === 'working'} className="rounded-full">
              <RefreshCw aria-hidden data-icon="inline-start" className={regenerateStatus === 'working' ? 'animate-spin' : ''} />
              {regenerateStatus === 'working' ? 'Regenerating…' : 'Regenerate'}
            </Button>
          </div>

          <div aria-busy={regenerateStatus === 'working'} className={`mt-7 flex flex-col gap-5 transition-opacity ${regenerateStatus === 'working' ? 'opacity-50' : ''}`}>
            <TextField label="Title" value={draft.title} onChange={setField('title')} />
            <TextAreaField label="Description" rows={6} value={draft.description} onChange={setField('description')} />
            <TextField label="Keywords" hint="Separate keywords with commas." value={draft.keywords} onChange={setField('keywords')} />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" size="xl" disabled={saveStatus === 'working'} className="rounded-full">
              {saveStatus === 'working' ? <LoaderCircle aria-hidden className="animate-spin" /> : saveStatus === 'done' ? <Check aria-hidden /> : null}
              {saveStatus === 'working' ? 'Saving…' : saveStatus === 'done' ? 'Saved' : 'Save listing'}
            </Button>
            <span role="status" className="sr-only">{saveStatus === 'done' ? 'Listing saved' : ''}</span>
          </div>
        </form>

        <aside className="h-fit rounded-xl border bg-secondary/60 p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-sm font-medium"><Sparkles aria-hidden className="size-4 text-accent-text" /> AI writing guardrails</div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Content is grounded in your approved product brief. We never invent certifications, prices, warranties, or business claims.</p>
          <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">Last edited just now</p>
        </aside>
      </div>
    </>
  )
}
