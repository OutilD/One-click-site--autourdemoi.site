import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/utils/cn'
import { formatNumber, pluralize } from '@/utils/format'

interface CityCardProps {
  name: string
  href: string
  /** Visuel de couverture. Absent quand la ville vient de l'API annuaire. */
  image?: string
  businessCount: number
  departmentCode?: string
  className?: string
}

/** Vignette de ville, avec visuel de couverture et compteur d'établissements. */
export function CityCard({ name, href, image, businessCount, departmentCode, className }: CityCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block overflow-hidden rounded-card bg-ink-900 focus-visible:outline-offset-4',
        className,
      )}
    >
      <div className="relative aspect-4/3">
        {image ? (
          <Image
            src={image}
            alt={`Professionnels et commerces à ${name}`}
            fill
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-80 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-70"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-linear-to-br from-brand-700 via-brand-800 to-ink-900"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink-900/85 via-ink-900/20 to-transparent"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-lg font-bold text-white">
          {name}
          {departmentCode && <span className="ml-1.5 text-sm font-normal text-white/70">({departmentCode})</span>}
        </p>
        <p className="text-sm text-white/80">
          {formatNumber(businessCount)} {pluralize(businessCount, 'établissement')}
        </p>
      </div>
    </Link>
  )
}
