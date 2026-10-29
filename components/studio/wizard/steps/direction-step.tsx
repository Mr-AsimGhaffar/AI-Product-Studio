import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { COLORWAYS, MODEL_LOOKS, PHOTO_SETS, PHOTO_STYLES } from '@/lib/studio-data'
import { cn } from '@/lib/utils'
import type { StepProps } from '../types'
import { ChoiceChip } from '../../shared/choice-chip'
import { SelectField } from '../../shared/field'

export function DirectionStep({ brief, update, toggleColor }: StepProps) {
  const [pickedColor, setPickedColor] = useState('#3158bd')
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
          {brief.colors
            .filter((name) => !COLORWAYS.some((color) => color.name === name))
            .map((hex) => (
              <ChoiceChip key={hex} tone="light" selected onClick={() => toggleColor(hex)} className="rounded-full" aria-label={`Remove ${hex}`}>
                <span aria-hidden className="size-4 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                {hex.toUpperCase()}
                <X aria-hidden className="size-3" />
              </ChoiceChip>
            ))}
          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-input py-1 pl-2 pr-1 text-sm">
            <input
              type="color"
              aria-label="Pick a custom color"
              value={pickedColor}
              onChange={(event) => setPickedColor(event.target.value.toLowerCase())}
              className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
            />
            <span className="tabular-nums text-muted-foreground">{pickedColor.toUpperCase()}</span>
            <button
              type="button"
              disabled={brief.colors.includes(pickedColor)}
              onClick={() => toggleColor(pickedColor)}
              className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition active:scale-[0.97] disabled:opacity-50"
            >
              Add
            </button>
          </div>
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
