import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { icons } from '@/lib/icons'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: { label: string; href: string }
  className?: string
}

/** État vide : aucun résultat de recherche, aucune publication, etc. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-dashed border-ink-300 bg-ink-50 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="text-ink-400" aria-hidden="true">
        {icon ?? <Icon icon={icons.search} className="h-10 w-10" />}
      </div>
      <h3 className="mt-5 text-xl font-medium text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">{description}</p>
      {action && (
        <div className="mt-6">
          <Button href={action.href} variant="outline">
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
