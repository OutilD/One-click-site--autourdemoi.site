import { getLocalSharkConfig, isStrictMode } from './config'
import type { LsBusinessDetail, LsDirectory } from './types'

/**
 * Client de l'API annuaire LocalShark.
 *
 * Deux routes seulement, conformément au contrat :
 *   A — `GET /api/directory`            : 1 appel par build
 *   B — `GET /api/directory/{idOrSlug}` : 1 appel par fiche
 *
 * Le cache de `fetch` de Next (`next.revalidate`) assure la déduplication et
 * la revalidation ; la gestion `ETag` / `If-None-Match` est prise en charge
 * par cette couche, il n'y a rien à faire ici.
 */
const ENDPOINTS = {
  directory: () => '/api/directory',
  business: (idOrSlug: string) => `/api/directory/${encodeURIComponent(idOrSlug)}`,
} as const

export class LocalSharkError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly path?: string,
  ) {
    super(message)
    this.name = 'LocalSharkError'
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>

/**
 * Étiquette de cache de l'annuaire global.
 *
 * Elle ne porte que sur l'endpoint A. Purger cette seule entrée suffit à
 * rafraîchir listings, catégories et sitemap ; l'étendre aux fiches
 * invaliderait les 268 entrées de détail d'un coup, pour rien.
 */
export const DIRECTORY_TAG = 'localshark-directory'

/**
 * Exécute une requête GET typée.
 *
 * Retourne `null` sur `404` (ressource absente, cas nominal) et, hors mode
 * strict, sur toute erreur — l'appelant se rabat alors sur sa source de repli
 * plutôt que de faire échouer le rendu.
 */
async function request<T>(
  path: string,
  params: QueryParams = {},
  tags: string[] = [],
): Promise<T | null> {
  const config = getLocalSharkConfig()

  if (!config) {
    throw new LocalSharkError('Client appelé sans DIRECTORY_API_KEY (mode statique actif)', undefined, path)
  }

  const url = new URL(`${config.baseUrl}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(config.timeoutMs),
      next: { revalidate: config.revalidateSeconds, ...(tags.length > 0 ? { tags } : {}) },
    })

    if (response.status === 404) return null

    if (response.status === 401) {
      // Toujours fatal : une clé invalide produirait un site entièrement vide,
      // ce qui est bien pire qu'un build en échec.
      throw new LocalSharkError('DIRECTORY_API_KEY refusée (401)', 401, path)
    }

    if (!response.ok) {
      throw new LocalSharkError(`L’API a répondu ${response.status} ${response.statusText}`, response.status, path)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof LocalSharkError && error.status === 401) throw error
    if (isStrictMode()) throw error

    console.error(`[localshark] échec sur ${path} :`, error instanceof Error ? error.message : error)
    return null
  }
}

export interface DirectoryQuery {
  limit?: number
  offset?: number
  /** ISO 8601. Ne filtre que sur `updatedAt` de la fiche — voir la note ci-dessous. */
  updatedSince?: string
  includePaused?: boolean
}

export const localSharkClient = {
  /**
   * Endpoint A — payload global.
   *
   * ⚠️ `updatedSince` ne filtre que sur `updatedAt` de la fiche : une nouvelle
   * publication ou photo ne fait PAS remonter l'établissement. Ne pas l'utiliser
   * pour des rebuilds incrémentaux tant que ce point n'est pas levé côté API.
   */
  async getDirectory(query: DirectoryQuery = {}): Promise<LsDirectory | null> {
    return request<LsDirectory>(
      ENDPOINTS.directory(),
      {
        limit: query.limit,
        offset: query.offset,
        updatedSince: query.updatedSince,
        includePaused: query.includePaused,
      },
      [DIRECTORY_TAG],
    )
  },

  /** Endpoint B — fiche complète. Accepte le slug ou le `googleCardId`. */
  async getBusiness(idOrSlug: string): Promise<LsBusinessDetail | null> {
    return request<LsBusinessDetail>(ENDPOINTS.business(idOrSlug))
  },
}

export type LocalSharkClient = typeof localSharkClient

/**
 * Détecte le cas « API joignable mais données non peuplées ».
 *
 * Les colonnes `city`, `category` et `servedCities` restent vides tant que la
 * migration n'est pas appliquée et que le cron `cron-websites` n'a pas repassé
 * les fiches. Sans ce garde-fou, le build produirait silencieusement un
 * annuaire sans aucune page ville ni catégorie.
 */
export function assertDirectoryHealth(directory: LsDirectory): void {
  const total = directory.businesses.length

  if (total === 0) {
    const empty =
      '[localshark] l’API a répondu mais ne renvoie AUCUNE fiche. ' +
      'Le site sera généré vide. Vérifier la portée de la clé et le filtre « site généré par LocalShark ».'
    if (isStrictMode()) throw new LocalSharkError(empty)
    console.warn(empty)
    return
  }

  const withCategory = directory.businesses.filter((business) => business.category !== null).length
  const withCity = directory.businesses.filter(
    (business) => business.location.city !== null || business.location.servedCities.length > 0,
  ).length

  const messages: string[] = []
  if (withCategory === 0) messages.push(`aucune des ${total} fiches n’a de catégorie`)
  if (withCity === 0) messages.push(`aucune des ${total} fiches n’a de ville ni de zone desservie`)

  if (messages.length === 0) return

  const detail = `[localshark] données incomplètes : ${messages.join(' ; ')}. ` +
    'La migration Prisma est-elle appliquée et le cron « cron-websites » a-t-il repassé les fiches ?'

  if (isStrictMode()) throw new LocalSharkError(detail)
  console.warn(detail)
}
