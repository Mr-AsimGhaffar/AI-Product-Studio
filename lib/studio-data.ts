export type View = 'dashboard' | 'create' | 'gallery' | 'listings'

export const WIZARD_STEPS = [
  { label: 'Product', title: 'What are we making?', description: 'Start with the product. We’ll build the rest of the world around it.' },
  { label: 'Creative direction', title: 'Set the visual direction.', description: 'Define the look and feel so every image stays consistent.' },
  { label: 'Output', title: 'Where will it live?', description: 'Choose your output formats and destinations.' },
  { label: 'Review', title: 'Ready to bring it to life?', description: 'Review your brief before we generate the first design concepts.' },
] as const

export const PHOTO_SETS = [
  { label: 'Front only', count: 1, detail: 'Single hero image' },
  { label: 'Front + back', count: 2, detail: 'Essential coverage' },
  { label: 'Four angles', count: 4, detail: 'Complete product view' },
  { label: 'Full set', count: 6, detail: 'Every angle, per color' },
]

export const COLORWAYS = [
  { name: 'Ink', value: '#20242a' },
  { name: 'Bone', value: '#e7dfd0' },
  { name: 'Cobalt', value: '#3158bd' },
  { name: 'Rust', value: '#b9553b' },
]

export const PLATFORMS = ['Amazon', 'eBay', 'Etsy', 'Website', 'Daraz', 'Alibaba']
export const STYLES = ['Casual', 'Formal', 'Streetwear', 'Luxury', 'Minimalist']
export const MATERIALS = ['Leather', 'Cotton', 'Denim', 'Wool', 'Custom']
export const PHOTO_STYLES = ['Studio', 'Commercial', 'Catalog', 'Editorial', 'Lifestyle']
export const MODEL_LOOKS = ['Product-only', 'Ghost mannequin', 'Female model', 'Male model']
export const COUNTRIES = ['United States', 'United Kingdom', 'Pakistan', 'United Arab Emirates', 'Australia']
export const LANGUAGES = ['English', 'Urdu', 'Arabic', 'Spanish']
export const DESIGN_COUNTS = [1, 2, 3, 4, 5]

export type Project = {
  name: string
  type: string
  status: 'Ready' | 'Generating'
  images: number
  date: string
  image: string
}

export const PROJECTS: Project[] = [
  { name: 'Autumn outerwear / 01', type: 'Jacket · 3 colors', status: 'Ready', images: 18, date: 'Oct 18', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80' },
  { name: 'Everyday knitwear', type: 'Sweater · 2 colors', status: 'Generating', images: 8, date: 'Oct 17', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80' },
  { name: 'Studio essentials', type: 'Trousers · 4 colors', status: 'Ready', images: 24, date: 'Oct 15', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80' },
]
