import type { FaqItem } from '@/types'
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
      <h2 id="faq-heading" className="text-2xl font-bold tracking-tight text-ink-900">
        {title}
      </h2>
      <div className="mt-6 divide-y divide-ink-200 overflow-hidden rounded-card border border-ink-200 bg-white">
        {items.map((item, index) => (
          <details
            key={item.question}
            open={defaultOpenFirst && index === 0}
            className="group px-5 py-4 open:bg-ink-50/60"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-xl leading-none text-ink-400 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
