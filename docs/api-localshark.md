# Spécification API — `app.localshark.io`

Deux endpoints dédiés à l'annuaire. **100 % des données du site en proviennent**,
plus aucune donnée éditoriale locale.

| # | Endpoint | Appelé | Sert à |
| --- | --- | --- | --- |
| **A** | `GET …/directory` | **1 fois** par build | Accueil, recherche, listings, pages catégorie et ville, sitemap |
| **B** | `GET …/directory/{googleCardId}` | 1 fois **par fiche** | Page fiche entreprise |

Propriété visée : un build complet = **1 + N requêtes** (N ≈ 190), au lieu de
5 requêtes par fiche avec des endpoints granulaires.

---

## Généralités

À préciser :

| Point | Question |
| --- | --- |
| URL de base | `https://app.localshark.io/api` ? `/api/v1` ? |
| Authentification | `Authorization: Bearer <token>` ? `X-API-Key` ? |
| Portée | Clé liée à une organisation, ou `organizationId` à passer ? |
| Quotas | Requêtes/minute ? `Retry-After` sur `429` ? |
| Cache | `ETag` / `If-None-Match` supportés ? |

Conventions supposées : JSON UTF-8, dates ISO 8601 UTC, `404` si absent.

**Fiches en pause** — merci de les **exclure par défaut**, avec un
`?includePaused=true` pour l'opt-in.

**Existe-t-il un OpenAPI/Swagger ?** Si oui, donnez-moi l'URL : je génère les
types et le client directement.

---

# A. `GET …/directory` — payload global

Appelé une fois. Contient tout ce qu'il faut pour rendre l'accueil, les
listings, la recherche, les pages catégorie et ville, et le sitemap —
**sans aucun autre appel**.

## A.1 Structure

```jsonc
{
  "generatedAt": "2026-07-30T08:00:00.000Z",

  "stats": {
    "businessCount": 187,
    "reviewCount": 24310,        // somme des agrégats
    "photoCount": 3420,
    "postCount": 1180
  },

  "businesses": [ /* voir A.2 */ ],

  "categories": [ /* voir A.3 — optionnel */ ],

  "latestReviews": [ /* voir A.4 */ ],
  "latestPosts":   [ /* voir A.4 */ ],
  "latestPhotos":  [ /* voir A.4 */ ]
}
```

## A.2 `businesses[]` — version allégée

**Une entrée par fiche.** Volontairement légère : pas de description longue,
pas de galerie complète, pas d'avis. Juste de quoi afficher une carte, filtrer,
trier et générer les URLs.

```jsonc
{
  "googleCardId": "12366692476652032898",
  "slug": "sanicoste-plomberie-chauffage-casteljaloux",   // voir « décision » ci-dessous
  "name": "Sanicoste plomberie chauffage",
  "shortDescription": "Plombier chauffagiste à Casteljaloux depuis 2011.",  // ~160 car. max

  "category": { "id": "gcid:plumber", "displayName": "Plombier", "slug": "plombiers" },

  "location": {
    "address": "12 rue de la République",     // null si artisan mobile
    "postalCode": "47700",                    // null si artisan mobile
    "city": "Casteljaloux",                   // null si artisan mobile
    "latitude": 44.3122,
    "longitude": 0.0894,
    // ⚠️ INDISPENSABLE : sans ça, un couvreur sans adresse publique
    // n'apparaît sur aucune page ville.
    "servedCities": [
      { "name": "Casteljaloux", "postalCode": "47700" },
      { "name": "Marmande",     "postalCode": "47200" }
    ]
  },

  "rating": 4.8,                 // null si aucun avis
  "reviewCount": 213,

  "phone": "+33553201234",
  "websiteUri": "https://www.sanicoste.fr",

  "logoUrl":  "https://…/logo.jpg",
  "coverUrl": "https://…/cover.jpg",         // 1 image suffit ici

  // Nécessaire pour le badge « Ouvert / Fermé » affiché sur chaque carte.
  "regularHours": [
    { "day": "MONDAY", "openTime": "08:00", "closeTime": "12:00" },
    { "day": "MONDAY", "openTime": "14:00", "closeTime": "18:00" }
  ],

  "verified": true,
  "priceLevel": 2,               // 1–4, null si inconnu
  "updatedAt": "2026-07-20T09:12:00.000Z"
}
```

### Usage champ par champ

| Champ | Sert à | Si absent |
| --- | --- | --- |
| `slug` | URL de la fiche | Je le dérive du nom (voir décision) |
| `category.slug` | **Pages `/plombiers`** + typage Schema.org (`Plumber`…) | **Pas de page catégorie** |
| `location.city` ou `servedCities` | **Pages `/casteljaloux`, `/plombiers/casteljaloux`** | **Fiche invisible dans l'annuaire** |
| `latitude`/`longitude` | Carte, JSON-LD `GeoCoordinates` | Pas de carte |
| `rating`/`reviewCount` | Tri, filtre « note minimale », étoiles, `aggregateRating` | Tri par note inopérant |
| `regularHours` | Badge « Ouvert / Fermé » sur les cartes | Badge masqué |
| `shortDescription` | Texte des cartes, meta description | Fiche pauvre en contenu |
| `coverUrl` | Visuel des cartes | Placeholder |
| `updatedAt` | `lastmod` du sitemap, rebuilds incrémentaux | Sitemap moins précis |
| `priceLevel`, `verified` | Badges secondaires | Simplement masqués |

### Volumétrie

≈ 700 octets par entrée × 190 ≈ **130 Ko**, soit ~25 Ko en gzip. Confortable
pour un appel unique.

**Prévoir tout de même une pagination** pour la croissance :
`?limit=200&offset=0`. Et idéalement `?updatedSince=<ISO>` pour ne récupérer
que les fiches modifiées.

## A.3 `categories[]` — optionnel

```jsonc
{ "id": "gcid:plumber", "slug": "plombiers", "displayName": "Plombier", "displayNamePlural": "Plombiers", "businessCount": 24 }
```

**Si vous ne l'exposez pas**, je déduis la liste des catégories distinctes
rencontrées dans `businesses[]`. Dites-moi simplement lequel vous préférez —
l'exposer vous donne la maîtrise des libellés et des slugs.

## A.4 Flux transverses

Alimentent les blocs « Derniers avis », « Dernières publications » et
« Dernières photos » de l'accueil. **Dénormalisés** : chaque entrée porte
l'identité de sa fiche, pour m'éviter toute jointure.

```jsonc
// latestReviews — 12 entrées suffisent
{
  "reviewId": "AbFvOqmQzvGjQPAxsNvP",
  "googleCardId": "…", "businessName": "Sanicoste", "businessSlug": "sanicoste-…",
  "reviewer": "Alex Toussaint",
  "reviewerPhotoUrl": null,
  "rating": 5,
  "comment": "Toujours bien reçu…",     // ⚠️ voir « traduction » ci-dessous
  "createdAt": "2026-07-29T11:41:39.321Z"
}

// latestPosts — 12 entrées
{
  "id": "Q0Fi5PW7lMZ",
  "googleCardId": "…", "businessName": "…", "businessSlug": "…",
  "type": "STANDARD",                   // STANDARD | EVENT | OFFER | ALERT
  "title": "Devis gratuit et sans surprise",   // voir « titre » ci-dessous
  "summary": "Vous avez un projet de plomberie…",
  "imageUrl": "https://…/photo.jpg",
  "publishedAt": "2026-07-29T22:00:00.000Z"
}

// latestPhotos — 12 entrées, idéalement une par fiche
{
  "id": "3CY8CS9JkD-",
  "googleCardId": "…", "businessName": "…", "businessSlug": "…",
  "imageUrl": "https://…/media.jpg",
  "description": "Diagnostic électricité et gaz",
  "width": 1600, "height": 1200,
  "publishedAt": "2026-07-29T22:01:37.565Z"
}
```

Seules les entrées **réellement publiées** (pas `DRAFT`, pas `Pending`, pas de
programmation future).

---

# B. `GET …/directory/{googleCardId}` — payload d'une fiche

Appelé une fois par fiche. Doit être **auto-suffisant** : après cet appel, je
n'ai plus besoin de rien pour rendre la page.

Accepter aussi le **slug** comme identifiant serait un plus
(`GET …/directory/sanicoste-plomberie-chauffage-casteljaloux`).

```jsonc
{
  // ── Tout le bloc A.2, à l'identique ────────────────────────────────────
  "googleCardId": "…", "slug": "…", "name": "…", "category": {…},
  "location": {…}, "rating": 4.8, "reviewCount": 213,
  "phone": "…", "websiteUri": "…", "logoUrl": "…", "coverUrl": "…",
  "regularHours": […], "verified": true, "priceLevel": 2, "updatedAt": "…",

  // ── Enrichissements propres à la fiche ────────────────────────────────
  "description": "Texte complet de présentation…",   // sans limite de longueur
  "openingDate": "2011-04-01",                       // ou "2011"

  "additionalCategories": [
    { "id": "gcid:heating_contractor", "displayName": "Chauffagiste", "slug": "chauffagistes" }
  ],

  "specialHours": [ { "date": "2026-12-25", "closed": true } ],

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

  // ── Médias ────────────────────────────────────────────────────────────
  "photos": [
    {
      "id": "3CY8CS9JkD-",
      "imageUrl": "https://…/1.jpg",
      "description": "Diagnostic électricité et gaz",
      "category": "AT_WORK",          // EXTERIOR|INTERIOR|PRODUCT|TEAMS|AT_WORK|COVER|PROFILE|LOGO|ADDITIONAL
      "mediaFormat": "PHOTO",         // PHOTO | VIDEO
      "width": 1600, "height": 1200,
      "publishedAt": "2026-07-29T22:01:37.565Z"
    }
  ],

  // ── Publications ──────────────────────────────────────────────────────
  "posts": [
    {
      "id": "Q0Fi5PW7lMZ",
      "type": "OFFER",
      "title": "Offre de bienvenue",
      "summary": "Texte complet du post…",
      "imageUrls": ["https://…/photo.jpg"],
      "callToAction": { "type": "CALL", "url": "" },
      "offer": { "couponCode": "BIENVENUE20", "validFrom": "…", "validTo": "…", "terms": "…" },
      "event": null,
      "publishedAt": "2026-07-29T22:00:00.000Z"
    }
  ],

  // ── Avis ──────────────────────────────────────────────────────────────
  "ratingDistribution": { "1": 3, "2": 2, "3": 8, "4": 40, "5": 160 },
  "reviews": [
    {
      "reviewId": "AbFvOqmQzvGjQPAxsNvP",
      "reviewer": "Alex Toussaint",
      "reviewerPhotoUrl": null,
      "rating": 5,
      "comment": "Toujours bien reçu…",
      "createdAt": "2026-07-29T11:41:39.321Z",
      "reply": { "comment": "Merci beaucoup !", "repliedAt": "2026-07-29T14:00:00.000Z" }
    }
  ]
}
```

### Combien d'avis embarquer ?

**20 à 30, les plus récents, commentaire non vide.** C'est ce que la page
affiche. `reviewCount` et `ratingDistribution` portent l'agrégat complet, donc
inutile de tout envoyer.

Si vous voulez une page « tous les avis » plus tard, prévoyez
`?reviewsLimit=&reviewsOffset=` sur ce même endpoint plutôt qu'un troisième.

### Usage des enrichissements

| Champ | Sert à |
| --- | --- |
| `description`, `services`, `attributes` | Corps de la fiche — contenu indexable, c'est le nerf du SEO |
| `faq` | Bloc FAQ + balisage `FAQPage` (rich snippet Google) |
| `ratingDistribution` | Histogramme de répartition des notes |
| `reviews[].reply` | Réponses du professionnel, affichées sous chaque avis |
| `photos` | Galerie avec visionneuse |
| `posts` | Actualités, offres, événements |
| `specialHours` | Fermetures exceptionnelles |
| `openingDate` | « Depuis 2011 » + `foundingDate` |
| `socialProfiles` | Liens sortants + `sameAs` |

---

# Trois décisions à trancher

## 1. Qui possède le `slug` ?

**Ma recommandation : l'API.**

Si je dérive le slug du nom, un établissement qui se renomme change d'URL —
et vous perdez le référencement acquis. Un slug stable et immuable côté
LocalShark protège vos URLs.

Si vous ne le fournissez pas, je le dérive de `name` + `city` et je le fige,
mais la garantie de stabilité disparaît.

## 2. Les avis auto-traduits

L'API renvoie aujourd'hui :

```
(Translated by Google) Always a warm welcome…

(Original)
Toujours bien reçu…
```

Je sais déjà extraire l'original. **Mais c'est plus propre côté API** : renvoyez
`comment` (version d'origine) et éventuellement `commentTranslated` + `language`
en champs séparés. Dites-moi ce que vous retenez, j'adapte.

## 3. Le titre des publications

Google ne fournit pas de titre de post. Aujourd'hui je le dérive de la première
phrase du corps, ce qui donne des titres approximatifs.

Si LocalShark peut en générer un — vous produisez déjà ces posts —, la qualité
d'affichage y gagne nettement.

---

# Récapitulatif de ce qu'il me faut

1. **URL de base + mode d'authentification + clé de test.**
2. **Endpoint A** avec au minimum, par fiche : `slug`, `name`, `category`,
   `location` (adresse **ou** `servedCities`), `rating`/`reviewCount`,
   `coverUrl`, `regularHours`.
3. **Endpoint B** avec au minimum : tout le bloc A + `description`, `photos`,
   `reviews`, `posts`.

Les trois champs qui commandent toute la structure du site :
**`category.slug`**, **`location.city` ou `servedCities`**, **`regularHours`**.
Le reste enrichit les fiches sans conditionner l'architecture.

Une fois A et B disponibles, je remplace la source éditoriale :
`repositories/sources/` est déjà conçu pour ce basculement — aucune page ni
aucun composant ne change.
