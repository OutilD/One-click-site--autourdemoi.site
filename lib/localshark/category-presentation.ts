import type { Category } from '@/types'
import { normalizeSearchTerm } from '@/utils/slug'

/**
 * Habillage des catégories.
 *
 * L'API annuaire ne renvoie que `id`, `slug` et `displayName` (au singulier,
 * sans pluriel — cf. contrat). Le pluriel, le pictogramme, la couleur et les
 * textes de page sont produits ici, de façon déterministe.
 */

const PREPOSITIONS = new Set(['de', 'du', 'des', 'd', 'à', 'au', 'aux', 'en', 'et', 'pour', 'sur', 'la', 'le', 'les', "l"])

/**
 * Met un libellé français au pluriel.
 *
 * Les mots sont accordés jusqu'à la première préposition, puis laissés tels
 * quels : « Salle de sport » → « Salles de sport », et non « Salles de sports ».
 */
export function pluralizeFrench(label: string): string {
  const words = label.split(' ')
  let stop = false

  return words
    .map((word) => {
      const bare = word.replace(/[’']/g, '').toLowerCase()
      if (stop) return word
      if (PREPOSITIONS.has(bare)) {
        stop = true
        return word
      }
      if (/[sxz]$/i.test(word)) return word
      if (/al$/i.test(word)) return `${word.slice(0, -2)}aux`
      if (/(au|eu)$/i.test(word)) return `${word}x`
      return `${word}s`
    })
    .join(' ')
}

/** Pictogramme et couleur, choisis par mot-clé sur le libellé. */
const PRESENTATION_RULES: { keywords: string[]; icon: string; color: string }[] = [
  { keywords: ['restaurant', 'pizzeria', 'brasserie', 'traiteur', 'food'], icon: '🍽️', color: '#f97316' },
  { keywords: ['boulanger', 'patissier', 'fromage'], icon: '🥖', color: '#d97706' },
  { keywords: ['plombier', 'plomberie', 'sanitaire'], icon: '🔧', color: '#0ea5e9' },
  { keywords: ['electricien', 'electricite', 'photovoltaique', 'solaire'], icon: '💡', color: '#eab308' },
  { keywords: ['couvreur', 'couverture', 'toiture', 'charpent'], icon: '🏠', color: '#b45309' },
  { keywords: ['macon', 'maconnerie', 'carreleur', 'renovation', 'construction', 'batiment'], icon: '🧱', color: '#78716c' },
  { keywords: ['peintre', 'peinture'], icon: '🎨', color: '#8b5cf6' },
  { keywords: ['serrurier', 'serrurerie'], icon: '🔐', color: '#475569' },
  { keywords: ['coiffeur', 'coiffure', 'barbier', 'esthetique', 'institut', 'ongle'], icon: '💇', color: '#ec4899' },
  { keywords: ['garage', 'automobile', 'auto', 'pneu', 'carrosserie', 'mecanique'], icon: '🚗', color: '#6366f1' },
  { keywords: ['taxi', 'vtc', 'chauffeur', 'transport'], icon: '🚕', color: '#f59e0b' },
  { keywords: ['immobilier', 'agent immobilier', 'syndic'], icon: '🏢', color: '#14b8a6' },
  { keywords: ['assurance', 'courtier', 'banque', 'conseil'], icon: '📋', color: '#0891b2' },
  { keywords: ['sport', 'fitness', 'salle', 'coach'], icon: '🏋️', color: '#22c55e' },
  { keywords: ['jardin', 'paysagiste', 'elagage', 'espaces verts', 'terrassement'], icon: '🌿', color: '#16a34a' },
  { keywords: ['nettoyage', 'proprete', 'menage', 'lavage'], icon: '🧽', color: '#06b6d4' },
  { keywords: ['piscine', 'spa'], icon: '🏊', color: '#0284c7' },
  { keywords: ['chauffage', 'climatisation', 'clim', 'energie', 'ramonage'], icon: '🔥', color: '#dc2626' },
  { keywords: ['nuisible', 'deratisation', 'desinsectisation'], icon: '🐜', color: '#65a30d' },
  { keywords: ['diagnostic', 'expert', 'audit'], icon: '📐', color: '#7c3aed' },
  { keywords: ['sante', 'osteopathe', 'medical', 'ortho', 'opticien'], icon: '🩺', color: '#0d9488' },
  { keywords: ['boutique', 'magasin', 'literie', 'bijou', 'vape'], icon: '🛍️', color: '#e11d48' },
  { keywords: ['reparation', 'depannage', 'electromenager'], icon: '🛠️', color: '#ea580c' },
  { keywords: ['photographe', 'videaste', 'video', 'agence'], icon: '🎬', color: '#a855f7' },
]

const DEFAULT_PRESENTATION = { icon: '🏢', color: '#2547eb' }

function pickPresentation(displayName: string) {
  const normalized = normalizeSearchTerm(displayName)
  const rule = PRESENTATION_RULES.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword)),
  )
  return rule ?? DEFAULT_PRESENTATION
}

/** FAQ générique de catégorie, déclinée sur le libellé. */
function buildCategoryFaq(name: string, plural: string) {
  const lowerPlural = plural.toLowerCase()

  return [
    {
      question: `Comment choisir un ${name.toLowerCase()} près de chez moi ?`,
      answer: `Comparez la note moyenne, le nombre d’avis reçus et les prestations proposées. Un professionnel qui répond à ses avis se montre en général plus réactif. Chaque fiche affiche également les horaires d’ouverture et les coordonnées directes.`,
    },
    {
      question: `Comment sont classés les ${lowerPlural} de l’annuaire ?`,
      answer: `Le classement par défaut combine la note moyenne et le nombre d’avis, afin de limiter l’effet des établissements n’ayant reçu qu’un ou deux avis. Vous pouvez à tout moment trier par ordre alphabétique, par note ou par nombre d’avis.`,
    },
    {
      question: `Les informations affichées sont-elles à jour ?`,
      answer: `Horaires, coordonnées, photos et avis proviennent des fiches d’établissement et sont synchronisés régulièrement. En période de congés ou de fêtes, nous recommandons de confirmer par téléphone.`,
    },
  ]
}

/** Construit une `Category` complète à partir du minimum fourni par l'API. */
export function buildCategory(input: { id: string; slug: string; displayName: string }): Category {
  const name = input.displayName
  const pluralName = pluralizeFrench(name)
  const { icon, color } = pickPresentation(name)
  const lowerPlural = pluralName.toLowerCase()

  return {
    id: input.id,
    slug: input.slug,
    name,
    pluralName,
    icon,
    tagline: `Trouvez un ${name.toLowerCase()} près de chez vous`,
    description: `Comparez les ${lowerPlural} référencés dans l’annuaire : avis clients, horaires d’ouverture, prestations et coordonnées réunis sur chaque fiche.`,
    keywords: [name.toLowerCase(), lowerPlural],
    faq: buildCategoryFaq(name, pluralName),
    accentColor: color,
  }
}
