type EmptyStateProps = { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-input bg-card/50 px-6 py-14 text-center">
      <span aria-hidden className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">{icon}</span>
      <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
