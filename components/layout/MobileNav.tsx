'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import type { NavLink } from './Header'

interface MobileNavProps {
  links: NavLink[]
}

/** Menu de navigation mobile. Se referme automatiquement au changement de route. */
export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-700"
      >
        <span className="sr-only">{isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
        <Icon icon={isOpen ? icons.close : icons.menu} />
      </button>

      {isOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 border-b border-ink-200 bg-white shadow-lg"
        >
          <ul className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-3 font-medium text-ink-700 hover:bg-ink-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
