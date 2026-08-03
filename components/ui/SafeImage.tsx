'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SafeImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  /** Rendu de remplacement si l'image échoue. Par défaut : rien du tout. */
  fallback?: ReactNode
}

/**
 * Image tolérante aux URLs mortes, avec état de chargement.
 *
 * Les visuels proviennent de Google et du stockage LocalShark : certaines URLs
 * expirent ou renvoient une erreur. Le navigateur afficherait alors l'icône
 * d'image cassée ; ici l'échec est intercepté et l'image laisse place au repli.
 *
 * Tant que l'image n'est pas arrivée, un aplat pulsé occupe sa place : sur des
 * visuels distants et parfois lents, un cadre gris immobile ne se distingue pas
 * d'une image manquante. L'image apparaît ensuite en fondu.
 *
 * Composant client : ni `onError` ni `onLoad` n'existent au rendu serveur.
 */
export function SafeImage({ fallback = null, alt, className, ...props }: SafeImageProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const imageRef = useRef<HTMLImageElement>(null)

  /*
    Une image déjà en cache peut être complète avant que React n'attache
    `onLoad` : l'événement ne se déclenche alors jamais, et le visuel resterait
    transparent sous son squelette. On rattrape ce cas au montage.
  */
  useEffect(() => {
    if (imageRef.current?.complete) {
      setStatus((current) => (current === 'loading' ? 'ready' : current))
    }
  }, [])

  if (status === 'failed') return <>{fallback}</>

  return (
    <>
      {/*
        Le squelette n'est posé que pour les images en `fill`, dont le parent
        est nécessairement positionné. Sur une image de taille fixe — logo,
        avatar — un `absolute` irait se caler sur un ancêtre imprévisible.
      */}
      {status === 'loading' && props.fill && (
        <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-ink-150" />
      )}

      <Image
        ref={imageRef}
        alt={alt}
        {...props}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('failed')}
        className={cn('transition-opacity duration-300', status === 'loading' && 'opacity-0', className)}
      />
    </>
  )
}
