import type { Brief } from '@/lib/brief'
import { SummaryRow } from '../shared/summary-row'

type EstimatePanelProps = { brief: Brief; totalImages: number }

export function EstimatePanel({ brief, totalImages }: EstimatePanelProps) {
  return (
    <aside aria-label="Live estimate" className="h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live estimate</span>
        <span aria-hidden className="size-2 rounded-full bg-success-foreground/60" />
      </div>
      <div className="mt-6" aria-live="polite">
        <p className="text-4xl font-semibold tracking-[-0.06em] tabular-nums">{totalImages}</p>
        <p className="text-sm text-muted-foreground">images in complete set</p>
      </div>
      <dl className="mt-6 flex flex-col gap-3 border-t pt-5">
        <SummaryRow label="Designs" value={String(brief.designs)} />
        <SummaryRow label="Colorways" value={String(brief.colors.length)} />
        <SummaryRow label="Images / color" value={String(brief.photoSet)} />
      </dl>
      <p className="mt-6 rounded-lg bg-background p-3 text-xs leading-relaxed text-muted-foreground">You’ll approve your favorite concept before we create the full image set.</p>
    </aside>
  )
}
