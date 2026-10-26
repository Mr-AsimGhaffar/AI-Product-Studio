import Image from 'next/image'
import { Download, ImagePlus, WandSparkles } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import type { GeneratedImage } from '@/components/image-detail'
import { imageSrc, slugify } from '@/lib/brief'
import { cn } from '@/lib/utils'
import { EmptyState } from '../shared/empty-state'
import { PageHeading } from '../shared/page-heading'

type GalleryViewProps = {
  images: GeneratedImage[]
  product: string
  onOpenImage: (index: number) => void
  onCreate: () => void
}

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export default function GalleryView({ images, product, onOpenImage, onCreate }: GalleryViewProps) {
  const name = product || 'Your product'

  return (
    <>
      <PageHeading eyebrow="Visual library" title="Image library" description="Browse, approve, and export every generated asset." />

      <section aria-labelledby="generated-images" className="mt-9">
        {images.length === 0 ? (
          <EmptyState
            icon={<ImagePlus />}
            title="No generated images yet"
            description="Create a project and your generated product photography will appear here, ready to review and download."
            action={<Button size="xl" onClick={onCreate} className="rounded-full"><WandSparkles data-icon="inline-start" aria-hidden /> Create your first set</Button>}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="generated-images" className="text-lg font-semibold tracking-[-0.02em]">{name} · generated images</h2>
              <span className="text-sm text-muted-foreground">{images.length} ready to review</span>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {images.map((image, index) => {
                const label = image.angle ? titleCase(image.angle) : `Angle ${index + 1}`
                const extension = image.mediaType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'png'
                return (
                  <li key={`${image.createdAt ?? ''}-${index}`} className="overflow-hidden rounded-xl border bg-card transition duration-300 hover:shadow-lg hover:shadow-black/5">
                    <button type="button" onClick={() => onOpenImage(index)} aria-label={`Open details for ${label} view`} className="group relative block aspect-square w-full overflow-hidden bg-muted">
                      <Image src={imageSrc(image)} alt={`${name} generated ${label} view`} fill unoptimized sizes="(min-width: 1536px) 18vw, (min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 ease-out group-hover:scale-105" />
                    </button>
                    <div className="flex items-center justify-between gap-2 p-3 text-sm">
                      <span className="truncate font-medium">{label}</span>
                      <a href={imageSrc(image)} download={`${slugify(name)}-${index + 1}.${extension}`} aria-label={`Download ${label} view`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-accent-text')}>
                        <Download aria-hidden /> Save
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
