# Refonte UI/UX du CRM Estio — spec de conception

> 2026-08-09 · Spec validée pour les lots **L1 (fondations)**, **L2 (coque)** et
> **L3 (primitives)**.
> Audit et liste complète des 87 travaux : `2026-08-09-refonte-crm-audit.md`.
> Les lots L4 à L9 (Pipeline, Tableau, Carte, panneau latéral, Fiche, Projets)
> feront chacun l'objet de leur propre spec, écrite une fois les fondations posées.

---

## 1. Objectif

Le CRM d'Estio doit ressembler à un CRM : dense, coloré là où la couleur informe,
en relief, sans une ligne de prose. Aujourd'hui il est plat, monochrome, semé de
filets décoratifs et de paragraphes explicatifs.

### Ce qui est intouchable

Le backend, les actions serveur, le schéma Supabase, le moteur de calcul
(`lib/calc/**`), MapLibre, dnd-kit, `lib/glossary.ts`, `lib/verdict.ts` dans
son principe. La refonte **rhabille** ; elle ne redéfinit ni la donnée ni le calcul.

### Ce qui est hors périmètre, par décision utilisateur

- **Tâches et relances datées.** Estio suit des biens, pas des interlocuteurs.
- **La vitrine** (`(marketing)`) : elle reste telle quelle pour l'instant et
  sera reprise après, au nouveau système.

### Ce qui n'est pas un défaut mais une fonction à venir

« Comparer » et la recherche. La refonte leur donne une place définitive dans
l'interface plutôt que de les masquer.

---

## 2. Les six règles nouvelles

1. **Un filet sépare deux zones qui vont jusqu'au bord, ou il n'existe pas.**
   Zéro filet de remplissage (`h-px flex-1`), zéro séparateur vertical court.
2. **L'interface ne raconte rien.** Aucun paragraphe explicatif. Un état vide =
   une icône, un titre de deux à quatre mots, un bouton. Les définitions vivent
   dans les infobulles du glossaire, jamais dans le flux.
3. **Trois systèmes chromatiques étanches** : l'action, l'étape, le verdict.
   Aucune teinte n'appartient à deux systèmes.
4. **La profondeur se lit par l'ombre, pas seulement par le fond.** Quatre
   niveaux d'élévation réels.
5. **Une seule gouttière d'écran.** `--pad-x` s'applique au rail, à la barre,
   au contenu et à la fiche, pour que tout s'aligne verticalement.
6. **Deux thèmes, un seul jeu de tokens sémantiques.** Aucun composant ne lit
   jamais une primitive ni un hexadécimal.

---

## 3. L1 — les fondations

### 3.1 Architecture des thèmes

`src/design/tokens.css` est réécrit :

- `:root` porte **le thème clair** (défaut de l'outil).
- `[data-theme="dark"]` porte les surcharges sombres. Sélecteur d'attribut nu,
  **pas** `:root[data-theme="dark"]` : la vitrine doit pouvoir rester sombre en
  posant l'attribut sur un simple conteneur, pendant que `<html>` reste clair.
- Symétriquement, `[data-theme="light"]` réexpose les valeurs claires, pour
  qu'un îlot clair reste possible à l'intérieur d'une page sombre.
- Les primitives (échelles brutes) restent définies une fois, hors thème :
  formes, durées, courbes, espacement, typo.
- Seules les **couleurs** changent d'un thème à l'autre.

Le thème est posé sur `<html>` par un script inline dans `layout.tsx` (lecture
de `localStorage`, repli sur `prefers-color-scheme`), avant la première peinture,
pour éviter le flash. Le segment `(marketing)` force `data-theme="dark"` sur son
propre conteneur tant que la vitrine n'est pas reprise.

### 3.2 Les neutres

> **Correction par rapport à ce qui a été présenté en conversation :** la « zone
> enfoncée » du thème clair était annoncée à `#fbfaf9`, qui est plus *claire* que
> le fond de scène `#f7f6f4` — une zone enfoncée ne peut pas être plus claire que
> ce qui l'entoure. Elle passe à `#efedea`.

| Token | Rôle | Clair | Sombre |
|---|---|---|---|
| `--sunken` | Rail latéral, colonne de board, en-tête de tableau | `#efedea` | `#0b0a09` |
| `--canvas` | Fond de scène | `#f7f6f4` | `#121110` |
| `--surface` | Carte, panneau, popover, ligne de tableau | `#ffffff` | `#1a1917` |
| `--surface-hover` | Survol d'une surface | `#f5f3f0` | `#221f1d` |
| `--surface-active` | Sélectionné, enfoncé | `#ebe8e3` | `#2a2724` |
| `--line` | Filet structurel — sépare deux zones | `#e3dfd9` | `#2e2b28` |
| `--line-soft` | Filet interne — lignes d'un tableau | `#efece8` | `#232120` |
| `--line-strong` | Contour de champ, bordure au survol | `#cfc9c1` | `#423d38` |
| `--text` | Texte principal | `#1c1917` | `#f5f2ef` |
| `--text-2` | Texte secondaire — usage courant | `#57534e` | `#b5aca3` |
| `--text-3` | Texte atténué | `#8a827a` | `#857d75` |
| `--text-4` | Texte très faible, désactivé | `#a8a29b` | `#635c55` |

Ni blanc pur ni noir pur : la base reste chaude, c'est ce qui reste de l'ADN
d'Estio quand la nuit n'est plus le seul univers.

### 3.3 L'action

| Token | Rôle | Clair | Sombre |
|---|---|---|---|
| `--ink` | Fond du bouton primaire | `#1c1917` | `#f5f2ef` |
| `--ink-fg` | Texte du bouton primaire | `#ffffff` | `#121110` |
| `--accent` | Onglet actif, focus, sélection, lien, projet courant | `#e8590c` | `#ff6a1a` |
| `--accent-fg` | Texte sur aplat d'accent | `#ffffff` | `#121110` |
| `--accent-soft` | Fond d'état actif discret | `rgb(232 89 12 / 0.09)` | `rgb(255 106 26 / 0.14)` |
| `--accent-line` | Bordure d'état actif | `rgb(232 89 12 / 0.34)` | `rgb(255 106 26 / 0.4)` |

Le bouton primaire descend de la braise vers l'encre : c'est ce que font Linear,
Attio et Notion, et cela libère la braise pour ce qu'elle fait le mieux — signaler
où l'on se trouve. La marque devient présente sur tous les écrans sans jamais crier.

### 3.4 Les étapes du pipeline

Un dégradé froid qui monte en tension. **Aucune de ces teintes n'est verte, ambrée
ou rouge** : ces trois familles appartiennent au verdict et à lui seul. C'est la
correction du défaut logique actuel, où « Offre » en vert entrait en collision avec
« bon dossier » en vert.

| Étape | Token | Teinte |
|---|---|---|
| À analyser | `--stage-analyser` | `#8fa3b8` ardoise |
| Analysé | `--stage-analyse` | `#5b8def` bleu |
| Visite | `--stage-visite` | `#6d6bef` indigo |
| En négo | `--stage-nego` | `#9457e8` violet |
| Offre | `--stage-offre` | `#c94ec9` magenta |
| Écarté | `--stage-ecarte` | `#a8a29b` gris chaud |

Chaque étape porte aussi un `--stage-*-soft` (même teinte à 12 % d'opacité) pour
les fonds de pastille. Les teintes sont identiques dans les deux thèmes ; seule
l'opacité des fonds doux change (12 % en clair, 18 % en sombre).

### 3.5 Le verdict

| Niveau | Token | Clair | Sombre |
|---|---|---|---|
| Bon dossier | `--good` | `#2f8f5b` | `#84b394` |
| À creuser | `--mid` | `#c08328` | `#d9b678` |
| Peu favorable | `--risk` | `#c4453c` | `#c4706a` |
| Incomplet | `--none` | `#a8a29b` | `#8a8078` |

Les valeurs sombres sont celles de la v2, qui fonctionnaient. Les valeurs claires
sont assombries pour rester lisibles sur blanc.

`--info` (donnée publique) : `#2b6f8f` clair / `#8fb4ca` sombre.
`--danger` reprend `--risk`.

### 3.6 Élévation

Quatre niveaux, réellement utilisés. En thème clair l'ombre est douce et large ;
en thème sombre elle est plus dense et courte, complétée par un filet clair en
haut de la surface.

| Token | Usage | Clair |
|---|---|---|
| `--shadow-1` | Carte, ligne survolée | `0 1px 2px rgb(28 25 23 / 0.06), 0 1px 1px rgb(28 25 23 / 0.04)` |
| `--shadow-2` | Popover, menu, infobulle | `0 8px 24px -6px rgb(28 25 23 / 0.14), 0 2px 6px rgb(28 25 23 / 0.06)` |
| `--shadow-3` | Modale, panneau latéral | `0 24px 64px -12px rgb(28 25 23 / 0.22)` |
| `--shadow-4` | Carte en cours de glissement | `0 32px 80px -16px rgb(28 25 23 / 0.3)` |

### 3.7 Forme, espacement, mesure

| Token | Valeur |
|---|---|
| `--r-sm` | 6 px — contrôles, pastilles, champs |
| `--r-md` | 10 px — cartes |
| `--r-lg` | 14 px — panneaux, colonnes de board |
| `--r-xl` | 18 px — modales |
| `--r-pill` | 999 px |

Le rayon de 2 px disparaît : c'est lui qui donnait l'impression d'arêtes
« rigides » sans jamais rien apporter.

Espacement : échelle 4 px stricte (`4 8 12 16 20 24 32 40 56 72`). Une seule
gouttière d'écran, `--pad-x: 20px`, appliquée au rail, à la barre, au board, au
tableau et à la fiche.

| Token | Valeur |
|---|---|
| `--bar-h` | `52px` — hauteur unique de la barre supérieure **et** de l'en-tête du rail |
| `--rail-w` | `248px` — rail déployé |
| `--rail-w-min` | `56px` — rail replié, mode icônes |
| `--row-h` | `44px` confortable · `36px` compact |

`--topbar` et `--rail` de la v2 disparaissent au profit de `--bar-h` et
`--rail-w` : c'est la coexistence de deux hauteurs proches (`3.5rem` pour la
barre, `py-5` + logo pour le rail) qui produisait le décalage visible sur les
captures.

### 3.8 Typographie

Space Grotesk et JetBrains Mono sont conservés. Six tailles fixes remplacent les
valeurs dispersées (`text-[13.5px]`, `text-[12.5px]`, `!text-[9px]`…) :

| Classe | Taille | Usage |
|---|---|---|
| `.t-xs` | 11 px | Compteurs, mentions |
| `.t-sm` | 12 px | Étiquettes, texte secondaire dense |
| `.t-base` | 13 px | Texte courant de l'outil |
| `.t-md` | 15 px | Titre de carte, nom de projet |
| `.t-lg` | 20 px | Titre de section |
| `.t-xl` | 28 px | Titre de page |

`.num` (chasses fixes tabulaires) reste obligatoire sur tout chiffre.
`.t-caps` est supprimée de l'outil et reste réservée à la vitrine.

### 3.9 Mouvement

`--t-fast: 120ms` · `--t-base: 180ms` · `--t-slow: 280ms`. La courbe unique de
l'outil devient `--e-out: cubic-bezier(0.2, 0, 0, 1)`. Le « calage focal »
(`focal-in`, `focal-stagger`, flou à l'entrée) est **retiré de l'outil** : un flou
à chaque rendu de liste donne une impression de lenteur dans un logiciel qu'on
utilise huit heures. Il reste sur la vitrine.

Le grain de film est retiré de l'outil (`globals.css`) et conservé sur la vitrine.

### 3.10 Densité et préférences

Une préférence utilisateur locale (`localStorage`) porte : thème
(`clair | sombre | système`), densité (`confortable | compact`), vue par défaut.
Elle est lue par le script inline du `layout` et exposée en attributs
`data-theme` / `data-density` sur `<html>`.

### 3.11 Table de correspondance pour la migration

La couche `@theme inline` de `globals.css` expose les nouveaux noms. Le
remplacement dans les composants est mécanique :

| Ancien | Nouveau |
|---|---|
| `bg-bg` | `bg-canvas` |
| `bg-sunken` | `bg-sunken` *(re-pointé)* |
| `bg-surface` | `bg-surface` *(re-pointé)* |
| `bg-raised` | `bg-surface-hover` |
| `bg-high` | `bg-surface` + `shadow-2` |
| `border-hairline` | `border-line-soft` |
| `border-hairline-2` | `border-line` |
| `border-hairline-3` | `border-line-strong` |
| `bg-brand` / `text-brand` | `bg-accent` / `text-accent` |
| `var(--brand-wash)` | `var(--accent-soft)` |
| `var(--lift-1/2/3)` | `var(--shadow-1/2/3)` |
| `text-text` / `-2` / `-3` / `-4` | inchangés |
| `bg-ink-600`, `text-bone-400`… | supprimés — passer par un token sémantique |
| `--radius-xs` (2 px), `--radius-2xl` | supprimés de la couche `@theme` |
| `rounded-sm` / `-md` / `-lg` / `-xl` | inchangés en écriture, re-pointés sur 6 / 10 / 14 / 18 px |
| `focal-in`, `focal-in-slow`, `focal-stagger` | retirés des composants de l'outil (R2) après suppression des règles (R1) |

Aucun composant ne conserve d'accès direct aux primitives : `ink-*` et `bone-*`
disparaissent de la couche Tailwind.

---

## 4. L2 — la coque

### 4.1 Une seule barre

`AppTopbar` et `ViewTabs` fusionnent en un composant `AppBar` de `--bar-h`, avec
**un seul filet bas**. Aujourd'hui les deux barres empilées consomment six rem de
chrome et posent deux filets parallèles.

Composition, de gauche à droite :

1. **Fil d'ariane** `Projets / T2 Lyon locatif` — chaque segment cliquable. Sur la
   fiche d'un bien, un troisième segment apparaît.
2. **Résumé des critères** — inchangé dans son principe (`ProjectCriteria`), mais
   sans le séparateur vertical de 12 px : un simple écart suffit.
3. **Onglets de vue** au centre (Pipeline · Tableau · Carte), état actif en braise.
4. **Recherche** — champ réel, raccourci `/`, filtrage client sur les biens déjà
   chargés, résultats groupés.
5. **Comparer** — bouton vivant qui ouvre un panneau d'attente, pas un contour
   pointillé grisé.
6. **Ajouter un bien** — bouton primaire, un seul par écran.

### 4.2 Le rail latéral

- En-tête à `--bar-h` exactement, pour que le logo et le fil d'ariane partagent
  la même ligne de base. C'est le décalage visible sur les captures.
- Recherche de projet en tête de liste dès qu'il y a plus de six projets.
- Chaque projet porte une **barre de répartition segmentée** aux couleurs
  d'étapes : elle redevient lisible maintenant que les étapes sont colorées.
  C'est précisément l'élément que la v2 avait supprimé parce que six gris ne se
  distinguaient pas.
- Projet actif : fond `--surface-active` et liseré `--accent` de 2 px.
- Sections repliables, archivés repliés par défaut.
- **Bouton « Nouveau projet » déplacé en pied de liste** : il ne mérite pas la
  place d'honneur, ce n'est pas le geste quotidien.
- **Rail rétractable** (`[`), état persisté, mode icônes à `--rail-w` replié.
- **Bloc de compte en pied** : avatar, nom, menu (préférences, thème, densité,
  abonnement, déconnexion). C'est ce qui manque le plus pour que l'écran
  ressemble à un outil et non à une maquette.

### 4.3 Palette de commandes

`Cmd/Ctrl + K` ouvre une palette qui couvre : aller à un projet, aller à un bien,
changer l'étape du bien courant, créer un projet, basculer le thème, changer de
vue, ouvrir les préférences. Implémentation maison, sans dépendance.

### 4.4 Raccourcis clavier

`1` `2` `3` vues · `n` nouveau bien · `/` recherche · `[` rail ·
`Cmd+K` palette · `?` aide · `Échap` ferme la couche la plus haute.
Un panneau d'aide liste les raccourcis — c'est le seul écran de l'outil qui a le
droit de contenir du texte, parce que c'est sa fonction.

### 4.5 Bandeau de synthèse du projet

Sous la barre, une ligne de chiffres seuls, sans phrase : nombre de biens, prix
médian, meilleur verdict, biens sans mouvement depuis plus de trois semaines.
Chaque valeur est cliquable et filtre la vue.

---

## 5. L3 — les primitives

Tous les composants de `src/components/ui/` sont repris. Le contrat d'API
publique de chacun est **préservé** autant que possible pour que les lots
suivants restent des remplacements de classes, pas des réécritures.

| Composant | Ce qui change |
|---|---|
| `Button` | Quatre variantes nettes : `primary` (encre), `secondary` (surface + filet), `quiet` (fantôme), `danger`. Trois tailles calées sur `--row-h`. État de chargement. Icônes alignées optiquement. |
| `Field` / `Input` | Hauteur unifiée, contour `--line-strong`, anneau de focus `--accent` à 2 px, libellé au-dessus, erreur sous le champ. |
| `Controls` (`Segmented`, `Toggle`, `Chip`) | Fond `--sunken`, pastille active en `--surface` + `--shadow-1` : la bascule prend enfin du relief. |
| `Panel` | `--r-lg`, `--shadow-1`, filet `--line-soft`. `PanelHeader` sans filet de remplissage. **`Rule` est supprimé** : les groupes portent leur propre séparation. |
| `Disclosure` | Chevron à droite (convention), plus de filet de remplissage, résumé dans une colonne alignée à droite. |
| `Overlay` (`Sheet`, `Modal`) | `--shadow-3`, en-tête et pied fixes, corps seul défilant, largeurs normalisées. |
| `Feedback` (`Empty`, `Notice`) | `Empty` devient purement visuel : icône, titre court, bouton. Le champ `body` disparaît de l'API. |
| `Toast` | Conservé, repositionné en bas à droite. |
| `Verdict` | `VerdictPill`, `VerdictBar`, `VerdictBlock` recalés sur les couleurs claires. |
| `Stage` | **Nouveau** : `StagePill`, `StageDot`, `StageBar` — l'équivalent de `Verdict` pour les étapes, aujourd'hui inexistant, d'où la confusion des deux systèmes. |
| `Skeleton` | **Nouveau** : blocs de chargement pour board, tableau et fiche. |
| `Avatar` | **Nouveau** : pour le bloc de compte. |
| `Menu` | **Nouveau** : extrait des trois menus recopiés à la main dans `PropertyCard`, `ProjectRow` et `PropertyTable`. Élévation, largeur régulière, raccourcis affichés à droite. |
| `InfoTip` | Conservé tel quel — le portail vers `document.body` est une contrainte technique, pas un choix esthétique. |
| `Icon` | Passe en revue : traits à 1,5 px, grille de 16, alignement optique. |

---

## 6. Découpage en plans

| Plan | Contenu | Vérifiable par |
|---|---|---|
| **R1** | `tokens.css` bi-thème + couche `@theme` de `globals.css` + script de thème + purge du grain et du calage focal dans l'outil | L'app s'ouvre en clair, rien n'est cassé, la bascule de thème fonctionne |
| **R2** | Migration mécanique des classes dans tous les composants existants (table §3.11) | Aucune régression visuelle autre que les couleurs |
| **R3** | Primitives L3 : `Button`, `Field`, `Controls`, `Panel`, `Disclosure`, `Overlay`, `Feedback`, `Menu`, `Skeleton`, `Avatar`, `Stage` | Écran de démonstration interne |
| **R4** | `AppBar` unifiée : fil d'ariane, onglets, recherche câblée, « Comparer », bouton primaire | La barre remplace `AppTopbar` + `ViewTabs` |
| **R5** | Rail latéral : hauteur d'en-tête, barre de répartition, rétraction, bloc de compte | — |
| **R6** | `Cmd+K`, raccourcis clavier, panneau d'aide, préférences (thème, densité) | — |
| **R7** | Bandeau de synthèse du projet | — |
| **R8** | Purge du texte explicatif (§1.4 de l'audit) et passe de polish : alignements, focus, mouvement | Relecture écran par écran |

Chaque plan est poussé sur `main`, validé par l'utilisateur sur Vercel, puis coché.

---

## 7. Risques

1. **R2 touche presque tous les fichiers** — `hairline` apparaît 212 fois,
   `brand` 111 fois. Le risque n'est pas la casse mais l'oubli : une classe
   manquée reste sur un token supprimé et l'élément devient transparent.

   ⚠ Tailwind v4 **n'échoue pas** sur un utilitaire inconnu : il ne génère
   simplement pas la règle. On ne peut donc pas compter sur une erreur de build
   pour détecter les oublis. Stratégie retenue :

   - **R1** ajoute les nouveaux tokens **et conserve les anciens noms en alias**
     pointant vers les nouvelles valeurs. Rien ne casse, et l'application prend
     déjà ses nouvelles couleurs dès le premier plan.
   - **R2** migre les classes fichier par fichier, puis **supprime les alias**.
   - La vérification est un `grep` qui doit retourner zéro occurrence, pas un
     build vert.
2. **Le thème clair change tous les rapports de contraste.** Les couleurs de
   verdict et d'étape doivent être vérifiées sur `--surface` et sur `--sunken`,
   pas seulement sur le fond de scène.
3. **La carte MapLibre** applique un filtre de désaturation prévu pour le sombre
   (`globals.css:380`). En thème clair, le filtre doit être retiré, pas ajusté.
4. **Le rendu serveur du thème.** Sans le script inline avant peinture, la page
   s'affiche en clair puis bascule. À vérifier en build de production, pas
   seulement avec Turbopack.
5. **`Rule` et `Empty.body` disparaissent de l'API.** Tout appelant doit être
   traité dans R3, sinon le build échoue — ce qui est le comportement souhaité.
