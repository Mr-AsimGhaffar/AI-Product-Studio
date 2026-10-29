import type { Brief } from '@/lib/brief'
import { colorValue } from '@/lib/studio-data'
import { SummaryRow } from '../shared/summary-row'

type EstimatePanelProps = { brief: Brief; totalImages: number }

export function EstimatePanel({ brief, totalImages }: EstimatePanelProps) {
  return (
    <aside aria-label="Live estimate" className="h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-8">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Live estimate</span>
        <span aria-hidden className="size-2 rounded-full bg-success-foreground/60" />
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border bg-background">
        <div className="relative flex aspect-[1.7] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_55%_45%,oklch(0.94_0.035_70),transparent_72%)]">
          <div className="grid size-24 place-items-center rounded-full border border-foreground/10 bg-card/80 shadow-sm">
            <span className="font-serif text-2xl text-accent-text">
              {brief.product.trim().slice(0, 1).toUpperCase() || (
                <span aria-hidden className="text-xl">AI</span>
              )}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-background/90 to-transparent px-3 pb-3 pt-8">
            {brief.colors.map((name) => {
              return (
                <span
                  key={name}
                  title={name}
                  className="size-4 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: colorValue(name) ?? 'var(--muted)' }}
                />
              )
            })}
          </div>
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium">
            {brief.product.trim() || 'Your product preview'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {brief.photoStyle} photography · {brief.modelLook}
          </p>
        </div>
      </div>
      <div className="mt-5" aria-live="polite">
        <p className="text-4xl font-semibold tracking-[-0.06em] tabular-nums">{totalImages}</p>
        <p className="text-sm text-muted-foreground">images in complete set</p>
      </div>
      <dl className="mt-5 flex flex-col gap-3 border-t pt-4">
        <SummaryRow label="Unique designs" value={String(brief.designs)} />
        <SummaryRow label="Colorways" value={String(brief.colors.length)} />
        <SummaryRow label="Images / color" value={String(brief.photoSet)} />
      </dl>
      <p className="mt-4 rounded-lg bg-accent-soft p-3 text-xs leading-relaxed text-muted-foreground">
        {brief.photoSet} {brief.photoSet === 1 ? "view" : "views"} generated per project
      </p>
    </aside>
  )
}
