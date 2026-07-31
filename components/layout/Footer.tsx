import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import logo from '@/public/logo.png'

interface FooterColumn {
  title: string
  links: { href: string; label: string }[]
}

interface FooterProps {
  columns: FooterColumn[]
  siteName: string
  tagline: string
  /** Année du copyright — passée en prop pour un rendu déterministe. */
  year: number
}

/** Pied de page : maillage interne vers les catégories, villes et pages clés. */
export function Footer({ columns, siteName, tagline, year }: FooterProps) {
  return (
    <footer className="mt-20 border-t-4 border-brand-400 bg-ink-100">
      <Container size="wide" className="py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              {/* `alt` vide : le nom du site suit en toutes lettres. */}
              <Image src={logo} alt="" width={40} height={40} className="h-10 w-10" />
              <span className="text-lg font-bold tracking-tight text-ink-900">{siteName}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">{tagline}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="eyebrow">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-600 transition-colors duration-150 hover:text-ink-900 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 border-t border-ink-200 pt-6 text-sm text-ink-500">
          © {year} {siteName}. Tous droits réservés.
        </p>
      </Container>
    </footer>
  )
}
