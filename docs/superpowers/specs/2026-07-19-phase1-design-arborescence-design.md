# Spec — Phase 1 : Design/UI & arborescence complète

> Date : 2026-07-19 · Statut : validé en brainstorm, prêt pour découpage en plans.
> Source produit : `CLAUDE.md`, `MVP.md`, `PROGRESS.md`. Prédécesseur : `2026-07-19-site-public-design.md` (sessions 3-5, amorce).

## 1. Objectif

Clôturer la Phase 1 : **toute l'arborescence du site en place** (chaque page existe, stylée, liens vivants) et une **landing quasi finie**. Aucune logique métier ni auth réelle — l'app connectée arrive en Phases 2+.

La phase est **conséquente** (UI ultra-originale, motion/GSAP, itérations webfetch). Elle est donc **découpée en deux sous-phases** : structure d'abord, polish ensuite.

## 2. Découpage en deux sous-phases

| Sous-phase | Nom | Contenu | Sortie |
|---|---|---|---|
| **1a** | Structure | Toute l'arborescence + coquilles à liens vivants, base a11y, SEO, build/lint verts. | Site navigable de bout en bout, zéro lien mort. |
| **1b** | Design-craft | UI ultra-originale, motion/GSAP, itérations design (webfetch pour inspiration), page par page. | Landing + pages poussées à l'UI finale. |

Règle méthodo : 1a se termine et se valide **avant** 1b. Chaque sous-phase se re-découpe en petits plans à son démarrage.

## 3. Arborescence figée (13 routes)

### 3.1 Groupe `(marketing)` — existant + 404

| Route | Page | État Phase 1 |
|-------|------|--------------|
| `/` | Accueil (landing) | quasi finie, raffinée, animée |
| `/comment-ca-marche` | Comment ça marche | coquille stylée, contenu honnête |
| `/tarifs` | Tarifs **+ recharge** | 3 offres + toggle + **section recharge sous les cartes** (§5) |
| `/faq` | FAQ | accordéons |
| `/a-propos` | À propos | mission + « ton score » |
| `/contact` | Contact | formulaire coquille |
| `/connexion` | Se connecter | formulaire coquille (pas d'auth) |
| `/mentions-legales` | Mentions légales | gabarit « à compléter » |
| `/confidentialite` | Confidentialité | gabarit « à compléter » |
| `/cgu` | CGU | gabarit « à compléter » |
| `not-found.tsx` | **404** | **nouveau** — page 404 stylée Estio, CTA retour accueil |

### 3.2 Groupe `(app)` — nouveau

| Route | Page | État Phase 1 |
|-------|------|--------------|
| `/app` | Dashboard connecté (inerte) | carte « Aucun bien analysé » + CTA `Importer un bien` désactivé (« bientôt ») |
| `/app/wallet` | Wallet | grille de cartes-biens **factices** + état vide, illustrant la capacité |

**Total : 13 routes.** Les routes `/app/import`, `/app/comparateur`, `/app/compte` sont **hors périmètre Phase 1** — créées à leur phase (2/3/5).

## 4. Groupe `(app)` — architecture

- `src/app/(app)/layout.tsx` : enveloppe un **`AppHeader` distinct** du marketing. Pas de footer marketing.
- **`AppHeader`** contient :
  - logo `estio.` (→ `/app`),
  - liens app : `Tableau de bord` (`/app`) · `Wallet` (`/app/wallet`),
  - **solde de crédits factice** (ex. « 3 crédits ») — **cliquable → `/tarifs`**,
  - lien discret « ← Retour au site » (→ `/`).
- **Pas d'auth réelle** en Phase 1 : `(app)` est librement accessible. Le gating (redirection si non connecté) arrive en Phase 5.
- `/app` : dashboard inerte — état vide dominant, un CTA principal désactivé marqué « bientôt ».
- `/app/wallet` : grille de cartes-biens factices (données bidon, éventuellement floutées) + bloc « état vide » expliquant à quoi sert le wallet.

## 5. Page `/tarifs` — abonnement + recharge

`/tarifs` est la page **unique** de monétisation : on y prend un abonnement **et** on y recharge des crédits. C'est la cible du solde crédits de l'`AppHeader`.

- **Haut** : les 3 cartes (Free / Pro / Expert) + toggle mensuel/annuel (existant, cf. spec site-public §11).
- **Sous les cartes** : une **section séparée « Recharge de crédits »** :
  - packs de crédits ponctuels (quantités indicatives),
  - **grisée / désactivée** avec la mention « réservé aux abonnés Pro & Expert » (on ne recharge pas en Free),
  - visuellement présente mais non actionnable en Phase 1 (pas de Stripe).
- Bandeau « tarifs indicatifs, non contractuels » conservé.

## 6. Définition de « quasi fini » (critère de sortie 1a)

Pour les pages publiques et les coquilles app :
1. **Zéro lien mort** dans header, footer, AppHeader, et corps de page.
2. Header marketing : état actif (`usePathname`) + burger mobile fonctionnel.
3. Accessibilité : `:focus-visible` global, contraste AA, liens actifs distinguables autrement que par la couleur seule.
4. `metadata` (title + description) exportée par page pour le SEO.
5. `npm run build` **et** `npm run lint` **verts**.
6. Solde crédits `AppHeader` → `/tarifs` fonctionne ; section recharge grisée visible.

## 7. Placeholders assumés (validés)

Explicitement tolérés pour clôturer la Phase 1, à lever en phases ultérieures :

| Placeholder | Marquage | Levé en |
|---|---|---|
| Chiffres / prix / crédits | « indicatif · non contractuel » | Phase 6 (Stripe) |
| Textes légaux (ML / Confid. / CGU) | « à compléter avant mise en ligne » | Phase 4 |
| Logo & images | logo texte `estio.` + illustrations/maquettes abstraites | ultérieur |
| Coquilles app (`/app`, `/app/wallet`) | données factices, CTA « bientôt » | Phases 2-3 |

Règle de contenu conservée (spec site-public §3) : **aucune mention « open data » / « gratuit »** à propos des sources dans l'UI publique. Formulation : « données de marché officielles ».

## 8. Sous-phase 1b — design-craft (cadre, détaillé à son démarrage)

Non détaillée ici (elle aura son propre découpage). Cadre posé :
- **Ambition** : UI ultra-originale, mémorable, cohérente avec la marque (« premium accessible » façon Monday/Linear, fond crème, argile/terre cuite, pastels — cf. `CLAUDE.md`).
- **Motion** : au-delà des springs actuels (Framer Motion). Ajout possible de **GSAP** (ScrollTrigger, timelines) — décision de librairie à prendre au démarrage de 1b, pas ici.
- **Méthode** : itérations avec inspiration externe (webfetch), page par page, en commençant par la landing.
- **Garde-fou** : le polish ne casse jamais l'a11y ni les critères de sortie 1a (build/lint, liens, contraste).

## 9. Petits plans issus du cadrage

### Sous-phase 1a (structure)
1. **Page 404** — `src/app/not-found.tsx`, stylée Estio, CTA retour accueil.
2. **Groupe `(app)` + `AppHeader` + layout** — `src/app/(app)/layout.tsx`, composant `AppHeader` (logo, nav app, solde crédits factice → `/tarifs`, retour au site).
3. **Coquille `/app`** — dashboard inerte (état vide + CTA « bientôt »).
4. **Coquille `/app/wallet`** — grille de cartes factices + état vide.
5. **Recharge sur `/tarifs`** — section « Recharge de crédits » sous les cartes, grisée « réservé Pro & Expert ».
6. **Passe de cohérence publique** — vérifier les 10 pages : liens vivants, placeholders marqués, `metadata` SEO, build/lint. Revue finale 1a par l'utilisateur.

### Sous-phase 1b (design-craft)
Découpée à son démarrage (brainstorm dédié possible). Piste d'ordre : landing → pages marketing → coquilles app.

## 10. Critères d'acceptation (Phase 1a)

1. Les **13 routes** existent et rendent une page stylée.
2. Aucun lien mort (header, footer, AppHeader, corps).
3. `AppHeader` affiche un solde crédits cliquable menant à `/tarifs`.
4. `/tarifs` présente la section recharge grisée sous les cartes.
5. Header marketing : état actif + burger mobile OK.
6. Aucune mention « open data » / « gratuit » (sources) dans l'UI publique.
7. Pages légales marquées « à compléter avant mise en ligne ».
8. `npm run build` et `npm run lint` passent.

## 11. Hors périmètre Phase 1

Auth réelle · gating des routes `(app)` · moteur de calcul · import/extraction Grok · comparateur fonctionnel · Stripe · routes `/app/import`, `/app/comparateur`, `/app/compte`.
