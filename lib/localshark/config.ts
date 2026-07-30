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
