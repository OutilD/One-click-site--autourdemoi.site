import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CategoryCard } from '@/components/directory/CategoryCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import { CategoryRepository, CityRepository } from '@/repositories'
import Link from 'next/link'

export const metadata: Metadata = buildMetadata({
  title: 'Toutes les catégories de professionnels',
  description: `Parcourez l’annuaire ${siteConfig.name} par métier : restaurants, plombiers, coiffeurs, garages, boulangeries, salles de sport, agences immobilières et électriciens.`,
  path: routes.categories(),
})

export default async function CategoriesPage() {
  const [categories, cities] = await Promise.all([
    CategoryRepository.getAllWithCounts(),
    CityRepository.getAllWithCounts(),
  ])

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catégories', href: routes.categories() },
  ]

  return (
    <Container size="wide" className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Toutes les catégories de professionnels
        </h1>
        <p className="mt-3 leading-relaxed text-ink-600">
          {categories.length} catégories d’activité couvertes par l’annuaire. Chaque catégorie regroupe les
          établissements de sa spécialité, avec leurs avis, horaires et coordonnées.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Maillage interne catégorie × ville — cœur de la stratégie SEO locale. */}
      <section className="mt-16 border-t border-ink-200 pt-10" aria-labelledby="combos-heading">
        <h2 id="combos-heading" className="text-2xl font-bold tracking-tight text-ink-900">
          Rechercher par métier et par ville
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.slug}>
              <h3 className="text-sm font-semibold text-ink-900">{category.pluralName}</h3>
              <ul className="mt-2 space-y-1.5">
                {cities.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={routes.categoryInCity(category.slug, city.slug)}
                      className="text-sm text-ink-600 hover:text-brand-700 hover:underline"
                    >
                      {category.pluralName} à {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </Container>
  )
}
