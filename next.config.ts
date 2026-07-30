import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Répertoire de sortie distinct entre développement et production.
   *
   * `next dev` et `next build` n'écrivent pas les mêmes artefacts. Partager
   * `.next` entre les deux — ou y lancer un build pendant qu'un serveur tourne
   * — laisse des références vers des chunks absents, d'où des
   * « Cannot find module './vendor-chunks/….js' » au démarrage suivant.
   *
   * Le script `dev` fixe `NEXT_DIST_DIR=.next-dev` : les deux modes ne se
   * marchent plus dessus.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    /**
     * Hôtes autorisés pour `next/image`.
     *
     * Les visuels proviennent de l'API annuaire et sont donc hors de notre
     * contrôle : un hôte non déclaré fait échouer le rendu de la page. La
     * liste couvre les deux origines observées en production, en acceptant
     * leurs sous-domaines.
     */
    remotePatterns: [
      // Photos, logos et couvertures servis par Google Business Profile
      // (lh3, lh4, lh5… selon le shard).
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.ggpht.com' },
      // Médias téléversés dans LocalShark (Vercel Blob). Le préfixe du store
      // change d'un environnement à l'autre, d'où le joker.
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      // Instance LocalShark de développement.
      { protocol: 'http', hostname: 'localhost' },
      // Visuels du jeu de démonstration (mode statique).
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
