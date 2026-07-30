'use client'

import Image from 'next/image'
import { useState } from 'react'
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

/**
 * Grille de photos.
 *
 * Les visuels dont l'URL est morte sont **retirés de la grille** plutôt que
 * laissés en image cassée : mieux vaut cinq photos qu'un damier de vignettes
 * vides. Si aucune ne charge, la grille disparaît entièrement.
 */
export function PhotoGrid({ photos, columns = 4, className }: PhotoGridProps) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set())

  const visible = photos.filter((photo) => !failed.has(photo.id))
  if (visible.length === 0) return null

  const markFailed = (id: string) => setFailed((current) => new Set(current).add(id))

  return (
    <ul className={cn('grid grid-cols-2 gap-3', COLUMN_CLASSES[columns], className)}>
      {visible.map((photo) => (
        <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            onError={() => markFailed(photo.id)}
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </li>
      ))}
    </ul>
  )
}
