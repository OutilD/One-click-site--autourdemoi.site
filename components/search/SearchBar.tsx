'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  /** Valeur initiale, pour repeupler le formulaire depuis l'URL. */
  defaultQuery?: string
  size?: 'md' | 'lg'
  className?: string
}

/**
 * Barre de recherche : terme libre + ville.
 *
 * Composant client (navigation programmatique), mais le formulaire reste
 * fonctionnel sans JavaScript grâce à `method="get"` sur `/entreprises`.
 */
export function SearchBar({ defaultQuery = '', size = 'md', className }: SearchBarProps) {
  const router = useRouter()
  const queryId = useId()
  const [query, setQuery] = useState(defaultQuery)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    const search = params.toString()
    router.push(search ? `/entreprises?${search}` : '/entreprises')
  }

  const fieldHeight = size === 'lg' ? 'h-14' : 'h-12'

  return (
    <form
      action="/entreprises"
      method="get"
      onSubmit={handleSubmit}
      role="search"
      className={cn(
        // Cadre noir plein plutôt qu'un anneau : la barre est posée sur l'aplat
        // jaune du héros, où un filet gris clair disparaîtrait. `focus-within`
        // porte l'état actif sur tout le bloc, pas sur le seul champ interne.
        'flex w-full flex-col gap-2 rounded-lg border-2 border-ink-900 bg-ink-50 p-1.5 transition-shadow duration-150 focus-within:shadow-[0_0_0_3px_var(--color-ink-900)] sm:flex-row',
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-3 px-3">
        <Icon icon={icons.search} className="text-ink-500" />
        <label htmlFor={queryId} className="sr-only">
          Que recherchez-vous ?
        </label>
        <input
          id={queryId}
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Restaurant, plombier, coiffeur…"
          autoComplete="off"
          className={cn(
            // L'état de focus est porté par le cadre : celui du champ ferait doublon.
            'w-full bg-transparent text-ink-900 outline-none placeholder:text-ink-400 focus-visible:outline-none',
            fieldHeight,
          )}
        />
      </div>

      {/*
        Bouton noir, et non jaune : dans le héros, la barre repose sur un aplat
        jaune — un bouton jaune s'y fondrait. Le noir tranche sur les deux fonds
        où la barre apparaît, l'aplat du héros comme le blanc des listings.
      */}
      <button
        type="submit"
        className={cn(
          'shrink-0 cursor-pointer rounded-md bg-ink-900 px-7 font-semibold text-ink-50 transition-colors duration-150 hover:bg-ink-700',
          fieldHeight,
        )}
      >
        Rechercher
      </button>
    </form>
  )
}
