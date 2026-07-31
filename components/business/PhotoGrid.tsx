'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import type { Photo } from '@/types'
import { cn } from '@/utils/cn'

interface PhotoGridProps {
  photos: Photo[]
  /** Nombre de colonnes sur grand écran. */
  columns?: 2 | 3 | 4
  /**
   * En-tête de section, rendu par la grille elle-même.
   *
   * Il lui est confié pour qu'il disparaisse avec elle : le serveur ne peut
   * pas savoir qu'une URL est morte — seul ce composant l'apprend, quand le
   * navigateur échoue à charger. Laissé dans la page, le titre survivait seul
   * au-dessus du vide.
   *
   * Le nœud est construit côté serveur et passé en prop : il n'entre donc pas
   * dans le bundle client.
   */
  heading?: ReactNode
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
 * vides. Si aucune ne charge, la section entière disparaît — en-tête compris.
 */
export function PhotoGrid({ photos, columns = 4, heading, className }: PhotoGridProps) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set())

  const visible = photos.filter((photo) => !failed.has(photo.id))
  if (visible.length === 0) return null

  const markFailed = (id: string) => setFailed((current) => new Set(current).add(id))

  const grid = (
    <ul
      className={cn('grid grid-cols-2 gap-3', COLUMN_CLASSES[columns], heading ? 'mt-10' : className)}
    >
      {visible.map((photo) => (
        <li key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-ink-150">
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

  // Sans en-tête, la grille reste un bloc nu que l'appelant place lui-même.
  if (!heading) return grid

  return (
    <Container size="wide" as="section" className={className}>
      {heading}
      {grid}
    </Container>
  )
}
