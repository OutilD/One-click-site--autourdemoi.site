'use client'

import { useEffect } from 'react'

/**
 * Bloque le défilement de la page tant que `isLocked` est vrai.
 * Utilisé par les surcouches modales (visionneuse de photos).
 */
export function useLockBodyScroll(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLocked])
}
