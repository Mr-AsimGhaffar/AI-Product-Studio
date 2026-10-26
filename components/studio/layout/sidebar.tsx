import { FileText, Grid2X2, ImagePlus, Sparkles, WandSparkles } from 'lucide-react'
import type { View } from '@/lib/studio-data'
import { cn } from '@/lib/utils'

export const NAV_ITEMS: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Overview', icon: <Grid2X2 /> },
  { view: 'create', label: 'Create new', icon: <WandSparkles /> },
  { view: 'gallery', label: 'Image library', icon: <ImagePlus /> },
  { view: 'listings', label: 'Listings', icon: <FileText /> },
]

export function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
      <span className="font-semibold tracking-[-0.03em]">form &amp; figure</span>
    </div>
  )
}

type SidebarNavProps = { current: View; onNavigate: (view: View) => void }

export function SidebarNav({ current, onNavigate }: SidebarNavProps) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.view === current
        return (
          <button
            key={item.view}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(item.view)}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm transition duration-150 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0',
              active ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function AccountCard() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div aria-hidden className="grid size-9 place-items-center rounded-full bg-[#d9c9b1] text-xs font-semibold text-foreground">AM</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">Amina Malik</p>
        <p className="text-xs text-muted-foreground">Studio plan</p>
      </div>
    </div>
  )
}
