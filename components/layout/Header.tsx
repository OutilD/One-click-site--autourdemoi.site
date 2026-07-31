import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import logo from '@/public/logo.png'
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
    // Le filet inférieur est noir et épais : c'est lui qui pose l'en-tête sur
    // la page, là où un thème sombre s'appuierait sur une ombre.
    <header className="sticky top-0 z-40 border-b-2 border-ink-900 bg-ink-50">
      <Container size="wide" className="relative flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/*
            40 px et pas moins : sous 32, les commerces, l'arbre et la maison du
            logo se referment en une tache. `alt` est vide à dessein — le nom du
            site suit en toutes lettres, l'annoncer deux fois n'apporterait rien.
          */}
          <Image src={logo} alt="" width={40} height={40} priority className="h-10 w-10" />
          <span className="whitespace-nowrap text-lg font-bold tracking-tight text-ink-900">{siteName}</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                {/*
                  Le survol souligne en jaune épais plutôt que de colorer le
                  fond : c'est le même geste que le surligneur du héros, et il
                  ne déplace rien dans la mise en page.
                */}
                <Link
                  href={link.href}
                  className="block border-b-2 border-transparent px-3 py-2 text-sm font-medium text-ink-600 transition-colors duration-150 hover:border-brand-400 hover:text-ink-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/*
            L'affichage responsive est porté par ce conteneur, pas par le
            bouton. `Button` pose déjà `inline-flex`, et Tailwind émet
            `.inline-flex` après `.hidden` : une classe `hidden` passée en
            `className` perdrait la cascade et le bouton resterait visible.
          */}
          <span className="hidden sm:block">
            <Button href="/entreprises" size="sm">
              <Icon icon={icons.search} /> Rechercher
            </Button>
          </span>
          <MobileNav links={links} />
        </div>
      </Container>
    </header>
  )
}
