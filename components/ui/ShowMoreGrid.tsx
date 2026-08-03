import { Children, type ReactNode } from 'react'
import { Icon } from './Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface ShowMoreGridProps {
  children: ReactNode
  /** Nombre d'éléments visibles avant dépliage. */
  max: number
  /** Nom au pluriel, pour la commande : « Voir les 13 autres catégories ». */
  noun: string
  /** Classes de la grille, appliquées à l'identique aux deux blocs. */
  gridClassName: string
  className?: string
}

/**
 * Grille tronquée, dépliable d'un clic.
 *
 * Le dépliage repose sur `<details>` natif : aucun script ajouté, un
 * fonctionnement au clavier gratuit, et surtout l'intégralité des éléments
 * présente dans le HTML — replier ne doit pas revenir à les désindexer.
 *
 * `<summary>` doit être le premier enfant du balisage, alors qu'une commande
 * « voir plus » se lit sous la grille. `order` sur les enfants du `<details>`
 * rétablit l'ordre visuel attendu une fois déplié. La mise en flex n'est posée
 * qu'à l'ouverture : repliée, la balise reste un bloc ordinaire et le
 * navigateur masque son contenu lui-même.
 */
export function ShowMoreGrid({ children, max, noun, gridClassName, className }: ShowMoreGridProps) {
  const items = Children.toArray(children)
  const visible = items.slice(0, max)
  const hidden = items.slice(max)

  return (
    <div className={className}>
      <div className={gridClassName}>{visible}</div>

      {hidden.length > 0 && (
        <details className="group mt-4 open:flex open:flex-col open:gap-4">
          <summary className="order-2 flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-ink-300 px-4 py-3 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:border-ink-900 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              Voir les {hidden.length} autres {noun}
            </span>
            <span className="hidden group-open:inline">Réduire la liste</span>
            <Icon
              icon={icons.plus}
              className="shrink-0 transition-transform duration-200 group-open:rotate-45"
            />
          </summary>

          <div className={cn('order-1', gridClassName)}>{hidden}</div>
        </details>
      )}
    </div>
  )
}
