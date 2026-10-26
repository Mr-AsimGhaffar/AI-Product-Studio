import { cn } from '@/lib/utils'

type ChoiceChipProps = Omit<React.ComponentProps<'button'>, 'type'> & {
  selected: boolean
  tone?: 'dark' | 'light'
}

const tones = {
  dark: {
    on: 'border-primary bg-primary text-primary-foreground',
    off: 'border-input bg-card text-foreground hover:border-foreground/40 hover:bg-muted',
  },
  light: {
    on: 'border-foreground bg-card text-foreground shadow-xs',
    off: 'border-transparent bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground',
  },
}

/** Toggle-style button used for single and multi choice groups. */
export function ChoiceChip({ selected, tone = 'dark', className, children, ...props }: ChoiceChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm transition duration-150 active:scale-[0.97]',
        selected ? tones[tone].on : tones[tone].off,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
