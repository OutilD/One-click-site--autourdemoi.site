import type { FaqItem } from '@/types'
import { Icon } from './Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface FAQProps {
  items: FaqItem[]
  title?: string
  /** Ouvre le premier élément par défaut. */
  defaultOpenFirst?: boolean
  className?: string
}

/**
 * Foire aux questions.
 *
 * Implémentée avec `<details>` natif : accessible au clavier et fonctionnelle
 * sans JavaScript, donc entièrement rendue côté serveur (le contenu reste
 * lisible par les moteurs, en cohérence avec le balisage `FAQPage`).
 */
export function FAQ({ items, title = 'Questions fréquentes', defaultOpenFirst = true, className }: FAQProps) {
  if (items.length === 0) return null

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
        {items.map((item, index) => (
          <details
            key={item.question}
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
        ))}
      </div>
    </section>
  )
}
