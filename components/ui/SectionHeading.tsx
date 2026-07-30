import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  title: ReactNode
  description?: ReactNode
  /** Lien « voir tout » aligné à droite sur desktop. */
  action?: { label: string; href: string }
  /** Niveau de titre — à ajuster pour respecter la hiérarchie de la page. */
  as?: 'h2' | 'h3'
  className?: string
}

/** En-tête de section : titre, sous-titre optionnel et lien d'action. */
export function SectionHeading({
  title,
  description,
  action,
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        <Tag className={cn('font-bold tracking-tight text-ink-900', Tag === 'h2' ? 'text-2xl sm:text-3xl' : 'text-xl')}>
          {title}
        </Tag>
        {description && <p className="mt-2 text-ink-600">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
        >
          {action.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}
