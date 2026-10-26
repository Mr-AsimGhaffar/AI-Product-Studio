import { memo } from 'react'

type StatCardProps = { label: string; value: string; note: string }

export const StatCard = memo(function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card/70 p-5 transition-shadow duration-200 hover:shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-accent-text">{note}</p>
    </div>
  )
})
