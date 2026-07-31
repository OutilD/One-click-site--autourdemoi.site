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
    <Container className="py-24 text-center">
      <div>
        <p className="eyebrow justify-center">
          <span aria-hidden="true" className="h-2.5 w-2.5 bg-brand-400" />
          Erreur 404
        </p>
        <h1 className="mt-5 text-4xl font-bold text-ink-900 sm:text-5xl">Page introuvable</h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-ink-500">
          La page que vous recherchez n’existe pas, a été déplacée, ou l’établissement n’est plus référencé
          dans l’annuaire.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={routes.home()}>Retour à l’accueil</Button>
          <Button href={routes.businesses()} variant="outline">
            Parcourir l’annuaire
          </Button>
        </div>
      </div>

      <section className="mt-20 text-left" aria-labelledby="popular-heading">
        <hr className="rule-heavy mb-12" />
        <h2 id="popular-heading" className="text-center text-2xl font-bold text-ink-900">
          Catégories populaires
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
