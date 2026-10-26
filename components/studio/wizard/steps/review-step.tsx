import { Check } from 'lucide-react'
import type { StepProps } from '../types'
import { SummaryRow } from '../../shared/summary-row'

export function ReviewStep({ brief, totalImages }: StepProps) {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-success text-success-foreground"><Check className="size-5" /></span>
        <div>
          <h2 className="font-medium">Your brief is ready</h2>
          <p className="text-sm text-muted-foreground">We’ll generate a design concept first for your approval.</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-3 border-t pt-5">
        <SummaryRow label="Product" value={brief.product.trim()} />
        <SummaryRow label="Designs" value={`${brief.designs} unique ${brief.designs === 1 ? 'concept' : 'concepts'}`} />
        <SummaryRow label="Colors" value={`${brief.colors.length} ${brief.colors.length === 1 ? 'colorway' : 'colorways'}`} />
        <SummaryRow label="Image output" value={`${totalImages} images total`} />
        <SummaryRow label="Listing" value={`${brief.platform} · ${brief.language}`} />
      </dl>
    </div>
  )
}
