import type {
  LsBusiness,
  LsBusinessDetail,
  LsDay,
  LsFeedPhoto,
  LsFeedPost,
  LsHourPeriod,
  LsMediaCategory,
  LsPhoto,
  LsPost,
  LsPostType,
  LsSpecialHour,
} from './types'
import type {
  Business,
  DayKey,
  OpeningHours,
  Photo,
  PhotoCategory,
  Post,
  PostType,
  PriceLevel,
  SpecialHours,
  TimeRange,
} from '@/types'
import { slugify } from '@/utils/slug'
import { truncate } from '@/utils/format'

/**
 * Conversion DTO LocalShark → modèle de domaine.
 *
 * Toute la connaissance du format fournisseur est concentrée ici : si le
 * contrat évolue, seuls ce fichier et `types.ts` bougent.
 */

const DAY_BY_LS: Record<LsDay, DayKey> = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
}

const EMPTY_HOURS: OpeningHours = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
}

/**
 * Tableau plat → horaires par jour.
 * Deux entrées pour un même jour = coupure méridienne ; jour absent = fermé.
 */
export function toOpeningHours(periods: LsHourPeriod[]): OpeningHours {
  const hours: OpeningHours = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  }

  for (const period of periods) {
    const day = DAY_BY_LS[period.day]
    if (!day || !period.openTime || !period.closeTime) continue
    hours[day].push({ open: period.openTime, close: period.closeTime } satisfies TimeRange)
  }

  for (const day of Object.keys(hours) as DayKey[]) {
    hours[day].sort((a, b) => a.open.localeCompare(b.open))
  }

  return hours
}

export function toSpecialHours(entries: LsSpecialHour[]): SpecialHours[] {
  return entries.map((entry) => ({
    date: entry.date,
    closed: entry.closed ?? false,
    ...(entry.openTime ? { open: entry.openTime } : {}),
    ...(entry.closeTime ? { close: entry.closeTime } : {}),
  }))
}

/**
 * Demande une taille raisonnable au CDN Google.
 *
 * Les URLs renvoyées par l'API se terminent par `=s0`, qui signifie « image
 * d'origine » : on a mesuré 8,6 Mo sur une simple photo de couverture. À cette
 * taille, l'optimiseur d'images de Next expire et la page ne s'affiche pas.
 *
 * Le suffixe `=s{n}` demande à Google un redimensionnement côté CDN, ce qui
 * accélère aussi nettement les builds.
 */
export function sizeGooglePhoto(url: string, size: number): string {
  if (!/(googleusercontent\.com|ggpht\.com)/.test(url)) return url

  // Le suffixe d'options est le dernier segment après `=` (ex. `=s0`, `=w200-h300`).
  const withoutOptions = url.replace(/=[\w-]+$/, '')
  return `${withoutOptions}=s${size}`
}

/**
 * Tailles demandées au CDN selon l'usage du visuel.
 *
 * Chaque valeur couvre le plus grand emplacement de rendu en densité 2×. Les
 * visuels de publication ne dépassent jamais 380 px CSS (`GooglePost`), d'où
 * une source à 800 px.
 */
const PHOTO_SIZES = { logo: 400, cover: 1600, gallery: 1600, post: 800 } as const

/**
 * Construit l'URL du widget d'avis : origine maîtrisée et paramètres imposés.
 *
 * L'API renvoie une URL absolue liée à son propre environnement
 * (`http://localhost:3000/widget/…` depuis l'instance de développement).
 * Seul le chemin est conservé ; l'origine et les paramètres d'affichage
 * viennent de la configuration — voir `widgetBaseUrl` et `getWidgetParams()`
 * dans `config.ts`.
 */
export function buildWidgetUrl(
  url: string,
  widgetBaseUrl?: string,
  widgetParams: Record<string, string> = {},
): string {
  try {
    const target = new URL(url)

    if (widgetBaseUrl) {
      const base = new URL(widgetBaseUrl)
      target.protocol = base.protocol
      target.hostname = base.hostname
      // `port` doit être affecté séparément : le setter `host` conserve le port
      // existant quand la valeur fournie n'en précise pas — on obtiendrait
      // `https://app.localshark.io:3000` en repartant d'une URL de dev.
      target.port = base.port
    }

    for (const [key, value] of Object.entries(widgetParams)) {
      target.searchParams.set(key, value)
    }

    return target.toString()
  } catch {
    // URL invalide de part ou d'autre : on ne casse pas la fiche pour autant.
    return url
  }
}

function toPriceLevel(value: number | null): PriceLevel | undefined {
  if (value === null) return undefined
  return value >= 1 && value <= 4 ? (Math.round(value) as PriceLevel) : undefined
}

/** Année de création à partir de `openingDate` (`"2011-04-01"` ou `"2011"`). */
function toFoundedYear(openingDate: string | null): number | undefined {
  if (!openingDate) return undefined
  const year = Number.parseInt(openingDate.slice(0, 4), 10)
  return Number.isFinite(year) && year > 1800 ? year : undefined
}

function cleanSocial(profiles: LsBusinessDetail['socialProfiles']) {
  return {
    ...(profiles.facebook ? { facebook: profiles.facebook } : {}),
    ...(profiles.instagram ? { instagram: profiles.instagram } : {}),
    ...(profiles.youtube ? { youtube: profiles.youtube } : {}),
    ...(profiles.tiktok ? { tiktok: profiles.tiktok } : {}),
  }
}

export interface MapperOptions {
  /** Origine sur laquelle rebaser `reviewsWidgetUrl`. */
  widgetBaseUrl?: string
  /** Paramètres d'affichage imposés à l'URL du widget. */
  widgetParams?: Record<string, string>
}

/** Fiche allégée (endpoint A) → `Business`. */
export function toBusiness(dto: LsBusiness, options: MapperOptions = {}): Business {
  const { location } = dto

  return {
    id: dto.googleCardId,
    slug: dto.slug,
    googleCardId: dto.googleCardId,
    name: dto.name,
    ...(dto.shortDescription ? { shortDescription: dto.shortDescription } : {}),

    categorySlug: dto.category?.slug ?? null,
    secondaryCategories: [],

    ...(location.address ? { address: location.address } : {}),
    ...(location.postalCode ? { postalCode: location.postalCode } : {}),
    ...(location.city ? { cityName: location.city } : {}),
    country: 'France',

    ...(dto.phone ? { phone: dto.phone } : {}),
    additionalPhones: [],
    ...(dto.websiteUri ? { website: dto.websiteUri } : {}),
    social: {},

    rating: dto.rating,
    reviewCount: dto.reviewCount,
    reviewsWidgetUrl: buildWidgetUrl(dto.reviewsWidgetUrl, options.widgetBaseUrl, options.widgetParams),

    ...(location.latitude !== null ? { latitude: location.latitude } : {}),
    ...(location.longitude !== null ? { longitude: location.longitude } : {}),
    ...(location.mapEmbedUrl ? { mapEmbedUrl: location.mapEmbedUrl } : {}),
    ...(location.mapLinkUrl ? { mapLinkUrl: location.mapLinkUrl } : {}),

    ...(dto.logoUrl ? { logo: sizeGooglePhoto(dto.logoUrl, PHOTO_SIZES.logo) } : {}),
    ...(dto.coverUrl ? { coverImage: sizeGooglePhoto(dto.coverUrl, PHOTO_SIZES.cover) } : {}),
    gallery: [],

    openingHours: dto.regularHours.length > 0 ? toOpeningHours(dto.regularHours) : EMPTY_HOURS,
    specialHours: [],
    ...(toPriceLevel(dto.priceLevel) ? { priceLevel: toPriceLevel(dto.priceLevel) } : {}),
    services: [],
    attributes: [],
    paymentMethods: [],
    faq: [],

    // L'API n'expose pas de notion de mise en avant : la sélection de la page
    // d'accueil se fait sur la pertinence (note pondérée par le volume d'avis).
    isFeatured: false,
    // `null` signifie « signal indisponible » : on n'affiche pas de badge.
    isVerified: dto.verified === true,
    updatedAt: dto.updatedAt,
  }
}

/** Fiche complète (endpoint B) → `Business` enrichie. */
export function toBusinessDetail(dto: LsBusinessDetail, options: MapperOptions = {}): Business {
  const base = toBusiness(dto, options)

  return {
    ...base,
    ...(dto.description ? { description: dto.description } : {}),
    secondaryCategories: dto.additionalCategories.map((category) => ({
      slug: category.slug,
      name: category.displayName,
    })),
    additionalPhones: dto.additionalPhones,
    ...(dto.email ? { email: dto.email } : {}),
    social: cleanSocial(dto.socialProfiles),
    gallery: dto.photos.map((photo) => sizeGooglePhoto(photo.imageUrl, PHOTO_SIZES.gallery)),
    specialHours: toSpecialHours(dto.specialHours),
    services: dto.services.map((service) => service.name).filter(Boolean),
    attributes: [],
    faq: dto.faq,
    ...(toFoundedYear(dto.openingDate) ? { foundedYear: toFoundedYear(dto.openingDate) } : {}),
  }
}

// ────────────────────────────── Publications ──────────────────────────────

const POST_TYPE_BY_LS: Record<LsPostType, PostType> = {
  STANDARD: 'update',
  ALERT: 'update',
  EVENT: 'event',
  OFFER: 'offer',
}

const CTA_LABELS: Record<string, string> = {
  CALL: 'Appeler',
  BOOK: 'Réserver',
  ORDER: 'Commander',
  SHOP: 'Acheter',
  LEARN_MORE: 'En savoir plus',
  SIGN_UP: 'S’inscrire',
}

/**
 * L'API ne fournit pas de titre (sauf pour les événements) : la première
 * ligne du corps en tient lieu. Le chapô prend la suivante, pour éviter
 * que titre et chapô ne se répètent.
 */
function splitSummary(summary: string, providedTitle: string | null) {
  const paragraphs = summary
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const first = paragraphs[0] ?? 'Actualité de l’établissement'

  if (providedTitle) {
    return { title: providedTitle, excerpt: truncate(first, 180), paragraphs }
  }

  const isShortEnough = first.length <= 90
  const body = isShortEnough ? paragraphs.slice(1) : paragraphs
  const excerptSource = (isShortEnough ? body[0] : (body[1] ?? body[0])) ?? first

  return {
    title: isShortEnough ? first : truncate(first, 80),
    excerpt: truncate(excerptSource, 180),
    paragraphs: body.length > 0 ? body : paragraphs,
  }
}

function buildCtaUrl(post: { callToAction: LsPost['callToAction'] }, phone?: string): string {
  const cta = post.callToAction
  if (!cta) return ''
  if (cta.url) return cta.url
  // Un CTA « CALL » arrive sans URL : on la reconstruit depuis le téléphone.
  if (cta.type === 'CALL' && phone) return `tel:${phone.replace(/[^\d+]/g, '')}`
  return ''
}

export function toPost(dto: LsPost, businessId: string, businessPhone?: string): Post {
  const { title, excerpt, paragraphs } = splitSummary(dto.summary, dto.title)
  const ctaUrl = buildCtaUrl(dto, businessPhone)

  return {
    id: dto.id,
    businessId,
    slug: slugify(`${title}-${dto.id}`),
    type: POST_TYPE_BY_LS[dto.type] ?? 'update',
    title,
    excerpt,
    content: paragraphs,
    image: dto.imageUrls[0] ? sizeGooglePhoto(dto.imageUrls[0], PHOTO_SIZES.post) : '',
    publishedAt: dto.publishedAt,
    ...(dto.callToAction && ctaUrl
      ? { ctaLabel: CTA_LABELS[dto.callToAction.type] ?? 'En savoir plus', ctaUrl }
      : {}),
    ...(dto.offer
      ? {
          offer: {
            label: dto.offer.couponCode ? `Code ${dto.offer.couponCode}` : 'Offre en cours',
            ...(dto.offer.couponCode ? { couponCode: dto.offer.couponCode } : {}),
            validUntil: dto.offer.validTo ?? dto.publishedAt,
          },
        }
      : {}),
    ...(dto.event && dto.event.startDate
      ? {
          event: {
            startDate: dto.event.startDate,
            endDate: dto.event.endDate ?? dto.event.startDate,
            location: '',
          },
        }
      : {}),
  }
}

/** Publication du flux transverse : une seule image, pas de CTA ni d'offre. */
export function toFeedPost(dto: LsFeedPost): Post {
  const { title, excerpt, paragraphs } = splitSummary(dto.summary, dto.title)

  return {
    id: dto.id,
    businessId: dto.googleCardId,
    slug: slugify(`${title}-${dto.id}`),
    type: POST_TYPE_BY_LS[dto.type] ?? 'update',
    title,
    excerpt,
    content: paragraphs,
    image: dto.imageUrl ? sizeGooglePhoto(dto.imageUrl, PHOTO_SIZES.post) : '',
    publishedAt: dto.publishedAt,
  }
}

// ───────────────────────────────── Médias ─────────────────────────────────

const PHOTO_CATEGORY_MAP: Record<string, PhotoCategory> = {
  EXTERIOR: 'exterieur',
  INTERIOR: 'interieur',
  PRODUCT: 'produit',
  TEAMS: 'equipe',
  AT_WORK: 'realisation',
  COVER: 'exterieur',
  PROFILE: 'exterieur',
  LOGO: 'exterieur',
  ADDITIONAL: 'realisation',
}

export function toPhotoCategory(category: LsMediaCategory): PhotoCategory {
  return PHOTO_CATEGORY_MAP[category] ?? 'realisation'
}

export function toPhoto(dto: LsPhoto, businessId: string, businessName: string): Photo {
  return {
    id: dto.id,
    businessId,
    url: sizeGooglePhoto(dto.imageUrl, PHOTO_SIZES.gallery),
    // Le texte alternatif est obligatoire pour l'accessibilité : à défaut de
    // description, on compose un libellé à partir du nom de l'établissement.
    alt: dto.description?.trim() || `Photo de ${businessName}`,
    category: toPhotoCategory(dto.category),
    publishedAt: dto.publishedAt,
  }
}

export function toFeedPhoto(dto: LsFeedPhoto): Photo {
  return toPhoto(dto, dto.googleCardId, dto.businessName)
}
