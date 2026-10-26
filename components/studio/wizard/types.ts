import type { Brief } from '@/lib/brief'

export type StepProps = {
  brief: Brief
  update: <K extends keyof Brief>(key: K, value: Brief[K]) => void
  toggleColor: (name: string) => void
  totalImages: number
}
