# Plan 4 — Vue Tableau — Design

> Phase 2 (l'outil), build "structure" en 8 plans. Contexte complet : `REORIENTATION-ESTIO.md`, `docs/superpowers/specs/2026-07-21-outil-pipeline-structure-design.md` (spec globale), `docs/superpowers/specs/2026-07-21-plan-3-vue-pipeline-design.md` (Plan 3, vue Pipeline).

## Objectif

Deuxième vue du pipeline (onglet `Tableau` déjà présent dans `ViewTabs`, actuellement un placeholder). Table dense et triable, complémentaire au board Kanban : permet de comparer tous les biens d'un coup d'œil (colonnes chiffrées), pas de trier/scroller entre colonnes de statut.

## 1. Architecture & composants

| Élément | Rôle |
|---|---|
| `src/lib/hooks/use-property-drawer.ts` (nouveau) | Hook partagé extrait de `PipelineBoard` : état du drawer (ouverture/fermeture via param d'URL `bien`), `handleStatusChange` (avec passage par `DiscardReasonModal` si passage à "Écarté"), `handleAddNote` (optimistic update + rollback), gestion d'erreur réseau. Signature : prend `projectId`, `properties`, `setProperties` (state géré par l'appelant) ; retourne `{ selectedProperty, openDrawer, closeDrawer, handleStatusChange, handleAddNote, error, pendingDiscard, confirmDiscard, cancelDiscard }`. |
| `PipelineBoard.tsx` (refactor léger) | Remplace sa logique inline de drawer/statut/note par le hook. Comportement inchangé (non-régression), le drag & drop (`@dnd-kit`) et la logique de colonnes restent dans le composant. |
| `src/components/app/PropertyTable.tsx` (nouveau) | Composant client : barre d'outils (chips statut + picker colonnes) + `<table>` triable + réutilise `PropertyDrawer`/`DiscardReasonModal` via le hook partagé. |
| `src/lib/table-columns.ts` (nouveau) | Config déclarative des colonnes disponibles : `{ id, label, sortValue(p): string | number | null, render(p): ReactNode }`. Réutilise `formatEUR`/`formatM2`/`formatPercent`/`formatPricePerM2` de `src/lib/format.ts` et `computeRendementBrutPct`/`computeVerdict` de `src/lib/calc/score.ts`. Source unique pour le picker de colonnes ET le rendu des cellules — pas de duplication de logique de formatage. |
| `src/lib/hooks/use-local-storage-set.ts` (nouveau, petit utilitaire générique) | `useState<Set<string>>` synchronisé avec `localStorage`, lecture après montage (évite le mismatch SSR/hydratation), fallback silencieux si `localStorage` indisponible. |
| `page.tsx` (édit) | La requête Supabase (déjà utilisée par la vue Pipeline) devient commune aux vues `pipeline` ET `tableau` — plus de branchement "placeholder" pour `tableau`. La vue `carte` reste un placeholder (Plan 6). |

## 2. Données — colonnes, filtre, tri

**Colonnes disponibles** (13) : Adresse, Ville, Code postal, Type de bien, Statut, Prix, Surface, Prix/m², Loyer estimé, Rendement brut, Verdict, Prix max, Jours dans statut.

**Colonnes par défaut** (1er chargement, avant toute personnalisation) : Adresse, Ville, Statut, Prix, Surface, Rendement brut, Verdict, Jours.

**Picker colonnes** : bouton "Colonnes" dans la barre d'outils → dropdown à cases à cocher (une par colonne disponible). Sélection persistée en `localStorage` sous la clé `estio.table.columns` (tableau JSON des `id` de colonnes cochées). Lue via `use-local-storage-set` après montage. **Adresse est toujours cochée et non décochable** (garde-fou : jamais de table sans repère de ligne).

**Filtre statut** : chips multi-sélection au-dessus de la table, une par valeur de `STATUS_COLUMNS` (À analyser/Analysé/Visite/En négo/Écarté/Offre). Aucune chip active = tous les statuts affichés (comportement par défaut). **Non persisté** — repart de "tous" à chaque chargement de page (contrairement aux colonnes, un filtre de vue est jugé plus session-que-préférence-durable).

**Tri** : clic sur un en-tête de colonne triable = active le tri sur cette colonne, un second clic inverse asc/desc. Indicateur texte simple `▲`/`▼` à côté du label (pas d'icône de lib, convention du repo). Tri par défaut au chargement : **Jours dans statut, décroissant**. État de tri en `useState` local au composant, non persisté. Valeurs `null` (ex. `asking_price` non renseigné) triées en dernier quel que soit le sens.

## 3. Interaction — drawer & actions

- Clic sur une ligne → `openDrawer(id)` (hook partagé) → ouvre le `PropertyDrawer` existant (aperçu complet, changement de statut, ajout de note rapide) — identique à la vue Pipeline.
- Changement de statut depuis le drawer en vue Tableau : la ligne **reste en place** et sa cellule "Statut" se met à jour (contrairement au board où le bien change de colonne visuelle). Si la colonne triée est "Statut" ou une colonne dépendante du statut, la ligne peut se retrier après update — comportement naturel du tri réactif, pas de logique spéciale à écrire.
- Passage à "Écarté" déclenche la même `DiscardReasonModal` bloquante que le board (le hook partagé centralise cette logique, une seule source de vérité pour les deux vues).
- Pas de miniature/photo dans les lignes (contrairement à `PropertyCard`) : la table reste dense, texte + chiffres uniquement.
- Pas de changement de statut inline dans la table elle-même (ex. dropdown dans la cellule) — uniquement via le drawer, pour rester cohérent avec le board et éviter deux façons de faire la même action.

## 4. Erreurs, edge cases

- **Aucun bien dans le projet** : message texte simple ("Aucun bien dans ce projet"), même registre que `ViewPlaceholder`.
- **Aucun bien pour le filtre actif** : message distinct ("Aucun bien pour ce filtre") pour ne pas laisser croire que le projet est vide.
- **Erreur réseau** (déplacement de statut / ajout de note) : bandeau d'erreur identique au board ("...n'a pas pu être enregistré. Réessaie."), affiché par le hook partagé, `router.refresh()` pour resynchroniser.
- **`localStorage` indisponible** (navigation privée stricte, SSR) : `use-local-storage-set` catch silencieusement et retombe sur les colonnes par défaut — jamais de crash.
- **Toutes les colonnes décochées** : impossible par construction (Adresse non décochable).

## 5. Vérification

Pas de framework de test dans ce repo (convention actée depuis le Plan 1). Vérification :
- `npx tsc --noEmit`
- `npm run build`
- `npm run lint`
- Vérification manuelle sur serveur de dev : tri par colonne, filtre par chip, picker de colonnes (+ persistance après reload), ouverture du drawer depuis une ligne, changement de statut synchronisé dans la table, non-régression du board (refactor du hook).

## Hors scope (rappel)

Formules fiscales exactes, vraie donnée N2, rampes d'extraction Grok, floutage freemium/Stripe, auth réelle, version mobile — inchangé, cf. spec globale Phase 2.
