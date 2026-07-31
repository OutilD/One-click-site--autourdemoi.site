import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Le jaune ne porte que du noir (13.3:1). L'action principale est donc un
 * aplat jaune à texte noir, et l'action secondaire son négatif — un aplat noir
 * à texte blanc. Deux niveaux francs, sans dégradé ni demi-teinte : c'est ce
 * qui donne à l'annuaire son évidence de lecture.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-400 text-ink-900 hover:bg-brand-300',
  secondary: 'bg-ink-900 text-ink-50 hover:bg-ink-700',
  outline: 'border-2 border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

// Angles vifs plutôt que gélules : le registre est celui de l'imprimé
// utilitaire, où la forme ne cherche pas à être douce.
const BASE =
  'inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string }

export type ButtonProps = ButtonAsButton | ButtonAsLink

/**
 * Bouton polymorphe : rend un `<button>`, un `<Link>` interne ou un `<a>`
 * externe selon `href`. Les liens externes reçoivent `rel="noopener"`.
 */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', fullWidth = false, className, children } = props
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)

  if (props.href !== undefined) {
    const { href, variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } = props
    const isInternal = href.startsWith('/') || href.startsWith('#')

    if (isInternal) {
      return (
        <Link href={href} className={classes} {...rest}>
          {children}
        </Link>
      )
    }

    return (
      <a href={href} className={classes} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  }

  const { variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } = props

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
