'use client'

import Image, { type ImageProps } from 'next/image'
import { useState, type ReactNode } from 'react'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  /** Rendu de remplacement si l'image échoue. Par défaut : rien du tout. */
  fallback?: ReactNode
}

/**
 * Image tolérante aux URLs mortes.
 *
 * Les visuels proviennent de Google et du stockage LocalShark : certaines URLs
 * expirent ou renvoient une erreur. Le navigateur afficherait alors l'icône
 * d'image cassée, ce qui donne une page dégradée. Ici, l'échec est intercepté
 * et l'image laisse place au repli — ou disparaît.
 *
 * Composant client : `onError` n'existe qu'au navigateur, une image morte ne
 * pouvant pas être détectée au rendu serveur.
 */
export function SafeImage({ fallback = null, alt, ...props }: SafeImageProps) {
  const [hasFailed, setHasFailed] = useState(false)

  if (hasFailed) return <>{fallback}</>

  return <Image alt={alt} {...props} onError={() => setHasFailed(true)} />
}
