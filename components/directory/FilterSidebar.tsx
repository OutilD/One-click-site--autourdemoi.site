'use client'

import { useRef } from 'react'
import Link from 'next/link'
import type { SelectOption } from '@/types'
import { cn } from '@/utils/cn'
import { formatNumber } from '@/utils/format'

export interface FilterValues {
  q: string
  categorie: string
  ville: string
  note: string
  tri: string
}

interface FilterSidebarProps {
  action: string
  values: FilterValues
  categoryOptions: SelectOption[]
  cityOptions: SelectOption[]
  ratingOptions: SelectOption[]
  /** URL de réinitialisation (page de listing sans paramètre). */
  resetHref: string
  className?: string
}

/**
 * Panneau de filtres.
 *
 * Rendu comme un vrai formulaire `GET` : il fonctionne sans JavaScript et
 * produit des URLs partageables et indexables. Le JavaScript ne fait
 * qu'ajouter la soumission automatique au changement.
 */
export function FilterSidebar({
  action,
  values,
  categoryOptions,
  cityOptions,
  ratingOptions,
  resetHref,
  className,
}: FilterSidebarProps) {
  const formRef = useRef<HTMLFormElement>(null)

  function autoSubmit() {
    formRef.current?.requestSubmit()
  }

  const hasActiveFilter = Boolean(values.categorie || values.ville || values.note)

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      className={cn('rounded-card border border-ink-200 bg-white p-5', className)}
      aria-label="Filtrer les résultats"
    >
      {/* Conserve la recherche et le tri courants lors d'un changement de filtre. */}
      <input type="hidden" name="q" value={values.q} />
      <input type="hidden" name="tri" value={values.tri} />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink-900">Filtres</h2>
        {hasActiveFilter && (
          <Link href={resetHref} className="text-sm font-medium text-brand-700 hover:underline">
            Réinitialiser
          </Link>
        )}
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-ink-900">Catégorie</legend>
        <div className="mt-2 space-y-1">
          <FilterRadio
            name="categorie"
            value=""
            label="Toutes les catégories"
            checked={values.categorie === ''}
            onChange={autoSubmit}
          />
          {categoryOptions.map((option) => (
            <FilterRadio
              key={option.value}
              name="categorie"
              value={option.value}
              label={option.label}
              count={option.count}
              checked={values.categorie === option.value}
              onChange={autoSubmit}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-ink-100 pt-5">
        <legend className="text-sm font-semibold text-ink-900">Ville</legend>
        <div className="mt-2 space-y-1">
          <FilterRadio
            name="ville"
            value=""
            label="Toutes les villes"
            checked={values.ville === ''}
            onChange={autoSubmit}
          />
          {cityOptions.map((option) => (
            <FilterRadio
              key={option.value}
              name="ville"
              value={option.value}
              label={option.label}
              count={option.count}
              checked={values.ville === option.value}
              onChange={autoSubmit}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-ink-100 pt-5">
        <legend className="text-sm font-semibold text-ink-900">Note minimale</legend>
        <div className="mt-2 space-y-1">
          <FilterRadio name="note" value="" label="Toutes les notes" checked={values.note === ''} onChange={autoSubmit} />
          {ratingOptions.map((option) => (
            <FilterRadio
              key={option.value}
              name="note"
              value={option.value}
              label={option.label}
              checked={values.note === option.value}
              onChange={autoSubmit}
            />
          ))}
        </div>
      </fieldset>

      {/* Repli sans JavaScript : le bouton reste utilisable au clavier. */}
      <button
        type="submit"
        className="mt-6 h-11 w-full rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Appliquer les filtres
      </button>
    </form>
  )
}

interface FilterRadioProps {
  name: string
  value: string
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}

function FilterRadio({ name, value, label, count, checked, onChange }: FilterRadioProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-ink-50">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--color-brand-600)]"
      />
      <span className="flex-1 text-ink-700">{label}</span>
      {count !== undefined && <span className="text-xs tabular-nums text-ink-400">{formatNumber(count)}</span>}
    </label>
  )
}
