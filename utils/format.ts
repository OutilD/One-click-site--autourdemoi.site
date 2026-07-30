import type { PriceLevel } from '@/types'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

/** « 12 avril 2026 ». */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

/** « 12/04/2026 ». */
export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(new Date(iso))
}

/**
 * Date relative approximative (« il y a 3 mois »).
 * `now` est injectable pour garder un rendu déterministe et testable.
 */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays < 1) return "aujourd'hui"
  if (diffDays === 1) return 'hier'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  if (diffDays < 31) {
    const weeks = Math.floor(diffDays / 7)
    return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `il y a ${months} mois`
  }
  const years = Math.floor(diffDays / 365)
  return `il y a ${years} an${years > 1 ? 's' : ''}`
}

/** « 1 248 ». */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** Note affichée avec une décimale : « 4,7 ». */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ',')
}

/** « 01 42 33 44 55 » à partir d'un numéro au format E.164. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^33/, '0')
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

/** Lien `tel:` normalisé. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/** Nom de domaine lisible à partir d'une URL complète. */
export function formatWebsiteLabel(website: string): string {
  return website.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

/** « €€ » pour un niveau de prix de 2. */
export function formatPriceLevel(level: PriceLevel): string {
  return '€'.repeat(level)
}

/** Accord singulier/pluriel : `pluralize(3, 'avis', 'avis')`. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count > 1 ? (plural ?? `${singular}s`) : singular
}

/** Tronque proprement un texte sur la dernière limite de mot. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const sliced = text.slice(0, maxLength)
  const lastSpace = sliced.lastIndexOf(' ')
  return `${sliced.slice(0, lastSpace > 0 ? lastSpace : maxLength).trimEnd()}…`
}
