import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface ServiceListProps {
  services: string[]
  /** Nombre de prestations visibles avant dépliage. */
  max?: number
  className?: string
}

const GRID = 'grid gap-2 sm:grid-cols-2'

function ServiceItem({ service }: { service: string }) {
  return (
    <li className="flex items-start gap-2 rounded-lg bg-ink-150 px-3 py-2 text-sm text-ink-700 ring-1 ring-ink-200">
      <Icon icon={icons.check} className="mt-1 shrink-0 text-brand-700" />
      {service}
    </li>
  )
}

/**
 * Liste des prestations, repliée au-delà de `max`.
 *
 * Certaines fiches en déclarent jusqu'à 115 — un taxi qui liste chaque commune
 * desservie. Déroulées, elles enterraient la carte, les avis et les
 * publications sous plusieurs écrans de vignettes.
 *
 * Le dépliage repose sur `<details>` natif : aucun JavaScript ajouté, un
 * fonctionnement au clavier gratuit, et surtout **toutes** les prestations
 * présentes dans le HTML — replier ne doit pas revenir à les désindexer.
 *
 * `<summary>` doit être le premier enfant du balisage, alors qu'une commande
 * « voir plus » se lit sous la liste. `order` sur les enfants du `<details>`
 * rétablit l'ordre visuel attendu une fois déplié : les prestations d'abord,
 * la commande ensuite.
 */
export function ServiceList({ services, max = 6, className }: ServiceListProps) {
  const visible = services.slice(0, max)
  const hidden = services.slice(max)

  return (
    <div className={className}>
      <ul className={GRID}>
        {/*
          La position entre dans la clé : le libellé seul ne suffit pas. Les
          fiches Google contiennent des prestations en double, et la source
          statique n'est pas dédoublonnée. La liste étant figée au rendu, aucun
          réordonnancement ne peut invalider un index.
        */}
        {visible.map((service, index) => (
          <ServiceItem key={`${index}-${service}`} service={service} />
        ))}
      </ul>

      {/*
        La mise en flex n'est posée qu'à l'ouverture : `order` n'a de sens que
        lorsque les deux enfants sont affichés. Replié, le `<details>` reste un
        bloc ordinaire et le navigateur masque son contenu lui-même.
      */}
      {hidden.length > 0 && (
        <details className="group mt-2 open:flex open:flex-col open:gap-2">
          <summary className="order-2 flex cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-ink-300 px-4 py-2.5 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:border-ink-900 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Voir les {hidden.length} autres prestations</span>
            <span className="hidden group-open:inline">Réduire la liste</span>
            <Icon
              icon={icons.plus}
              className="shrink-0 transition-transform duration-200 group-open:rotate-45"
            />
          </summary>

          <ul className={cn('order-1', GRID)}>
            {hidden.map((service, index) => (
              <ServiceItem key={`${max + index}-${service}`} service={service} />
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
