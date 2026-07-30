import type { JsonLd as JsonLdObject } from '@/lib/jsonld'

interface JsonLdProps {
  /** Un ou plusieurs graphes Schema.org. */
  data: JsonLdObject | JsonLdObject[]
}

/**
 * Injecte du JSON-LD dans le document.
 *
 * `JSON.stringify` est sûr ici (données maîtrisées, pas de saisie utilisateur),
 * mais `<` est tout de même échappé pour éviter toute fermeture prématurée
 * de la balise `<script>`.
 */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data]

  return (
    <>
      {payload.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  )
}
