import type { Category } from '@/types'

/**
 * Référentiel des catégories d'activité (données statiques — Phase 1).
 * En phase 2, cette liste proviendra des catégories Google Business LocalShark.
 */
export const categories: Category[] = [
  {
    id: 'cat-restaurants',
    slug: 'restaurants',
    name: 'Restaurant',
    pluralName: 'Restaurants',
    icon: '🍽️',
    tagline: 'Cuisine locale, bistrots et tables gastronomiques',
    description:
      'Des bistrots de quartier aux tables gastronomiques, découvrez les restaurants les mieux notés près de chez vous. Consultez les cartes, les horaires de service et les avis clients avant de réserver.',
    keywords: ['restaurant', 'bistrot', 'brasserie', 'cuisine', 'table', 'gastronomique', 'menu'],
    accentColor: '#f97316',
    faq: [
      {
        question: 'Comment réserver une table dans un restaurant de l’annuaire ?',
        answer:
          'Chaque fiche restaurant affiche le numéro de téléphone et le site web de l’établissement. La réservation se fait directement auprès du restaurant, par téléphone ou via son propre système de réservation en ligne.',
      },
      {
        question: 'Les horaires de service affichés sont-ils à jour ?',
        answer:
          'Les horaires proviennent de la fiche Google Business de chaque établissement et sont synchronisés régulièrement. En période de fêtes ou de congés, nous recommandons de confirmer par téléphone.',
      },
      {
        question: 'Comment sont classés les restaurants ?',
        answer:
          'Par défaut, le classement combine la note moyenne et le nombre d’avis reçus. Vous pouvez à tout moment trier par ordre alphabétique, par note ou par nombre d’avis.',
      },
    ],
  },
  {
    id: 'cat-plombiers',
    slug: 'plombiers',
    name: 'Plombier',
    pluralName: 'Plombiers',
    icon: '🔧',
    tagline: 'Dépannage, sanitaire et chauffage',
    description:
      'Fuite d’eau, chauffe-eau en panne, installation sanitaire : trouvez un plombier disponible près de chez vous. Interventions d’urgence, devis gratuits et artisans notés par leurs clients.',
    keywords: ['plombier', 'plomberie', 'fuite', 'chauffe-eau', 'sanitaire', 'dépannage', 'chauffage'],
    accentColor: '#0ea5e9',
    faq: [
      {
        question: 'Comment trouver un plombier en urgence ?',
        answer:
          'Filtrez les résultats sur votre ville, puis vérifiez les horaires affichés sur chaque fiche : les artisans proposant un service d’urgence l’indiquent dans leurs prestations. Le numéro de téléphone est cliquable depuis mobile.',
      },
      {
        question: 'Les devis sont-ils gratuits ?',
        answer:
          'La majorité des plombiers référencés proposent un devis gratuit avant intervention. Cette information figure dans la liste des prestations de chaque fiche.',
      },
      {
        question: 'Comment vérifier le sérieux d’un artisan ?',
        answer:
          'Consultez la note moyenne, le nombre d’avis et les réponses apportées par le professionnel. Un artisan qui répond à ses avis est généralement plus réactif.',
      },
    ],
  },
  {
    id: 'cat-coiffeurs',
    slug: 'coiffeurs',
    name: 'Coiffeur',
    pluralName: 'Coiffeurs',
    icon: '💇',
    tagline: 'Salons de coiffure femme, homme et enfant',
    description:
      'Coupe, couleur, balayage ou barbier : comparez les salons de coiffure de votre ville. Photos des réalisations, tarifs indicatifs, horaires et avis clients réunis sur une seule fiche.',
    keywords: ['coiffeur', 'coiffure', 'salon', 'barbier', 'balayage', 'couleur', 'coupe'],
    accentColor: '#ec4899',
    faq: [
      {
        question: 'Peut-on prendre rendez-vous en ligne ?',
        answer:
          'Les salons disposant d’un module de réservation en ligne l’indiquent sur leur fiche, via le bouton « Site web ». Sinon, la prise de rendez-vous se fait par téléphone.',
      },
      {
        question: 'Les tarifs sont-ils indiqués ?',
        answer:
          'Chaque fiche affiche un niveau de prix indicatif ainsi que la liste des prestations. Les tarifs détaillés restent à confirmer directement auprès du salon.',
      },
      {
        question: 'Comment voir les réalisations d’un salon ?',
        answer:
          'La galerie photo de chaque fiche regroupe les visuels publiés par le salon, dont les réalisations récentes.',
      },
    ],
  },
  {
    id: 'cat-garages',
    slug: 'garages-automobiles',
    name: 'Garage automobile',
    pluralName: 'Garages automobiles',
    icon: '🚗',
    tagline: 'Entretien, réparation et contrôle technique',
    description:
      'Révision, embrayage, carrosserie ou pneumatiques : trouvez un garage automobile de confiance près de chez vous. Comparez les avis, les prestations et les horaires d’atelier.',
    keywords: ['garage', 'automobile', 'mécanique', 'révision', 'carrosserie', 'pneus', 'vidange'],
    accentColor: '#6366f1',
    faq: [
      {
        question: 'Le garage propose-t-il un véhicule de courtoisie ?',
        answer:
          'Cette prestation, quand elle existe, est listée dans la section « Prestations » de la fiche du garage.',
      },
      {
        question: 'Comment obtenir un devis de réparation ?',
        answer:
          'Contactez le garage par téléphone ou via son site web. La plupart des garages référencés établissent un devis gratuit après diagnostic.',
      },
      {
        question: 'Les garages sont-ils agréés par les assurances ?',
        answer:
          'Les agréments et labels affichés proviennent des informations publiées par le garage sur sa fiche établissement.',
      },
    ],
  },
  {
    id: 'cat-boulangeries',
    slug: 'boulangeries',
    name: 'Boulangerie',
    pluralName: 'Boulangeries',
    icon: '🥖',
    tagline: 'Pains au levain, viennoiseries et pâtisseries',
    description:
      'Baguette de tradition, pain au levain, viennoiseries pur beurre : découvrez les boulangeries artisanales les mieux notées de votre ville, avec leurs horaires et jours de fermeture.',
    keywords: ['boulangerie', 'pain', 'viennoiserie', 'pâtisserie', 'baguette', 'levain', 'artisan'],
    accentColor: '#d97706',
    faq: [
      {
        question: 'Comment savoir si la boulangerie est ouverte le dimanche ?',
        answer:
          'Les horaires détaillés jour par jour figurent sur chaque fiche, avec un indicateur d’ouverture en temps réel.',
      },
      {
        question: 'Les boulangeries proposent-elles de la vente à emporter ?',
        answer:
          'Oui pour la quasi-totalité des établissements référencés. Certaines proposent également un service traiteur ou de la restauration rapide sur place.',
      },
      {
        question: 'Peut-on commander pour un événement ?',
        answer:
          'Les commandes spéciales (buffets, pièces montées, pains pour événements) sont à passer directement auprès de la boulangerie, généralement 48 h à l’avance.',
      },
    ],
  },
  {
    id: 'cat-salles-de-sport',
    slug: 'salles-de-sport',
    name: 'Salle de sport',
    pluralName: 'Salles de sport',
    icon: '🏋️',
    tagline: 'Musculation, cours collectifs et coaching',
    description:
      'Musculation, cross-training, cours collectifs ou coaching individuel : comparez les salles de sport de votre ville, leurs équipements, leurs horaires d’ouverture et les avis des adhérents.',
    keywords: ['salle de sport', 'fitness', 'musculation', 'coaching', 'cross-training', 'gym'],
    accentColor: '#22c55e',
    faq: [
      {
        question: 'Y a-t-il un engagement à la souscription ?',
        answer:
          'Les conditions d’abonnement varient d’une salle à l’autre. Contactez l’établissement pour connaître les formules sans engagement.',
      },
      {
        question: 'Peut-on essayer avant de s’inscrire ?',
        answer:
          'La plupart des salles référencées proposent une séance découverte gratuite. Vérifiez les publications de l’établissement, les offres y sont régulièrement annoncées.',
      },
      {
        question: 'Les salles sont-elles accessibles 24 h/24 ?',
        answer:
          'Certaines salles proposent un accès par badge en dehors des heures encadrées. Les horaires affichés correspondent aux heures avec présence d’un coach.',
      },
    ],
  },
  {
    id: 'cat-immobilier',
    slug: 'agences-immobilieres',
    name: 'Agence immobilière',
    pluralName: 'Agences immobilières',
    icon: '🏠',
    tagline: 'Achat, vente, location et gestion locative',
    description:
      'Vendre, acheter ou louer : trouvez une agence immobilière implantée dans votre quartier. Estimation gratuite, gestion locative et accompagnement, avec les avis des clients.',
    keywords: ['agence immobilière', 'immobilier', 'vente', 'location', 'estimation', 'gestion locative'],
    accentColor: '#14b8a6',
    faq: [
      {
        question: 'L’estimation d’un bien est-elle gratuite ?',
        answer:
          'La majorité des agences référencées proposent une estimation gratuite et sans engagement, réalisée sur place.',
      },
      {
        question: 'Quels sont les honoraires pratiqués ?',
        answer:
          'Les honoraires sont réglementés et affichés en agence. Contactez directement l’établissement pour obtenir sa grille tarifaire.',
      },
      {
        question: 'Les agences gèrent-elles la location ?',
        answer:
          'La gestion locative fait partie des prestations les plus courantes : elle est indiquée dans la liste des services de chaque fiche.',
      },
    ],
  },
  {
    id: 'cat-electriciens',
    slug: 'electriciens',
    name: 'Électricien',
    pluralName: 'Électriciens',
    icon: '💡',
    tagline: 'Mise aux normes, dépannage et domotique',
    description:
      'Tableau électrique, mise aux normes NF C 15-100, dépannage ou installation domotique : trouvez un électricien qualifié près de chez vous, avec devis gratuit et avis vérifiés.',
    keywords: ['électricien', 'électricité', 'tableau électrique', 'domotique', 'normes', 'dépannage'],
    accentColor: '#eab308',
    faq: [
      {
        question: 'Qu’est-ce qu’une mise aux normes électrique ?',
        answer:
          'Il s’agit de la mise en conformité de l’installation avec la norme NF C 15-100 : tableau, différentiels, mise à la terre et protection des circuits. Elle est souvent exigée lors d’une vente.',
      },
      {
        question: 'Les électriciens interviennent-ils en urgence ?',
        answer:
          'Plusieurs artisans référencés assurent un service de dépannage d’urgence. Vérifiez la mention correspondante dans leurs prestations.',
      },
      {
        question: 'Faut-il un certificat Consuel ?',
        answer:
          'Le Consuel est obligatoire pour toute installation neuve ou entièrement rénovée avant la mise en service par le fournisseur d’électricité.',
      },
    ],
  },
]

/** Index par slug — évite les `.find()` répétés dans les repositories. */
export const categoriesBySlug: ReadonlyMap<string, Category> = new Map(
  categories.map((category) => [category.slug, category]),
)
