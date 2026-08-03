import type { FaqItem } from '@/types'
import { Icon } from './Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface FAQProps {
  items: FaqItem[]
  title?: string
  /** Ouvre le premier élément par défaut. */
  defaultOpenFirst?: boolean
  /** Nombre de questions visibles avant dépliage. */
  max?: number
  className?: string
}

/**
 * Foire aux questions.
 *
 * Implémentée avec `<details>` natif : accessible au clavier et fonctionnelle
 * sans JavaScript, donc entièrement rendue côté serveur (le contenu reste
 * lisible par les moteurs, en cohérence avec le balisage `FAQPage`).
 *
 * Au-delà de `max`, les questions passent derrière une commande : certaines
 * fiches en cumulent une vingtaine, ce qui repoussait le pied de page très
 * loin. Toutes restent dans le HTML — le balisage `FAQPage` les déclare, il
 * serait incohérent de les retirer du document.
 */
export function FAQ({
  items,
  title = 'Questions fréquentes',
  defaultOpenFirst = true,
  max = 6,
  className,
}: FAQProps) {
  if (items.length === 0) return null

  const visible = items.slice(0, max)
  const hidden = items.slice(max)

  /*
    L'index entre dans la clé : les questions viennent de deux sources — celles
    de l'établissement et celles de sa catégorie — et peuvent se répéter. Le
    libellé seul ne garantit donc pas l'unicité.
  */
  const renderItem = (item: FaqItem, index: number) => (
    <details
      key={`${index}-${item.question}`}
      open={defaultOpenFirst && index === 0}
      className="group px-5 py-4 transition-colors duration-200 open:bg-ink-150/70"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900 [&::-webkit-details-marker]:hidden">
        {item.question}
        <Icon
          icon={icons.plus}
          className="shrink-0 text-brand-700 transition-transform duration-200 group-open:rotate-45"
        />
      </summary>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">{item.answer}</p>
    </details>
  )

  return (
    <section className={cn('', className)} aria-labelledby="faq-heading">
      <p className="eyebrow mb-3">
        <span aria-hidden="true" className="h-px w-7 bg-brand-400" />
        Bon à savoir
      </p>
      <h2 id="faq-heading" className="text-3xl font-medium text-ink-900">
        {title}
      </h2>
      <div className="mt-8 divide-y divide-ink-200 overflow-hidden rounded-card border border-ink-200 bg-ink-50">
        {visible.map(renderItem)}

        {hidden.length > 0 && (
          <details className="group/more open:flex open:flex-col">
            <summary className="order-2 flex cursor-pointer list-none items-center justify-center gap-2 border-t border-ink-200 px-5 py-3.5 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:bg-ink-150 [&::-webkit-details-marker]:hidden">
              <span className="group-open/more:hidden">Voir les {hidden.length} autres questions</span>
              <span className="hidden group-open/more:inline">Réduire la liste</span>
              <Icon
                icon={icons.plus}
                className="shrink-0 transition-transform duration-200 group-open/more:rotate-45"
              />
            </summary>

            <div className="order-1 divide-y divide-ink-200">
              {hidden.map((item, index) => renderItem(item, max + index))}
            </div>
          </details>
        )}
      </div>
    </section>
  )
}
