'use client'

import { useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NAV_ITEMS, AccountCard, Brand, SidebarNav } from './sidebar'
import { MobileNav } from './mobile-nav'
import type { View } from '@/lib/studio-data'

type AppShellProps = { view: View; onNavigate: (view: View) => void; children: React.ReactNode }

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const label = NAV_ITEMS.find((item) => item.view === view)?.label ?? 'Overview'

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r bg-sidebar px-5 py-6 lg:flex 2xl:w-64">
        <Brand />
        <div className="mt-12"><SidebarNav current={view} onNavigate={onNavigate} /></div>
        <div className="mt-auto border-t pt-5"><AccountCard /></div>
      </aside>
      <MobileNav open={menuOpen} current={view} onNavigate={onNavigate} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-60 2xl:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6 md:h-[76px] md:px-10">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" className="-ml-2 grid size-11 place-items-center rounded-full transition hover:bg-muted lg:hidden">
              <Menu className="size-5" />
            </button>
            <span className="hidden text-sm text-muted-foreground sm:inline">Workspace /</span>
            <span className="truncate text-sm font-medium">{label}</span>
          </div>
          <Button size="xl" onClick={() => onNavigate('create')} className="rounded-full">
            <Plus data-icon="inline-start" aria-hidden /> <span>New project</span>
          </Button>
        </header>
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-8 outline-none sm:px-6 md:px-10 md:py-12 2xl:max-w-[1600px] 2xl:px-14">
          <div key={view} className="animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  )
}
