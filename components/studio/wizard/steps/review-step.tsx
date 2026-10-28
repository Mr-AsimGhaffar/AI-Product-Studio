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
          <p className="text-sm text-muted-foreground">Review the details before generating your complete image set.</p>
        </div>
      </div>
      <dl className="mt-6 grid gap-3 border-t pt-5">
        <SummaryRow label="Project" value={brief.projectName.trim() || brief.product.trim()} />
        <SummaryRow label="Product" value={brief.product.trim()} />
        <SummaryRow label="Style & material" value={`${brief.style} · ${brief.material}`} />
        <SummaryRow label="Colorways" value={brief.colors.join(', ')} />
        <SummaryRow label="Photo direction" value={`${brief.photoStyle} · ${brief.modelLook}`} />
        <SummaryRow label="Photo set" value={`${brief.photoSet} views per colorway`} />
        <SummaryRow label="Listing destination" value={`${brief.platform} · ${brief.country} · ${brief.language}`} />
        <SummaryRow label="Total output" value={`${totalImages} images`} />
      </dl>
    </div>
  )
}
