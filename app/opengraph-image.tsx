import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Image OpenGraph par défaut, générée sans ressource externe
 * (aucune police ni image distante n'est téléchargée).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #1d35d8 0%, #2547eb 55%, #608cfa 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, opacity: 0.9 }}>
          {/* Marque dessinée en CSS : aucun glyphe exotique, donc aucun
              téléchargement de police au moment de la génération. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.18)',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '6px solid white',
              }}
            />
          </div>
          {siteConfig.name}
        </div>

        <div style={{ marginTop: 40, fontSize: 76, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
          {siteConfig.tagline}
        </div>

        <div style={{ marginTop: 32, fontSize: 32, opacity: 0.85 }}>
          Avis vérifiés · Horaires · Coordonnées · Photos
        </div>

        <div style={{ marginTop: 'auto', fontSize: 28, opacity: 0.7 }}>{siteConfig.domain}</div>
      </div>
    ),
    size,
  )
}
