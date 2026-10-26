type PageHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  actions?: React.ReactNode
  size?: 'default' | 'large'
}

export function PageHeading({ eyebrow, title, description, actions, size = 'default' }: PageHeadingProps) {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">{eyebrow}</p>
        <h1 className={`mt-3 text-balance font-serif tracking-[-0.045em] ${size === 'large' ? 'text-4xl md:text-5xl' : 'text-4xl'}`}>{title}</h1>
        {description && <p className="mt-3 max-w-xl text-pretty text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
