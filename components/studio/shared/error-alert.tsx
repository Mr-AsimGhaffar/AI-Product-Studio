import { AlertTriangle } from 'lucide-react'

type ErrorAlertProps = { title: string; message: string; hint?: string }

export function ErrorAlert({ title, message, hint }: ErrorAlertProps) {
  return (
    <div role="alert" className="flex animate-fade-up items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive-soft p-4 text-destructive shadow-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-destructive/10"><AlertTriangle aria-hidden className="size-[18px]" /></span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 break-words text-sm leading-relaxed">{message}</p>
        {hint && <p className="mt-2 text-xs opacity-80">{hint}</p>}
      </div>
    </div>
  )
}
