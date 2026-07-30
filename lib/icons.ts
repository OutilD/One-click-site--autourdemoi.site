import {
  faArrowRight,
  faBagShopping,
  faBriefcase,
  faBuilding,
  faBurst,
  faCalendarDays,
  faCamera,
  faCar,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faClipboardList,
  faCompassDrafting,
  faCrown,
  faEnvelope,
  faFire,
  faGlobe,
  faScissors,
  faHelmetSafety,
  faHouse,
  faLightbulb,
  faLocationArrow,
  faLocationDot,
  faMagnifyingGlass,
  faMugHot,
  faPaintRoller,
  faPersonDigging,
  faPhone,
  faPlus,
  faSprayCanSparkles,
  faStar,
  faStethoscope,
  faTaxi,
  faTicket,
  faTrowelBricks,
  faUtensils,
  faVideo,
  faWater,
  faWrench,
  faXmark,
  faBars,
  faBug,
  faDumbbell,
  faKey,
  faScrewdriverWrench,
  faSolarPanel,
  faBreadSlice,
} from '@fortawesome/free-solid-svg-icons'
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faTiktok,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

/**
 * Icônes du site.
 *
 * Regroupées ici pour deux raisons : garder les imports Font Awesome hors des
 * composants, et permettre de désigner une icône par une clé stable — les
 * catégories, notamment, en portent une dans leurs données.
 */
export const icons = {
  // Interface
  search: faMagnifyingGlass,
  arrowRight: faArrowRight,
  chevronLeft: faChevronLeft,
  chevronRight: faChevronRight,
  close: faXmark,
  menu: faBars,
  plus: faPlus,
  check: faCheck,
  star: faStar,
  featured: faCrown,

  // Coordonnées
  phone: faPhone,
  email: faEnvelope,
  website: faGlobe,
  address: faLocationDot,
  directions: faLocationArrow,

  // Contenus
  calendar: faCalendarDays,
  coupon: faTicket,
  photo: faCamera,

  // Réseaux sociaux
  facebook: faFacebookF,
  instagram: faInstagram,
  linkedin: faLinkedinIn,
  youtube: faYoutube,
  tiktok: faTiktok,
} as const satisfies Record<string, IconDefinition>

export type IconKey = keyof typeof icons

/**
 * Icônes de catégorie, désignées par clé dans les données.
 * `business` sert de repli pour toute catégorie non reconnue.
 */
export const categoryIcons = {
  business: faBuilding,
  restaurant: faUtensils,
  bakery: faBreadSlice,
  cafe: faMugHot,
  plumber: faWrench,
  electrician: faLightbulb,
  roofer: faHouse,
  mason: faTrowelBricks,
  painter: faPaintRoller,
  locksmith: faKey,
  hairdresser: faScissors,
  beauty: faSprayCanSparkles,
  garage: faCar,
  taxi: faTaxi,
  realEstate: faBuilding,
  insurance: faClipboardList,
  gym: faDumbbell,
  garden: faPersonDigging,
  cleaning: faBurst,
  pool: faWater,
  heating: faFire,
  pest: faBug,
  survey: faCompassDrafting,
  health: faStethoscope,
  shop: faBagShopping,
  repair: faScrewdriverWrench,
  media: faVideo,
  solar: faSolarPanel,
  construction: faHelmetSafety,
  services: faBriefcase,
} as const satisfies Record<string, IconDefinition>

export type CategoryIconKey = keyof typeof categoryIcons

/** Résout une clé d'icône de catégorie, avec repli explicite. */
export function categoryIcon(key: string | undefined): IconDefinition {
  return categoryIcons[(key ?? '') as CategoryIconKey] ?? categoryIcons.business
}
