import Link from 'next/link'
import { Container } from '@/components/ui/Container'

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
    <footer className="mt-20 border-t border-ink-200 bg-white">
      <Container size="wide" className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"
              >
                ◎
              </span>
              {siteName}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-600">{tagline}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold text-ink-900">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-600 hover:text-brand-700 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink-200 pt-6 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteName}. Tous droits réservés.
          </p>
          <p className="text-xs">
            Données de démonstration — les informations affichées ne correspondent pas à des établissements réels.
          </p>
        </div>
      </Container>
    </footer>
  )
}
