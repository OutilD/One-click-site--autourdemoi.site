'use client'

import { useRouter } from 'next/navigation'
import { useId, useState, type FormEvent } from 'react'
import type { SelectOption } from '@/types'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  /** Villes proposées dans le sélecteur — jamais lues depuis `/data`. */
  cityOptions: SelectOption[]
  /** Valeurs initiales, pour repeupler le formulaire depuis l'URL. */
  defaultQuery?: string
  defaultCity?: string
  size?: 'md' | 'lg'
  className?: string
}

/**
 * Barre de recherche : terme libre + ville.
 *
 * Composant client (navigation programmatique), mais le formulaire reste
 * fonctionnel sans JavaScript grâce à `method="get"` sur `/entreprises`.
 */
export function SearchBar({
  cityOptions,
  defaultQuery = '',
  defaultCity = '',
  size = 'md',
  className,
}: SearchBarProps) {
  const router = useRouter()
  const queryId = useId()
  const cityId = useId()
  const [query, setQuery] = useState(defaultQuery)
  const [city, setCity] = useState(defaultCity)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (city) params.set('ville', city)
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
        'flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-ink-900/5 ring-1 ring-ink-200 sm:flex-row',
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <span aria-hidden="true" className="text-ink-400">
          🔎
        </span>
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
          className={cn('w-full bg-transparent text-ink-900 outline-none placeholder:text-ink-400', fieldHeight)}
        />
      </div>

      <div className="flex items-center gap-2 border-ink-200 px-3 sm:border-l">
        <span aria-hidden="true" className="text-ink-400">
          📍
        </span>
        <label htmlFor={cityId} className="sr-only">
          Ville
        </label>
        <select
          id={cityId}
          name="ville"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className={cn('w-full min-w-40 bg-transparent text-ink-900 outline-none', fieldHeight)}
        >
          <option value="">Toutes les villes</option>
          {cityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={cn(
          'shrink-0 rounded-xl bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-700',
          fieldHeight,
        )}
      >
        Rechercher
      </button>
    </form>
  )
}
