import type { Business, Category, City, SelectOption } from '@/types'
import type { OpeningStatusMap } from '@/components/directory/BusinessGrid'
import { DAY_ORDER, dayKeyFromDate, getOpeningStatus } from '@/utils/opening-hours'

/**
 * Helpers de présentation partagés par les pages.
 *
 * Ils préparent côté serveur ce dont les composants ont besoin, afin que
 * ces derniers restent purement pilotés par leurs props.
 */

/** Libellés de catégorie indexés par slug. */
export function buildCategoryLabels(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.map((category) => [category.slug, category.name]))
}

/** `true` si la fiche déclare au moins un créneau d'ouverture. */
export function hasOpeningHours(business: Business): boolean {
  return DAY_ORDER.some((day) => business.openingHours[day].length > 0)
}

/**
 * Statuts d'ouverture indexés par identifiant d'entreprise.
 *
 * Les fiches sans horaire connu sont omises : aucun badge ne s'affiche, plutôt
 * qu'un « Fermé » trompeur.
 *
 * `now` est évalué au rendu. Sur une page générée statiquement, la valeur est
 * celle du build — compromis assumé pour un site entièrement statique.
 */
export function buildOpeningStatuses(businesses: Business[], now: Date): OpeningStatusMap {
  const entries = businesses.flatMap((business) => {
    if (!hasOpeningHours(business)) return []
    const status = getOpeningStatus(business.openingHours, now)
    return [[business.id, { label: status.isOpen ? 'Ouvert' : 'Fermé', isOpen: status.isOpen }] as const]
  })

  return Object.fromEntries(entries)
}

/** Jour courant, utilisé pour surligner la ligne du tableau d'horaires. */
export function currentDayKey(now: Date) {
  return dayKeyFromDate(now)
}

/** Options de sélection à partir d'une liste d'entités nommées. */
export function toSelectOptions<T extends { slug: string; businessCount?: number }>(
  items: T[],
  getLabel: (item: T) => string,
): SelectOption[] {
  return items.map((item) => ({
    value: item.slug,
    label: getLabel(item),
    ...(item.businessCount !== undefined ? { count: item.businessCount } : {}),
  }))
}

/** « Casteljaloux (47) » quand le département est connu, « Casteljaloux » sinon. */
export function cityLabel(city: City): string {
  return city.departmentCode ? `${city.name} (${city.departmentCode})` : city.name
}

/** Options de tri exposées dans l'interface, mappées vers `BusinessSort`. */
export const SORT_OPTIONS: SelectOption[] = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'alphabetique', label: 'Ordre alphabétique' },
  { value: 'note', label: 'Meilleure note' },
  { value: 'avis', label: 'Nombre d’avis' },
]

/** Options de note minimale. */
export const RATING_OPTIONS: SelectOption[] = [
  { value: '4.5', label: '4,5 et plus' },
  { value: '4', label: '4 et plus' },
  { value: '3.5', label: '3,5 et plus' },
  { value: '3', label: '3 et plus' },
]
