import { Check } from 'lucide-react'
import { WIZARD_STEPS } from '@/lib/studio-data'
import { cn } from '@/lib/utils'

export function Stepper({ step }: { step: number }) {
  return (
    <ol aria-label="Progress" className="hidden items-center md:flex">
      {WIZARD_STEPS.map(({ label }, index) => {
        const done = index < step
        return (
          <li key={label} aria-current={index === step ? 'step' : undefined} className="flex items-center gap-2">
            <span className={cn('grid size-7 place-items-center rounded-full text-xs transition-colors duration-300', index <= step ? 'bg-primary text-primary-foreground' : 'border border-input text-muted-foreground')}>
              {done ? <Check aria-hidden className="size-3" /> : index + 1}
            </span>
            <span className={cn('text-sm', index === step ? 'font-medium' : 'text-muted-foreground')}>{label}</span>
            {index < WIZARD_STEPS.length - 1 && <span aria-hidden className="mx-2 h-px w-6 bg-input lg:w-8" />}
          </li>
        )
      })}
    </ol>
  )
}

export function StepProgressBar({ step }: { step: number }) {
  return (
    <div role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={WIZARD_STEPS.length} aria-valuenow={step + 1} className="h-1 w-full bg-muted md:hidden">
      <div className="h-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }} />
    </div>
  )
}
