import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { MobileNav } from './MobileNav'

export interface NavLink {
  href: string
  label: string
}

interface HeaderProps {
  /** Liens de navigation principaux, fournis par le layout (aucun accès aux données ici). */
  links: NavLink[]
  siteName: string
}

/** En-tête global : logo, navigation principale et accès à la recherche. */
export function Header({ links, siteName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <Container size="wide" className="relative flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"
          >
            ◎
          </span>
          <span className="text-lg tracking-tight">{siteName}</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button href="/entreprises" size="sm" variant="outline" className="hidden sm:inline-flex">
            <span aria-hidden="true">🔎</span> Rechercher
          </Button>
          <MobileNav links={links} />
        </div>
      </Container>
    </header>
  )
}
