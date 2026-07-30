import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CityCard } from '@/components/directory/CityCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/jsonld'
import { routes } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site'
import { CategoryRepository, CityRepository } from '@/repositories'
import { cityLabel } from '@/lib/view-helpers'
import { formatNumber } from '@/utils/format'

export const metadata: Metadata = buildMetadata({
  title: 'Toutes les villes couvertes par l’annuaire',
  description: `Découvrez les professionnels et commerces référencés par ${siteConfig.name} à Paris, Lyon, Marseille, Bordeaux, Lille et Toulouse.`,
  path: routes.cities(),
})

export default async function CitiesPage() {
  const [cities, categories] = await Promise.all([
    CityRepository.getAllWithCounts(),
    CategoryRepository.getAllWithCounts(),
  ])

  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Villes', href: routes.cities() },
  ]

  return (
    <Container size="wide" className="py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Toutes les villes couvertes par l’annuaire
        </h1>
        <p className="mt-3 leading-relaxed text-ink-600">
          {cities.length} villes référencées, de Paris à Toulouse. Sélectionnez votre ville pour découvrir les
          établissements de proximité, classés par métier et par note.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cities.map((city) => (
          <CityCard
            key={city.slug}
            name={city.name}
            href={routes.city(city.slug)}
            image={city.coverImage}
            businessCount={city.businessCount}
            departmentCode={city.departmentCode}
          />
        ))}
      </div>

      <section className="mt-16 space-y-10 border-t border-ink-200 pt-10" aria-labelledby="cities-detail">
        <h2 id="cities-detail" className="text-2xl font-bold tracking-tight text-ink-900">
          Détail par ville
        </h2>

        {cities.map((city) => (
          <article key={city.slug} className="rounded-card border border-ink-200 bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="text-xl font-semibold text-ink-900">
                <Link href={routes.city(city.slug)} className="hover:text-brand-700 hover:underline">
                  {cityLabel(city)}
                </Link>
              </h3>
              <p className="text-sm text-ink-500">
                {[
                  city.region,
                  city.population !== undefined ? `${formatNumber(city.population)} habitants` : null,
                  `${city.businessCount} établissements`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            {city.description && (
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{city.description}</p>
            )}

            <ul className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={routes.cityCategory(city.slug, category.slug)}
                    className="inline-flex rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {category.pluralName} à {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
    </Container>
  )
}
