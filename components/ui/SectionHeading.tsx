import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  /** Sur-titre en petites capitales — numérote et nomme la section. */
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  /** Lien « voir tout » aligné à droite sur desktop. */
  action?: { label: string; href: string }
  /** Niveau de titre — à ajuster pour respecter la hiérarchie de la page. */
  as?: 'h2' | 'h3'
  className?: string
}

/** En-tête de section : sur-titre, titre, sous-titre optionnel et lien d'action. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-8 gap-y-4', className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="eyebrow mb-3">
            {/* Barre jaune épaisse : le repère de section de l'annuaire. Assez
                large pour se voir, posée sur la ligne de base du sur-titre. */}
            <span aria-hidden="true" className="h-2.5 w-2.5 bg-brand-400" />
            {eyebrow}
          </p>
        )}

        <Tag className={cn('font-bold text-ink-900', Tag === 'h2' ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
          {title}
        </Tag>

        {description && <p className="mt-3 leading-relaxed text-ink-500">{description}</p>}
      </div>

      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-2 border-b-2 border-brand-400 pb-1 text-sm font-semibold text-ink-900 transition-colors duration-150 hover:border-ink-900"
        >
          {action.label}
          <Icon
            icon={icons.arrowRight}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  )
}
