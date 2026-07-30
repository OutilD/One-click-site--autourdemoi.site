'use client'

import { useEffect } from 'react'

interface KeyboardHandlers {
  onEscape?: () => void
  onPrevious?: () => void
  onNext?: () => void
}

/**
 * Raccourcis clavier d'une surcouche : Échap pour fermer, flèches pour naviguer.
 * Les écouteurs ne sont posés que lorsque `isActive` est vrai.
 */
export function useKeyboardNavigation(isActive: boolean, handlers: KeyboardHandlers): void {
  const { onEscape, onPrevious, onNext } = handlers

  useEffect(() => {
    if (!isActive) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onEscape?.()
      else if (event.key === 'ArrowLeft') onPrevious?.()
      else if (event.key === 'ArrowRight') onNext?.()
      else return

      event.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onEscape, onPrevious, onNext])
}
