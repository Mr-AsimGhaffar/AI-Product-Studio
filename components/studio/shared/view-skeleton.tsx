/** Lightweight placeholder shown while a lazily loaded view downloads. */
export function ViewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" role="status" className="animate-shimmer space-y-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-secondary" />
        <div className="h-10 w-72 max-w-full rounded-lg bg-secondary" />
        <div className="h-4 w-96 max-w-full rounded-full bg-secondary" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((key) => <div key={key} className="aspect-[1.15] rounded-xl bg-secondary" />)}
      </div>
    </div>
  )
}
