'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'

interface ReviewsWidgetProps {
  /** `reviewsWidgetUrl` fourni par l'API annuaire. */
  src: string
  title?: string
  className?: string
}

/** Hauteur initiale avant le premier message du widget. */
const INITIAL_HEIGHT = 600

/**
 * Widget d'avis LocalShark, embarqué en iframe.
 *
 * L'API n'expose pas le texte des avis : ils sont rendus par ce widget, qui
 * publie sa hauteur au parent via `postMessage` pour éviter une barre de
 * défilement interne.
 *
 * Conséquence à connaître : le contenu des avis vit dans l'iframe et n'est
 * donc **pas indexable** dans la page. Le balisage `aggregateRating`
 * (note et nombre d'avis) reste, lui, injecté côté serveur.
 */
export function ReviewsWidget({ src, title = 'Avis Google', className }: ReviewsWidgetProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(INITIAL_HEIGHT)

  useEffect(() => {
    // N'accepter que les messages provenant de l'origine du widget.
    let widgetOrigin: string
    try {
      widgetOrigin = new URL(src).origin
    } catch {
      return
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== widgetOrigin) return
      if (event.data?.type !== 'ls-reviews-widget-height') return

      const next = Number(event.data.height)
      if (Number.isFinite(next) && next > 0) setHeight(next)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [src])

  return (
    <iframe
      ref={frameRef}
      src={src}
      title={title}
      loading="lazy"
      style={{ height }}
      className={cn('w-full rounded-card border-0 bg-white', className)}
    />
  )
}
