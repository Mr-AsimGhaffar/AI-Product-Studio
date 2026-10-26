'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WIZARD_STEPS } from '@/lib/studio-data'
import { ErrorAlert } from '../shared/error-alert'
import { EstimatePanel } from './estimate-panel'
import { Stepper, StepProgressBar } from './stepper'
import { DirectionStep } from './steps/direction-step'
import { OutputStep } from './steps/output-step'
import { ProductStep } from './steps/product-step'
import { ReviewStep } from './steps/review-step'
import type { StepProps } from './types'

type CreationWizardProps = StepProps & {
  step: number
  onStepChange: (step: number) => void
  generationError: string
  onExit: () => void
  onGenerate: () => void
}

const STEP_COMPONENTS = [ProductStep, DirectionStep, OutputStep, ReviewStep]
const LAST_STEP = WIZARD_STEPS.length - 1

export default function CreationWizard({ step, onStepChange: setStep, generationError, onExit, onGenerate, ...stepProps }: CreationWizardProps) {
  const { brief } = stepProps
  const heading = useRef<HTMLHeadingElement>(null)
  const hasNavigated = useRef(false)
  const StepComponent = STEP_COMPONENTS[step]
  const { title, description } = WIZARD_STEPS[step]

  const blocker = step === 0 && !brief.product.trim()
    ? 'Describe your product to continue.'
    : step === 1 && brief.colors.length === 0
      ? 'Select at least one colorway to continue.'
      : ''

  useEffect(() => {
    if (hasNavigated.current) heading.current?.focus()
    hasNavigated.current = true
  }, [step])

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6 md:h-[76px] md:px-10">
          <button type="button" onClick={onExit} className="-ml-2 flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition hover:text-foreground">
            <X aria-hidden className="size-4" /> Exit
          </button>
          <Stepper step={step} />
          <span className="text-sm text-muted-foreground md:hidden">Step {step + 1} of {WIZARD_STEPS.length}</span>
          <span className="hidden text-sm text-muted-foreground md:inline">Draft saved</span>
        </div>
        <StepProgressBar step={step} />
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-10 md:py-14 2xl:max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18.75rem]">
          <form
            onSubmit={(event) => { event.preventDefault(); if (!blocker) step < LAST_STEP ? setStep(step + 1) : onGenerate() }}
            noValidate
          >
            <div key={step} className="animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-text">Step {step + 1} of {WIZARD_STEPS.length}</p>
              <h1 ref={heading} tabIndex={-1} className="mt-3 text-balance font-serif text-3xl tracking-[-0.045em] outline-none sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-xl text-pretty text-muted-foreground">{description}</p>
              <div className="mt-8 md:mt-10"><StepComponent {...stepProps} /></div>
            </div>

            {generationError && (
              <div className="mt-8">
                <ErrorAlert title="We couldn’t generate your images" message={generationError} hint="Check your settings and try again — your selections are saved." />
              </div>
            )}

            <div className="mt-10 border-t pt-6">
              {blocker && <p role="status" className="mb-4 text-sm text-muted-foreground">{blocker}</p>}
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="ghost" size="xl" onClick={() => setStep(step - 1)} disabled={step === 0}>Back</Button>
                {step < LAST_STEP ? (
                  <Button type="submit" size="xl" disabled={Boolean(blocker)} className="rounded-full px-6">Continue <ArrowRight aria-hidden data-icon="inline-end" /></Button>
                ) : (
                  <Button type="submit" variant="brand" size="xl" className="rounded-full px-6"><Sparkles aria-hidden data-icon="inline-start" /> Generate concept</Button>
                )}
              </div>
            </div>
          </form>

          <EstimatePanel brief={brief} totalImages={stepProps.totalImages} />
        </div>
      </main>
    </div>
  )
}
