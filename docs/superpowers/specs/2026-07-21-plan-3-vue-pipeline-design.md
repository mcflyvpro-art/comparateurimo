# Spec — Plan 3 : Vue Pipeline (board Kanban + drawer)

> Sous-plan de la Phase 2 (l'outil), découpage défini dans `docs/superpowers/specs/2026-07-21-outil-pipeline-structure-design.md` §6. Brainstorm du 2026-07-21. Plan 1 (schéma & seed) et Plan 2 (app shell & navigation) faits et validés sur Vercel.

## 1. Intention

Livrer la vue Pipeline : un board Kanban à 6 colonnes (statuts) avec cartes-biens riches, drag & drop persistant, et un drawer d'aperçu permettant de changer le statut et d'ajouter une note rapide sans quitter le board.

## 2. Décisions

1. **Score/verdict provisoires** : création d'un mini moteur `src/lib/calc/` dès ce plan (pas de mock statique). Formule : `rendementBrut = (estimated_rent * 12) / (asking_price + works_estimate)`, mappé sur 4 seuils → verdict `Pépite` / `Solide` / `Correct` / `À éviter` + couleur pastel (sauge/ambre/rose). Fonction pure TS, sans I/O ni LLM, réutilisée telle quelle par les plans suivants (Tableau, Fiche complète).
2. **Drag & drop** : lib **dnd-kit** (légère, accessible, gratuite) plutôt que pointer events fait-main — le board Kanban est jugé trop sujet aux edge cases (scroll, multi-colonnes, ghost image) pour un fait-main fiable en un plan.
3. **Carte-bien riche** : vignette photo (`property_photos` si présente, sinon fallback illustré par `property_type`), adresse + ville, prix, surface, badge score+verdict pastel, pastille "X j dans ce statut".
4. **Raison d'écart obligatoire** : tout passage vers le statut `ecarte` (drag ou dropdown) déclenche une **modale bloquante** demandant la raison avant confirmation. Garantit que `discard_reason` n'est jamais vide.
5. **Drawer d'aperçu interactif** (pas juste lecture) : score/verdict, 3-4 chiffres clés (prix, surface, rendement brut, prix/m²), dropdown de changement de statut (même règle de modale pour Écarté), champ d'ajout rapide de note. Bouton "Analyse complète →" présent mais pointe vers une route pas encore construite (Plan 5) — traité en placeholder simple, pas un lien mort silencieux.

## 3. Architecture technique

- **`src/lib/calc/score.ts`** — fonctions pures : `computeRendementBrut(property)`, `computeVerdict(rendement)` → `{ score: number, verdict: 'pepite'|'solide'|'correct'|'a_eviter' }`. Testable en isolation.
- **`src/components/app/PropertyCard.tsx`** — présentation carte (client, draggable via dnd-kit `useSortable`).
- **`src/components/app/PipelineBoard.tsx`** — orchestration board (client component), 6 `DndContext`/colonnes, appelle la server action au `onDragEnd`.
- **`src/components/app/PropertyDrawer.tsx`** — drawer contrôlé par l'état d'URL `?bien=id` (lecture RSC + mutations client via server actions).
- **`src/components/app/DiscardReasonModal.tsx`** — modale bloquante réutilisée par board (drop) et drawer (dropdown).
- **Server actions** (`src/app/(app)/app/p/[projectId]/actions.ts`, étend le fichier existant du Plan 2 si présent, sinon le crée) :
  - `moveProperty(propertyId, newStatus, newPosition, reason?)` — update `properties.status`/`board_position` + insert `status_history`.
  - `addQuickNote(propertyId, body)` — insert `property_notes` (kind `note`).
- **`board_position`** : recalculé côté serveur par moyenne entre les deux voisins de la colonne cible (pattern fractional indexing simple, déjà en `double precision` dans le schéma).
- **Données** : lecture RSC des `properties` + `property_photos` (1ère photo) + agrégat "jours dans le statut" dérivé du dernier `status_history` (ou `updated_at` si aucun historique).
- **Design** : tokens existants (`src/design/tokens.css`), composants dans `src/components/app/`, pas de lib de charts/graphique nécessaire ici.

## 4. Flux utilisateur

1. Arrivée sur `/app/p/[projectId]` (vue `pipeline` par défaut, déjà branchée au Plan 2) → board 6 colonnes avec cartes.
2. Drag d'une carte vers une autre colonne → si colonne ≠ `ecarte`, mise à jour immédiate (optimistic) + server action. Si colonne = `ecarte` → modale raison → confirmation → server action avec `reason`.
3. Clic sur une carte → drawer s'ouvre (`?bien=id`), affiche aperçu + score/verdict + notes récentes.
4. Dans le drawer : changer le statut (dropdown, même règle Écarté) ou ajouter une note rapide → mutation server action, drawer se rafraîchit.
5. Bouton "Analyse complète →" → navigue vers route Plan 5 (non encore implémentée dans ce plan, simple placeholder acceptable).

## 5. Hors-scope de ce plan

Vue Tableau et Carte (Plans 4 et 6) · page Analyse complète (Plan 5) · scénario en direct / curseurs · fiscalité · upload de photos/documents (Plan 5, la carte lit seulement les photos existantes du seed) · comparaison/arbitrage (Plan 7) · flux d'ajout de bien (Plan 8) · pondérations/profils de score (arrivent avec Plan 7) — le score de ce plan reste mono-critère (rendement brut) et provisoire.

## 6. Risques / points de vigilance

- **`board_position` par moyenne** : peut converger vers une précision flottante limite après de nombreux réordonnancements dans une même colonne ; acceptable pour ce plan, à surveiller si le pipeline grossit beaucoup.
- **Score mono-critère** : rendement brut seul peut mal classer certains biens (ex. bien cher avec loyer élevé mais mauvais cash-flow) — assumé et documenté comme provisoire, cohérent avec la règle CLAUDE.md sur l'honnêteté de la granularité.
- **Modale Écarté bloquante** : à vérifier qu'elle ne casse pas le flux drag & drop (UX : le drop doit visuellement "annuler" tant que la modale n'est pas confirmée).
