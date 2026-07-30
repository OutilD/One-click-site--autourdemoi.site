/**
 * Configuration de la source de données.
 *
 * - `static`     : données de démonstration (`data/`), aucune requête réseau ;
 * - `localshark` : tout provient de l'API annuaire `app.localshark.io`.
 *
 * Le mode `localshark` s'active dès que `DIRECTORY_API_KEY` est renseignée.
 * La clé est un secret de build : elle n'est jamais exposée au navigateur
 * (aucun préfixe `NEXT_PUBLIC_`).
 */

export type DataSourceMode = 'static' | 'localshark'

/**
 * Paramètres d'affichage du widget d'avis, pilotés par l'environnement.
 *
 * Chaque entrée associe un paramètre de l'URL du widget à sa variable
 * d'environnement et à sa valeur par défaut. Un paramètre sans défaut ni
 * variable n'est pas écrit : la valeur renvoyée par l'API est alors conservée.
 *
 * Valeurs acceptées par le widget :
 *   variant  grid | list | slider | masonry | badge
 *   header   full | minimal | side | none
 *   theme    light | dark
 *   ratings  liste de notes, ex. « 4,5 »
 *   withText 0 | 1
 *   sort     recent | highest | lowest
 *   lang     fr | en | es
 */
const WIDGET_SETTINGS: { param: string; env: string; fallback?: string }[] = [
  { param: 'variant', env: 'LOCALSHARK_WIDGET_VARIANT' },
  { param: 'header', env: 'LOCALSHARK_WIDGET_HEADER' },
  { param: 'theme', env: 'LOCALSHARK_WIDGET_THEME' },
  { param: 'sort', env: 'LOCALSHARK_WIDGET_SORT' },
  // L'annuaire met en avant les établissements : seuls les avis favorables
  // et commentés sont affichés. La note moyenne et le nombre total d'avis
  // restent, eux, affichés sans filtre au-dessus du widget.
  { param: 'ratings', env: 'LOCALSHARK_WIDGET_RATINGS', fallback: '4,5' },
  { param: 'withText', env: 'LOCALSHARK_WIDGET_WITH_TEXT', fallback: '1' },
  { param: 'lang', env: 'LOCALSHARK_WIDGET_LANG', fallback: 'fr' },
]

export type WidgetParams = Record<string, string>

export interface LocalSharkConfig {
  baseUrl: string
  /**
   * Origine sur laquelle est reconstruite l'URL du widget d'avis.
   *
   * L'API renvoie un `reviewsWidgetUrl` absolu qui dépend de SON
   * environnement (observé à `http://localhost:3000` depuis l'instance de
   * développement). Embarquer cette valeur telle quelle casserait le site en
   * production : contenu mixte `http` dans une page `https`, iframe bloquée.
   *
   * On ne conserve donc que le chemin et la requête, rebasés sur `baseUrl`.
   * `LOCALSHARK_WIDGET_URL` permet de pointer ailleurs si le widget n'est pas
   * servi par le même hôte que l'API.
   */
  widgetBaseUrl: string
  /** Paramètres imposés à l'URL du widget — voir `WIDGET_SETTINGS`. */
  widgetParams: WidgetParams
  apiKey: string
  /** Durée de cache ISR des réponses, en secondes. */
  revalidateSeconds: number
  /** Délai maximal d'une requête, en millisecondes. */
  timeoutMs: number
}

const DEFAULT_BASE_URL = 'https://app.localshark.io'

function readEnv(name: string): string {
  return (process.env[name] ?? '').trim()
}

/**
 * Paramètres du widget d'avis résolus depuis l'environnement.
 *
 * Exporté séparément de `getLocalSharkConfig()` afin de rester lisible en
 * mode statique, où aucune clé d'API n'est renseignée.
 */
export function getWidgetParams(): WidgetParams {
  const params: WidgetParams = {}

  for (const { param, env, fallback } of WIDGET_SETTINGS) {
    const value = readEnv(env) || fallback
    if (value) params[param] = value
  }

  return params
}

export function getLocalSharkConfig(): LocalSharkConfig | null {
  const apiKey = readEnv('DIRECTORY_API_KEY')
  if (!apiKey) return null

  const revalidate = Number.parseInt(readEnv('LOCALSHARK_REVALIDATE_SECONDS') || '3600', 10)
  // L'endpoint A ramène toutes les fiches d'un coup : prévoir large.
  const timeout = Number.parseInt(readEnv('LOCALSHARK_TIMEOUT_MS') || '30000', 10)

  const baseUrl = (readEnv('LOCALSHARK_API_URL') || DEFAULT_BASE_URL).replace(/\/$/, '')

  return {
    baseUrl,
    widgetBaseUrl: (readEnv('LOCALSHARK_WIDGET_URL') || baseUrl).replace(/\/$/, ''),
    widgetParams: getWidgetParams(),
    apiKey,
    revalidateSeconds: Number.isFinite(revalidate) && revalidate >= 0 ? revalidate : 3600,
    timeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : 30_000,
  }
}

export function getDataSourceMode(): DataSourceMode {
  return getLocalSharkConfig() ? 'localshark' : 'static'
}

/**
 * Par défaut, une erreur d'API n'interrompt pas le build : elle est tracée et
 * l'appelant se rabat sur les données de démonstration.
 *
 * `LOCALSHARK_STRICT=1` fait échouer le build à la place. **Recommandé en
 * pré-production** — voir aussi `assertDirectoryHealth()` dans le client, qui
 * détecte le cas « API joignable mais colonnes non peuplées ».
 */
export function isStrictMode(): boolean {
  return readEnv('LOCALSHARK_STRICT') === '1'
}
