'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { View } from '@/lib/studio-data'
import { AccountCard, Brand, SidebarNav } from './sidebar'

type MobileNavProps = { open: boolean; current: View; onNavigate: (view: View) => void; onClose: () => void }

/** Native dialog gives us focus trapping, Escape handling and inert background for free. */
export function MobileNav({ open, current, onNavigate, onClose }: MobileNavProps) {
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-label="Navigation"
      onClose={onClose}
      onClick={(event) => event.target === dialog.current && onClose()}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-foreground/30 backdrop:backdrop-blur-[2px] open:animate-in open:fade-in lg:hidden"
    >
      <div className="flex h-full w-[min(20rem,85vw)] animate-slide-in flex-col bg-sidebar px-5 py-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <Brand />
          <button type="button" onClick={onClose} aria-label="Close navigation" className="grid size-11 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-10">
          <SidebarNav current={current} onNavigate={(view) => { onNavigate(view); onClose() }} />
        </div>
        <div className="mt-auto border-t pt-5"><AccountCard /></div>
      </div>
    </dialog>
  )
}
