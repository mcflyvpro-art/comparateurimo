# Plan 6 — Vue Carte (design)

Date : 2026-07-26
Phase : 2 — L'outil (pipeline de décision)
Statut : validé en brainstorm, en attente de découpage en plans d'implémentation

## Contexte

Le pipeline a déjà 2 vues opérationnelles et validées sur Vercel : le board Kanban (`PipelineBoard`) et le tableau (`PropertyTable`). La 3e vue, Carte, est câblée en placeholder dans `src/app/(app)/app/p/[projectId]/page.tsx` (`?view=carte` → `ViewPlaceholder`) depuis le Plan 5. Elle doit afficher les biens géolocalisés du projet sous forme d'épingles sur une carte, avec un code couleur de score et un aperçu au clic.

Les colonnes `lat`/`lng` existent sur `properties` depuis le Plan 1 mais ne sont encore jamais sélectionnées ni affichées nulle part. Aucune lib carto n'est installée. Le géocodage réel (formulaire d'ajout, Plan 8) n'existe pas encore — la carte affiche uniquement ce qui existe déjà en base (seed démo : 6 biens à Lyon).

## Décision clé issue du brainstorm : score en direct, partagé, temporaire

Contrairement à l'hypothèse de départ (garder la carte cohérente avec le score mono-critère du board, ou adopter tel quel le score/100 de la fiche), l'utilisateur veut une fonctionnalité plus riche : **un panneau de scénario unique, modifiable en direct, appliqué à tous les biens visibles à l'écran simultanément**, pour les comparer à conditions égales. Ce scénario n'est **jamais sauvegardé** — il vit uniquement le temps de la session sur la vue Carte (« le temps de la carte »).

Le recalcul du score est **limité aux biens visibles dans le viewport courant** (zoom/pan), pas à l'ensemble du projet, pour rester réactif.

Cette mécanique rend le score/100 (`src/lib/calc/scoring.ts` + `src/lib/calc/metrics.ts`) seul pertinent pour la carte — le score mono-critère (`src/lib/calc/score.ts`) reste réservé au board/tableau (changement hors-scope, non demandé).

## Lib carto retenue

**MapLibre GL JS** + tuiles vecteur **OpenFreeMap** (gratuit, sans clé API, sans compte à créer). Choisi plutôt que Leaflet (raster, plus dur à assortir au thème dark grotesk d'Estio) ou Google Maps JS API (payant au-delà d'un quota, écarté par défaut). MapLibre expose une API de bounds (`map.getBounds()`) nécessaire au recalcul limité au viewport, et un style JSON personnalisable pour un fond de carte sombre cohérent avec l'identité visuelle.

C'est une **3e exception lib** validée explicitement (après `@dnd-kit` et `browser-image-compression`).

## Architecture & flux de données

1. **Query serveur** (`page.tsx`, branche `view === "carte"`) : sélectionne les `properties` du projet avec `lat`/`lng` non nuls, **tous les champs** nécessaires à `computeInvestmentMetrics` (pas le sous-ensemble actuel utilisé par le board/tableau), jointes à leur `property_scenarios` (relation 1-1, déjà existante depuis le Plan 5a).
2. Les biens **sans** `lat`/`lng` sont comptés et exclus de la carte ; un texte discret affiche « N biens sans localisation ».
3. `MapView` (composant client) reçoit `properties: PropertyRow[]` et `scenarios: PropertyScenarioRow[]`.
4. **État partagé** `sharedScenario` (state React dans `MapView`) : initialisé avec le scénario du premier bien reçu (les scénarios par défaut sont identiques pour tous en démo — pas de notion de « scénario neutre » séparée à construire). Modifié via un panneau de curseurs, jamais persisté en base.
5. `MapView` garde les `bounds` MapLibre courants en state, mis à jour sur les événements `moveend`/`zoomend` (pas sur chaque frame de `drag`, pour éviter du recalcul superflu pendant le geste).
6. À chaque changement de `bounds` OU de `sharedScenario` : filtrer les biens dont `lat`/`lng` tombent dans les bounds courants, puis pour chacun calculer `computeInvestmentMetrics(property, sharedScenario)` → `computeScoreSur100(...)` → `computeVerdictFromScore(...)`. Chaîne 100 % pure/synchrone, exécutée côté client, aucun aller-retour serveur.
7. Couleur de l'épingle = verdict (réutilise la palette pastel déjà définie pour `VerdictBadge`).
8. Panneau de curseurs = réutilisation directe de `SectionScenario` (`src/components/app/fiche/SectionScenario.tsx`), sans le hook `useDebouncedScenarioSave` (pas de sauvegarde ici).

## Aperçu au clic

Clic sur une épingle → nouveau composant léger `MapPropertyPopup` (pas de réutilisation du `PropertyDrawer` existant, voir ci-dessous) affichant : adresse, ville, prix, score/100 + verdict calculés avec `sharedScenario`, et un lien « Analyse complète → » vers la fiche (`/app/p/[projectId]/bien/[id]`).

Pas d'actions d'édition dans la popup (pas de changement de statut, pas de notes) : la carte est un outil d'exploration/comparaison, l'édition reste dans board/tableau/fiche. Ouverture/fermeture en state local à `MapView`, sans synchronisation avec le paramètre d'URL `?bien=` (pas de deep-link nécessaire pour un aperçu carte).

### Pourquoi pas `PropertyDrawer` ?

Découverte faite en explorant le code pendant le brainstorm : `PropertyDrawer` (`src/components/app/PropertyDrawer.tsx`) est couplé au score mono-critère (`computeRendementBrutPct`/`computeVerdict`) et au type `PipelineProperty`, qui n'inclut ni `lat`/`lng` ni scénario. Il est aussi indirectement couplé à `usePropertyDrawer`, qui porte toute la logique de drag/drop et de changement de statut du board — inutile et indésirable pour un aperçu carte en lecture seule. La mémoire de reprise du Plan 6 supposait ce drawer réutilisable ; ce n'est plus le cas une fois le scénario partagé introduit.

## Erreurs & cas limites

- Aucun bien géolocalisé dans le projet → message centré « Aucun bien à afficher sur la carte » + lien vers le tableau.
- Tuiles OpenFreeMap indisponibles (réseau/panne) → MapLibre affiche un fond vide ; fallback texte discret si `map.on('error')` se déclenche de façon répétée (pas de retry agressif).
- Bien avec `asking_price` ou `estimated_rent` `null` → `computeInvestmentMetrics` renvoie déjà des `null` proprement gérés par `computeScoreSur100` (retombe à 50/100 neutre via `normalize`) — épingle affichée en verdict "correct" par défaut, pas de crash.

## Hors-scope (explicite)

- Géocodage réel des adresses (arrive avec le formulaire d'ajout, Plan 8).
- Toute action d'édition depuis la carte (statut, notes, écarter).
- Sauvegarde du scénario partagé de la carte — il est jetable par construction.
- Changement du score utilisé par le board/tableau (reste le score mono-critère, `score.ts`).
- Deep-link vers un bien précis sur la carte (`?bien=` réservé au drawer board/tableau).

## Conventions déjà figées (rappel)

Dark grotesk only, pas de lib d'icônes (fait main), aucun framework de test (`tsc` + `build` + `lint` + QA manuelle), méthodo = brainstorm → spec → plan → subagent-driven-development → revue finale → validation Vercel avant de cocher.
