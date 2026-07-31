'use client'

import Image from 'next/image'
import { useCallback, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { cn } from '@/utils/cn'

export interface GalleryImage {
  url: string
  alt: string
}

interface GalleryProps {
  images: GalleryImage[]
  /**
   * En-tête de section, rendu par la galerie elle-même.
   *
   * Il lui est confié pour qu'il disparaisse avec elle : le serveur ne peut
   * pas savoir qu'une URL est morte — seul ce composant l'apprend, quand le
   * navigateur échoue à charger. Laissé dans la page, le titre « Photos »
   * survivait seul au-dessus du vide.
   *
   * Le nœud est construit côté serveur et passé en prop : il n'entre donc pas
   * dans le bundle client.
   */
  heading?: ReactNode
  className?: string
}

/**
 * Galerie avec visionneuse plein écran.
 *
 * Les images dont l'URL est morte sont retirées de la grille : une vignette
 * cassée n'apporte rien et donne une page négligée. La visionneuse ne navigue
 * donc qu'entre les images réellement affichables, et la section entière
 * disparaît quand il n'en reste aucune.
 *
 * Gestion du clavier (Échap, flèches) et verrouillage du défilement délégués
 * aux hooks dédiés.
 */
export function Gallery({ images, heading, className }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set())

  const visible = images.filter((image) => !failed.has(image.url))

  const close = useCallback(() => setActiveIndex(null), [])

  const move = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null || visible.length === 0) return current
        return (current + delta + visible.length) % visible.length
      })
    },
    [visible.length],
  )

  const previous = useCallback(() => move(-1), [move])
  const next = useCallback(() => move(1), [move])

  const isOpen = activeIndex !== null
  useLockBodyScroll(isOpen)
  useKeyboardNavigation(isOpen, { onEscape: close, onPrevious: previous, onNext: next })

  if (visible.length === 0) return null

  const active = activeIndex === null ? null : visible[activeIndex]

  return (
    <>
      <section className={className}>
        {heading}
        <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', Boolean(heading) && 'mt-8')}>
          {visible.map((image, index) => (
            <li key={image.url} className="relative aspect-4/3 overflow-hidden rounded-xl bg-ink-150">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group absolute inset-0 h-full w-full"
              >
                <span className="sr-only">Agrandir : {image.alt}</span>
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 300px, 45vw"
                  onError={() => setFailed((current) => new Set(current).add(image.url))}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse de photos"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/90 p-4"
          onClick={close}
        >
          <div className="relative max-h-full w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <div className="relative aspect-4/3 w-full">
              <Image
                src={active.url}
                alt={active.alt}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>

            <p className="mt-3 text-center text-sm text-white/80">
              {active.alt} — {(activeIndex ?? 0) + 1} / {visible.length}
            </p>

            <button
              type="button"
              onClick={close}
              className="absolute -top-2 right-0 flex h-10 w-10 -translate-y-full items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <Icon icon={icons.close} label="Fermer la visionneuse" />
            </button>

            {visible.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previous}
                  className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Icon icon={icons.chevronLeft} label="Photo précédente" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Icon icon={icons.chevronRight} label="Photo suivante" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
