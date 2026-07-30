/**
 * Fabriques de données de démonstration — **Phase 1 uniquement**.
 *
 * Ce fichier complète les enregistrements saisis à la main (`businesses.ts`)
 * avec les champs dérivés : horaires, médias, coordonnées, avis, publications.
 * Tout est déterministe (voir `utils/seed.ts`) : aucun `Math.random()`, donc
 * aucun écart serveur/client et un build reproductible.
 *
 * En phase 2, ce fichier disparaît : les repositories appelleront LocalShark.
 */
import { citiesBySlug } from './cities'
import type {
  Business,
  DayKey,
  OpeningHours,
  Photo,
  PhotoCategory,
  Post,
  PostType,
  PriceLevel,
  Review,
  TimeRange,
} from '@/types'
import { slugify } from '@/utils/slug'
import { createRandom } from '@/utils/seed'

/** Date de référence du jeu de données. Fixe, pour un build reproductible. */
export const DATASET_REFERENCE_DATE = new Date('2026-07-01T09:00:00.000Z')

const CLOSED: TimeRange[] = []

function week(
  weekdays: TimeRange[],
  saturday: TimeRange[] = CLOSED,
  sunday: TimeRange[] = CLOSED,
  overrides: Partial<OpeningHours> = {},
): OpeningHours {
  return {
    monday: weekdays,
    tuesday: weekdays,
    wednesday: weekdays,
    thursday: weekdays,
    friday: weekdays,
    saturday,
    sunday,
    ...overrides,
  }
}

/** Grilles horaires typiques par catégorie. */
export const OPENING_HOURS_TEMPLATES: Record<string, OpeningHours> = {
  restaurants: week(
    [
      { open: '12:00', close: '14:30' },
      { open: '19:00', close: '22:30' },
    ],
    [
      { open: '12:00', close: '15:00' },
      { open: '19:00', close: '23:00' },
    ],
    CLOSED,
    { monday: [{ open: '19:00', close: '22:30' }] },
  ),
  boulangeries: week(
    [{ open: '06:30', close: '19:30' }],
    [{ open: '06:30', close: '19:30' }],
    [{ open: '07:00', close: '13:00' }],
    { monday: CLOSED },
  ),
  plombiers: week(
    [
      { open: '08:00', close: '12:00' },
      { open: '14:00', close: '18:00' },
    ],
    [{ open: '09:00', close: '12:00' }],
  ),
  electriciens: week(
    [
      { open: '08:00', close: '12:00' },
      { open: '13:30', close: '17:30' },
    ],
    [{ open: '09:00', close: '12:00' }],
  ),
  coiffeurs: week(
    [{ open: '09:30', close: '19:00' }],
    [{ open: '09:00', close: '18:00' }],
    CLOSED,
    { monday: CLOSED, thursday: [{ open: '09:30', close: '20:00' }] },
  ),
  'garages-automobiles': week(
    [
      { open: '08:00', close: '12:00' },
      { open: '14:00', close: '18:30' },
    ],
    [{ open: '09:00', close: '12:00' }],
  ),
  'salles-de-sport': week(
    [{ open: '06:00', close: '22:00' }],
    [{ open: '09:00', close: '19:00' }],
    [{ open: '09:00', close: '18:00' }],
  ),
  'agences-immobilieres': week(
    [
      { open: '09:00', close: '12:30' },
      { open: '14:00', close: '19:00' },
    ],
    [{ open: '10:00', close: '13:00' }],
  ),
}

/** Indicatif téléphonique par ville. */
const PHONE_PREFIX: Record<string, string> = {
  paris: '1',
  lyon: '4',
  marseille: '4',
  bordeaux: '5',
  toulouse: '5',
  lille: '3',
}

const COMMON_ATTRIBUTES = [
  'Accès handicapé',
  'Wi-Fi gratuit',
  'Paiement sans contact',
  'Parking à proximité',
  'Accessible en transports',
  'Rendez-vous conseillé',
]

const CATEGORY_ATTRIBUTES: Record<string, string[]> = {
  restaurants: ['Terrasse', 'Vente à emporter', 'Réservation en ligne', 'Menu végétarien', 'Groupes acceptés'],
  boulangeries: ['Fabrication maison', 'Pain au levain', 'Sans gluten sur commande', 'Vente à emporter'],
  plombiers: ['Intervention d’urgence', 'Devis gratuit', 'Artisan assuré', 'Déplacement rapide'],
  electriciens: ['Intervention d’urgence', 'Devis gratuit', 'Certifié Qualifelec', 'Attestation Consuel'],
  coiffeurs: ['Produits bio', 'Espace barbier', 'Coiffure enfant', 'Carte de fidélité'],
  'garages-automobiles': ['Véhicule de courtoisie', 'Agréé assurances', 'Diagnostic électronique', 'Atelier pneus'],
  'salles-de-sport': ['Vestiaires et douches', 'Cours collectifs', 'Coaching individuel', 'Accès par badge'],
  'agences-immobilieres': ['Estimation gratuite', 'Gestion locative', 'Vitrine sur rue', 'Mandat exclusif'],
}

const PAYMENT_METHODS = ['Espèces', 'Carte bancaire', 'Chèque', 'Virement', 'Sans contact', 'Titres restaurant']

const FIRST_NAMES = [
  'Camille', 'Julien', 'Sofia', 'Mehdi', 'Élodie', 'Thomas', 'Nadia', 'Antoine',
  'Laura', 'Karim', 'Céline', 'Vincent', 'Amina', 'Guillaume', 'Sarah', 'Pierre',
  'Manon', 'Ludovic', 'Inès', 'Bastien', 'Chloé', 'Rachid', 'Marine', 'Olivier',
]

const LAST_INITIALS = ['B.', 'D.', 'L.', 'M.', 'P.', 'R.', 'S.', 'T.', 'V.', 'G.', 'C.', 'F.']

/** Fragments d'avis positifs, assemblés par catégorie. */
const POSITIVE_REVIEWS: Record<string, string[]> = {
  restaurants: [
    'Une très belle découverte. Produits frais, cuisson maîtrisée et un service attentionné du début à la fin.',
    'Excellent rapport qualité-prix pour le quartier. La carte change régulièrement, ce qui donne envie de revenir.',
    'Accueil chaleureux et cadre soigné. Nous étions six et tout est arrivé en même temps, sans attente.',
  ],
  boulangeries: [
    'La baguette de tradition est parmi les meilleures du quartier, croustillante jusqu’au soir.',
    'Viennoiseries pur beurre remarquables et personnel toujours souriant, même aux heures de pointe.',
    'Le pain au levain se conserve plusieurs jours. On sent le travail d’un vrai artisan.',
  ],
  plombiers: [
    'Intervention le jour même pour une fuite sous l’évier. Diagnostic clair et tarif conforme au devis.',
    'Très professionnel : chantier propre, explications précises et respect des horaires annoncés.',
    'Remplacement du chauffe-eau en deux heures. Rien à redire, je recommande sans hésiter.',
  ],
  electriciens: [
    'Mise aux normes du tableau réalisée proprement, avec l’attestation Consuel fournie dans les délais.',
    'Ponctuel, méthodique et pédagogue. Il a pris le temps d’expliquer chaque circuit repéré.',
    'Dépannage rapide après une coupure générale. Devis respecté au centime près.',
  ],
  coiffeurs: [
    'Coupe exactement conforme à ce que j’avais demandé, avec de vrais conseils d’entretien.',
    'Balayage très réussi, teintes naturelles. Le salon est agréable et jamais surchargé.',
    'Prise en charge à l’heure du rendez-vous et résultat impeccable. Prestation à la hauteur du prix.',
  ],
  'garages-automobiles': [
    'Diagnostic honnête : on m’avait annoncé un embrayage ailleurs, il s’agissait d’un capteur.',
    'Révision complète au tarif annoncé, véhicule rendu propre et dans les délais.',
    'Équipe réactive et transparente sur les pièces utilisées. Enfin un garage de confiance.',
  ],
  'salles-de-sport': [
    'Matériel récent et bien entretenu, salle rarement saturée même en fin de journée.',
    'Les cours collectifs sont variés et les coachs corrigent réellement les postures.',
    'Vestiaires propres et amplitude horaire idéale pour s’entraîner avant le travail.',
  ],
  'agences-immobilieres': [
    'Bien vendu en trois semaines au prix de l’estimation. Suivi régulier tout au long du mandat.',
    'Accompagnement sérieux sur le montage du dossier, avec des réponses claires à chaque étape.',
    'Visites bien préparées et agent qui connaît parfaitement le quartier.',
  ],
}

const MIXED_REVIEWS = [
  'Prestation correcte dans l’ensemble, mais un peu d’attente avant la prise en charge.',
  'Bon travail sur le fond ; la communication en amont pourrait être plus précise.',
  'Rien à reprocher sur la qualité, le tarif reste néanmoins au-dessus de la moyenne du secteur.',
]

const REVIEW_TITLES = [
  'Très satisfait',
  'Je recommande',
  'Prestation au rendez-vous',
  'Excellent accueil',
  'Sérieux et efficace',
  'Bon rapport qualité-prix',
  'Correct dans l’ensemble',
]

const REPLY_TEMPLATES = [
  'Merci beaucoup pour votre retour, il compte énormément pour toute l’équipe. À très bientôt !',
  'Nous vous remercions pour ce commentaire et sommes ravis que la prestation vous ait convenu.',
  'Merci pour votre avis. Nous prenons note de votre remarque afin de continuer à progresser.',
]

const PHOTO_CATEGORIES: PhotoCategory[] = ['exterieur', 'interieur', 'produit', 'equipe', 'realisation']

const PHOTO_ALT_BY_CATEGORY: Record<PhotoCategory, string> = {
  exterieur: 'Façade et enseigne de',
  interieur: 'Intérieur de l’établissement',
  produit: 'Produits et prestations de',
  equipe: 'Équipe de',
  realisation: 'Réalisation récente de',
}

/** Décalage géographique déterministe autour du centre-ville (~2 km max). */
function jitterCoordinate(base: number, offset: number): number {
  return Math.round((base + offset) * 1e6) / 1e6
}

function isoDaysBefore(days: number, reference: Date = DATASET_REFERENCE_DATE): string {
  return new Date(reference.getTime() - days * 86_400_000).toISOString()
}

function isoDaysAfter(days: number, reference: Date = DATASET_REFERENCE_DATE): string {
  return new Date(reference.getTime() + days * 86_400_000).toISOString()
}

/** Enregistrement saisi à la main dans `businesses.ts`. */
export interface BusinessSeed {
  name: string
  categorySlug: string
  citySlug: string
  street: string
  shortDescription: string
  description: string
  services: string[]
  rating: number
  reviewCount: number
  isFeatured?: boolean
  priceLevel?: PriceLevel
  foundedYear?: number
  district?: string
}

/** Complète un `BusinessSeed` en `Business` pleinement typée. */
export function buildBusiness(seed: BusinessSeed, index: number): Business {
  const slug = slugify(`${seed.name}-${seed.citySlug}`)
  const random = createRandom(`business:${slug}`)
  const city = citiesBySlug.get(seed.citySlug)

  if (!city) {
    throw new Error(`buildBusiness: ville inconnue « ${seed.citySlug} » pour « ${seed.name} »`)
  }

  const phoneSuffix = String(random.int(10_000_000, 99_999_999))
  const phone = `+33${PHONE_PREFIX[seed.citySlug] ?? '1'}${phoneSuffix}`
  const domain = slugify(seed.name)
  const openingHours =
    OPENING_HOURS_TEMPLATES[seed.categorySlug] ??
    week([{ open: '09:00', close: '18:00' }], [{ open: '09:00', close: '12:00' }])

  const attributePool = [...(CATEGORY_ATTRIBUTES[seed.categorySlug] ?? []), ...COMMON_ATTRIBUTES]

  return {
    id: `biz-${String(index + 1).padStart(3, '0')}`,
    slug,
    name: seed.name,
    legalName: `${seed.name.toUpperCase()} ${random.pick(['SARL', 'SAS', 'EURL'])}`,
    shortDescription: seed.shortDescription,
    description: seed.description,

    categorySlug: seed.categorySlug,
    secondaryCategorySlugs: [],

    address: seed.street,
    postalCode: city.postalCode,
    citySlug: city.slug,
    cityName: city.name,
    // Les fiches de démonstration ont toutes une adresse : aucune zone
    // desservie. En mode API, ce champ porte les artisans mobiles.
    servedCitySlugs: [],
    country: 'France',

    phone,
    additionalPhones: [],
    email: `contact@${domain}.fr`,
    website: `https://www.${domain}.fr`,
    social: {
      facebook: `https://www.facebook.com/${domain}`,
      instagram: `https://www.instagram.com/${domain}`,
      ...(random.bool(0.4) ? { linkedin: `https://www.linkedin.com/company/${domain}` } : {}),
    },

    rating: seed.rating,
    reviewCount: seed.reviewCount,

    latitude: jitterCoordinate(city.latitude ?? 0, random.float(-0.018, 0.018, 6)),
    longitude: jitterCoordinate(city.longitude ?? 0, random.float(-0.024, 0.024, 6)),

    logo: `https://picsum.photos/seed/${slug}-logo/240/240`,
    coverImage: `https://picsum.photos/seed/${slug}-cover/1600/900`,
    gallery: Array.from(
      { length: 6 },
      (_, galleryIndex) => `https://picsum.photos/seed/${slug}-${galleryIndex}/1200/800`,
    ),

    openingHours,
    specialHours: [],
    priceLevel: seed.priceLevel ?? (random.int(1, 3) as PriceLevel),
    services: seed.services,
    attributes: random.sample(attributePool, random.int(4, 6)),
    paymentMethods: random.sample(PAYMENT_METHODS, random.int(3, 5)),
    faq: buildBusinessFaq(seed, city.name),

    isFeatured: seed.isFeatured ?? false,
    isVerified: random.bool(0.8),
    foundedYear: seed.foundedYear ?? random.int(1994, 2021),
    createdAt: isoDaysBefore(random.int(700, 1400)),
    updatedAt: isoDaysBefore(random.int(1, 40)),
  }
}

/** FAQ spécifique à l'établissement, en complément de la FAQ de catégorie. */
function buildBusinessFaq(seed: BusinessSeed, cityName: string) {
  return [
    {
      question: `Quels sont les horaires d’ouverture de ${seed.name} ?`,
      answer: `Les horaires détaillés jour par jour sont affichés sur cette fiche, avec un indicateur d’ouverture en temps réel. Ils proviennent de la fiche établissement et sont mis à jour régulièrement.`,
    },
    {
      question: `Où se situe ${seed.name} ?`,
      answer: `L’établissement se trouve ${seed.street} à ${cityName}. L’adresse complète et la localisation sont indiquées dans la section « Localisation » de cette page.`,
    },
    {
      question: `Comment contacter ${seed.name} ?`,
      answer: `Vous pouvez appeler l’établissement directement depuis cette fiche via le bouton « Appeler », lui écrire par e-mail ou consulter son site web pour plus d’informations.`,
    },
  ]
}

/**
 * Avis affichés pour une fiche. Il s'agit d'un échantillon : `reviewCount`
 * reste l'agrégat de la fiche Google, comme le fera l'API en phase 2.
 */
export function buildReviews(business: Business): Review[] {
  const random = createRandom(`reviews:${business.slug}`)
  const count = Math.min(business.reviewCount, random.int(6, 11))
  const positivePool = (business.categorySlug ? POSITIVE_REVIEWS[business.categorySlug] : undefined) ?? MIXED_REVIEWS

  return Array.from({ length: count }, (_, index) => {
    // Distribution cohérente avec la note agrégée : majorité de 4-5 étoiles.
    const roll = random.next()
    const rating = roll < 0.62 ? 5 : roll < 0.85 ? 4 : roll < 0.95 ? 3 : 2
    const isPositive = rating >= 4
    const content = isPositive ? random.pick(positivePool) : random.pick(MIXED_REVIEWS)
    const hasReply = isPositive ? random.bool(0.45) : random.bool(0.8)
    const publishedDaysAgo = 8 + index * random.int(9, 26)

    return {
      id: `rev-${business.id}-${String(index + 1).padStart(2, '0')}`,
      businessId: business.id,
      authorName: `${random.pick(FIRST_NAMES)} ${random.pick(LAST_INITIALS)}`,
      authorAvatar: `https://i.pravatar.cc/96?u=${business.slug}-${index}`,
      authorReviewCount: random.int(2, 148),
      rating,
      title: random.pick(REVIEW_TITLES),
      content,
      publishedAt: isoDaysBefore(publishedDaysAgo),
      source: random.bool(0.85) ? 'google' : 'facebook',
      helpfulCount: random.int(0, 34),
      ...(hasReply
        ? {
            reply: {
              content: random.pick(REPLY_TEMPLATES),
              publishedAt: isoDaysBefore(Math.max(1, publishedDaysAgo - random.int(1, 5))),
            },
          }
        : {}),
    } satisfies Review
  })
}

const POST_TEMPLATES: Record<PostType, { title: string; excerpt: string; cta: string }[]> = {
  update: [
    {
      title: 'Nouveaux horaires pour la saison',
      excerpt: 'Nos horaires évoluent afin de mieux vous accueillir en semaine comme le week-end.',
      cta: 'Voir les horaires',
    },
    {
      title: 'Notre équipe s’agrandit',
      excerpt: 'Un nouveau collaborateur rejoint l’équipe pour réduire encore les délais de prise en charge.',
      cta: 'En savoir plus',
    },
    {
      title: 'Espace entièrement rénové',
      excerpt: 'Travaux terminés : nous vous accueillons désormais dans un espace repensé et plus confortable.',
      cta: 'Découvrir',
    },
  ],
  offer: [
    {
      title: 'Offre de bienvenue pour les nouveaux clients',
      excerpt: 'Profitez d’une remise sur votre première prestation, sur présentation du code en établissement.',
      cta: 'Profiter de l’offre',
    },
    {
      title: 'Opération spéciale ce mois-ci',
      excerpt: 'Une réduction exceptionnelle est appliquée sur une sélection de prestations, dans la limite des places disponibles.',
      cta: 'Voir les conditions',
    },
  ],
  event: [
    {
      title: 'Journée portes ouvertes',
      excerpt: 'Venez découvrir nos locaux, rencontrer l’équipe et poser toutes vos questions sans rendez-vous.',
      cta: 'Réserver ma place',
    },
    {
      title: 'Atelier découverte gratuit',
      excerpt: 'Un atelier ouvert à tous pour découvrir nos prestations et repartir avec des conseils concrets.',
      cta: 'M’inscrire',
    },
  ],
}

export function buildPosts(business: Business): Post[] {
  const random = createRandom(`posts:${business.slug}`)
  const count = random.int(2, 4)

  return Array.from({ length: count }, (_, index) => {
    const type: PostType = index === 0 ? 'update' : random.pick<PostType>(['update', 'offer', 'event'])
    const template = random.pick(POST_TEMPLATES[type])
    const publishedDaysAgo = 5 + index * random.int(14, 38)
    const discount = random.pick(['-10 %', '-15 %', '-20 %', '-25 %'])

    return {
      id: `post-${business.id}-${String(index + 1).padStart(2, '0')}`,
      businessId: business.id,
      slug: slugify(`${template.title}-${business.slug}-${index}`),
      type,
      title: template.title,
      excerpt: template.excerpt,
      content: [
        `${template.excerpt} Chez ${business.name}, à ${business.cityName}, nous attachons une importance particulière à la qualité de l’accueil comme à celle de la prestation.`,
        `Notre équipe reste disponible pour répondre à vos questions et vous orienter vers la solution la plus adaptée à votre besoin. N’hésitez pas à nous contacter par téléphone pour connaître les disponibilités.`,
        `Retrouvez l’ensemble de nos informations pratiques — adresse, horaires et coordonnées — directement sur cette fiche.`,
      ],
      image: `https://picsum.photos/seed/${business.slug}-post-${index}/1200/675`,
      publishedAt: isoDaysBefore(publishedDaysAgo),
      ctaLabel: template.cta,
      ctaUrl: business.website,
      ...(type === 'offer'
        ? {
            offer: {
              label: discount,
              couponCode: `BIENVENUE${discount.replace(/\D/g, '')}`,
              validUntil: isoDaysAfter(random.int(20, 70)),
            },
          }
        : {}),
      ...(type === 'event'
        ? {
            event: {
              startDate: isoDaysAfter(random.int(6, 40)),
              endDate: isoDaysAfter(random.int(41, 55)),
              location: `${business.address}, ${business.postalCode} ${business.cityName}`,
            },
          }
        : {}),
    } satisfies Post
  })
}

export function buildPhotos(business: Business): Photo[] {
  const random = createRandom(`photos:${business.slug}`)

  return business.gallery.map((url, index) => {
    const category = PHOTO_CATEGORIES[index % PHOTO_CATEGORIES.length] as PhotoCategory

    return {
      id: `photo-${business.id}-${String(index + 1).padStart(2, '0')}`,
      businessId: business.id,
      url,
      alt: `${PHOTO_ALT_BY_CATEGORY[category]} ${business.name} à ${business.cityName}`,
      width: 1200,
      height: 800,
      category,
      publishedAt: isoDaysBefore(random.int(10, 400)),
    } satisfies Photo
  })
}

/** Jours de la semaine, réexportés pour les fabriques d'horaires. */
export type { DayKey }
