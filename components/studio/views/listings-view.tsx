'use client'

import { useState } from 'react'
import { Check, Copy, Info, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLATFORMS } from '@/lib/studio-data'
import { ChoiceChip } from '../shared/choice-chip'
import { TextAreaField, TextField } from '../shared/field'
import { PageHeading } from '../shared/page-heading'

type ListingsViewProps = { platform: string; onPlatformChange: (platform: string) => void }

const INITIAL_DRAFT = {
  title: 'Structured leather jacket — relaxed fit, everyday outerwear',
  description: 'A considered outer layer cut from supple leather with a relaxed shape and refined utility details. Designed for daily wear.',
  keywords: 'leather jacket, relaxed fit, autumn outerwear, everyday jacket',
}

export default function ListingsView({ platform, onPlatformChange }: ListingsViewProps) {
  const [draft, setDraft] = useState(INITIAL_DRAFT)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')
  const setField =
    (key: keyof typeof INITIAL_DRAFT) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCopied(false)
      setCopyError('')
      setDraft((current) => ({ ...current, [key]: event.target.value }))
    }

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(
        `${draft.title}\n\n${draft.description}\n\nKeywords: ${draft.keywords}`,
      )
      setCopied(true)
      setCopyError('')
    } catch {
      setCopied(false)
      setCopyError('Could not access the clipboard. Select and copy the text instead.')
    }
  }

  return (
    <>
      <PageHeading eyebrow="Copy studio" title="Marketplace listings" description="Shape a product listing for your chosen marketplace." />

      <div role="group" aria-label="Marketplace" className="mt-9 flex flex-wrap gap-2 border-b pb-4">
        {PLATFORMS.map((name) => (
          <ChoiceChip key={name} tone="light" selected={name === platform} onClick={() => onPlatformChange(name)} className="rounded-full">{name}</ChoiceChip>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning-foreground/15 bg-warning p-4 text-warning-foreground">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Example preview — not connected to a project</p>
          <p className="mt-1 text-sm leading-relaxed">
            This sample draft is for layout preview only. Changes remain local until you leave this page; saving or generating project-specific listings is not available yet.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="listing-draft-title" className="rounded-xl border bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="listing-draft-title" className="font-medium">{platform} listing draft</h2>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">Sample</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Example product · Preview only</p>
            </div>
            <Button type="button" variant="outline" size="lg" onClick={copyDraft} className="rounded-full">
              {copied ? <Check aria-hidden data-icon="inline-start" /> : <Copy aria-hidden data-icon="inline-start" />}
              {copied ? 'Copied' : 'Copy listing'}
            </Button>
          </div>

          <div className="mt-7 flex flex-col gap-5">
            <TextField label="Title" value={draft.title} onChange={setField('title')} />
            <TextAreaField label="Description" rows={6} value={draft.description} onChange={setField('description')} />
            <TextField label="Keywords" hint="Separate keywords with commas." value={draft.keywords} onChange={setField('keywords')} />
          </div>
          {copyError && <p role="alert" className="mt-4 text-sm text-destructive">{copyError}</p>}
          {copied && <p role="status" className="sr-only">Listing copied to clipboard.</p>}
        </section>

        <aside className="h-fit rounded-xl border bg-secondary/60 p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-sm font-medium"><Sparkles aria-hidden className="size-4 text-accent-text" /> About this preview</div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Choose a marketplace and edit the example copy. The title, description, and keywords are sample content—not AI-generated or saved to a project.
          </p>
          <div className="mt-5 border-t pt-4">
            <p className="text-xs font-medium text-foreground">Available now</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Edit locally and copy the listing text to use elsewhere.</p>
          </div>
        </aside>
      </div>
    </>
  )
}
