import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Logo embarqué en base64.
 *
 * La génération a lieu au build : le fichier est lu sur le disque et intégré
 * à l'image, plutôt que référencé par URL. L'image de partage reste ainsi
 * autonome — aucune requête réseau, et rien à résoudre côté réseau social.
 */
const LOGO = `data:image/png;base64,${readFileSync(join(process.cwd(), 'public', 'logo.png')).toString('base64')}`

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
          padding: '68px 80px',
          // L'aplat jaune du héros, transposé au format carte : dans un fil
          // d'actualité, c'est la couleur qui identifie le site avant le texte.
          background: '#ffd400',
          color: '#12100d',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 38, fontWeight: 700 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- `next/image` n'existe pas dans le rendu Satori. */}
          <img src={LOGO} width={88} height={88} alt="" />
          {siteConfig.name}
        </div>

        {/*
          64 px et non 76 : à 76, l'accroche tenait sur trois lignes trop hautes
          et la carte débordait, si bien que `marginTop: auto` se repliait et
          que le filet du bas venait chevaucher la ligne de mentions.
        */}
        <div
          style={{
            marginTop: 44,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            maxWidth: 940,
          }}
        >
          {siteConfig.tagline}
        </div>

        <div style={{ marginTop: 24, fontSize: 28, color: '#46423a' }}>
          Avis vérifiés · Horaires · Coordonnées · Photos
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 32,
            borderTop: '2px solid #12100d',
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          {siteConfig.domain}
        </div>
      </div>
    ),
    size,
  )
}
