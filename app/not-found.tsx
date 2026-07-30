import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { CategoryCard } from '@/components/directory/CategoryCard'
import { routes } from '@/lib/routes'
import { CategoryRepository } from '@/repositories'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page que vous recherchez n’existe pas ou n’est plus disponible.',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const categories = await CategoryRepository.getPopular(6)

  return (
    <Container className="py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Erreur 404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Page introuvable</h1>
      <p className="mx-auto mt-4 max-w-xl text-ink-600">
        La page que vous recherchez n’existe pas, a été déplacée, ou l’établissement n’est plus référencé dans
        l’annuaire.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={routes.home()}>Retour à l’accueil</Button>
        <Button href={routes.businesses()} variant="outline">
          Parcourir l’annuaire
        </Button>
      </div>

      <section className="mt-16 text-left" aria-labelledby="popular-heading">
        <h2 id="popular-heading" className="text-center text-lg font-semibold text-ink-900">
          Catégories populaires
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              name={category.pluralName}
              icon={category.icon}
              href={routes.category(category.slug)}
              businessCount={category.businessCount}
              accentColor={category.accentColor}
            />
          ))}
        </div>
      </section>
    </Container>
  )
}
