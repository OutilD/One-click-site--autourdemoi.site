import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import './globals.css'
import { Header, type NavLink } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { siteConfig } from '@/lib/site'
import { CategoryRepository } from '@/repositories'

/**
 * Police auto-hébergée par `next/font` : les fichiers sont récupérés au build
 * et servis depuis le domaine. Aucune requête vers Google au runtime, donc
 * aucun décalage de mise en page au chargement.
 *
 * IBM Plex Sans porte titres et interface. Une seule famille suffit : la
 * hiérarchie d'un annuaire se lit à la graisse et à la casse. Quatre graisses
 * seulement — Plex n'est pas variable sur Google Fonts, chacune est un fichier.
 */
const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
}

export const viewport: Viewport = {
  themeColor: '#ffd400',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

/** Année du copyright, figée au build pour un rendu déterministe. */
const BUILD_YEAR = new Date().getFullYear()

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Les données de navigation transitent par les repositories, jamais par `/data`.
  const categories = await CategoryRepository.getPopular(8)

  const navLinks: NavLink[] = [
    { href: routes.businesses(), label: 'Toutes les entreprises' },
    { href: routes.categories(), label: 'Catégories' },
    ...categories.slice(0, 3).map((category) => ({
      href: routes.category(category.slug),
      label: category.pluralName,
    })),
  ]

  const footerColumns = [
    {
      title: 'Catégories populaires',
      links: categories.map((category) => ({
        href: routes.category(category.slug),
        label: category.pluralName,
      })),
    },
    {
      title: 'L’annuaire',
      links: [
        { href: routes.businesses(), label: 'Toutes les entreprises' },
        { href: routes.categories(), label: 'Toutes les catégories' },
        { href: routes.businesses({ tri: 'note' }), label: 'Les mieux notés' },
      ],
    },
  ]

  return (
    <html lang={siteConfig.lang} className={plex.variable}>
      <body className="flex min-h-screen flex-col">
        <a href="#contenu" className="skip-link">
          Aller au contenu principal
        </a>

        <Header links={navLinks} siteName={siteConfig.name} />

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <Footer
          columns={footerColumns}
          siteName={siteConfig.name}
          tagline={siteConfig.tagline}
          year={BUILD_YEAR}
        />

        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  )
}
