import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 shadow-sm',
  outline: 'border border-ink-300 bg-white text-ink-800 hover:bg-ink-50 hover:border-ink-400',
  ghost: 'text-ink-700 hover:bg-ink-100',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

const BASE =
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

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
