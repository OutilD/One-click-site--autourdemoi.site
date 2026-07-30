import type { City } from '@/types'

/**
 * Référentiel des villes couvertes par l'annuaire (données statiques — Phase 1).
 */
export const cities: City[] = [
  {
    id: 'city-paris',
    slug: 'paris',
    name: 'Paris',
    department: 'Paris',
    departmentCode: '75',
    region: 'Île-de-France',
    postalCode: '75011',
    population: 2_133_111,
    latitude: 48.8566,
    longitude: 2.3522,
    description:
      'Capitale économique et culturelle, Paris concentre la plus forte densité de commerces et d’artisans de France. Des Halles à Belleville, chaque arrondissement possède son propre tissu de professionnels de proximité.',
    coverImage: 'https://picsum.photos/seed/city-paris/1600/900',
    districts: ['Le Marais', 'Bastille', 'Montmartre', 'Belleville', 'Batignolles', 'Butte-aux-Cailles'],
  },
  {
    id: 'city-lyon',
    slug: 'lyon',
    name: 'Lyon',
    department: 'Rhône',
    departmentCode: '69',
    region: 'Auvergne-Rhône-Alpes',
    postalCode: '69002',
    population: 522_250,
    latitude: 45.764,
    longitude: 4.8357,
    description:
      'Capitale de la gastronomie et deuxième bassin économique français, Lyon réunit un artisanat dense entre Presqu’île, Croix-Rousse et Part-Dieu. Ses commerces de bouche et ses artisans du bâtiment y sont particulièrement représentés.',
    coverImage: 'https://picsum.photos/seed/city-lyon/1600/900',
    districts: ['Presqu’île', 'Croix-Rousse', 'Part-Dieu', 'Vieux Lyon', 'Confluence', 'Guillotière'],
  },
  {
    id: 'city-marseille',
    slug: 'marseille',
    name: 'Marseille',
    department: 'Bouches-du-Rhône',
    departmentCode: '13',
    region: 'Provence-Alpes-Côte d’Azur',
    postalCode: '13006',
    population: 873_076,
    latitude: 43.2965,
    longitude: 5.3698,
    description:
      'Première ville portuaire de France, Marseille mêle commerces historiques du Panier et nouvelles enseignes du Vieux-Port. Un tissu artisanal dense couvre l’ensemble des seize arrondissements.',
    coverImage: 'https://picsum.photos/seed/city-marseille/1600/900',
    districts: ['Vieux-Port', 'Le Panier', 'La Joliette', 'Notre-Dame-du-Mont', 'Prado', 'Endoume'],
  },
  {
    id: 'city-bordeaux',
    slug: 'bordeaux',
    name: 'Bordeaux',
    department: 'Gironde',
    departmentCode: '33',
    region: 'Nouvelle-Aquitaine',
    postalCode: '33000',
    population: 261_804,
    latitude: 44.8378,
    longitude: -0.5792,
    description:
      'Bordeaux conjugue patrimoine classé et forte croissance démographique, portée par les Chartrons et les Bassins à flot. Les métiers du bâtiment et de la restauration y connaissent une activité soutenue.',
    coverImage: 'https://picsum.photos/seed/city-bordeaux/1600/900',
    districts: ['Chartrons', 'Saint-Pierre', 'Saint-Michel', 'Bassins à flot', 'Nansouty', 'Caudéran'],
  },
  {
    id: 'city-lille',
    slug: 'lille',
    name: 'Lille',
    department: 'Nord',
    departmentCode: '59',
    region: 'Hauts-de-France',
    postalCode: '59000',
    population: 236_234,
    latitude: 50.6292,
    longitude: 3.0573,
    description:
      'Cœur de la métropole européenne, Lille rassemble un commerce de proximité très actif du Vieux-Lille à Wazemmes. Estaminets, artisans et services aux particuliers y sont fortement représentés.',
    coverImage: 'https://picsum.photos/seed/city-lille/1600/900',
    districts: ['Vieux-Lille', 'Wazemmes', 'Vauban', 'Euralille', 'Moulins', 'Saint-Maurice'],
  },
  {
    id: 'city-toulouse',
    slug: 'toulouse',
    name: 'Toulouse',
    department: 'Haute-Garonne',
    departmentCode: '31',
    region: 'Occitanie',
    postalCode: '31000',
    population: 511_684,
    latitude: 43.6047,
    longitude: 1.4442,
    description:
      'Quatrième ville de France, Toulouse combine dynamisme économique et forte croissance résidentielle. Le tissu commerçant s’étend du Capitole aux Carmes jusqu’aux quartiers de Saint-Cyprien.',
    coverImage: 'https://picsum.photos/seed/city-toulouse/1600/900',
    districts: ['Capitole', 'Les Carmes', 'Saint-Cyprien', 'Saint-Aubin', 'Compans', 'Minimes'],
  },
]

export const citiesBySlug: ReadonlyMap<string, City> = new Map(cities.map((city) => [city.slug, city]))
