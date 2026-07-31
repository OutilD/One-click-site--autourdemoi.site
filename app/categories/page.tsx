import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CategoryCard } from '@/components/directory/CategoryCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import { CategoryRepository } from '@/repositories'

export const metadata: Metadata = buildMetadata({
  title: 'Toutes les catégories de professionnels',
  description: `Parcourez l’annuaire ${siteConfig.name} par métier : restaurants, plombiers, coiffeurs, garages, boulangeries, salles de sport, agences immobilières et électriciens.`,
  path: routes.categories(),
})

export default async function CategoriesPage() {
  const categories = await CategoryRepository.getAllWithCounts()

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catégories', href: routes.categories() },
  ]

  return (
    <Container size="wide" className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 max-w-3xl">
        <h1 className="text-4xl font-medium text-ink-900 sm:text-5xl">
          Toutes les catégories de professionnels
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-500">
          {categories.length} catégories d’activité couvertes par l’annuaire. Chaque catégorie regroupe les
          établissements de sa spécialité, avec leurs avis, horaires et coordonnées.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            name={category.pluralName}
            icon={category.icon}
            href={routes.category(category.slug)}
            businessCount={category.businessCount}
            tagline={category.tagline}
            accentColor={category.accentColor}
          />
        ))}
      </div>

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </Container>
  )
}
