'use client'

import { useId, useRef } from 'react'
import type { SelectOption } from '@/types'
import { cn } from '@/utils/cn'

interface SortSelectProps {
  action: string
  value: string
  options: SelectOption[]
  /** Paramètres à conserver lors du changement de tri (q, catégorie, ville, note). */
  hiddenFields: Record<string, string>
  className?: string
}

/**
 * Sélecteur de tri.
 *
 * Formulaire `GET` autonome : fonctionne sans JavaScript, la soumission
 * automatique n'est qu'une amélioration progressive.
 */
export function SortSelect({ action, value, options, hiddenFields, className }: SortSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const selectId = useId()

  return (
    <form ref={formRef} action={action} method="get" className={cn('flex items-center gap-2', className)}>
      {Object.entries(hiddenFields).map(([name, fieldValue]) => (
        <input key={name} type="hidden" name={name} value={fieldValue} />
      ))}

      <label htmlFor={selectId} className="shrink-0 text-sm text-ink-600">
        Trier par
      </label>
      <select
        id={selectId}
        name="tri"
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-10 rounded-lg border border-ink-300 bg-ink-150 px-3 text-sm font-medium text-ink-800"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <noscript>
        <button type="submit" className="h-10 rounded-lg border border-ink-300 px-3 text-sm font-medium">
          OK
        </button>
      </noscript>
    </form>
  )
}
