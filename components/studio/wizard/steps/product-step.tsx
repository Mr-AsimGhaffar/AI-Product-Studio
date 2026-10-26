import { DESIGN_COUNTS, MATERIALS, STYLES } from '@/lib/studio-data'
import type { StepProps } from '../types'
import { ChoiceChip } from '../../shared/choice-chip'
import { SelectField, TextAreaField, TextField } from '../../shared/field'

export function ProductStep({ brief, update }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <TextField label="Product idea" value={brief.product} onChange={(event) => update('product', event.target.value)} placeholder="e.g. cropped leather jacket" autoComplete="off" autoFocus required />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Style" options={STYLES} value={brief.style} onChange={(value) => update('style', value)} />
        <SelectField label="Material" options={MATERIALS} value={brief.material} onChange={(value) => update('material', value)} />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Number of unique designs</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DESIGN_COUNTS.map((count) => (
            <ChoiceChip key={count} selected={brief.designs === count} onClick={() => update('designs', count)} aria-label={`${count} ${count === 1 ? 'design' : 'designs'}`} className="size-11 px-0">{count}</ChoiceChip>
          ))}
        </div>
      </fieldset>
      <TextAreaField label="Extra details" rows={4} value={brief.extra} onChange={(event) => update('extra', event.target.value)} placeholder="Fit, pockets, stitching, logo placement..." />
    </div>
  )
}
