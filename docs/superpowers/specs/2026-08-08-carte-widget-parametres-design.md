# Carte — Widget de personnalisation & popup au clic (design)

Date : 2026-08-08
Phase : 2 — L'outil (pipeline de décision)
Statut : validé en brainstorm, en attente de découpage en plan(s) d'implémentation

## Contexte

Le Plan 6a (fondations de la vue Carte — MapLibre, épingles colorées par verdict, scénario fixe) est livré, poussé, et validé fonctionnel par l'utilisateur en production. Ce document couvre la suite : ce qui était esquissé comme Plan 6b (panneau de scénario partagé, éditable, avec recalcul en direct) et Plan 6c (aperçu au clic) dans `docs/superpowers/specs/2026-07-26-plan-6-vue-carte-design.md`, élargi par une nouvelle demande explicite de l'utilisateur : un widget de personnalisation de l'affichage de la carte (style de fond + informations visibles sur les épingles), en plus du scénario.

Après clarification, l'utilisateur veut **un seul point d'entrée** dans la vue Carte — pas plusieurs boutons dispersés — couvrant à la fois le scénario et l'affichage. Ce document remplace donc la répartition 6b/6c de la spec précédente par une seule fonctionnalité cohérente : **le widget Paramètres de la carte**, plus la popup au clic qui en dépend (elle affiche un score calculé avec le scénario configuré dans ce même widget).

## Ce qui est acquis (rappel, ne pas rediscuter)

- Scénario partagé, éditable, **jamais sauvegardé** (« le temps de la carte »), recalcul limité aux biens visibles dans le viewport courant — cadrage du brainstorm du 2026-07-26.
- Score des épingles = score/100 (`computeScoreSur100`/`computeVerdictFromScore`), pas le score mono-critère du board/tableau.
- Aucune action d'édition depuis la carte (statut, notes) — exploration/comparaison seulement.

## Architecture

1. **Un bouton flottant « Paramètres »** (icône réglages, fait main comme le reste des icônes de l'app) en haut de la carte, à côté du texte « N biens sans localisation » s'il est présent.
2. **Un panneau à 2 onglets** au clic sur ce bouton : **Scénario** et **Affichage**. Composant `MapSettingsPanel`, style visuel proche de `SectionCard`/`SectionScenario` déjà existants (dark grotesk, cohérent avec le reste de l'outil).
3. **État `sharedScenario`** (déjà cadré) : state React dans `MapView`, initialisé avec le scénario d'un bien du projet, modifié via l'onglet Scénario (réutilise `SectionScenario` tel quel, sans le hook de sauvegarde debounce), jamais persisté.
4. **État `displayPrefs`** (nouveau) : `{ mapStyle: "dark" | "light" | "detailed"; showSurface: boolean; showStatus: boolean }`, initialisé depuis `localStorage` (clé dédiée, ex. `estio:carte:display-prefs`), mis à jour à chaque changement dans l'onglet Affichage, et réécrit dans `localStorage` à chaque changement (debounce non nécessaire, ce ne sont que 3 valeurs simples).
5. **Changement de style de carte** : `map.setStyle(STYLE_URLS[mapStyle])` sur l'instance MapLibre existante — pas de recréation de la carte. Les `Marker` (épingles), qui sont des éléments DOM indépendants du style, survivent au changement sans réinsertion.
6. **Contenu de l'étiquette d'épingle** recalculé à chaque changement de `displayPrefs.showSurface`/`showStatus` (pas besoin de recalcul de score, juste de re-rendu du texte de l'étiquette) — voir section Épingles.

## Styles de carte disponibles

Les 3 styles gratuits OpenFreeMap déjà validés comme fournisseur (aucune nouvelle dépendance/compte) :

| Option affichée | Style OpenFreeMap | URL |
|---|---|---|
| Sombre (actuel) | `dark` | `https://tiles.openfreemap.org/styles/dark` |
| Clair | `positron` | `https://tiles.openfreemap.org/styles/positron` |
| Détaillé | `liberty` | `https://tiles.openfreemap.org/styles/liberty` |

Le filtre CSS désaturé (`.estio-map .maplibregl-canvas { filter: ... }`, posé au Plan 6a) reste appliqué uniquement au style Sombre — les styles Clair/Détaillé s'affichent avec leurs couleurs d'origine (le filtre actuel n'aurait pas de sens dessus, il a été calibré pour assombrir un fond déjà sombre).

## Épingles : étiquette de prix + champs optionnels

- **Le prix est toujours visible**, format compact : `250k €` (arrondi au millier, pas de décimales — cohérent avec la densité recherchée quand plusieurs biens sont proches sur la carte). Nouvelle fonction `formatCompactEUR` dans `src/lib/format.ts`.
- **Surface** et **Statut** sont deux cases à cocher dans l'onglet Affichage, décochées par défaut. Si cochées, leur valeur s'ajoute sous le prix dans l'étiquette, séparée par ` · ` : `250k € · 45 m² · Visite`.
- La couleur du point (le cercle `<i>` existant) reste le verdict — l'étiquette de texte est un élément additionnel à côté/au-dessus du point, pas un remplacement.
- Le statut affiché utilise le même libellé que `STATUS_COLUMNS` (`src/lib/pipeline-types.ts`), pour rester cohérent avec le board/tableau.

## Popup au clic (aperçu rapide)

- Clic sur une épingle → `Popup` MapLibre (composant natif de la lib, pas un composant maison) ancrée à l'épingle cliquée, qui suit la carte au pan/zoom.
- Contenu : adresse, ville, prix (format complet cette fois, `formatEUR`), surface, score/100 + verdict (calculés avec `sharedScenario`, comme les épingles), lien « Analyse complète → » vers `/app/p/[projectId]/bien/[id]`.
- Lecture seule : pas de changement de statut, pas d'ajout de note — l'édition reste board/tableau/fiche, la carte est un outil d'exploration/comparaison.
- Une seule popup ouverte à la fois (MapLibre ferme automatiquement la popup précédente à l'ouverture d'une nouvelle, comportement natif). Fermeture via le bouton × natif de la popup ou un clic ailleurs sur la carte.

## Persistance

- `sharedScenario` : **jamais persisté**, réinitialisé à chaque montage de la vue Carte (rappel, déjà acquis).
- `displayPrefs` (style de carte + champs épingle) : **persisté en `localStorage`**, survit à la fermeture de l'onglet/navigateur — c'est une préférence d'affichage personnelle, pas une donnée métier, aucun aller-retour serveur nécessaire.

## Erreurs & cas limites

- `localStorage` indisponible ou vide au premier chargement → valeurs par défaut (`mapStyle: "dark"`, `showSurface: false`, `showStatus: false`), pas d'erreur.
- Changement de style de carte pendant que la carte est en cours de chargement initial → `map.setStyle` est mis en file par MapLibre lui-même, pas de gestion spécifique nécessaire.
- Bien avec `surface_carrez` `null` → si "Surface" est cochée, ce bien affiche juste `— m²` plutôt que de casser l'étiquette (cohérent avec `formatM2` existant dans `src/lib/format.ts`).

## Hors-scope (explicite)

- Toute action d'édition depuis la popup ou la carte (statut, notes, écarter) — inchangé depuis le Plan 6a.
- D'autres styles de carte que les 3 listés (pas de style personnalisé/upload).
- D'autres champs d'épingle que prix/surface/statut (pas de rendement, TRI, etc. sur l'épingle elle-même — ces indicateurs restent dans la popup et la fiche).
- Persistance serveur des préférences d'affichage (localStorage suffit, pas de table Supabase dédiée).
- Deep-link vers un bien précis ou vers un état de widget particulier depuis l'URL.

## Conventions déjà figées (rappel)

Dark grotesk only, pas de lib d'icônes (fait main), MapLibre + OpenFreeMap = seule lib carto (déjà validée au Plan 6a), aucun framework de test (`tsc` + `build` + `lint` + QA manuelle), méthodo = brainstorm → spec → plan → subagent-driven-development → revue finale → validation Vercel avant de cocher.
