# Brief de développement — deux endpoints annuaire

> À copier-coller dans l'environnement de développement LocalShark.
> Document autonome : aucune connaissance du site consommateur n'est requise.

---

## Contexte

Un site annuaire externe (Next.js, rendu statique) doit publier les fiches
Google Business gérées dans LocalShark : une page par établissement, plus des
pages de listing par métier et par ville.

Il consomme l'API **au moment du build**, pas à chaque visite. Le profil de
charge est donc : peu d'appels, mais tous d'un coup, et des payloads riches.

**À développer : deux endpoints REST, en lecture seule.**

| # | Route | Fréquence | Rôle |
| --- | --- | --- | --- |
| A | `GET /api/directory` | 1 appel par build | Accueil, recherche, listings, pages catégorie et ville, sitemap |
| B | `GET /api/directory/{idOrSlug}` | 1 appel par fiche (~190) | Page détail d'un établissement |

Objectif de conception : **1 + N requêtes par build**. Chaque endpoint doit
être auto-suffisant — le consommateur ne doit jamais avoir à enchaîner des
appels pour compléter une réponse.

Ajustez les chemins à vos conventions ; communiquez simplement les chemins
retenus.

---

## Contraintes transverses

- **Lecture seule.** Aucune mutation.
- **Authentification** : réutiliser le mécanisme existant de l'API
  (`Authorization: Bearer …` ou équivalent). Portée : l'organisation liée à
  la clé.
- **Format** : JSON UTF-8, dates ISO 8601 UTC.
- **Fiches en pause** (`paused: true`) : **exclues par défaut**, avec un
  paramètre `?includePaused=true` pour l'opt-in.
- **`ETag` / `If-None-Match`** : souhaitable sur les deux endpoints, les
  rebuilds sont fréquents.
- **Pas de N+1 interne.** L'endpoint A agrège ~190 fiches : prévoir des
  requêtes groupées côté base, pas une boucle par fiche.

---

## Règles métier communes

Ces règles sont issues de l'observation des données réelles de production.
Merci de les appliquer **côté API**, pour éviter que chaque consommateur les
réimplémente.

### 1. Avis auto-traduits par Google

Le champ `comment` contient fréquemment :

```
(Translated by Google) Always a warm welcome and nothing to complain about 👌

(Original)
Toujours bien reçu et rien à dire sur le presta👌
```

**Attendu :** découper en champs distincts.

| Champ | Contenu |
| --- | --- |
| `comment` | La version **d'origine** uniquement (après `(Original)`) |
| `commentTranslated` | La traduction, ou `null` |
| `language` | Code ISO de la langue d'origine si connu (`fr`, `en`…), sinon `null` |

Si le commentaire ne contient pas le marqueur, `comment` vaut le texte tel quel
et `commentTranslated` vaut `null`.

### 2. Avis sans texte

Google autorise une note sans commentaire — `comment` vaut `""`. Ces avis
**comptent dans les agrégats** (`reviewCount`, `ratingDistribution`) mais
doivent être **exclus des tableaux `reviews[]`**, qui ne servent qu'à
l'affichage.

### 3. Contenus non publiés

`posts[]`, `photos[]` et les flux transverses ne doivent contenir que du
**réellement publié** : exclure `DRAFT`, `Pending`, `Processing`, `Failed`,
ainsi que toute entrée dont `isFutureSchedule` vaut `true`.

### 4. Dates de publication

Constat : sur les médias, `publishedAt` est souvent `null` alors que
`status` vaut `"Published"`.

**Attendu :** exposer un `publishedAt` toujours renseigné pour un contenu
publié, avec repli sur `scheduledFor` si la date réelle est inconnue.

### 5. Valeurs nulles

- `averageRating` vaut `null` quand `totalReviews` vaut `0` — conserver `null`,
  **ne pas renvoyer `0`** (une note de 0/5 serait affichée telle quelle).
- Idem pour tout champ inconnu : `null` plutôt qu'une chaîne vide ou un zéro.

### 6. Slug

**Le slug existe déjà côté LocalShark : l'exposer tel quel.** Ne pas le
recalculer, ne pas le dériver du nom.

C'est lui qui construit les URLs publiques du site — il doit donc être
**stable dans le temps**, y compris si l'établissement change de nom. S'il
peut changer, signalez-le : il faudra prévoir des redirections.

---

# Endpoint A — `GET /api/directory`

## Paramètres

| Paramètre | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `limit` | int | tout | Pagination de `businesses[]` |
| `offset` | int | `0` | Pagination de `businesses[]` |
| `updatedSince` | ISO 8601 | — | Ne renvoyer que les fiches modifiées depuis — rebuilds incrémentaux |
| `includePaused` | bool | `false` | Inclure les fiches en pause |

## Réponse

```jsonc
{
  "generatedAt": "2026-07-30T08:00:00.000Z",

  "stats": {
    "businessCount": 187,
    "reviewCount": 24310,      // somme des totalReviews
    "photoCount": 3420,
    "postCount": 1180
  },

  "categories": [
    {
      "id": "gcid:plumber",
      "slug": "plombiers",
      "displayName": "Plombier",
      "displayNamePlural": "Plombiers",
      "businessCount": 24
    }
  ],

  "businesses": [ /* voir ci-dessous */ ],

  "latestReviews": [ /* 12 entrées */ ],
  "latestPosts":   [ /* 12 entrées */ ],
  "latestPhotos":  [ /* 12 entrées */ ]
}
```

### `businesses[]` — version allégée

Volontairement légère : **ni description longue, ni galerie, ni avis.**
Uniquement de quoi afficher une carte, filtrer, trier et générer les URLs.

```jsonc
{
  "googleCardId": "12366692476652032898",
  "slug": "sanicoste-plomberie-chauffage-casteljaloux",
  "name": "Sanicoste plomberie chauffage",
  "shortDescription": "Plombier chauffagiste à Casteljaloux depuis 2011.",  // ~160 car. max

  "category": { "id": "gcid:plumber", "slug": "plombiers", "displayName": "Plombier" },

  "location": {
    "address": "12 rue de la République",   // null si artisan mobile
    "postalCode": "47700",                  // null si artisan mobile
    "city": "Casteljaloux",                 // null si artisan mobile
    "latitude": 44.3122,
    "longitude": 0.0894,
    "servedCities": [                       // voir encadré ci-dessous
      { "name": "Casteljaloux", "postalCode": "47700" },
      { "name": "Marmande",     "postalCode": "47200" }
    ]
  },

  "rating": 4.8,                 // null si aucun avis
  "reviewCount": 213,

  "phone": "+33553201234",
  "websiteUri": "https://www.sanicoste.fr",

  "logoUrl":  "https://…/logo.jpg",
  "coverUrl": "https://…/cover.jpg",        // une seule image ici

  "regularHours": [
    { "day": "MONDAY", "openTime": "08:00", "closeTime": "12:00" },
    { "day": "MONDAY", "openTime": "14:00", "closeTime": "18:00" }
  ],

  "verified": true,
  "priceLevel": 2,               // 1–4, null si inconnu
  "updatedAt": "2026-07-20T09:12:00.000Z"
}
```

> ### ⚠️ `servedCities` est indispensable
>
> Une part importante des fiches sont des **artisans mobiles** — couvreurs,
> plombiers, taxis, élagueurs — qui n'ont légitimement pas d'adresse publique
> (`storefrontAddress` absent, `serviceArea` renseigné côté Google).
>
> Le rattachement d'une fiche à une ville se fait sur `location.city` **ou**
> `location.servedCities`. **Sans `servedCities`, ces fiches n'apparaissent sur
> aucune page ville et sont donc invisibles dans l'annuaire.**
>
> Source : `serviceArea.places[].placeInfos[].placeName` de l'API Google
> Business Profile. Le `postalCode` est optionnel — le nom de la ville suffit.

### Format des horaires

Un tableau plat. **Deux entrées pour un même jour = coupure méridienne.**
Un jour absent du tableau = **fermé**.

`day` ∈ `MONDAY`…`SUNDAY`. `openTime`/`closeTime` au format `HH:MM` (24 h).

### Flux transverses

**Dénormalisés** : chaque entrée porte l'identité de sa fiche, pour éviter au
consommateur toute jointure.

```jsonc
// latestReviews
{
  "reviewId": "AbFvOqmQzvGjQPAxsNvP",
  "googleCardId": "…", "businessName": "Sanicoste", "businessSlug": "sanicoste-…",
  "reviewer": "Alex Toussaint",
  "reviewerPhotoUrl": null,
  "rating": 5,
  "comment": "Toujours bien reçu…",
  "commentTranslated": "Always a warm welcome…",
  "language": "fr",
  "createdAt": "2026-07-29T11:41:39.321Z"
}

// latestPosts
{
  "id": "Q0Fi5PW7lMZ",
  "googleCardId": "…", "businessName": "…", "businessSlug": "…",
  "type": "STANDARD",                   // STANDARD | EVENT | OFFER | ALERT
  "title": "Devis gratuit et sans surprise",
  "summary": "Vous avez un projet de plomberie…",
  "imageUrl": "https://…/photo.jpg",
  "publishedAt": "2026-07-29T22:00:00.000Z"
}

// latestPhotos — idéalement une seule par établissement, pour la diversité
{
  "id": "3CY8CS9JkD-",
  "googleCardId": "…", "businessName": "…", "businessSlug": "…",
  "imageUrl": "https://…/media.jpg",
  "description": "Diagnostic électricité et gaz",
  "width": 1600, "height": 1200,
  "publishedAt": "2026-07-29T22:01:37.565Z"
}
```

**`title` sur les posts** : Google ne fournit pas de titre. Si LocalShark peut
en produire un (les posts sont générés dans l'outil), l'exposer améliore
nettement l'affichage. Sinon renvoyer `null` — le consommateur le dérivera du
corps, avec un résultat approximatif.

---

# Endpoint B — `GET /api/directory/{idOrSlug}`

Accepter **indifféremment** le `googleCardId` ou le `slug` comme identifiant.

`404` si inconnu ou en pause (sauf `?includePaused=true`).

## Paramètres

| Paramètre | Type | Défaut | Rôle |
| --- | --- | --- | --- |
| `reviewsLimit` | int | `25` | Nombre d'avis embarqués |
| `reviewsOffset` | int | `0` | Pagination des avis |

## Réponse

**Tout le bloc `businesses[]` de l'endpoint A, à l'identique**, plus :

```jsonc
{
  // … tous les champs de A.businesses[] …

  "description": "Texte complet de présentation…",   // sans limite de longueur
  "openingDate": "2011-04-01",                       // ou "2011"

  "additionalCategories": [
    { "id": "gcid:heating_contractor", "slug": "chauffagistes", "displayName": "Chauffagiste" }
  ],

  "specialHours": [
    { "date": "2026-12-25", "closed": true },
    { "date": "2026-12-24", "openTime": "09:00", "closeTime": "16:00" }
  ],

  "email": "contact@sanicoste.fr",
  "additionalPhones": [],
  "socialProfiles": { "facebook": "https://…", "instagram": "https://…" },

  "services": [
    { "name": "Dépannage d'urgence", "description": "…", "price": null }
  ],
  "attributes": [
    { "id": "wheelchair_accessible_entrance", "displayName": "Accès handicapé" }
  ],
  "faq": [
    { "question": "Intervenez-vous le week-end ?", "answer": "Oui, …" }
  ],

  "photos": [
    {
      "id": "3CY8CS9JkD-",
      "imageUrl": "https://…/1.jpg",
      "description": "Diagnostic électricité et gaz",
      "category": "AT_WORK",     // EXTERIOR|INTERIOR|PRODUCT|TEAMS|AT_WORK|COVER|PROFILE|LOGO|ADDITIONAL
      "mediaFormat": "PHOTO",    // PHOTO | VIDEO
      "thumbnailUrl": null,      // pour les vidéos
      "width": 1600, "height": 1200,
      "publishedAt": "2026-07-29T22:01:37.565Z"
    }
  ],

  "posts": [
    {
      "id": "Q0Fi5PW7lMZ",
      "type": "OFFER",
      "title": "Offre de bienvenue",
      "summary": "Texte complet du post…",
      "imageUrls": ["https://…/photo.jpg"],
      "callToAction": { "type": "CALL", "url": "" },
      "offer": { "couponCode": "BIENVENUE20", "validFrom": "…", "validTo": "…", "terms": "…" },
      "event": null,             // { "title", "startDate", "endDate" } si type EVENT
      "publishedAt": "2026-07-29T22:00:00.000Z"
    }
  ],

  "ratingDistribution": { "1": 3, "2": 2, "3": 8, "4": 40, "5": 160 },

  "reviews": [
    {
      "reviewId": "AbFvOqmQzvGjQPAxsNvP",
      "reviewer": "Alex Toussaint",
      "reviewerPhotoUrl": null,
      "rating": 5,
      "comment": "Toujours bien reçu…",
      "commentTranslated": null,
      "language": "fr",
      "createdAt": "2026-07-29T11:41:39.321Z",
      "reply": { "comment": "Merci beaucoup !", "repliedAt": "2026-07-29T14:00:00.000Z" }
    }
  ]
}
```

### Précisions

- **`ratingDistribution`** porte l'agrégat **complet** de la fiche, indépendant
  de `reviewsLimit`. La somme des cinq valeurs doit égaler `reviewCount`.
- **`reviews[]`** : les plus récents d'abord, commentaire non vide uniquement.
- **`reply.repliedAt`** : si la date de réponse n'est pas stockée, renvoyer
  `null` — mais conserver l'objet `reply` avec son `comment`.
- **`priceLevel`, `email`, `socialProfiles`, `faq`** : renvoyer `null` ou un
  tableau vide si la donnée n'existe pas. Ne bloquent pas la livraison.

---

## Correspondance API Google Business Profile

Si les données proviennent de `accounts.locations`, le mapping est direct :

| Champ demandé | Source Google |
| --- | --- |
| `name` | `title` |
| `description` | `profile.description` |
| `openingDate` | `openInfo.openingDate` |
| `location.address` / `postalCode` / `city` | `storefrontAddress.addressLines` / `.postalCode` / `.locality` |
| `location.latitude` / `longitude` | `latlng.latitude` / `.longitude` |
| `location.servedCities` | `serviceArea.places[].placeInfos[].placeName` |
| `phone` / `additionalPhones` | `phoneNumbers.primaryPhone` / `.additionalPhones` |
| `websiteUri` | `websiteUri` |
| `category` / `additionalCategories` | `categories.primaryCategory` / `.additionalCategories` |
| `regularHours` | `regularHours.periods` (aplati) |
| `specialHours` | `specialHours.specialHourPeriods` |
| `services` | `serviceItems` |
| `attributes` | `attributes` |

---

## Critères d'acceptation

Checklist testable :

- [ ] `GET /api/directory` répond en une requête, sans N+1 interne.
- [ ] Aucune fiche `paused: true` dans la réponse par défaut ;
      `?includePaused=true` les fait apparaître.
- [ ] Une fiche **sans adresse** mais avec zones desservies expose
      `location.city: null` **et** un `servedCities` non vide.
- [ ] Une fiche **sans aucun avis** expose `rating: null` et `reviewCount: 0`
      (et non `rating: 0`).
- [ ] Un avis auto-traduit expose `comment` en version d'origine et
      `commentTranslated` séparément.
- [ ] Un avis sans texte est **absent** de `reviews[]` mais **compté** dans
      `reviewCount` et `ratingDistribution`.
- [ ] La somme de `ratingDistribution` égale `reviewCount`.
- [ ] Aucun contenu `DRAFT` / `Pending` / `isFutureSchedule: true` dans
      `posts[]`, `photos[]` et les flux transverses.
- [ ] Tout contenu publié expose un `publishedAt` non nul.
- [ ] Une journée avec coupure méridienne produit **deux** entrées
      `regularHours` pour le même `day`.
- [ ] Un jour de fermeture **n'apparaît pas** dans `regularHours`.
- [ ] `GET /api/directory/{slug}` et `GET /api/directory/{googleCardId}`
      renvoient la même fiche.
- [ ] `404` sur identifiant inconnu.
- [ ] Les champs de `businesses[]` (endpoint A) sont **strictement identiques**
      à ceux de l'endpoint B — mêmes noms, mêmes types.

---

## Points à remonter

1. **Chemins retenus** pour les deux endpoints.
2. **Le slug est-il immuable ?** S'il peut changer, il faudra des redirections
   côté site.
3. **Champs non disponibles** dans votre modèle (`faq`, `priceLevel`,
   `socialProfiles`, `mediaFormat`, dimensions d'images, `offer`/`event`
   structurés) — renvoyez `null`, ce n'est pas bloquant, mais dites-le pour
   que le consommateur n'attende pas ces données.
4. **Un OpenAPI / Swagger** de ces deux routes, si vous en générez un.
