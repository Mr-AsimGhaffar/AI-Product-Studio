import { COUNTRIES, LANGUAGES, PLATFORMS } from '@/lib/studio-data'
import type { StepProps } from '../types'
import { ChoiceChip } from '../../shared/choice-chip'
import { SelectField, TextField } from '../../shared/field'

export function OutputStep({ brief, update }: StepProps) {
  return (
    <div className="flex flex-col gap-7">
      <fieldset>
        <legend className="text-sm font-medium">Selling platforms</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORMS.map((name) => (
            <ChoiceChip key={name} selected={brief.platform === name} onClick={() => update('platform', name)}>{name}</ChoiceChip>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Target country" options={COUNTRIES} value={brief.country} onChange={(value) => update('country', value)} />
        <SelectField label="Language" options={LANGUAGES} value={brief.language} onChange={(value) => update('language', value)} />
      </div>
      <TextField label="Project name" value={brief.projectName} onChange={(event) => update('projectName', event.target.value)} placeholder={brief.product ? `${brief.product} / new collection` : 'e.g. Winter collection 2026'} />
    </div>
  )
}
