import type { Business, DayKey } from '@/types'
import { ContactCard } from './ContactCard'
import { OpeningHours } from './OpeningHours'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'
import { DAY_ORDER } from '@/utils/opening-hours'
import { formatDate } from '@/utils/format'

interface BusinessSidebarProps {
  business: Business
  /** Statut d'ouverture et jour courant, calculés par la page. */
  openingLabel: string | null
  isOpen: boolean
  todayKey: DayKey
  className?: string
}

/** Colonne latérale de la fiche : coordonnées, horaires, attributs, paiements. */
export function BusinessSidebar({
  business,
  openingLabel,
  isOpen,
  todayKey,
  className,
}: BusinessSidebarProps) {
  const hasHours = DAY_ORDER.some((day) => business.openingHours[day].length > 0)
  const hasLegalInfo = Boolean(business.legalName || business.foundedYear)

  return (
    <aside className={cn('space-y-5', className)}>
      <ContactCard business={business} />

      {hasHours && (
        <section className="rounded-card border border-ink-200 bg-ink-50 p-5" aria-labelledby="hours-heading">
          <div className="flex items-center justify-between gap-3">
            <h2 id="hours-heading" className="text-xl font-medium text-ink-900">
              Horaires
            </h2>
            {openingLabel && <Badge tone={isOpen ? 'success' : 'neutral'}>{openingLabel}</Badge>}
          </div>
          <div className="mt-4">
            <OpeningHours hours={business.openingHours} todayKey={todayKey} />
          </div>

          {business.specialHours.length > 0 && (
            <div className="mt-4 border-t border-ink-200 pt-4">
              <h3 className="eyebrow font-sans">Horaires exceptionnels</h3>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {business.specialHours.map((entry) => (
                  <li key={entry.date} className="flex justify-between gap-3">
                    <span>{formatDate(entry.date)}</span>
                    <span className={cn('tabular-nums', entry.closed && 'text-ink-400')}>
                      {entry.closed ? 'Fermé' : `${entry.open ?? '—'} – ${entry.close ?? '—'}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {business.attributes.length > 0 && (
        <section
          className="rounded-card border border-ink-200 bg-ink-50 p-5"
          aria-labelledby="attributes-heading"
        >
          <h2 id="attributes-heading" className="text-xl font-medium text-ink-900">
            Informations pratiques
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-700">
            {business.attributes.map((attribute) => (
              <li key={attribute} className="flex items-start gap-2">
                <Icon icon={icons.check} className="mt-1 text-positive" />
                {attribute}
              </li>
            ))}
          </ul>
        </section>
      )}

      {business.paymentMethods.length > 0 && (
        <section
          className="rounded-card border border-ink-200 bg-ink-50 p-5"
          aria-labelledby="payment-heading"
        >
          <h2 id="payment-heading" className="text-xl font-medium text-ink-900">
            Moyens de paiement
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {business.paymentMethods.map((method) => (
              <li key={method}>
                <Badge>{method}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasLegalInfo && (
        <section className="rounded-card border border-ink-200 bg-ink-50 p-5" aria-labelledby="legal-heading">
          <h2 id="legal-heading" className="text-xl font-medium text-ink-900">
            Informations légales
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            {business.legalName && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Raison sociale</dt>
                <dd className="text-right font-medium text-ink-800">{business.legalName}</dd>
              </div>
            )}
            {business.foundedYear !== undefined && (
              <div className="flex justify-between gap-4">
                <dt className="text-ink-500">Création</dt>
                <dd className="font-medium text-ink-800">{business.foundedYear}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </aside>
  )
}
