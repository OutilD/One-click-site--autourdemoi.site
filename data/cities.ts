/**
 * Communes du jeu de démonstration.
 *
 * La ville n'est plus un axe de navigation de l'annuaire : ce module ne sert
 * qu'à composer des adresses plausibles dans `factories.ts`.
 */
interface DemoCity {
  id: string
  slug: string
  name: string
  postalCode: string
  latitude: number
  longitude: number
}

/**
 * Référentiel des villes couvertes par l'annuaire (données statiques — Phase 1).
 */
export const cities: DemoCity[] = [
  {
    id: 'city-paris',
    slug: 'paris',
    name: 'Paris',
    postalCode: '75011',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    id: 'city-lyon',
    slug: 'lyon',
    name: 'Lyon',
    postalCode: '69002',
    latitude: 45.764,
    longitude: 4.8357,
  },
  {
    id: 'city-marseille',
    slug: 'marseille',
    name: 'Marseille',
    postalCode: '13006',
    latitude: 43.2965,
    longitude: 5.3698,
  },
  {
    id: 'city-bordeaux',
    slug: 'bordeaux',
    name: 'Bordeaux',
    postalCode: '33000',
    latitude: 44.8378,
    longitude: -0.5792,
  },
  {
    id: 'city-lille',
    slug: 'lille',
    name: 'Lille',
    postalCode: '59000',
    latitude: 50.6292,
    longitude: 3.0573,
  },
  {
    id: 'city-toulouse',
    slug: 'toulouse',
    name: 'Toulouse',
    postalCode: '31000',
    latitude: 43.6047,
    longitude: 1.4442,
  },
]

export const citiesBySlug: ReadonlyMap<string, DemoCity> = new Map(cities.map((city) => [city.slug, city]))
