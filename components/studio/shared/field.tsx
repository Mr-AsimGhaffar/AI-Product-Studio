import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const controlStyles =
  'w-full rounded-lg border border-input bg-card px-4 text-base font-normal text-foreground shadow-xs transition placeholder:text-muted-foreground/70 hover:border-foreground/30 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/25 sm:text-sm'

type FieldShellProps = { label: string; hint?: string; htmlFor: string; children: React.ReactNode }

function FieldShell({ label, hint, htmlFor, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

type TextFieldProps = Omit<React.ComponentProps<'input'>, 'id'> & { label: string; hint?: string }

export function TextField({ label, hint, className, ...props }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <input id={id} className={cn(controlStyles, 'h-12', className)} {...props} />
    </FieldShell>
  )
}

type TextAreaFieldProps = Omit<React.ComponentProps<'textarea'>, 'id'> & { label: string; hint?: string }

export function TextAreaField({ label, hint, className, ...props }: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} hint={hint} htmlFor={id}>
      <textarea id={id} className={cn(controlStyles, 'resize-y py-3 leading-relaxed', className)} {...props} />
    </FieldShell>
  )
}

type SelectFieldProps = { label: string; options: string[]; value: string; onChange: (value: string) => void }

export function SelectField({ label, options, value, onChange }: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} htmlFor={id}>
      <span className="relative">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={cn(controlStyles, 'h-12 cursor-pointer appearance-none pr-10')}>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </span>
    </FieldShell>
  )
}
