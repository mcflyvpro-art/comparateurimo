# R2 — Migration des composants vers les tokens bi-thème · plan d'implémentation

> **Pour les agents :** SOUS-SKILL REQUISE — utiliser `superpowers:subagent-driven-development`
> (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche.
> Les étapes utilisent la syntaxe `- [ ]` pour le suivi.

**Objectif :** remplacer, dans les 79 fichiers concernés, les noms de tokens de
l'ancien système par ceux du système bi-thème posé en R1, puis **supprimer les
alias de compatibilité** — de sorte qu'il ne reste qu'un seul vocabulaire.

**Architecture :** R1 a laissé vivants les anciens noms (`hairline`, `brand`,
`raised`, `lift-*`…) sous forme d'alias, précisément pour que rien ne casse
pendant que les composants attendaient leur tour. R2 fait le remplacement zone par
zone — les primitives d'abord, puis l'outil, puis la vitrine — et retire les alias
en dernier. Chaque zone est vérifiable indépendamment.

**Stack :** Next.js 16 (App Router), React 19, Tailwind CSS v4 (`@theme inline`),
CSS custom properties. Aucune dépendance ajoutée.

## Contraintes globales

- **Spec de référence :** `docs/superpowers/specs/2026-08-09-refonte-crm-design.md`,
  section 3.11 pour la table de correspondance.
- **C'est un renommage, pas une refonte.** Aucune mise en page ne change, aucune
  classe de taille, d'espacement ou de disposition n'est touchée. Si un
  remplacement demande de repenser un composant, il est **hors périmètre** : le
  signaler, ne pas le faire. Les composants sont redessinés en R3.
- ⚠ **L'ordre des remplacements compte.** `hairline` est un préfixe de
  `hairline-2`, `hairline-3` et `hairline-ember` ; `brand` est un préfixe de
  `brand-hot`, `brand-wash`, `brand-wash-2` et `brand-glow`. **Toujours remplacer
  la forme la plus longue en premier**, sinon `border-hairline-2` devient
  `border-line-soft-2`, qui ne génère aucune règle.
- ⚠ **Tailwind v4 n'échoue pas sur un utilitaire inconnu** : il ne génère pas la
  règle, silencieusement, et l'élément devient transparent. Un mauvais
  remplacement ne se voit ni au build, ni au lint, ni dans `tsc`. La vérification
  passe par `grep` et par lecture des règles réellement produites.
- ⚠ **Ne jamais toucher `rail-x`.** C'est un utilitaire de défilement horizontal
  défini dans `globals.css`, sans aucun rapport avec `var(--rail)`.
- ⚠ **Ne pas toucher `var(--gutter)`** (29 occurrences) : c'est une mesure de
  vitrine, conservée telle quelle.
- **Français** dans les commentaires et les messages de commit.
- Aucune dépendance ajoutée.
- **Commandes de vérification :** `npx tsc --noEmit`, `npm run lint`,
  `npm run build`. Le serveur de développement se lance **uniquement** via
  l'outil `preview_start` (`estio-dev`, port 3000), jamais avec Bash.
- **Limite d'environnement :** dans ces sessions, le volet navigateur n'est pas
  affiché. `computer{action:"screenshot"}` échoue systématiquement, et les pages
  `/app/**` ne révèlent jamais leur contenu de streaming React — elles paraissent
  vides alors que le DOM est présent et interrogeable avec `javascript_tool`. La
  vitrine `/` s'affiche normalement. **Ce n'est pas une régression, ne pas
  chercher à la corriger.** Vérifier le DOM et les feuilles de style, pas
  l'apparence.

---

## La table de correspondance

C'est le cœur du plan. Elle est reprise à l'identique dans chaque tâche.

### Classes Tailwind — remplacer dans cet ordre exact

| # | Ancien | Nouveau | Occurrences |
|---|---|---|---|
| 1 | `border-hairline-ember` | `border-accent-line` | 13 |
| 2 | `border-hairline-3` | `border-line-strong` | 22 |
| 3 | `border-hairline-2` | `border-line` | 51 |
| 4 | `bg-hairline-2` | `bg-line` | 8 |
| 5 | `border-hairline` | `border-line-soft` | 89 |
| 6 | `bg-hairline` | `bg-line-soft` | 16 |
| 7 | `bg-surface-high` | `bg-surface-active` | 5 |
| 8 | `bg-brand-wash-2` | `bg-accent-soft` | 1 |
| 9 | `text-brand-hot` | `text-accent-hot` | 9 |
| 10 | `bg-brand-hot` | `bg-accent-hot` | 4 |
| 11 | `bg-brand` | `bg-accent` | 30 |
| 12 | `text-brand` | `text-accent` | 28 |
| 13 | `border-brand` | `border-accent` | 10 |
| 14 | `outline-brand` | `outline-accent` | 6 |
| 15 | `bg-bg` | `bg-canvas` | 10 |
| 16 | `bg-raised` | `bg-surface-hover` | 25 |
| 17 | `bg-high` | `bg-surface` | 4 |
| 18 | `text-inverse` | `text-ink-fg` | 10 |
| 19 | `bg-ink-600` | `bg-surface-active` | 7 |
| 20 | `bg-ink-500` | `bg-line-strong` | 3 |
| 21 | `bg-bone-400` | `bg-text-3` | 2 |

`bg-sunken` et `text-sunken` sont **conservés tels quels** : le nom survit, seule
sa valeur a changé en R1.

⚠ **La table se lit par le suffixe de couleur, pas par la classe entière.** Tailwind
accepte des préfixes directionnels et des variantes que la table n'énumère pas :
`border-l-hairline-3`, `border-t-hairline`, `divide-hairline`, `ring-brand`,
`hover:bg-raised`, `group-hover:text-brand`… Le remplacement porte sur le
**jeton** (`hairline-3` → `line-strong`, `brand` → `accent`, `raised` →
`surface-hover`), quel que soit ce qui le précède. Une occurrence rencontrée sous
une forme absente de la table se traite donc par la même règle, sans demander
d'arbitrage.

### Variables lues directement en `var(--…)`

| Ancien | Nouveau | Occurrences |
|---|---|---|
| `var(--lift-3)` | `var(--shadow-3)` | 10 |
| `var(--lift-2)` | `var(--shadow-2)` | 0 |
| `var(--lift-1)` | `var(--shadow-1)` | 0 |
| `var(--brand-wash)` | `var(--accent-soft)` | 6 |
| `var(--brand-wash-2)` | `var(--accent-line)` | 2 |
| `var(--brand-glow)` | `var(--accent-glow)` | 3 |
| `var(--brand)` | `var(--accent)` | 2 |
| `var(--ember-700)` | `var(--accent)` | 2 |
| `var(--ink-950)` | `var(--ink-fg)` | 2 |
| `var(--bone-100)` | `var(--text)` | 1 |
| `var(--bone-500)` | `var(--text-4)` | 1 |
| `var(--risk-300)` | `var(--risk)` | 2 |
| `var(--surface-scrim)` | `var(--scrim)` | 2 |
| `var(--good-wash)` | `var(--good-soft)` | 2 |
| `var(--mid-wash)` | `var(--mid-soft)` | 1 |
| `var(--risk-wash)` | `var(--risk-soft)` | 5 |
| `var(--danger-wash)` | `var(--danger-soft)` | 4 |
| `var(--topbar)` | `var(--bar-h)` | 1 |
| `var(--rail)` | `var(--rail-w)` | 1 |

### Les onze occurrences qui ne sont pas de simples renommages

Toutes celles-ci consomment un token **qui n'existe plus, ou n'a jamais existé** :
la déclaration tombe silencieusement et l'élément hérite de la couleur de son
parent. La décision est déjà prise ci-dessous — l'appliquer telle quelle.

| Fichier:ligne | Ancien | Nouveau | Pourquoi |
|---|---|---|---|
| `src/app/error.tsx:29` | `text-ember-600` | `text-danger` | Cercle d'icône d'une page d'erreur : c'est un état, pas une action. |
| `src/app/(app)/error.tsx:28` | `text-ember-600` | `text-danger` | Idem. |
| `src/components/app/fiche/DocumentList.tsx:101` | `text-ember-800` | `text-danger` | La variable affichée s'appelle `validationError` : c'est une erreur. |
| `src/components/app/fiche/PhotoGrid.tsx:194` | `text-ember-800` | `text-mid` | La variable affichée s'appelle `warning` : c'est un avertissement. |
| `src/components/ui/Feedback.tsx:104` | `border-[color-mix(in_srgb,var(--ember-800)_35%,transparent)] bg-[var(--n3-wash)] text-ember-900` | `border-[color-mix(in_srgb,var(--mid)_35%,transparent)] bg-mid-soft text-mid` | Les **trois** jetons de ce ton `warn` sont morts. L'ambre du verdict est la seule famille qui dit « avertissement ». |
| `src/app/(marketing)/comment-ca-marche/page.tsx:57` | `var(--n1)` | `var(--text-2)` | Voir la note ci-dessous. |
| `src/app/(marketing)/comment-ca-marche/page.tsx:64` | `var(--n2)` | `var(--text-2)` | Idem. |
| `src/app/(marketing)/comment-ca-marche/page.tsx:71` | `var(--n3)` | `var(--text-2)` | Idem. |
| `src/app/(marketing)/a-propos/page.tsx:93` | `bg-ember-300` | `bg-accent` | Voir la note ci-dessous. |
| `src/components/landing/SourcesMarquee.tsx:26` | `bg-ember-300` | `bg-accent` | Idem. |

**Note sur `--n1` / `--n2` / `--n3`.** Ce sont les vestiges du code couleur des
« trois niveaux de données », supprimé en v2. Aucune des trois n'a jamais été
définie : les trois libellés s'affichent donc aujourd'hui dans la **même** couleur
héritée. `var(--text-2)` reproduit exactement ce qui est à l'écran. Redonner trois
couleurs distinctes à cette page serait une décision de conception, pas un
renommage : elle appartient à la reprise de la vitrine, pas à R2.

**Constaté à l'exécution — trois différences visibles supplémentaires sur la
vitrine, toutes des restaurations.** La relecture de la Tâche 5 a établi que la
migration en produit trois de plus que la seule annoncée. Vérification faite
contre les valeurs de la v2 d'origine (commit `2d588d9`), les trois **rendent à
la vitrine ce qu'elle était censée montrer** :

| Ce qui change | Avant | Après | Verdict |
|---|---|---|---|
| `border-hairline-ember` → `border-accent-line` (5 sites : carte gagnante et badge de `SectionArbitrage`, anneau d'appareil photo de `SectionCapture`, confirmation de `ContactForm`, carte « Le plus choisi » de `PricingTable`) | La classe **ne produisait aucune règle** : `--color-hairline-ember` n'a jamais figuré dans `@theme`. La bordure retombait sur `currentcolor`. | Ambre translucide à 40 % — exactement la valeur v2 de `--hairline-ember`. | **Bogue réparé.** La bordure ambrée était écrite dans le code depuis toujours et n'a jamais été peinte. |
| `bg-brand-hot` → `bg-accent-hot` (CTA principal de `MagneticButton`) | L'alias de R1 pointait vers `--accent` : le survol était **identique au repos**, donc sans retour visuel. | `#ff8c3d` en thème sombre — exactement la valeur v2 de `--ember-800`, que `--brand-hot` référençait. | **Comportement d'origine restauré.** |
| `var(--brand-glow)` → `var(--accent-glow)` (halo de la carte gagnante et de la carte populaire) | L'alias de R1 pointait vers `--accent-line`, à 0,4 d'opacité. | 0,32 — exactement la valeur v2 de `--brand-glow`. | **Valeur d'origine restaurée** ; l'alias avait dérivé. |

Ces trois écarts sont donc **acceptés et assumés**, au même titre que la pastille
de `SourcesMarquee`. Ils sont à signaler à la relecture sur Vercel, pas à
neutraliser.

**Note sur `bg-ember-300`.** Ce jeton n'a jamais existé non plus : les deux
éléments concernés — un filet de 8 px et une pastille de 4 px — sont
**actuellement invisibles**. `bg-accent` les rétablit dans la couleur de marque
manifestement voulue. C'est la **seule différence visible** que R2 introduit sur
la vitrine ; elle est délibérée et doit être signalée à la relecture.

### Un piège de syntaxe

Deux occurrences portent un modificateur d'opacité :
`bg-bone-400/40` et `bg-bone-400/18` (`src/components/landing/PipelineForms.tsx:214`
et `:218`). Le renommage doit **conserver le suffixe** : `bg-text-3/40` et
`bg-text-3/18`. Le perdre rendrait les deux traits opaques.

---

## Structure des fichiers

| Zone | Fichiers concernés | Traitée par |
|---|---|---|
| `src/design/tokens.css`, `src/app/globals.css` | 2 | Tâche 1 puis Tâche 6 |
| `src/components/ui/**` | 13 | Tâche 2 |
| `src/components/app/**` | 28 | Tâche 3 |
| `src/app/**` + `src/components/layout/**` | 19 | Tâche 4 |
| `src/components/landing/**` + `src/components/marketing/**` | 19 | Tâche 5 |

---

## Task 1 — compléter les tokens manquants

Trois tokens nommés par la table de correspondance n'existent pas encore. Sans
eux, les remplacements des tâches suivantes produiraient des classes muettes.

**Fichiers :**
- Modifier : `src/design/tokens.css`
- Modifier : `src/app/globals.css` (couche `@theme inline` uniquement)

**Interfaces :**
- Produit : `--accent-hot`, `--accent-glow` (variables CSS) et les utilitaires
  Tailwind `bg-accent-soft`, `bg-accent-line`, `bg-accent-hot`,
  `text-accent-hot`, `border-accent-line`, `bg-line`, `bg-line-soft`,
  `bg-line-strong`, `bg-text-3`, `bg-good-soft`, `bg-mid-soft`, `bg-risk-soft`.

- [ ] **Étape 1 : ajouter les deux tokens d'accent au thème clair**

Dans `src/design/tokens.css`, bloc `:root, [data-theme="light"]`, juste après
`--accent-line` :

```css
  /* Survol d'une action : en thème clair on FONCE, on n'éclaircit pas — un
     orange plus vif sur fond blanc perd du contraste au lieu d'en gagner. */
  --accent-hot: #cf4c08;
  --accent-glow: rgb(232 89 12 / 0.28);
```

- [ ] **Étape 2 : ajouter leurs équivalents sombres**

Dans le bloc `[data-theme="dark"]`, juste après `--accent-line` :

```css
  /* Dans le noir, le survol s'éclaircit — c'est l'inverse du thème clair. */
  --accent-hot: #ff8c3d;
  --accent-glow: rgb(255 106 26 / 0.32);
```

- [ ] **Étape 3 : exposer les noms Tailwind manquants**

Dans `src/app/globals.css`, couche `@theme inline`, section « Action », ajouter :

```css
  --color-accent-soft: var(--accent-soft);
  --color-accent-line: var(--accent-line);
  --color-accent-hot: var(--accent-hot);
```

Et dans la section « Verdict », ajouter :

```css
  --color-good-soft: var(--good-soft);
  --color-mid-soft: var(--mid-soft);
  --color-risk-soft: var(--risk-soft);
  --color-danger-soft: var(--danger-soft);
```

- [ ] **Étape 4 : vérifier que les nouveaux utilitaires produisent des règles**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Attendu : aucune erreur.

Puis, serveur lancé via `preview_start` (`estio-dev`), sur `http://localhost:3000/` :

```js
(() => {
  const s = getComputedStyle(document.documentElement);
  const noms = ['--accent', '--accent-hot', '--accent-glow', '--accent-soft',
                '--accent-line', '--good-soft', '--mid-soft', '--risk-soft'];
  return Object.fromEntries(noms.map(n => [n, s.getPropertyValue(n).trim() || 'VIDE']));
})()
```

Attendu : **aucune valeur `VIDE`**. Sur `/` (vitrine sombre), `--accent-hot` doit
valoir `#ff8c3d`.

- [ ] **Étape 5 : commit**

```bash
git add src/design/tokens.css src/app/globals.css
git commit -m "feat(design): tokens d'accent au survol et expositions Tailwind manquantes"
```

---

## Task 2 — migrer les primitives d'interface

**Fichiers :** les 13 fichiers de `src/components/ui/` qui référencent un ancien
token. Les localiser ainsi :

```bash
grep -rlE "hairline|bg-bg|bg-raised|bg-high|surface-high|brand|ember-|lift-|bone-|-ink-[0-9]|text-inverse|--n[123]" src/components/ui
```

**Interfaces :**
- Consomme : les tokens produits par la Tâche 1.
- Produit : des primitives qui n'emploient plus que le vocabulaire bi-thème.
  Les tâches 3 à 5 les consomment sans changement d'API.

- [ ] **Étape 1 : appliquer la table de correspondance**

Appliquer, fichier par fichier, les 21 remplacements de classes et les 19
remplacements de `var(--…)` de la table ci-dessus, **dans l'ordre indiqué**.

Ne modifier **que** ces jetons. Aucune classe de taille, d'espacement, de
disposition ou d'état ne change. Aucune balise n'est ajoutée ni retirée.

- [ ] **Étape 2 : appliquer la seule occurrence non mécanique de cette zone**

`src/components/ui/Feedback.tsx:104`, ton `warn`. Ses **trois** jetons sont morts.
Remplacer la chaîne entière :

```
border-[color-mix(in_srgb,var(--ember-800)_35%,transparent)] bg-[var(--n3-wash)] text-ember-900
```

par :

```
border-[color-mix(in_srgb,var(--mid)_35%,transparent)] bg-mid-soft text-mid
```

- [ ] **Étape 3 : vérifier qu'aucun ancien nom ne subsiste dans la zone**

```bash
grep -rnE "hairline|bg-bg\b|bg-raised|bg-high\b|surface-high|brand|ember-|lift-|bone-[0-9]|-ink-[0-9]|text-inverse|--n[123]" src/components/ui
```

Attendu : **aucune sortie**.

- [ ] **Étape 4 : vérifier la compilation**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Attendu : aucune erreur.

- [ ] **Étape 5 : vérifier que les classes produisent bien des règles**

Serveur via `preview_start` (`estio-dev`), sur `http://localhost:3000/` :

```js
(() => {
  // Toutes les classes utilitaires réellement générées par Tailwind.
  // ⚠ Tailwind v4 range TOUTES ses règles dans des blocs `@layer`. Sans
  // récursion dans `r.cssRules`, ce relevé revient vide et signale la totalité
  // des classes comme muettes — un faux positif intégral.
  const generees = new Set();
  const parcourir = (regles) => {
    for (const r of regles) {
      if (r.selectorText) {
        for (const m of r.selectorText.matchAll(/\.([a-zA-Z0-9_:\\/-]+)/g)) {
          generees.add(m[1].replace(/\\/g, ''));
        }
      }
      if (r.cssRules) parcourir(r.cssRules);
    }
  };
  for (const f of document.styleSheets) {
    let regles; try { regles = f.cssRules; } catch { continue; }
    parcourir(regles);
  }
  if (generees.size < 100) return { erreur: 'relevé vide — la récursion @layer a échoué' };
  const attendues = ['bg-canvas','bg-surface','bg-surface-hover','bg-surface-active',
    'bg-sunken','border-line','border-line-soft','border-line-strong',
    'bg-accent','text-accent','border-accent','bg-accent-soft','text-accent-hot',
    'border-accent-line','text-ink-fg','bg-text-3'];
  return { muettes: attendues.filter(c => !generees.has(c)) };
})()
```

Attendu : `muettes: []`. Toute classe listée est une classe qui ne peint rien.

- [ ] **Étape 6 : commit**

```bash
git add src/components/ui
git commit -m "refactor(ui): primitives migrées vers les tokens bi-thème"
```

---

## Task 3 — migrer les composants de l'outil

**Fichiers :** les 28 fichiers de `src/components/app/` qui référencent un ancien
token. Les localiser ainsi :

```bash
grep -rlE "hairline|bg-bg|bg-raised|bg-high|surface-high|brand|ember-|lift-|bone-|-ink-[0-9]|text-inverse|--n[123]" src/components/app
```

**Interfaces :**
- Consomme : les tokens de la Tâche 1 et les primitives migrées en Tâche 2.

- [ ] **Étape 1 : appliquer la table de correspondance**

Mêmes règles qu'à la Tâche 2 : les 21 remplacements de classes et les 19
remplacements de `var(--…)`, **dans l'ordre indiqué**, et rien d'autre.

Attention particulière dans cette zone : `MapCanvas.tsx`, `MapView.tsx` et
`MapSettingsPanel.tsx` construisent des couleurs pour MapLibre. Les épingles et
les popups doivent continuer de fonctionner à l'identique — c'est une
fonctionnalité livrée et validée, elle ne doit pas régresser.

- [ ] **Étape 2 : appliquer les deux occurrences non mécaniques de cette zone**

Toutes deux portent `text-ember-800`, qui ne produit aucune règle aujourd'hui :

- `src/components/app/fiche/DocumentList.tsx:101` → `text-danger`
  (la variable affichée s'appelle `validationError`)
- `src/components/app/fiche/PhotoGrid.tsx:194` → `text-mid`
  (la variable affichée s'appelle `warning`)

- [ ] **Étape 3 : vérifier qu'aucun ancien nom ne subsiste dans la zone**

```bash
grep -rnE "hairline|bg-bg\b|bg-raised|bg-high\b|surface-high|brand|ember-|lift-|bone-[0-9]|-ink-[0-9]|text-inverse|--n[123]" src/components/app
```

Attendu : **aucune sortie**.

- [ ] **Étape 4 : vérifier la compilation**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Attendu : aucune erreur.

- [ ] **Étape 5 : vérifier que la carte fonctionne toujours**

Serveur via `preview_start` (`estio-dev`). Récupérer un identifiant de projet réel
en lisant le `href` d'une carte depuis `/app/projects`, puis ouvrir
`/app/p/<id>?view=carte` et exécuter :

```js
(() => ({
  epingles: document.querySelectorAll('.estio-pin').length,
  toile: !!document.querySelector('.maplibregl-canvas'),
  erreurs: 0,
}))()
```

Attendu : `epingles` supérieur à zéro et `toile: true`. Puis
`read_console_messages` : aucune erreur.

- [ ] **Étape 6 : commit**

```bash
git add src/components/app
git commit -m "refactor(app): composants de l'outil migrés vers les tokens bi-thème"
```

---

## Task 4 — migrer les pages et la coque

**Fichiers :** les fichiers de `src/app/` et `src/components/layout/` qui
référencent un ancien token. Les localiser ainsi :

```bash
grep -rlE "hairline|bg-bg|bg-raised|bg-high|surface-high|brand|ember-|lift-|bone-|-ink-[0-9]|text-inverse|--n[123]" src/app src/components/layout --include=*.tsx --include=*.ts
```

⚠ **Ne pas toucher `src/app/globals.css` ni `src/design/tokens.css`** : ils sont
traités en Tâche 1 et Tâche 6.

- [ ] **Étape 1 : appliquer la table de correspondance**

Mêmes règles qu'aux tâches précédentes.

⚠ **Correction constatée à l'exécution :** `var(--topbar)` et `var(--rail)`,
annoncés ici, se trouvaient en réalité dans `AppSidebar.tsx` et `AppTopbar.tsx`,
donc dans la zone de la Tâche 3, qui les a déjà traités. Il ne devrait rien en
rester ici — le `grep` de l'étape 3 le confirmera.
⚠ **Ne pas confondre `var(--rail)` avec la classe `rail-x`**, qui reste inchangée.

- [ ] **Étape 2 : appliquer les six occurrences non mécaniques de cette zone**

| Fichier:ligne | Ancien | Nouveau |
|---|---|---|
| `src/app/error.tsx:29` | `text-ember-600` | `text-danger` |
| `src/app/(app)/error.tsx:28` | `text-ember-600` | `text-danger` |
| `src/app/(marketing)/comment-ca-marche/page.tsx:57` | `var(--n1)` | `var(--text-2)` |
| `src/app/(marketing)/comment-ca-marche/page.tsx:64` | `var(--n2)` | `var(--text-2)` |
| `src/app/(marketing)/comment-ca-marche/page.tsx:71` | `var(--n3)` | `var(--text-2)` |
| `src/app/(marketing)/a-propos/page.tsx:93` | `bg-ember-300` | `bg-accent` |

Les trois `var(--n*)` deviennent volontairement **la même** valeur : elles ne sont
définies nulle part aujourd'hui, les trois libellés s'affichent donc déjà dans la
même couleur héritée, et `var(--text-2)` reproduit exactement l'écran actuel.
`bg-ember-300` sur `a-propos:93` rend visible un filet qui ne l'est pas
aujourd'hui — différence délibérée, à signaler dans le rapport.

- [ ] **Étape 3 : vérifier qu'aucun ancien nom ne subsiste dans la zone**

```bash
grep -rnE "hairline|bg-bg\b|bg-raised|bg-high\b|surface-high|brand|ember-|lift-|bone-[0-9]|-ink-[0-9]|text-inverse|--n[123]|var\(--topbar\)|var\(--rail\)" src/app src/components/layout --include=*.tsx --include=*.ts
```

Attendu : **aucune sortie**.

- [ ] **Étape 4 : vérifier la compilation**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Attendu : aucune erreur.

- [ ] **Étape 5 : commit**

```bash
git add src/app src/components/layout
git commit -m "refactor(app): pages et coque migrées vers les tokens bi-thème"
```

---

## Task 5 — migrer la vitrine

**Fichiers :** les 19 fichiers de `src/components/landing/` et
`src/components/marketing/`.

C'est la zone la plus sensible du plan : la vitrine est **déjà livrée et validée**.
Elle doit rester **strictement identique** après migration. Elle est sombre, donc
les tokens y résolvent vers les valeurs sombres — celles de l'ancien système, aux
écarts de R1 près.

- [ ] **Étape 1 : appliquer la table de correspondance**

Mêmes règles qu'aux tâches précédentes. ⚠ `var(--gutter)` (29 occurrences) reste
inchangée.

- [ ] **Étape 2 : appliquer les six occurrences non mécaniques de cette zone**

| Fichier:ligne | Ancien | Nouveau |
|---|---|---|
| `src/components/landing/Hero.tsx:136` | `var(--bone-500)` | `var(--text-4)` |
| `src/components/landing/SourcesMarquee.tsx:26` | `bg-ember-300` | `bg-accent` |
| `src/components/landing/PipelineForms.tsx:214` | `bg-bone-400/40` | `bg-text-3/40` |
| `src/components/landing/PipelineForms.tsx:218` | `bg-bone-400/18` | `bg-text-3/18` |
| `src/components/landing/ProductShowcase.tsx:49,50,51` | `bg-ink-500` ×3 | `bg-line-strong` ×3 |

⚠ **Les suffixes d'opacité `/40` et `/18` doivent être conservés.** Les perdre
rendrait les deux traits de `PipelineForms` opaques.

`bg-ember-300` sur `SourcesMarquee:26` rend visible une pastille de 4 px qui ne
l'est pas aujourd'hui — différence délibérée, à signaler dans le rapport.

- [ ] **Étape 3 : vérifier qu'aucun ancien nom ne subsiste dans la zone**

```bash
grep -rnE "hairline|bg-bg\b|bg-raised|bg-high\b|surface-high|brand|ember-|lift-|bone-[0-9]|-ink-[0-9]|text-inverse|--n[123]" src/components/landing src/components/marketing
```

Attendu : **aucune sortie**.

- [ ] **Étape 4 : vérifier que la vitrine n'a pas bougé**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Puis, serveur via `preview_start` (`estio-dev`), sur `http://localhost:3000/` :

```js
(() => {
  const vitrine = document.querySelector('[data-theme="dark"]');
  const s = getComputedStyle(vitrine);
  // Relever la couleur effective de chaque bloc de premier niveau : c'est ce
  // qui trahirait une classe devenue muette.
  const blocs = [...vitrine.querySelectorAll('section')].slice(0, 12).map(e => {
    const c = getComputedStyle(e);
    return { fond: c.backgroundColor, texte: c.color, bordure: c.borderTopColor };
  });
  return {
    fondVitrine: s.backgroundColor,
    texteVitrine: s.color,
    transparents: blocs.filter(b => b.texte === 'rgba(0, 0, 0, 0)').length,
    blocs,
  };
})()
```

Attendu : `fondVitrine: "rgb(18, 17, 16)"`, `texteVitrine: "rgb(245, 242, 239)"`,
et `transparents: 0`. Puis `read_console_messages` : aucune erreur.

Parcourir également `/tarifs`, `/faq` et `/connexion` et confirmer que le fond
reste sombre sur chacune.

- [ ] **Étape 5 : commit**

```bash
git add src/components/landing src/components/marketing
git commit -m "refactor(vitrine): migrée vers les tokens bi-thème, rendu inchangé"
```

---

## Task 6 — supprimer les alias de compatibilité

C'est la tâche qui donne son sens à R2 : tant que les alias vivent, les deux
vocabulaires coexistent et rien n'empêche d'écrire à nouveau l'ancien.

**Fichiers :**
- Modifier : `src/app/globals.css`

- [ ] **Étape 1 : vérifier qu'aucun consommateur ne subsiste, dans tout `src`**

```bash
grep -rnE "hairline|bg-bg\b|bg-raised|bg-high\b|surface-high|brand-wash|brand-glow|brand-hot|bg-brand|text-brand|border-brand|outline-brand|ember-[0-9]|lift-[0-9]|bone-[0-9]|-ink-[0-9]|text-inverse|--n[123]|var\(--topbar\)|var\(--rail\)|--r-xs|--r-2xl" src
```

Attendu : **aucune sortie**. S'il en reste, les traiter avant de continuer —
c'est le dernier filet avant la suppression.

- [ ] **Étape 2 : supprimer le bloc d'alias de variables brutes**

Dans `src/app/globals.css`, supprimer entièrement le bloc commenté
« ALIAS DE VARIABLES BRUTES — À SUPPRIMER EN R2 », déclaré sur
`:root, [data-theme="light"], [data-theme="dark"]`, juste après les imports.

- [ ] **Étape 3 : supprimer les alias de la couche `@theme inline`**

Toujours dans `src/app/globals.css`, supprimer le bloc commenté
« ALIAS DE COMPATIBILITÉ — À SUPPRIMER EN R2 » de la couche `@theme inline`, avec
toutes ses entrées : `--color-bg`, `--color-raised`, `--color-high`,
`--color-inverse`, `--color-hairline*`, `--color-brand*`, `--color-ember-*`,
`--color-good-300/-100`, `--color-mid-300/-100`, `--color-risk-300/-100`,
`--color-ink-*`, `--color-bone-*`, `--radius-xs`, `--radius-2xl`.

- [ ] **Étape 4 : vérifier qu'il ne reste plus une seule référence orpheline**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

Puis, serveur via `preview_start` (`estio-dev`), sur `http://localhost:3000/`,
relever toutes les variables consommées par les feuilles de style et les
composants, et confirmer que chacune résout :

```js
(() => {
  const s = getComputedStyle(document.documentElement);
  const consommees = new Set();
  for (const f of document.styleSheets) {
    let regles; try { regles = f.cssRules; } catch { continue; }
    for (const r of regles) {
      const t = r.cssText || '';
      for (const m of t.matchAll(/var\((--[a-z0-9-]+)\)/g)) consommees.add(m[1]);
    }
  }
  const orphelines = [...consommees].filter(n =>
    !s.getPropertyValue(n).trim() && !n.startsWith('--font-') && n !== '--fill');
  return { nbConsommees: consommees.size, orphelines };
})()
```

Attendu : `orphelines: []`.

- [ ] **Étape 5 : parcourir les deux univers une dernière fois**

Sur `/` : la vitrine est sombre, aucun bloc à texte transparent.
Sur `/app/projects` puis sur une fiche de bien : l'outil est clair, et le DOM
contient bien les éléments attendus. `read_console_messages` : aucune erreur.

- [ ] **Étape 6 : commit**

```bash
git add src/app/globals.css
git commit -m "refactor(design): alias de compatibilité supprimés — un seul vocabulaire

Les 212 occurrences de hairline et les 111 de brand ont été migrées zone par
zone ; plus rien ne consomme l'ancien système."
```

---

## Vérification finale de R2

- [ ] `npx tsc --noEmit` — aucune erreur
- [ ] `npm run lint` — aucune erreur
- [ ] `npm run build` — succès
- [ ] Le `grep` de la Tâche 6 étape 1, lancé sur tout `src` — aucune sortie
- [ ] Aucune variable orpheline (script de la Tâche 6 étape 4)
- [ ] La vitrine est sombre, l'outil est clair, la carte affiche ses épingles
- [ ] Pousser sur `main` et demander la validation Vercel avant de cocher R2
