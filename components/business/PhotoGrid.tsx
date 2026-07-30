import Image from 'next/image'
import type { Photo } from '@/types'
import { cn } from '@/utils/cn'

interface PhotoGridProps {
  photos: Photo[]
  /** Nombre de colonnes sur grand écran. */
  columns?: 2 | 3 | 4
  className?: string
}

const COLUMN_CLASSES = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

/** Grille de photos statique (sans interaction), utilisée sur l'accueil. */
export function PhotoGrid({ photos, columns = 4, className }: PhotoGridProps) {
  if (photos.length === 0) return null

  return (
    <ul className={cn('grid grid-cols-2 gap-3', COLUMN_CLASSES[columns], className)}>
      {photos.map((photo) => (
        <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </li>
      ))}
    </ul>
  )
}
