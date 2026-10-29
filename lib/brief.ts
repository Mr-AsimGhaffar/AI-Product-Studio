import type { GeneratedImage } from '@/components/image-detail'

export type Brief = {
  product: string
  designs: number
  colors: string[]
  photoSet: number
  platform: string
  style: string
  material: string
  extra: string
  photoStyle: string
  modelLook: string
  country: string
  language: string
  projectName: string
}

export const DEFAULT_BRIEF: Brief = {
  product: '',
  designs: 3,
  colors: ['Ink', 'Bone', 'Cobalt'],
  photoSet: 4,
  platform: 'Amazon',
  style: 'Casual',
  material: 'Cotton',
  extra: '',
  photoStyle: 'Studio',
  modelLook: 'Female model',
  country: 'United States',
  language: 'English',
  projectName: '',
}

// Generation produces one image per selected angle, so the total equals the photo set size.
export const countImages = (brief: Pick<Brief, 'photoSet'>) => brief.photoSet

export const imageSrc = (image: GeneratedImage) => `data:${image.mediaType};base64,${image.base64}`

export const slugify = (value: string) => value.trim().replace(/\s+/g, '-').toLowerCase() || 'product'
