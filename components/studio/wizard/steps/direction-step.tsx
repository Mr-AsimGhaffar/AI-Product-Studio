import { Check } from 'lucide-react'
import { COLORWAYS, MODEL_LOOKS, PHOTO_SETS, PHOTO_STYLES } from '@/lib/studio-data'
import { cn } from '@/lib/utils'
import type { StepProps } from '../types'
import { ChoiceChip } from '../../shared/choice-chip'
import { SelectField } from '../../shared/field'

export function DirectionStep({ brief, update, toggleColor }: StepProps) {
  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="text-sm font-medium">Colorways</legend>
        <p className="mt-1 text-xs text-muted-foreground">Select at least one.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {COLORWAYS.map((color) => {
            const selected = brief.colors.includes(color.name)
            return (
              <ChoiceChip key={color.name} tone="light" selected={selected} onClick={() => toggleColor(color.name)} className="rounded-full">
                <span aria-hidden className="size-4 rounded-full border border-black/10" style={{ backgroundColor: color.value }} />
                {color.name}
                <Check aria-hidden className={cn('size-3 transition-opacity', selected ? 'opacity-100' : 'opacity-0')} />
              </ChoiceChip>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Photo set</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PHOTO_SETS.map((item) => {
            const selected = brief.photoSet === item.count
            return (
              <button
                key={item.label}
                type="button"
                aria-pressed={selected}
                onClick={() => update('photoSet', item.count)}
                className={cn('rounded-xl border p-4 text-left transition duration-150 hover:border-foreground/40 active:scale-[0.99]', selected ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-input bg-card')}
              >
                <span className="flex justify-between font-medium"><span>{item.label}</span><span className="text-accent-text tabular-nums">{item.count}</span></span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Photo style" options={PHOTO_STYLES} value={brief.photoStyle} onChange={(value) => update('photoStyle', value)} />
        <SelectField label="Model look" options={MODEL_LOOKS} value={brief.modelLook} onChange={(value) => update('modelLook', value)} />
      </div>
    </div>
  )
}
