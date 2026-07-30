# Autour de Moi — annuaire local

Annuaire de professionnels type Pages Jaunes / Google Business, construit avec
Next.js App Router, TypeScript et TailwindCSS.

Le site fonctionne dans **deux modes**, choisis par variable d'environnement :

- **`static`** (défaut) — données de démonstration de [data/](data/), aucune
  requête réseau ;
- **`localshark`** — 100 % des données depuis l'API annuaire `app.localshark.io`
  (voir [Phase 2](#phase-2--intégration-localshark)).

```bash
npm install
cp .env.example .env.local   # y renseigner DIRECTORY_API_KEY pour le mode API
npm run dev                  # http://localhost:3000
npm run build                # 153 pages en mode statique
npm run typecheck            # tsc --noEmit
```

---

## Architecture

```
app/                        Routes (App Router, Server Components par défaut)
  layout.tsx                Header/Footer, JSON-LD Organization + WebSite
  page.tsx                  Accueil
  entreprises/              Liste : recherche, filtres, tri, pagination
  entreprise/[slug]/        Fiche entreprise (SSG)
  categories/ villes/       Pages index
  [slug]/                   /restaurants, /plombiers, /paris, /lyon…
  [slug]/[sub]/             /restaurants/paris ET /paris/restaurants
  sitemap.ts robots.ts      SEO technique
  opengraph-image.tsx       Image OG générée (sans ressource externe)

components/
  ui/                       Button, Badge, Rating, Breadcrumb, Pagination,
                            SectionHeading, EmptyState, FAQ, Container
  layout/                   Header, MobileNav, Footer
  search/                   SearchBar
  business/                 BusinessCard, BusinessHeader, BusinessSidebar,
                            ContactCard, OpeningHours, Gallery, PhotoGrid,
                            ReviewCard, ReviewSummary, GooglePost, MapPlaceholder
  directory/                CategoryCard, CityCard, BusinessGrid, FilterSidebar,
                            SortSelect, DirectoryPage
  seo/                      JsonLd

repositories/               ⭐ Couche d'abstraction — seul point d'accès aux données
  snapshot.ts               Cache par rendu : 1 seul appel global par build
  sources/                  staticSource | localSharkSource + sélecteur
data/                       Données de démonstration (mode statique)
types/                      Modèle de domaine
lib/
  localshark/               Client HTTP, DTO, mappers, habillage catégories
  geo/                      Département et région déduits du code postal
  …                         site, routes, seo, jsonld, search-params, view-helpers
utils/                      format, slug, opening-hours, pagination, seed, cn
hooks/                      useLockBodyScroll, useKeyboardNavigation
```

### Règle d'architecture centrale

```
app/ + components/  →  repositories/  →  sources/  →  data/ | API LocalShark
                                            ▲
                                   seule frontière qui bascule
```

- Les pages et les composants **n'importent jamais** `data/` ni
  `lib/localshark/` : uniquement `repositories/`.
- Les composants sont **purement pilotés par leurs props** : aucun accès aux
  repositories, aucun état global.
- Changer de source ne modifie **aucune page ni aucun composant**.

---

## Modèle de données

| Type | Fichier | Rôle |
| --- | --- | --- |
| `Business` | [types/business.ts](types/business.ts) | Fiche entreprise (fiche Google Business) |
| `Category` | [types/category.ts](types/category.ts) | Catégorie d'activité |
| `City` | [types/city.ts](types/city.ts) | Ville couverte |
| `Review` | [types/review.ts](types/review.ts) | Avis client + réponse du professionnel |
| `Post` | [types/post.ts](types/post.ts) | Publication (update / offer / event) |
| `Photo` | [types/photo.ts](types/photo.ts) | Média |
| `Paginated<T>`, `SelectOption`, `FaqItem`… | [types/common.ts](types/common.ts) | Types transverses |

Les champs optionnels du modèle correspondent à ce que l'API n'alimente pas :
les composants les traitent tous comme facultatifs. Une note absente s'affiche
« Aucun avis » et jamais `0/5`.

Jeu de démonstration : **43 entreprises**, 8 catégories, 6 villes, ~350 avis,
~130 publications, ~260 photos.

Les champs éditoriaux sont saisis à la main dans
[data/businesses.ts](data/businesses.ts) ; les champs dérivés (horaires,
coordonnées, médias, FAQ, avis, publications) sont complétés par
[data/factories.ts](data/factories.ts) via un générateur **déterministe**
([utils/seed.ts](utils/seed.ts)) — pas de `Math.random()`, donc pas d'écart
serveur/client ni de build non reproductible.

---

## Routes

| URL | Type | Contenu |
| --- | --- | --- |
| `/` | Statique | Hero, recherche, catégories, entreprises à la une, avis, publications, photos, FAQ |
| `/entreprises` | Dynamique | Recherche plein texte, filtres (catégorie / ville / note), tri, pagination |
| `/entreprise/[slug]` | SSG | Fiche complète |
| `/categories`, `/villes` | Statique | Index + maillage interne |
| `/[slug]` | SSG | Catégorie (`/restaurants`) **ou** ville (`/paris`) |
| `/[slug]/[sub]` | SSG | `/restaurants/paris` et `/paris/restaurants` |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Statique | SEO technique |

Paramètres d'URL en français : `?q=`, `?categorie=`, `?ville=`, `?note=`,
`?tri=`, `?page=` — voir [lib/search-params.ts](lib/search-params.ts).

---

## SEO

- `metadataBase`, titres templatés, meta descriptions, `keywords`
- URL canonique sur chaque page ; combinaisons de filtres en `noindex, follow`
- OpenGraph + Twitter Card + image OG générée
- JSON-LD : `Organization`, `WebSite` + `SearchAction`, `LocalBusiness`
  (typé finement : `Restaurant`, `Plumber`, `HairSalon`…) avec
  `openingHoursSpecification`, `aggregateRating`, `review`, `geo`,
  plus `BreadcrumbList`, `FAQPage` et `ItemList`
- Sitemap complet généré depuis les repositories
- Maillage interne systématique catégorie ↔ ville ↔ fiche

## Accessibilité & performance

- Lien d'évitement, hiérarchie de titres, `aria-*`, focus visible homogène
- FAQ en `<details>` natif, filtres et tri en formulaires `GET` :
  **fonctionnels sans JavaScript** et produisant des URLs partageables
- `prefers-reduced-motion` respecté
- Server Components partout ; seuls `SearchBar`, `Gallery`, `FilterSidebar`,
  `SortSelect` et `MobileNav` sont clients (~105 kB de JS partagé)
- `next/image` avec `sizes` explicites et `priority` sur le LCP

---

## Phase 2 — intégration LocalShark

L'intégration est **en place et vérifiée contre l'API réelle**. Le site
fonctionne dans deux modes, choisis par variable d'environnement — voir
[.env.example](.env.example) :

| Mode | Déclencheur | Comportement |
| --- | --- | --- |
| `static` | défaut | Tout vient de `data/`. Aucune requête réseau. |
| `localshark` | `DIRECTORY_API_KEY` renseignée | Tout vient de l'API `app.localshark.io`. |

```
app/ + components/
        ↓
repositories/            ← API publique stable, inchangée
        ↓
repositories/snapshot.ts ← cache par rendu (1 seul appel global)
        ↓
repositories/sources/    ← staticSource | localSharkSource
        ↓
lib/localshark/          ← client HTTP, DTO, mappers, habillage catégories
```

### Deux endpoints, `1 + N` requêtes par build

| Endpoint | Appels | Alimente |
| --- | --- | --- |
| `GET /api/directory` | **1 par build** | Accueil, listings, catégories, villes, sitemap |
| `GET /api/directory/{slug\|id}` | 1 par fiche | Page fiche |

`React.cache()` garantit qu'un build ne déclenche qu'un seul appel global,
quel que soit le nombre de pages qui le sollicitent
([repositories/snapshot.ts](repositories/snapshot.ts)).

### Les avis passent par une iframe

L'API **n'expose pas** le texte des avis : chaque fiche porte un
`reviewsWidgetUrl` embarqué par
[ReviewsWidget](components/business/ReviewsWidget.tsx), qui écoute le
`postMessage` `ls-reviews-widget-height` pour s'auto-dimensionner (avec
contrôle de l'origine émettrice).

Conséquences assumées :

- le contenu des avis vit dans l'iframe et n'est **pas indexable** ;
- `aggregateRating` (note + volume) reste injecté côté serveur, donc les
  étoiles restent éligibles aux rich snippets ;
- le balisage `review` individuel disparaît en mode API ;
- le bloc « Derniers avis » de l'accueil est masqué faute de flux transverse.

### Ce que le site dérive lui-même

- **Villes** : déduites de `location.city` et `location.servedCities`. Le
  département et la région viennent du code postal
  ([lib/geo/departments.ts](lib/geo/departments.ts)) — aucun endpoint requis.
- **Habillage des catégories** : l'API ne renvoie ni pluriel, ni pictogramme,
  ni texte. [category-presentation.ts](lib/localshark/category-presentation.ts)
  les produit de façon déterministe (pluriel français avec arrêt à la première
  préposition : « Salle de sport » → « Salles de sport »).
- **Titre des publications** : dérivé du corps quand l'API renvoie `title: null`,
  sans que titre et chapô se répètent.
- **Répartition des notes** : reconstituée depuis la moyenne et le total, et
  **signalée comme estimée** dans l'interface.

### Robustesse

- `401` → échec immédiat du build (une clé invalide produirait un site vide,
  bien pire qu'un build cassé).
- Autres erreurs → trace console et repli, sauf si `LOCALSHARK_STRICT=1`.
- `assertDirectoryHealth()` détecte le cas « API joignable mais colonnes
  ville/catégorie vides », qui produirait silencieusement un annuaire sans
  aucune page locale.

### État constaté sur l'instance de développement

Vérifié le 30/07/2026 sur `http://localhost:3001` :

| Point | Constat |
| --- | --- |
| Structure des deux endpoints | Conforme au contrat |
| `slug` et `googleCardId` sur l'endpoint B | Résolvent tous deux |
| `401` sans clé, `404` sur identifiant inconnu | Conformes |
| Nombre de fiches | **1** — seules les fiches ayant un site généré par LocalShark sont exposées |
| `category`, `location.*`, `regularHours` | **Vides** — migration Prisma et cron `cron-websites` en attente |

Tant que les colonnes ne sont pas peuplées, le build produit 11 pages au lieu
des 153 attendues : ni page ville, ni page catégorie.

Écarts relevés par rapport au contrat, à remonter :

1. `verified` renvoie `null` là où le contrat annonce un booléen — traité
   comme « non vérifié ».
2. `phone` arrive au format national (`01 47 00 67 96`) et non en E.164
   (`+33147006796`) comme dans l'exemple du contrat.
3. `reviewsWidgetUrl` pointe vers `http://localhost:3000/...` : URL dépendante
   de l'environnement, et en `http` — contenu mixte bloqué sur un site `https`.

---

Les données de démonstration (`data/`) sont **fictives** et ne correspondent à
aucun établissement réel.
