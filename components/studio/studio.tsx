'use client'

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useBrief } from '@/hooks/use-brief'
import { useImageGeneration } from '@/hooks/use-image-generation'
import { imageSrc } from '@/lib/brief'
import type { Project, View } from '@/lib/studio-data'
import { AppShell } from './layout/app-shell'
import { GenerationProgress } from './generation-progress'
import { ViewSkeleton } from './shared/view-skeleton'
import { DashboardView } from './views/dashboard-view'

const CreationWizard = dynamic(() => import('./wizard/creation-wizard'), { loading: () => <div className="p-8"><ViewSkeleton /></div> })
const GalleryView = dynamic(() => import('./views/gallery-view'), { loading: () => <ViewSkeleton /> })
const ListingsView = dynamic(() => import('./views/listings-view'), { loading: () => <ViewSkeleton /> })
const ImageDetail = dynamic(() => import('@/components/image-detail').then((module) => module.ImageDetail), { loading: () => <div className="p-8"><ViewSkeleton /></div> })

export function Studio() {
  const [view, setView] = useState<View>('dashboard')
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [wizardStep, setWizardStep] = useState(0)
  const { brief, update, toggleColor, totalImages } = useBrief()
  const { images, context, isGenerating, error, generate, cancel } = useImageGeneration()

  const latestProject = useMemo<Project | undefined>(() => {
    if (images.length === 0) return undefined
    const name = context.product || 'New product'
    return {
      name,
      type: `${name} · ${context.colors.length} ${context.colors.length === 1 ? 'color' : 'colors'}`,
      status: 'Ready',
      images: images.length,
      date: 'Just now',
      image: imageSrc(images[0]),
    }
  }, [images, context])

  const goTo = useCallback((next: View) => setView(next), [])
  const openCreate = useCallback(() => setView('create'), [])
  const openLibrary = useCallback(() => setView('gallery'), [])
  const closeDetail = useCallback(() => setSelectedImage(null), [])
  const setPlatform = useCallback((platform: string) => update('platform', platform), [update])

  const handleGenerate = useCallback(async () => {
    if (await generate(brief)) {
      setSelectedImage(null)
      setView('gallery')
    }
  }, [generate, brief])

  if (isGenerating) return <GenerationProgress product={brief.product} totalImages={totalImages} onCancel={cancel} />

  if (view === 'gallery' && selectedImage !== null && images[selectedImage]) {
    return <ImageDetail images={images} index={selectedImage} context={context} onIndexChange={setSelectedImage} onBack={closeDetail} />
  }

  if (view === 'create') {
    return <CreationWizard step={wizardStep} onStepChange={setWizardStep} brief={brief} update={update} toggleColor={toggleColor} totalImages={totalImages} generationError={error} onExit={() => setView('dashboard')} onGenerate={handleGenerate} />
  }

  return (
    <AppShell view={view} onNavigate={goTo}>
      {view === 'gallery' ? (
        <GalleryView images={images} product={context.product || brief.product} onOpenImage={setSelectedImage} onCreate={openCreate} />
      ) : view === 'listings' ? (
        <ListingsView platform={brief.platform} onPlatformChange={setPlatform} />
      ) : (
        <DashboardView latestProject={latestProject} onCreate={openCreate} onOpenLibrary={openLibrary} />
      )}
    </AppShell>
  )
}
