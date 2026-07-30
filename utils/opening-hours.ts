import type { DayKey, OpeningHours, TimeRange } from '@/types'

export const DAY_ORDER: readonly DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

/** Abréviations Schema.org (`openingHoursSpecification.dayOfWeek`). */
export const SCHEMA_DAYS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

/** Convertit `Date.getDay()` (0 = dimanche) en clé de jour. */
export function dayKeyFromDate(date: Date): DayKey {
  const index = (date.getDay() + 6) % 7
  return DAY_ORDER[index] as DayKey
}

/** Minutes écoulées depuis minuit pour un horaire `HH:MM`. */
export function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':')
  return Number(hours) * 60 + Number(minutes)
}

/** « 09:00 – 12:30 · 14:00 – 19:00 », ou « Fermé ». */
export function formatDayRanges(ranges: TimeRange[]): string {
  if (ranges.length === 0) return 'Fermé'
  return ranges.map((range) => `${range.open} – ${range.close}`).join(' · ')
}

export interface OpeningStatus {
  isOpen: boolean
  /** Message court : « Ouvert · ferme à 19:00 » ou « Fermé · ouvre demain à 09:00 ». */
  label: string
  /** Prochain changement d'état, au format `HH:MM`. */
  nextChange?: string
}

/**
 * Calcule l'état d'ouverture à un instant donné.
 *
 * `now` est un paramètre explicite : le rendu se fait en Server Component et
 * l'appelant reste maître du fuseau/moment évalué (rendu déterministe possible).
 */
export function getOpeningStatus(hours: OpeningHours, now: Date): OpeningStatus {
  const todayKey = dayKeyFromDate(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const todayRanges = hours[todayKey]

  const current = todayRanges.find(
    (range) => toMinutes(range.open) <= nowMinutes && nowMinutes < toMinutes(range.close),
  )
  if (current) {
    return { isOpen: true, label: `Ouvert · ferme à ${current.close}`, nextChange: current.close }
  }

  const laterToday = todayRanges.find((range) => toMinutes(range.open) > nowMinutes)
  if (laterToday) {
    return { isOpen: false, label: `Fermé · ouvre à ${laterToday.open}`, nextChange: laterToday.open }
  }

  // Recherche du prochain jour ouvré, sur les 7 jours suivants.
  const todayIndex = DAY_ORDER.indexOf(todayKey)
  for (let offset = 1; offset <= 7; offset += 1) {
    const key = DAY_ORDER[(todayIndex + offset) % 7] as DayKey
    const first = hours[key][0]
    if (!first) continue
    const dayLabel = offset === 1 ? 'demain' : DAY_LABELS[key].toLowerCase()
    return { isOpen: false, label: `Fermé · ouvre ${dayLabel} à ${first.open}`, nextChange: first.open }
  }

  return { isOpen: false, label: 'Fermé' }
}
