# Spec — Site public Estio (header, pages marketing, footer)

> Date : 2026-07-19 · Statut : validé en brainstorm, prêt pour plan d'implémentation.

## 1. Objectif

Doter Estio d'un **site public complet et navigable** : header refait, footer enrichi, et l'ensemble des pages marketing + légales en **coquilles stylées** (design Estio, liens vivants, contenu placeholder honnête). Aucune logique métier ni backend dans cette tranche — l'application connectée (comparateur, import, moteur) et l'authentification réelle viendront plus tard (épiques E1–E7).

## 2. Périmètre

**Inclus** : structure de routes, header, footer, pages marketing, pages légales, coquilles de formulaires (contact, connexion), nettoyage de la landing existante.

**Exclus** : app connectée (`/app/*`), auth Supabase réelle, moteur de calcul, import de biens, paiement Stripe, envoi réel des formulaires.

## 3. Règle de contenu — pas de « open data »

L'UI publique **ne doit jamais** afficher « open data », « données ouvertes » ni « gratuit » à propos des sources : cela dévalorise l'offre (on vend la synthèse/le calcul, pas la donnée brute — cf. `CLAUDE.md`). Formulation retenue : **« données de marché officielles »**. Les noms de sources crédibles (BAN, DVF, INSEE, Géorisques, ADEME) restent affichables.

Cette règle impose de **corriger la landing existante** :
- Ligne de confiance du hero : retirer « Données open data · ».
- Section `#donnees` : « sources ouvertes et gratuites » → « sources publiques officielles ».
- Footer actuel : retirer « données open data ».

## 4. Arborescence des routes

| Route | Page | Nature |
|-------|------|--------|
| `/` | Accueil | landing existante, raffinée |
| `/comment-ca-marche` | Comment ça marche | pédagogie : 3 niveaux + score développés |
| `/tarifs` | Tarifs | modèle crédits (indicatif) |
| `/faq` | FAQ | accordéons |
| `/a-propos` | À propos | mission + « ton score » |
| `/contact` | Contact | email + formulaire coquille |
| `/connexion` | Se connecter | formulaire coquille (pas d'auth) |
| `/mentions-legales` | Mentions légales | gabarit texte |
| `/confidentialite` | Confidentialité | gabarit texte |
| `/cgu` | CGU | gabarit texte |

## 5. Header (remplace `SiteNav`)

Composant `SiteHeader`, translucide (`backdrop-blur`, conservé).

- **Gauche** : `estio.` (logo, lien vers `/`).
- **Centre** (desktop ≥ sm) : liens vers **vraies pages** — `Comment ça marche` · `Tarifs` · `FAQ` · `À propos`. Fini les ancres `#`.
- **Droite** : `Se connecter` (lien discret → `/connexion`) + `Ajouter un bien` (CTA magnétique → `/connexion`).
- **État actif** : la page courante est surlignée (couleur/poids) via `usePathname`.
- **Mobile** (< sm) : bouton burger → **panneau plein écran** (`MobileMenu`, client) listant tous les liens + les deux actions ; fermeture par croix ou sélection ; respecte `prefers-reduced-motion`.

## 6. Footer (remplace le footer minimal)

Composant `SiteFooter`, 4 colonnes sur desktop, empilées sur mobile.

- **Marque** : `estio.` + phrase courte (sans « open data ») + rappel `estio.immo`.
- **Produit** : Comment ça marche · Tarifs · FAQ.
- **Entreprise** : À propos · Contact.
- **Légal** : Mentions légales · Confidentialité · CGU.
- **Barre du bas** : `© 2026 Estio`.

## 7. Contenu des pages (coquilles)

Toutes reprennent le style Estio (Craie, Argile, General Sans, `Reveal`, coins ronds, pastels). Contenu honnête, marqué placeholder là où c'est indicatif.

- **Accueil** : landing actuelle, mentions « open data » retirées (§3).
- **Comment ça marche** : hero de section + les 3 niveaux (N1/N2/N3) développés + le principe du score + bloc « sources » nommées (sans « open data »).
- **Tarifs** : 2–3 offres en cartes (ex. *Découverte* — quelques analyses offertes / *Crédits* — à l'analyse / *Illimité* — abonnement), bandeau « tarifs indicatifs, non contractuels ». La frontière gratuit/payant exacte reste une question ouverte (`MVP.md` Q3).
- **FAQ** : `FaqAccordion` (client) — 6–8 questions/réponses (fiabilité des chiffres, sources, RGPD, gratuit/payant, périmètre géographique, sécurité). Une seule ouverte à la fois, animation d'ouverture, `aria-expanded`.
- **À propos** : mission (« aider à décider, chiffres à l'appui »), le principe « c'est ton score », posture honnête (projections = scénarios, pas prédictions).
- **Contact** : bloc email (`mailto:`) + `ContactForm` coquille (nom, email, message ; labels au-dessus, validation visuelle, bouton « Envoyer » sans backend, message de succès factice).
- **Connexion** : `LoginForm` coquille (email, mot de passe, bouton « Se connecter » désactivé/placeholder, mention « bientôt disponible »), lien vers `/` .
- **Légales** (3 pages) : gabarits texte structurés avec champs explicitement à compléter (raison sociale, éditeur, hébergeur, responsable de traitement…), marqués « à compléter avant mise en ligne ».

## 8. Architecture technique

- **Groupe de routes** `src/app/(marketing)/` avec `layout.tsx` qui enveloppe `SiteHeader` + `SiteFooter`. L'accueil (`/`) et toutes les pages marketing/légales vivent dans ce groupe et partagent ce layout.
- **Header/Footer extraits** de `page.tsx` (aujourd'hui codés en dur) vers `SiteHeader`/`SiteFooter` ; `page.tsx` ne contient plus que le contenu de la landing.
- **Composants** (`src/components/`) :
  - `layout/SiteHeader.tsx` (client léger — `usePathname` pour l'état actif).
  - `layout/MobileMenu.tsx` (client — panneau burger, spring, reduced-motion).
  - `layout/SiteFooter.tsx` (server).
  - `marketing/FaqAccordion.tsx` (client).
  - `marketing/ContactForm.tsx` (client, coquille).
  - `marketing/LoginForm.tsx` (client, coquille).
  - Réutilise l'existant : `MagneticButton`, `Reveal`, tokens Estio.
- **Métadonnées** : chaque page exporte `metadata` (title + description) pour le SEO.
- **Accessibilité** : héritée de la passe précédente (`:focus-visible` global, contraste AA) ; liens actifs distinguables autrement que par la seule couleur (poids/soulignement) ; formulaires avec labels visibles, erreurs sous le champ, `aria` correct.

## 9. Critères d'acceptation

1. Les 10 routes existent et rendent une page stylée ; aucun lien mort dans le header ni le footer.
2. Le header met en évidence la page courante et fonctionne en mobile (burger → panneau).
3. Aucune occurrence de « open data » / « gratuit » (à propos des sources) dans l'UI publique, landing incluse.
4. Header et footer sont partagés via le layout `(marketing)` (pas de duplication par page).
5. FAQ, Contact et Connexion sont interactifs côté UI (accordéon, validation visuelle) sans backend.
6. `npm run build` et `npm run lint` passent.
7. Pages légales clairement marquées « à compléter avant mise en ligne ».

## 10. Risques & notes

- **Tarifs indicatifs** — la grille exacte dépend de la Q3 (frontière gratuit/payant) non tranchée ; afficher un bandeau « non contractuel » évite tout engagement prématuré.
- **Pages légales** — gabarits seulement ; ne pas mettre en ligne sans compléter les mentions obligatoires (LCEN, RGPD).
- **`/connexion` coquille** — ne doit pas laisser croire à une auth fonctionnelle ; mention « bientôt » explicite.
- **Cohérence future** — quand l'app connectée arrivera, prévoir un second layout `(app)` avec un header applicatif distinct ; hors périmètre ici mais anticipé par le choix du groupe `(marketing)`.
