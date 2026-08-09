# Refonte UI/UX du CRM Estio — audit + liste de travaux

> 2026-08-09 · Document de brainstorm (pas encore la spec d'implémentation).
> Périmètre : l'outil (`/app/**`). La vitrine sera rhabillée après, au nouveau système.
> Interdit : casser le backend, les actions serveur, le moteur de calcul, MapLibre, dnd-kit.

---

## 1. Diagnostic — pourquoi ça ne « fait pas CRM »

### 1.1 Le trait décoratif orphelin (le grief n°1 de l'utilisateur)

Six endroits posent un filet qui ne sépare rien et ne délimite rien. Ce sont
exactement les zones entourées en bleu sur les captures.

| Fichier | Ligne | Le trait | Pourquoi il gêne |
|---|---|---|---|
| `Disclosure.tsx` | 64 | `<span className="h-px flex-1 bg-hairline">` | Remplit l'espace entre le titre et le résumé. Un vide aurait suffi. |
| `AppSidebar.tsx` | 49 | `ml-auto h-px w-full max-w-8 bg-hairline` (via `PipelineColumn`) | Trait de 32 px collé au compteur de colonne : ornement pur. |
| `PipelineColumn.tsx` | 49 | idem | idem |
| `projects/page.tsx` | 79, 104 | `h-px flex-1 bg-hairline` entre le titre de section et le compteur | idem |
| `AppTopbar.tsx` | 49 | `h-3 w-px bg-hairline-2` entre le nom du projet et les critères | Séparateur vertical de 12 px, invisible ou parasite selon l'écran. |
| `FicheShell.tsx` | 107 | `h-3.5 w-px bg-hairline-2` | idem |

**Règle nouvelle :** un filet sépare deux zones qui vont jusqu'au bord, ou il
n'existe pas. Zéro filet de remplissage, zéro séparateur vertical court.

### 1.2 Aucune hiérarchie de surface, aucun relief

- Le filet unique `--hairline: rgb(240 234 227 / 0.08)` sert à tout : bordure de
  carte, bordure de panneau, séparateur de ligne de tableau, contour d'entrée.
  À 8 % d'opacité sur un fond à luminance 4 %, il est quasi invisible → l'écran
  ressemble à une nappe grise indifférenciée.
- `tokens.css` définit `--lift-1/2/3` mais l'outil ne les utilise **quasiment
  jamais** (parti-pris v2 : « quasi aucune ombre dans l'outil »). Résultat :
  menus, popovers, drawer et cartes flottent au même niveau que le fond.
- Trois niveaux de surface existent (`surface`, `raised`, `high`) mais l'écart
  entre `#15120f` et `#221d19` est de ~6 % de luminance — imperceptible.

### 1.3 Le monochrome

Une seule couleur (braise `#ff6a1a`) + trois verdicts désaturés + six gris
d'étapes. Sur un écran de board, cela donne : gris, gris, gris, un bouton
orange. Aucun repère visuel pour naviguer, rien à mémoriser, rien qui accroche.
Les CRM de référence emploient tous une palette fonctionnelle large (statuts,
tags, membres, priorités) précisément pour créer des repères périphériques.

### 1.4 Le texte explicatif (le grief n°2)

Prose à supprimer, exhaustivement :

| Endroit | Texte |
|---|---|
| `PipelineColumn.tsx:20-27` | Six phrases `VIDE[status]` (« Glissez-y un bien dont vous avez lu les chiffres. ») |
| `PipelineBoard.tsx:115` | « Capturez une annonce — capture d'écran, PDF d'agence… » |
| `projects/page.tsx:68-71` | « Un projet, c'est un achat. Il porte son propre pipeline… » |
| `SectionMarche.tsx:88-91` | `Notice` « Valeurs d'exemple. Le branchement réel… » |
| `FicheShell.tsx:158-162` | Disclaimer centré « Estio est un outil d'aide à la décision… » |
| `ProjectRow.tsx:326-329` | « Si vous voulez seulement le sortir de votre liste, archivez-le… » |
| `PropertyTable.tsx:227, 232` | « Le tableau se remplira dès la première annonce capturée. » etc. |
| `AppTopbar.tsx:68, 77` | `title=` verbeux sur des contrôles désactivés |
| `CreateProjectForm` | Sous-titres explicatifs du formulaire |

**Règle nouvelle :** l'interface ne raconte rien. Un état vide = une icône, un
titre de 2-4 mots, un bouton. Les définitions restent, mais uniquement dans les
infobulles du glossaire (`InfoTip`), jamais en paragraphe.

### 1.5 Alignements et rythme cassés

- **Gouttières incohérentes** : topbar `px-5`, sidebar `px-3`, page projets
  `px-8`, fiche `px-6`, board `px-5`. Rien ne s'aligne verticalement d'un écran
  à l'autre.
- **Hauteurs d'en-tête différentes** : la barre du haut fait `--topbar: 3.5rem`,
  l'en-tête du rail latéral fait `py-5` + logo `h-6` ≈ 4,25 rem → le logo et le
  nom du projet ne sont pas sur la même ligne (visible capture 5).
- **Deux barres empilées** : topbar puis `ViewTabs` avec chacune sa bordure
  basse → double filet horizontal, 6 rem de chrome avant le contenu.
- **La carte** ne remplit pas sa zone : elle démarre sous `ViewTabs` mais le
  panneau de réglages flotte sans marge cohérente et la légende est posée en
  bas à gauche sans grille (capture 7).
- **`PipelineColumn` header** `sticky top-0 bg-bg` alors que le conteneur
  parent a `py-4` → au défilement, les cartes passent derrière un fond qui ne
  couvre pas toute la largeur de la colonne.

### 1.6 Ce qui manque, purement et simplement

Fonctions présentes dans tout CRM sérieux et absentes ici :

- Palette de commandes (`Cmd+K`) — aucune.
- Recherche : le champ existe mais est `disabled`.
- Filtres : uniquement dans la vue Tableau, sous forme de puces d'étape.
- Tri : uniquement Tableau, une seule clé.
- Groupement (par étape / ville / verdict) : absent.
- Vues sauvegardées : absentes.
- Sélection multiple + actions groupées : absentes.
- Raccourcis clavier : aucun.
- Menu de compte / avatar / notifications : absents.
- Fil d'activité, historique des changements d'étape : absent.
- Étiquettes libres (tags) sur un bien : absentes.
- Densité réglable, thème clair : absents.
- États de chargement : `loading.tsx` existe mais pas de squelettes de contenu.

> **Hors périmètre, décision utilisateur.** Pas de tâches ni de relances datées
> (« relancer l'agent le 12 ») : Estio suit des **biens**, pas des interlocuteurs.
> Ce mécanisme, standard dans un CRM de vente, n'a pas de sens ici.
>
> **« Comparer » et la recherche ne sont pas des défauts** : ce sont des
> fonctions à venir, déjà prévues à la feuille de route. La refonte doit donc
> leur donner une place définitive dans l'interface — et une forme d'attente
> honnête — au lieu de les masquer.

---

## 2. Ce qu'on emprunte aux meilleurs

| Produit | Ce qu'on prend |
|---|---|
| **Linear** | `Cmd+K`, raccourcis mono-touche, densité, sobriété colorée mais lisible, transitions courtes |
| **Attio** | Grille de données éditable en place, vues sauvegardées, barre de filtres composables |
| **Notion** | Bascule de vue sur la même donnée, panneau latéral qui devient page |
| **Trello** | Ajout rapide en tête/pied de colonne, en-tête de colonne compacte avec menu |
| **HubSpot / Pipedrive** | Bandeau de synthèse au-dessus du pipeline (total, valeur, étape la plus lente), fil d'activité, tâches datées |
| **Monday** | Couleur de statut assumée et lisible d'un coup d'œil |

---

## 3. Les trois directions visuelles possibles

### D1 — « Studio clair »
Clair par défaut, gris neutres froids, un accent profond (indigo/ardoise),
étapes en pastels saturés, ombres douces réelles, rayons 8-12 px.
**Pour :** c'est le registre de tous les CRM ; on y passe des heures sans fatigue.
**Contre :** Estio perd son identité nocturne, la vitrine devra suivre.

### D2 — « Nuit habitée »
On garde le sombre mais on le construit vraiment : 5 niveaux de surface bien
écartés, ombres et lueurs, un accent conservé pour les actions **plus** une
palette froide (bleu/cyan/violet/vert) pour les étapes, qui contraste avec le
chaud de la marque.
**Pour :** garde l'ADN, corrige la fadeur, chantier plus court.
**Contre :** reste un produit sombre, moins « CRM canonique ».

### D3 — « Bi-thème » *(recommandé)*
Un seul jeu de tokens sémantiques, deux thèmes réels. **Clair par défaut dans
l'outil**, sombre disponible d'un raccourci, vitrine sombre conservée.
**Pour :** on ne choisit pas contre l'utilisateur ; c'est ce que font Linear,
Attio, Notion, Height.
**Contre :** deux fois la validation visuelle, tokens à réécrire proprement.

---

## 4. La longue liste des travaux

### 4.0 Fondations — `tokens.css` réécrit
1. Passer d'une palette de primitives à **deux thèmes** (`[data-theme]`), tous
   les composants ne lisant que des tokens sémantiques.
2. **Cinq niveaux de surface** réellement écartés (fond, panneau, panneau élevé,
   survol, sélectionné) au lieu de trois quasi identiques.
3. **Trois bordures** avec un rôle chacune : structurelle (visible), légère
   (interne), focus. Supprimer `hairline-3`, redondante.
4. **Vraies ombres** réintroduites, par niveau d'élévation (carte, popover,
   modal, drag).
5. **Palette d'étapes colorée** : 6 teintes distinctes (à analyser → offre),
   utilisées en pastille + barre de colonne + point de carte.
6. **Palette de verdict** conservée en principe (bon/à creuser/peu favorable)
   mais recalée sur les nouveaux fonds.
7. **Couleur d'accent** = actions seulement (règle v2 conservée, elle est bonne).
8. **Échelle d'espacement 4 px stricte** et **une seule gouttière d'écran**
   (`--pad-x`), appliquée topbar / sidebar / contenu / fiche.
9. **Rayons** revus : 6 px (contrôles), 10 px (cartes), 14 px (panneaux),
   16 px (modales). Plus de `2 px`.
10. **Densité** : token `--row-h` avec deux valeurs (confortable / compacte),
    réglable dans les préférences.
11. **Grain de film** : retiré de l'outil (garder sur la vitrine) — il salit les
    aplats clairs et ne sert à rien à cette densité.
12. Typo : garder Space Grotesk + JetBrains Mono, mais **fixer une échelle de
    5 tailles** (11/12/13/15/20) au lieu des `text-[13.5px]` dispersés.

### 4.1 Coque de l'application
13. **Aligner la sidebar et la topbar sur la même hauteur d'en-tête** (une seule
    ligne de 52 px, logo à gauche, contexte à droite).
14. **Fusionner topbar + ViewTabs en une seule barre** : nom du projet + fil
    d'ariane à gauche, onglets de vue au centre, actions à droite. Un seul filet.
15. **Fil d'ariane** `Projets / T2 Lyon / Rue Paul Bert` cliquable partout.
16. **Sidebar repensée** : sections repliables, projet actif avec sa pastille de
    couleur, favoris épinglés, compteur discret, recherche de projet, bouton
    « Nouveau projet » en bas et non en haut (il ne mérite pas la place d'honneur).
17. **Sidebar rétractable** (`[` ) avec état persisté, mode icônes.
18. **Bloc compte en pied de sidebar** : avatar, nom, menu (préférences, thème,
    déconnexion, abonnement).
19. **Palette de commandes `Cmd+K`** : aller à un projet, à un bien, changer
    d'étape, créer, basculer le thème, ouvrir les préférences.
20. **Recherche réelle** dans la topbar (`/` pour la focaliser), résultats
    groupés biens / projets / notes.
21. **Raccourcis clavier** : `1/2/3` vues, `n` nouveau bien, `e` étape,
    `f` filtre, `?` aide, `Esc` ferme.
22. **Barre de synthèse du projet** sous l'en-tête : nombre de biens, budget
    médian, meilleur verdict, biens qui stagnent. Chiffres seuls, aucune phrase.
23. **Les fonctions à venir prennent leur place définitive, sans se déguiser.**
    La recherche est câblée pour de bon (filtrage client sur les biens déjà
    chargés — presque gratuit), donc plus de champ `disabled`. « Comparer »
    garde son emplacement dans la barre mais devient un bouton vivant qui ouvre
    un panneau d'attente, au lieu d'un contour pointillé grisé marqué
    « bientôt ».

### 4.2 Vue Pipeline
24. **En-tête de colonne solide** : bandeau plein (pas transparent), pastille de
    couleur de l'étape, libellé, compteur, menu `⋯`, bouton `+`.
25. Supprimer le filet décoratif de l'en-tête (§1.1).
26. **Colonne = surface**, pas un vide : fond légèrement enfoncé, coins arrondis,
    ce qui rend le board lisible d'un coup d'œil.
27. **Colonne vide** : icône fantôme + `+`, aucune phrase.
28. **Ajout rapide en tête de colonne** (adresse + prix, le reste plus tard).
29. **Carte de bien redessinée** : miniature photo à gauche si disponible,
    adresse, ville, prix en évidence, surface + €/m², pastille de verdict,
    rangée d'indicateurs (notes, documents, jours d'inactivité, tags).
30. **Poignée de glissement supprimée** au profit d'un glissement sur toute la
    carte avec seuil (les CRM le font tous ; la poignée est un aveu de bug).
31. **Fantôme de glissement** : conserver, mais ajouter un **emplacement
    d'accueil** (ligne d'insertion) dans la colonne cible.
32. **Repli des colonnes** (une colonne « Écarté » repliée par défaut).
33. **Limite douce** par colonne (avertissement visuel si > n biens).
34. **Sélection multiple** (clic + `Maj`) et barre d'actions flottante :
    changer d'étape, taguer, écarter, supprimer.
35. **Groupement alternatif** : par étape (défaut), par ville, par verdict.
36. **Tri intra-colonne** : manuel (défaut), prix, verdict, ancienneté.

### 4.3 Vue Tableau
37. **Vraie grille de données** : en-tête figé, colonnes redimensionnables,
    première colonne gelée, lignes à hauteur réglée par la densité.
38. **Édition en place** des champs N1 (prix, surface, notes courtes).
39. **Barre de filtres composables** (`Ville = Lyon`, `Prix ≤ 250 k`,
    `Verdict = bon`) au lieu des seules puces d'étape.
40. **Vues sauvegardées** avec nom, partagées entre Tableau/Pipeline/Carte.
41. **Sélection par case à cocher** + actions groupées (mêmes que le board).
42. **Groupement par étape** avec en-têtes de groupe repliables et sous-totaux.
43. **Colonne de verdict** avec micro-barre, pas seulement une pastille.
44. **Export CSV** de la vue courante.
45. Supprimer le liseré animé `scale-y` à gauche de la ligne survolée
    (`PropertyTable.tsx:299`) : ornement qui n'informe pas.

### 4.4 Vue Carte
46. **La carte occupe toute la zone**, sous une barre unique ; plus d'espace mort.
47. **Panneau latéral de liste** synchronisé (survol carte ↔ survol liste), à la
    manière d'un portail immobilier.
48. **Épingles** au nouveau code couleur d'étape (et non verdict seul), avec
    regroupement au dézoom.
49. **Légende et réglages** dans un seul panneau ancré, pas deux flottants.
50. **Dessin de zone** (polygone) pour filtrer géographiquement — grosse valeur,
    déjà permis par MapLibre.

### 4.5 Panneau latéral (drawer)
51. **Onglets** : Aperçu · Notes · Documents · Activité. Aujourd'hui tout est
    empilé et séparé par des `<Rule />`.
52. **Supprimer les `Rule`** : les onglets et les groupes portent la séparation.
53. **En-tête riche** : photo, adresse, étape éditable en place, verdict, actions.
54. **Rail d'étapes** transformé en **fil de progression** cliquable et coloré.
55. **Fil d'activité** : chaque changement d'étape, note, document, horodaté.
56. **Élargissement** du panneau en plein écran (bouton), pour rejoindre la fiche.

### 4.6 Fiche du bien
57. **Deux colonnes stables** : contenu à gauche, **scénario en panneau ancré à
    droite** — mais avec une seule zone de défilement, pas trois.
58. **Navigation par onglets** (Synthèse · Le bien · Le marché · L'argent ·
    Suivi) au lieu de la pile de panneaux + replis imbriqués.
59. **Supprimer la bascule Simple/Complet** : elle duplique la logique des
    onglets et oblige à choisir avant d'avoir vu.
60. **Le verdict en tête**, format fiche produit : score, barre, 4 chiffres clés,
    et le détail du score (critère par critère) accessible d'un clic.
61. **Supprimer le `Notice` « Valeurs d'exemple »** ; remplacer par une petite
    pastille « démo » sur les seuls chiffres concernés.
62. **Supprimer le disclaimer de bas de page** ; le déplacer en pied de compte /
    mentions légales, une fois pour toutes.
63. **`Disclosure` redessiné** : plus de filet de remplissage, résumé aligné à
    droite dans une colonne fixe, chevron à droite (convention).
64. **Photos** : galerie en tête de fiche, pas un panneau perdu au milieu.
65. **Les curseurs de scénario** regroupés avec valeurs éditables au clavier
    (aujourd'hui : curseur seul, imprécis).
66. **Comparaison de scénarios** (A/B) — la vraie valeur d'Estio, aujourd'hui
    absente.
67. **Bloc « Votre suivi »** redessiné autour de ce qui est propre à Estio : le
    prix maximum, l'interlocuteur, les notes libres et l'historique d'étapes.
    Pas de tâches ni de relances datées — voir §1.6.

### 4.7 Écran Projets
68. **Passer d'une liste à un tableau de bord** : chaque projet en carte avec
    mini-pipeline (barre segmentée colorée — cette fois lisible car les étapes
    ont des couleurs), budget, dernier mouvement.
69. **Formulaire de création en modale** plutôt qu'en colonne permanente qui
    déséquilibre la page.
70. **Supprimer le paragraphe d'introduction** et les filets de section.
71. **Archivés** dans un onglet, pas une seconde section empilée.
72. **Actions rapides** au survol : ouvrir, renommer, dupliquer, archiver.

### 4.8 Composants transverses
73. **Boutons** : 4 variantes claires (primaire, secondaire, discret, danger),
    3 tailles, états de chargement, icônes alignées optiquement.
74. **Champs** : hauteur unifiée, libellé au-dessus, erreur sous le champ,
    anneau de focus cohérent.
75. **Menus** : élévation réelle, largeur régulière, raccourcis affichés à
    droite, séparateurs groupés.
76. **Modales** : une seule largeur par usage, en-tête/corps/pied fixes.
77. **Toasts** : conserver (ils sont bons), les repositionner en bas à droite.
78. **États vides** : un composant unique, visuel, sans prose.
79. **Squelettes de chargement** pour board, tableau, fiche.
80. **Infobulles** : garder le portail (`InfoTip`), harmoniser le style.
81. **Pastille de verdict et pastille d'étape** : deux composants distincts,
    jamais confondus.

### 4.9 Nouvelles fonctions à prévoir (au-delà du visuel)
82. Étiquettes libres colorées sur un bien.
83. Champs personnalisés par projet.
84. Comparateur de 2-3 finalistes (déjà prévu par le bouton « Comparer »).
85. Historique et annulation d'un changement d'étape.
86. Préférences : thème, densité, devise, vue par défaut.
87. Partage en lecture d'un bien (lien public) — haut d'entonnoir viral.

---

## 5. Ordre de bataille proposé

| Lot | Contenu | Pourquoi d'abord |
|---|---|---|
| **L1** | Fondations : tokens, thèmes, surfaces, ombres, espacement, typo | Tout le reste en dépend |
| **L2** | Coque : sidebar + barre unique + fil d'ariane + compte + `Cmd+K` | Ce qu'on voit sur 100 % des écrans |
| **L3** | Primitives : boutons, champs, menus, modales, états vides, squelettes | Rhabille tout d'un coup |
| **L4** | Pipeline : colonnes, cartes, ajout rapide, sélection multiple | L'écran-cœur |
| **L5** | Tableau : grille, filtres, vues sauvegardées, groupes | Le second écran de travail |
| **L6** | Fiche + panneau latéral : onglets, activité, scénario | L'écran le plus dense |
| **L7** | Carte : plein cadre, liste synchronisée, panneau unique | Le moins cassé |
| **L8** | Projets : tableau de bord | Peu fréquenté |
| **L9** | Purge du texte + passe de polish (alignements, focus, mouvement) | Vérification finale |

---

## 6. Questions ouvertes

1. Direction visuelle : D1 clair / D2 sombre retravaillé / D3 bi-thème.
2. Conserve-t-on la braise `#ff6a1a` comme accent d'action, ou change-t-on de
   couleur d'accent ?
3. Priorité de départ : refaire les fondations d'abord (L1-L3, invisible
   pendant deux jours) ou frapper un écran complet d'abord (L4) pour voir le
   nouveau style tout de suite ?
