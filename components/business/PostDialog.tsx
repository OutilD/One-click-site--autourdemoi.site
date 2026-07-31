'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

interface PostDialogProps {
  /** Titre de la publication — nom accessible du déclencheur et du dialogue. */
  title: string
  /**
   * Contenu détaillé.
   *
   * Construit côté serveur et passé en prop : le balisage complet de la
   * publication ne rejoint donc pas le bundle client, qui ne porte que
   * l'ouverture, la fermeture et la gestion du focus.
   */
  children: ReactNode
}

/**
 * Ouvre le détail d'une publication dans une surcouche modale.
 *
 * Le déclencheur est un bouton étiré sur toute la carte parente — laquelle
 * doit donc être `relative`. Les éléments interactifs de la carte (lien vers
 * l'établissement, bouton d'action) passent au-dessus via `z-10` et restent
 * cliquables : un seul bouton dans l'arbre, pas d'imbrication interdite.
 *
 * Le contenu n'est monté qu'à l'ouverture. Il n'est donc pas dans le HTML
 * initial : cette fenêtre sert la lecture, pas le référencement.
 */
export function PostDialog({ title, children }: PostDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // Évite de voler le focus au premier rendu : on ne le restitue qu'après
  // une ouverture réelle.
  const hasOpened = useRef(false)

  const close = useCallback(() => setIsOpen(false), [])

  useLockBodyScroll(isOpen)
  useKeyboardNavigation(isOpen, { onEscape: close })

  useEffect(() => {
    if (isOpen) {
      hasOpened.current = true
      // `preventScroll` : sans lui, le navigateur fait défiler la surcouche
      // pour caler le panneau en haut de la fenêtre et mange sa marge, si bien
      // qu'un panneau plus haut que l'écran vient toucher le bord.
      panelRef.current?.focus({ preventScroll: true })
    } else if (hasOpened.current) {
      triggerRef.current?.focus({ preventScroll: true })
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="absolute inset-0 cursor-pointer"
      >
        <span className="sr-only">Lire la publication : {title}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={close}
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink-900/70 p-4 sm:p-8"
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            // Le clic sur le panneau ne doit pas refermer : seul l'arrière-plan ferme.
            onClick={(event) => event.stopPropagation()}
            className="relative mx-auto w-full max-w-2xl rounded-card border border-ink-200 bg-ink-50 text-left outline-none"
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-ink-50 text-ink-700 ring-1 ring-ink-300 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-900"
            >
              <Icon icon={icons.close} label="Fermer" />
            </button>

            {children}
          </div>
        </div>
      )}
    </>
  )
}
