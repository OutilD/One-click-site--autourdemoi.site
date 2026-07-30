import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { cn } from '@/utils/cn'

interface IconProps {
  icon: IconDefinition
  /** Libellé accessible. Omis, l'icône est purement décorative. */
  label?: string
  className?: string
}

/**
 * Icône Font Awesome, rendue en SVG inline.
 *
 * Les données d'icônes sont importées à la pièce depuis
 * `@fortawesome/free-*-svg-icons` : seules celles réellement utilisées
 * entrent dans le bundle.
 *
 * Le composant React officiel (`@fortawesome/react-fontawesome`) n'est pas
 * utilisé — il ajoute une dépendance et un composant client là où ces quelques
 * lignes suffisent, et restent rendues côté serveur.
 */
export function Icon({ icon, label, className }: IconProps) {
  const [width, height, , , path] = icon.icon
  // Certaines icônes définissent plusieurs tracés (duotone) : on les concatène.
  const d = Array.isArray(path) ? path.join(' ') : path

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('inline-block h-[1em] w-[1em] shrink-0 fill-current align-[-0.125em]', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
