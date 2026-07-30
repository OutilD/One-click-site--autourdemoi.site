import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
  /** `wide` pour les listings pleine largeur, `narrow` pour le texte long. */
  size?: 'default' | 'wide' | 'narrow'
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'article'
}

const SIZES = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  narrow: 'max-w-3xl',
} as const

/** Conteneur de largeur maximale, avec gouttières responsives. */
export function Container({ children, className, size = 'default', as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZES[size], className)}>{children}</Tag>
}
