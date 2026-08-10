# R1 — Fondations bi-thème · plan d'implémentation

> **Pour les agents :** SOUS-SKILL REQUISE — utiliser `superpowers:subagent-driven-development`
> (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche.
> Les étapes utilisent la syntaxe `- [ ]` pour le suivi.

**Objectif :** remplacer le système de couleur monochrome sombre d'Estio par un
système bi-thème (clair par défaut dans l'outil, sombre disponible, vitrine
sombre conservée), sans casser un seul écran existant.

**Architecture :** `src/design/tokens.css` est réécrit en trois blocs — les
primitives hors thème (forme, espacement, mesures, mouvement), le thème clair sur
`:root, [data-theme="light"]`, le thème sombre sur `[data-theme="dark"]`. La
couche `@theme inline` de `globals.css` expose les nouveaux noms Tailwind **et
conserve les anciens en alias**, pour que les 212 occurrences de `hairline` et les
111 de `brand` continuent de fonctionner jusqu'à leur migration en R2. Un script
inline dans `layout.tsx` pose `data-theme` sur `<html>` avant la première peinture.

**Stack :** Next.js 16 (App Router), React 19, Tailwind CSS v4 (`@theme inline`),
CSS custom properties. Aucune dépendance ajoutée.

## Contraintes globales

- **Spec de référence :** `docs/superpowers/specs/2026-08-09-refonte-crm-design.md`.
  Toute valeur hexadécimale se lit là-bas, verbatim. Ne rien inventer.
- **Rien ne casse.** À la fin de R1, tous les écrans existants doivent s'afficher
  et fonctionner. Les couleurs changent ; les mises en page, non.
- **Tailwind v4 n'échoue pas sur un utilitaire inconnu** : il ne génère pas la
  règle, silencieusement. On ne peut donc jamais compter sur une erreur de build
  pour détecter un oubli — la vérification passe par `grep` et par lecture des
  valeurs calculées dans le navigateur.
- **Aucun composant ne lit une primitive.** Interdit : `#ffffff`, `--ink-800`,
  `--bone-300` dans un `.tsx`. Toujours un token sémantique.
- **Ni blanc pur ni noir pur** dans les neutres.
- **La vitrine reste sombre.** Le segment `(marketing)` porte `data-theme="dark"`.
- **Le grain de film et le calage focal disparaissent de l'outil**, et seulement
  de l'outil.
- **Commandes de vérification :** `npx tsc --noEmit`, `npm run lint`, et le
  serveur de développement via l'outil `preview_start` (`estio-dev`, port 3000).
  Ne jamais lancer le serveur avec Bash.
- **Français** dans tous les commentaires de code et messages de commit.
- **Les numéros de ligne cités dans ce plan sont indicatifs** : la tâche 2
  insère un bloc en tête de `globals.css` et décale tout ce qui suit. Repérer
  toujours le bloc par son **en-tête de commentaire** (`ÉCHELLE TYPOGRAPHIQUE`,
  `LE GESTE SIGNATURE`, `CARTE`…), jamais par sa ligne.
- **Pour les URL de vérification**, récupérer un identifiant réel : ouvrir
  `http://localhost:3000/app/projects` et lire le `href` d'une carte de projet
  (`/app/p/<id>`). Même méthode pour un bien depuis la vue Tableau.

---

## Structure des fichiers

| Fichier | Responsabilité après R1 |
|---|---|
| `src/design/tokens.css` | **Réécrit.** Primitives hors thème + les deux thèmes. Seul endroit où vit un hexadécimal. |
| `src/app/globals.css` | **Modifié.** Couche `@theme inline` (noms Tailwind + alias), base, échelle typo, utilitaires. Perd le grain global et le calage focal. |
| `src/lib/theme.ts` | **Créé.** Lecture/écriture de la préférence (thème, densité) et application sur `<html>`. Consommé par le script inline et, plus tard, par le menu de compte (R6). |
| `src/components/providers/ThemeScript.tsx` | **Créé.** Le `<script>` inline anti-flash, injecté dans `<head>`. |
| `src/app/layout.tsx` | **Modifié.** Injecte `ThemeScript`, `suppressHydrationWarning` sur `<html>`, `viewport` neutre. |
| `src/app/(marketing)/layout.tsx` | **Modifié.** Force `data-theme="dark"` et applique le grain sur la vitrine seule. |
| 7 composants de l'outil | **Modifiés.** Retrait des classes `focal-in` / `focal-stagger`. |

---

## Task 1 — réécrire `tokens.css`

**Fichiers :**
- Remplacer intégralement : `src/design/tokens.css`

**Interfaces :**
- Produit : les variables CSS consommées par la tâche 2 —
  `--sunken --canvas --surface --surface-hover --surface-active`,
  `--line --line-soft --line-strong`,
  `--text --text-2 --text-3 --text-4`,
  `--ink --ink-fg`,
  `--accent --accent-fg --accent-soft --accent-line`,
  `--good --mid --risk --none --info --danger` et leurs `-soft`,
  `--stage-analyser --stage-analyse --stage-visite --stage-nego --stage-offre --stage-ecarte`,
  `--stage-soft-alpha`,
  `--shadow-1 --shadow-2 --shadow-3 --shadow-4`, `--scrim`,
  `--r-sm --r-md --r-lg --r-xl --r-pill`,
  `--pad-x --bar-h --rail-w --rail-w-min --row-h`,
  `--t-fast --t-base --t-slow --t-cine --t-cine-long`,
  `--e-out --e-focal --e-swing`,
  `--gutter --measure --shell-max --grain`.

- [ ] **Étape 1 : remplacer le contenu du fichier**

Écrire ceci **à la place de tout** le contenu actuel de `src/design/tokens.css` :

```css
/* =============================================================================
   ESTIO — SYSTÈME BI-THÈME
   =============================================================================

   Trois blocs, dans cet ordre :

     1. LES PRIMITIVES HORS THÈME — forme, espacement, mesures, mouvement.
        Elles ne changent jamais d'un thème à l'autre.
     2. LE THÈME CLAIR — le défaut de l'outil.
     3. LE THÈME SOMBRE — la surcharge.

   Trois systèmes chromatiques ÉTANCHES, et c'est la règle qui compte :

     — L'ACTION   : l'encre (bouton primaire) et la braise (état actif, focus,
                    lien, sélection). Ne dit jamais si un bien est bon.
     — L'ÉTAPE    : un dégradé froid, ardoise → magenta. Ne dit jamais si un
                    bien est bon non plus : une étape est une position, pas un
                    jugement. Aucune teinte verte, ambrée ou rouge ici.
     — LE VERDICT : vert, ambre, rouge. Ces trois familles n'appartiennent qu'à
                    lui.

   C'est la correction d'un défaut logique de la v2, où « Offre » était vert et
   « bon dossier » aussi.

   ⚠ Le sélecteur du thème sombre est un ATTRIBUT NU, `[data-theme="dark"]`, et
   non `:root[data-theme="dark"]` : la vitrine doit pouvoir rester sombre en
   posant l'attribut sur un simple conteneur pendant que <html> reste clair.
   ========================================================================== */

/* =============================================================================
   1. PRIMITIVES HORS THÈME
   ========================================================================== */

:root {
  /* --- FORME. Le rayon de 2 px de la v2 disparaît : il donnait des arêtes
         rigides sans rien apporter. ------------------------------------- */
  --r-sm: 6px;   /* contrôles, pastilles, champs */
  --r-md: 10px;  /* cartes */
  --r-lg: 14px;  /* panneaux, colonnes de board */
  --r-xl: 18px;  /* modales */
  --r-pill: 999px;

  /* --- ESPACEMENT. Échelle 4 px stricte. ---------------------------------- */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-14: 56px;
  --sp-18: 72px;

  /* --- MESURES DE LA COQUE.
         Une seule gouttière d'écran : c'est elle qui fait que le rail, la barre
         et le contenu s'alignent enfin verticalement. --bar-h vaut AUSSI pour
         l'en-tête du rail — la coexistence de deux hauteurs proches était la
         cause du décalage entre le logo et le nom du projet. --------------- */
  --pad-x: 20px;
  --bar-h: 52px;
  --rail-w: 248px;
  --rail-w-min: 56px;
  --row-h: 44px;

  /* --- MOUVEMENT.
         L'outil se règle en dessous de 300 ms. --e-focal et --t-cine ne
         servent plus qu'à la vitrine. ------------------------------------- */
  --t-fast: 120ms;
  --t-base: 180ms;
  --t-slow: 280ms;
  --t-cine: 1200ms;
  --t-cine-long: 1800ms;

  --e-out: cubic-bezier(0.2, 0, 0, 1);
  --e-focal: cubic-bezier(0.16, 1, 0.3, 1);
  --e-swing: cubic-bezier(0.65, 0, 0.35, 1);

  /* --- GRILLE & MESURE — vitrine. ---------------------------------------- */
  --gutter: 5vw;
  --measure: 68ch;
  --shell-max: 108rem;

  /* --- MATIÈRE — grain de film. Vitrine uniquement depuis R1. ------------- */
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* La densité compacte ne touche qu'une mesure : la hauteur de rangée. */
[data-density="compact"] {
  --row-h: 36px;
}

/* =============================================================================
   2. THÈME CLAIR — le défaut de l'outil.
   ========================================================================== */

:root,
[data-theme="light"] {
  color-scheme: light;

  /* --- SURFACES. Cinq niveaux réellement écartés. En clair, « enfoncé » est
         plus SOMBRE que le fond de scène, et la carte est blanche. -------- */
  --sunken: #efedea;          /* rail, colonne de board, en-tête de tableau */
  --canvas: #f7f6f4;          /* fond de scène */
  --surface: #ffffff;         /* carte, panneau, popover, ligne de tableau */
  --surface-hover: #f5f3f0;
  --surface-active: #ebe8e3;

  /* --- FILETS. Trois rôles, trois tokens, jamais interchangeables. -------- */
  --line: #e3dfd9;            /* structurel — sépare deux zones */
  --line-soft: #efece8;       /* interne — lignes d'un tableau */
  --line-strong: #cfc9c1;     /* contour de champ, bordure au survol */

  /* --- TEXTE. Encre chaude, jamais noir pur. ----------------------------- */
  --text: #1c1917;
  --text-2: #57534e;
  --text-3: #8a827a;
  --text-4: #a8a29b;

  /* --- ACTION.
         Le bouton primaire descend de la braise vers l'encre, ce qui libère la
         braise pour ce qu'elle fait le mieux : dire où l'on se trouve. ----- */
  --ink: #1c1917;
  --ink-fg: #ffffff;

  --accent: #e8590c;
  --accent-fg: #ffffff;
  --accent-soft: rgb(232 89 12 / 0.09);
  --accent-line: rgb(232 89 12 / 0.34);

  /* --- VERDICT. Vert, ambre, rouge — et rien d'autre ne les emprunte. ----- */
  --good: #2f8f5b;
  --good-soft: rgb(47 143 91 / 0.12);
  --mid: #c08328;
  --mid-soft: rgb(192 131 40 / 0.12);
  --risk: #c4453c;
  --risk-soft: rgb(196 69 60 / 0.12);
  --none: #a8a29b;
  --none-soft: rgb(168 162 155 / 0.12);

  --info: #2b6f8f;
  --info-soft: rgb(43 111 143 / 0.1);
  --danger: #c4453c;
  --danger-soft: rgb(196 69 60 / 0.12);

  /* --- ÉLÉVATION. En clair, l'ombre est douce et large. ------------------- */
  --shadow-1: 0 1px 2px rgb(28 25 23 / 0.06), 0 1px 1px rgb(28 25 23 / 0.04);
  --shadow-2: 0 8px 24px -6px rgb(28 25 23 / 0.14), 0 2px 6px rgb(28 25 23 / 0.06);
  --shadow-3: 0 24px 64px -12px rgb(28 25 23 / 0.22);
  --shadow-4: 0 32px 80px -16px rgb(28 25 23 / 0.3);

  --scrim: rgb(28 25 23 / 0.4);
}

/* --- ÉTAPES DU PIPELINE.
       Identiques dans les deux thèmes : elles sont posées ici, hors de la
       surcharge sombre, et en héritent donc partout. Seule l'opacité des fonds
       doux change d'un thème à l'autre. ------------------------------------ */
:root {
  --stage-analyser: #8fa3b8;  /* ardoise */
  --stage-analyse: #5b8def;   /* bleu */
  --stage-visite: #6d6bef;    /* indigo */
  --stage-nego: #9457e8;      /* violet */
  --stage-offre: #c94ec9;     /* magenta */
  --stage-ecarte: #a8a29b;    /* gris chaud */
  --stage-soft-alpha: 0.12;
}

/* =============================================================================
   3. THÈME SOMBRE
   ========================================================================== */

[data-theme="dark"] {
  color-scheme: dark;

  --sunken: #0b0a09;
  --canvas: #121110;
  --surface: #1a1917;
  --surface-hover: #221f1d;
  --surface-active: #2a2724;

  --line: #2e2b28;
  --line-soft: #232120;
  --line-strong: #423d38;

  --text: #f5f2ef;
  --text-2: #b5aca3;
  --text-3: #857d75;
  --text-4: #635c55;

  --ink: #f5f2ef;
  --ink-fg: #121110;

  --accent: #ff6a1a;
  --accent-fg: #121110;
  --accent-soft: rgb(255 106 26 / 0.14);
  --accent-line: rgb(255 106 26 / 0.4);

  --good: #84b394;
  --good-soft: rgb(132 179 148 / 0.16);
  --mid: #d9b678;
  --mid-soft: rgb(217 182 120 / 0.16);
  --risk: #c4706a;
  --risk-soft: rgb(196 112 106 / 0.16);
  --none: #8a8078;
  --none-soft: rgb(138 128 120 / 0.16);

  --info: #8fb4ca;
  --info-soft: rgb(143 180 202 / 0.14);
  --danger: #c4706a;
  --danger-soft: rgb(196 112 106 / 0.16);

  --stage-soft-alpha: 0.18;

  /* Dans le noir, l'ombre est plus dense et plus courte. */
  --shadow-1: 0 1px 2px rgb(0 0 0 / 0.5);
  --shadow-2: 0 8px 24px -6px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.4);
  --shadow-3: 0 24px 64px -12px rgb(0 0 0 / 0.75);
  --shadow-4: 0 32px 80px -16px rgb(0 0 0 / 0.85);

  --scrim: rgb(6 5 5 / 0.74);
}
```

- [ ] **Étape 2 : vérifier qu'aucune primitive de la v2 ne subsiste**

```bash
grep -nE "ink-9|ink-8|ink-7|bone-|ember-|good-500|frost-|--hairline|--brand|--lift-|--r-xs|--r-2xl|--topbar|--rail:" src/design/tokens.css
```

Attendu : **aucune sortie**. Toute ligne retournée est un reste de la v2 à
supprimer.

- [ ] **Étape 3 : commit**

```bash
git add src/design/tokens.css
git commit -m "refactor(design): tokens bi-thème — trois systèmes chromatiques étanches"
```

> À ce stade l'application est **cassée visuellement** : `globals.css` référence
> encore `--bg`, `--ink-800`, `--hairline`… La tâche 2 la répare. C'est le seul
> moment du plan où l'écran est incohérent, et il ne dure qu'une tâche.

---

## Task 2 — recâbler la couche `@theme` de `globals.css`

**Fichiers :**
- Modifier : `src/app/globals.css:8-68` (le bloc `@theme inline`) et `:74-133`
  (le bloc BASE)

**Interfaces :**
- Consomme : toutes les variables produites par la tâche 1.
- Produit : les utilitaires Tailwind `bg-canvas bg-sunken bg-surface
  bg-surface-hover bg-surface-active bg-ink text-ink-fg bg-accent text-accent
  border-line border-line-soft border-line-strong text-text text-text-2/3/4
  text-good/mid/risk/none/info/danger bg-stage-*`, plus **les alias de
  compatibilité** que R2 supprimera.

- [ ] **Étape 1 : remplacer le bloc `@theme inline`**

Remplacer les lignes 8 à 68 de `src/app/globals.css` par :

```css
@theme inline {
  /* --- Surfaces ---------------------------------------------------------- */
  --color-canvas: var(--canvas);
  --color-sunken: var(--sunken);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);
  --color-surface-active: var(--surface-active);

  /* --- Filets ------------------------------------------------------------ */
  --color-line: var(--line);
  --color-line-soft: var(--line-soft);
  --color-line-strong: var(--line-strong);

  /* --- Texte ------------------------------------------------------------- */
  --color-text: var(--text);
  --color-text-2: var(--text-2);
  --color-text-3: var(--text-3);
  --color-text-4: var(--text-4);

  /* --- Action ------------------------------------------------------------ */
  --color-ink: var(--ink);
  --color-ink-fg: var(--ink-fg);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);

  /* --- Verdict ----------------------------------------------------------- */
  --color-good: var(--good);
  --color-mid: var(--mid);
  --color-risk: var(--risk);
  --color-none: var(--none);
  --color-info: var(--info);
  --color-danger: var(--danger);

  /* --- Étapes du pipeline ------------------------------------------------ */
  --color-stage-analyser: var(--stage-analyser);
  --color-stage-analyse: var(--stage-analyse);
  --color-stage-visite: var(--stage-visite);
  --color-stage-nego: var(--stage-nego);
  --color-stage-offre: var(--stage-offre);
  --color-stage-ecarte: var(--stage-ecarte);

  /* --- Forme ------------------------------------------------------------- */
  --radius-sm: var(--r-sm);
  --radius-md: var(--r-md);
  --radius-lg: var(--r-lg);
  --radius-xl: var(--r-xl);

  /* --- Typographie ------------------------------------------------------- */
  --font-sans: var(--font-grotesk), "Helvetica Neue", Arial, sans-serif;
  --font-mono: var(--font-mono-jb), ui-monospace, "SF Mono", monospace;

  /* =========================================================================
     ALIAS DE COMPATIBILITÉ — À SUPPRIMER EN R2.
     `hairline` apparaît 212 fois dans le code, `brand` 111 fois. Tailwind v4
     n'échoue PAS sur un utilitaire inconnu : il ne génère simplement pas la
     règle, et l'élément devient transparent sans que rien ne le signale. On
     garde donc les anciens noms vivants le temps de la migration, puis on
     supprime ce bloc et on vérifie par `grep`, pas par un build vert.
     ====================================================================== */
  --color-bg: var(--canvas);
  --color-raised: var(--surface-hover);
  --color-high: var(--surface);
  --color-inverse: var(--ink-fg);

  --color-hairline: var(--line-soft);
  --color-hairline-2: var(--line);
  --color-hairline-3: var(--line-strong);

  --color-brand: var(--accent);
  --color-brand-hot: var(--accent);
  --color-ember-100: var(--accent-soft);
  --color-ember-200: var(--accent-line);
  --color-ember-700: var(--accent);
  --color-ember-900: var(--accent);

  --color-good-300: var(--good);
  --color-good-100: var(--good-soft);
  --color-mid-300: var(--mid);
  --color-mid-100: var(--mid-soft);
  --color-risk-300: var(--risk);
  --color-risk-100: var(--risk-soft);

  --color-ink-700: var(--surface);
  --color-ink-600: var(--surface-active);
  --color-ink-500: var(--line-strong);
  --color-bone-300: var(--text-2);
  --color-bone-400: var(--text-3);

  --radius-xs: var(--r-sm);
  --radius-2xl: var(--r-xl);
}
```

- [ ] **Étape 2 : ajouter les alias de variables brutes**

Certains composants n'utilisent pas les classes Tailwind mais les variables
directement — `var(--brand-wash)`, `var(--risk-wash)`, `var(--lift-3)`,
`var(--ember-700)`, `var(--r-pill)`. Ajouter ce bloc **juste après**
`@import "../design/tokens.css";` (donc autour de la ligne 3) :

```css
/* =============================================================================
   ALIAS DE VARIABLES BRUTES — À SUPPRIMER EN R2.
   Les composants qui écrivent `var(--brand-wash)` ou `var(--lift-3)` en dur
   continuent de fonctionner pendant la migration.

   ⚠ LES TROIS SÉLECTEURS SONT INDISPENSABLES. Une propriété personnalisée qui
   en référence une autre est substituée là où elle est DÉCLARÉE, puis héritée
   comme valeur calculée. Déclarés sur `:root` seul, ces alias figeraient donc
   les valeurs CLAIRES et les transmettraient tels quels à l'intérieur de la
   vitrine sombre — qui deviendrait un fond noir avec des filets clairs. En
   listant aussi les deux sélecteurs de thème, chaque conteneur qui porte un
   thème redéclare ses alias à partir de son propre `--accent`.
   ========================================================================== */
:root,
[data-theme="light"],
[data-theme="dark"] {
  --bg: var(--canvas);
  --bg-sunken: var(--sunken);
  --surface-raised: var(--surface-hover);
  --surface-high: var(--surface-active);
  --surface-scrim: var(--scrim);

  --hairline: var(--line-soft);
  --hairline-2: var(--line);
  --hairline-3: var(--line-strong);
  --hairline-ember: var(--accent-line);

  --brand: var(--accent);
  --brand-hot: var(--accent);
  --brand-wash: var(--accent-soft);
  --brand-wash-2: var(--accent-line);
  --brand-glow: var(--accent-line);
  --ember-700: var(--accent);

  --good-wash: var(--good-soft);
  --mid-wash: var(--mid-soft);
  --risk-wash: var(--risk-soft);
  --info-wash: var(--info-soft);
  --danger-wash: var(--danger-soft);

  --lift-1: var(--shadow-1);
  --lift-2: var(--shadow-2);
  --lift-3: var(--shadow-3);

  --ink-950: var(--ink-fg);
  --ink-600: var(--surface-active);
  --ink-500: var(--line-strong);
  --ink-400: var(--text-4);
  --bone-100: var(--text);
  --bone-400: var(--text-3);

  --r-xs: var(--r-sm);
  --r-2xl: var(--r-xl);

  --topbar: var(--bar-h);
  --rail: var(--rail-w);
}
```

- [ ] **Étape 3 : corriger le bloc BASE**

Dans `src/app/globals.css`, remplacer le bloc `html { … }` / `body { … }`
(lignes 74 à 87 environ) par :

```css
html {
  background: var(--canvas);
}

body {
  background: var(--canvas);
  color: var(--text);
  font-family: var(--font-grotesk), "Helvetica Neue", Arial, sans-serif;
  font-feature-settings: "ss01" 1, "ss03" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

`color-scheme` disparaît d'ici : il est désormais porté par le thème, dans
`tokens.css`.

Puis, dans le même fichier, remplacer les deux règles suivantes :

```css
::selection {
  background: var(--accent);
  color: var(--accent-fg);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--r-sm);
}
```

Et la barre de défilement :

```css
* {
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}
*::-webkit-scrollbar-thumb {
  background: var(--line-strong);
  border-radius: var(--r-pill);
  border: 2px solid transparent;
  background-clip: content-box;
}
*::-webkit-scrollbar-thumb:hover {
  background: var(--text-4);
  background-clip: content-box;
}
```

- [ ] **Étape 4 : vérifier la compilation**

```bash
npx tsc --noEmit && npm run lint
```

Attendu : aucune erreur.

- [ ] **Étape 5 : vérifier les valeurs calculées dans le navigateur**

Ouvrir la prévisualisation avec `preview_start` sur la configuration
`estio-dev`, naviguer vers `http://localhost:3000/app/projects`, puis exécuter
avec `javascript_tool` :

```js
(() => {
  const s = getComputedStyle(document.documentElement);
  const lire = (n) => s.getPropertyValue(n).trim();
  return {
    canvas: lire('--canvas'),
    surface: lire('--surface'),
    accent: lire('--accent'),
    texte: lire('--text'),
    aliasHairline: lire('--hairline'),
    fondBody: getComputedStyle(document.body).backgroundColor,
  };
})()
```

Attendu exactement :
`canvas: "#f7f6f4"`, `surface: "#ffffff"`, `accent: "#e8590c"`,
`texte: "#1c1917"`, `aliasHairline: "#efece8"`,
`fondBody: "rgb(247, 246, 244)"`.

Puis vérifier la console avec `read_console_messages` : aucune erreur.

- [ ] **Étape 6 : commit**

```bash
git add src/app/globals.css
git commit -m "refactor(design): couche @theme recâblée sur les tokens bi-thème

Les anciens noms (hairline, brand, raised, lift-*) restent en alias le temps
de la migration des 212 occurrences prévue en R2."
```

---

## Task 3 — purger le grain, le calage focal et le filtre de carte

**Fichiers :**
- Modifier : `src/app/globals.css` (blocs GRAIN, CALAGE FOCAL, CARTE, ÉCHELLE
  TYPOGRAPHIQUE, ACCESSIBILITÉ)
- Modifier : `src/app/(app)/app/projects/page.tsx`
- Modifier : `src/components/app/fiche/FicheShell.tsx`
- Modifier : `src/components/app/fiche/SectionCalculs.tsx`
- Modifier : `src/components/app/fiche/SectionFinancement.tsx`
- Modifier : `src/components/app/PipelineBoard.tsx`
- Modifier : `src/components/app/PropertyTable.tsx`
- Modifier : `src/components/ui/InfoTip.tsx`

**Interfaces :**
- Produit : la classe utilitaire `.grain`, appliquée par la vitrine en tâche 5.
  Les classes `focal-in`, `focal-in-slow`, `focal-stagger` **n'existent plus**.

- [ ] **Étape 1 : déplacer le grain dans une classe**

Dans `src/app/globals.css`, remplacer la règle `body::after { … }` (lignes 89 à
100 environ) par :

```css
/* =============================================================================
   GRAIN DE FILM — VITRINE UNIQUEMENT.
   Il empêchait le noir d'être plat, ce qui était juste. Mais il salit les
   aplats clairs, et à la densité d'un CRM il ajoute du bruit là où on cherche
   de la précision. Il devient donc une classe, que seule la vitrine applique.
   ========================================================================== */
.grain {
  position: relative;
}
.grain::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: var(--grain);
  background-size: 180px 180px;
  opacity: 0.026;
  mix-blend-mode: overlay;
}
```

- [ ] **Étape 2 : supprimer le calage focal**

Dans `src/app/globals.css`, **supprimer entièrement** le bloc « LE GESTE
SIGNATURE — LE CALAGE FOCAL » : le `@keyframes focal-settle` et les règles
`.focal-in`, `.focal-in-slow`, `.focal-stagger` avec leurs sept délais
(lignes 219 à 252 environ).

Supprimer aussi, dans le bloc `@media (prefers-reduced-motion: reduce)`, les
trois sélecteurs devenus orphelins :

```css
  .focal-in,
  .focal-in-slow,
  .focal-stagger > * {
```

...et le corps de règle qui les suit.

Justification à mettre en commentaire à la place du bloc supprimé :

```css
/* Le calage focal (flou de 9 px à l'entrée) vivait ici. Retiré de l'outil : un
   flou à chaque rendu de liste donne une impression de lenteur dans un logiciel
   qu'on utilise huit heures par jour. Il reste en vigueur sur la vitrine, où
   il est joué par GSAP au défilement. */
```

- [ ] **Étape 3 : retirer les classes des sept composants**

Retirer `focal-in`, `focal-in-slow` et `focal-stagger` des `className` — **sans
toucher au reste de la chaîne de classes** :

| Fichier | Occurrence |
|---|---|
| `src/app/(app)/app/projects/page.tsx` | `className="focal-in"` sur le `<header>` → supprimer l'attribut ; `focal-stagger grid gap-3` → `grid gap-3` |
| `src/components/app/PipelineBoard.tsx` | `rail-x focal-stagger flex min-h-0…` → `rail-x flex min-h-0…` |
| `src/components/app/PropertyTable.tsx` | `focal-in absolute right-0 top-full…` → `absolute right-0 top-full…` |
| `src/components/app/fiche/FicheShell.tsx` | `focal-stagger flex min-w-0 flex-col gap-5` → `flex min-w-0 flex-col gap-5` |
| `src/components/app/fiche/SectionCalculs.tsx` | retirer la classe, garder le reste |
| `src/components/app/fiche/SectionFinancement.tsx` | retirer la classe, garder le reste |
| `src/components/ui/InfoTip.tsx` | retirer la classe, garder le reste |

- [ ] **Étape 4 : conditionner le filtre de la carte au thème sombre**

Le filtre de désaturation de MapLibre est conçu pour le noir : appliqué sur un
thème clair, il donne une carte grise et sale. Dans `src/app/globals.css`,
remplacer les deux règles `.estio-map.estio-map--dark .maplibregl-canvas` et
`.estio-map.estio-map--detailed .maplibregl-canvas` par :

```css
/* Le filtre n'a de sens que dans le thème sombre. En clair, la tuile
   d'OpenFreeMap s'affiche telle quelle — elle est déjà faite pour ça. */
[data-theme="dark"] .estio-map.estio-map--dark .maplibregl-canvas {
  filter: saturate(0.28) sepia(0.22) brightness(0.8) contrast(1.1);
}

[data-theme="dark"] .estio-map.estio-map--detailed .maplibregl-canvas {
  filter: invert(1) hue-rotate(180deg) saturate(0.35) brightness(0.9) contrast(1.05);
}
```

Et remplacer le fond de l'attribution, qui était codé en dur :

```css
.estio-map .maplibregl-ctrl-attrib {
  background: color-mix(in srgb, var(--canvas) 82%, transparent) !important;
  backdrop-filter: blur(4px);
  border-radius: var(--r-sm) 0 0 0;
  font-size: 10px;
  padding: 2px 6px;
}
.estio-map .maplibregl-ctrl-attrib a {
  color: var(--text-3);
}
.estio-map .maplibregl-ctrl-attrib-button {
  filter: none;
  opacity: 0.5;
}
```

Ainsi que l'anneau de l'épingle, qui supposait un fond noir :

```css
.estio-pin {
  position: relative;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 0 2px var(--canvas);
  transition: transform var(--t-base) var(--e-out);
}
```

Et l'ombre du popup :

```css
.estio-map .maplibregl-popup-content {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 12px 14px;
  box-shadow: var(--shadow-2);
}
```

- [ ] **Étape 5 : ajouter l'échelle typographique fixe**

Dans `src/app/globals.css`, **juste après** la règle `.t-label`, ajouter :

```css
/* -----------------------------------------------------------------------------
   ÉCHELLE DE L'OUTIL — six tailles, et pas une de plus.
   Elle remplace les `text-[13.5px]`, `text-[12.5px]`, `!text-[9px]` dispersés
   dans les composants : c'est cette dispersion qui produisait le sentiment que
   « rien n'est aligné ». Les composants migreront dessus en R3.
   -------------------------------------------------------------------------- */
.t-xs   { font-size: 11px; line-height: 1.4; }
.t-sm   { font-size: 12px; line-height: 1.4; }
.t-base { font-size: 13px; line-height: 1.5; }
.t-md   { font-size: 15px; line-height: 1.4; letter-spacing: -0.011em; }
.t-lg   { font-size: 20px; line-height: 1.3; letter-spacing: -0.018em; font-weight: 500; }
.t-xl   { font-size: 28px; line-height: 1.2; letter-spacing: -0.026em; font-weight: 500; }
```

- [ ] **Étape 6 : vérifier**

```bash
npx tsc --noEmit && npm run lint && grep -rnE "focal-in|focal-stagger" src
```

Attendu : aucune erreur, et **aucune sortie du `grep`**.

- [ ] **Étape 7 : vérifier visuellement**

Recharger `http://localhost:3000/app/projects` puis
`http://localhost:3000/app/p/<un-id-de-projet>?view=carte`, prendre une capture
avec `computer {action:"screenshot"}`. Attendu : la page apparaît **sans flou
d'entrée**, la carte est claire et lisible, aucune erreur dans
`read_console_messages`.

- [ ] **Étape 8 : commit**

```bash
git add src/app/globals.css "src/app/(app)/app/projects/page.tsx" src/components
git commit -m "refactor(design): grain en classe, calage focal retiré de l'outil

Le flou d'entrée à chaque rendu de liste donnait une impression de lenteur.
Le filtre de désaturation de la carte est conditionné au thème sombre."
```

---

## Task 4 — préférence de thème et script anti-flash

**Fichiers :**
- Créer : `src/lib/theme.ts`
- Créer : `src/components/providers/ThemeScript.tsx`
- Modifier : `src/app/layout.tsx`

**Interfaces :**
- Consomme : les attributs `data-theme` / `data-density` définis en tâche 1.
- Produit :
  - `type Theme = "light" | "dark" | "system"`
  - `type Density = "confortable" | "compact"`
  - `THEME_STORAGE_KEY: string`, `DENSITY_STORAGE_KEY: string`
  - `lireTheme(): Theme`, `ecrireTheme(t: Theme): void`
  - `lireDensite(): Density`, `ecrireDensite(d: Density): void`
  - `appliquerPreferences(): void`
  - `<ThemeScript />` — composant serveur sans props.

  Le menu de compte de **R6** consommera `lireTheme` / `ecrireTheme` ;
  ne pas renommer ces fonctions.

- [ ] **Étape 1 : créer `src/lib/theme.ts`**

```ts
/**
 * Préférences d'affichage — thème et densité.
 *
 * Elles vivent dans `localStorage` et se traduisent en attributs sur <html>,
 * lus par `tokens.css`. Aucun état React : le thème doit être posé AVANT la
 * première peinture, ce qu'un composant client ne peut pas faire.
 */

export type Theme = "light" | "dark" | "system";
export type Density = "confortable" | "compact";

export const THEME_STORAGE_KEY = "estio.theme";
export const DENSITY_STORAGE_KEY = "estio.density";

const THEMES: readonly Theme[] = ["light", "dark", "system"];
const DENSITES: readonly Density[] = ["confortable", "compact"];

/** Le thème réellement appliqué, une fois « système » résolu. */
export function resoudreTheme(theme: Theme): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function lireTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const brut = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(brut as Theme) ? (brut as Theme) : "light";
}

export function ecrireTheme(theme: Theme): void {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.dataset.theme = resoudreTheme(theme);
}

export function lireDensite(): Density {
  if (typeof window === "undefined") return "confortable";
  const brut = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return DENSITES.includes(brut as Density) ? (brut as Density) : "confortable";
}

export function ecrireDensite(densite: Density): void {
  window.localStorage.setItem(DENSITY_STORAGE_KEY, densite);
  document.documentElement.dataset.density = densite;
}

/** Repose les deux attributs depuis le stockage. Utile après une hydratation. */
export function appliquerPreferences(): void {
  document.documentElement.dataset.theme = resoudreTheme(lireTheme());
  document.documentElement.dataset.density = lireDensite();
}
```

- [ ] **Étape 2 : créer `src/components/providers/ThemeScript.tsx`**

```tsx
/**
 * Le thème doit être posé sur <html> AVANT la première peinture, sinon la page
 * s'affiche en clair puis bascule — un clignotement blanc d'autant plus visible
 * qu'on vient d'une page sombre. Un composant client ne peut pas le faire : il
 * s'exécute après l'hydratation. D'où ce script inline, synchrone, dans <head>.
 *
 * Il duplique volontairement la logique de `lib/theme.ts` : ce code doit tenir
 * en une chaîne de caractères, sans import ni compilation.
 */
const SCRIPT = `(function(){try{
var t=localStorage.getItem("estio.theme")||"light";
var r=t==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;
var d=localStorage.getItem("estio.density")||"confortable";
var e=document.documentElement;
e.dataset.theme=r;e.dataset.density=d;
}catch(_){document.documentElement.dataset.theme="light";}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
```

- [ ] **Étape 3 : brancher le script dans `src/app/layout.tsx`**

Trois modifications dans ce fichier :

1. Ajouter l'import en tête :

```tsx
import { ThemeScript } from "@/components/providers/ThemeScript";
```

2. Remplacer le bloc `export const viewport` :

```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};
```

`colorScheme` disparaît d'ici : il est porté par le thème dans `tokens.css`, et
le laisser à `"dark"` forcerait les contrôles natifs en sombre sur un fond clair.

3. Remplacer le corps du composant :

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `suppressHydrationWarning` : le script inline modifie `data-theme` sur
    // <html> avant l'hydratation, donc le serveur et le client diffèrent
    // nécessairement sur cet attribut. C'est le cas d'usage exact prévu par
    // React pour cette échappatoire.
    <html
      lang="fr"
      data-theme="light"
      data-density="confortable"
      suppressHydrationWarning
      className={`h-full antialiased ${grotesk.variable} ${mono.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-text">{children}</body>
    </html>
  );
}
```

- [ ] **Étape 4 : vérifier la compilation**

```bash
npx tsc --noEmit && npm run lint
```

Attendu : aucune erreur.

- [ ] **Étape 5 : vérifier la bascule des deux thèmes**

Recharger `http://localhost:3000/app/projects`, puis avec `javascript_tool` :

```js
(() => {
  const lire = () => {
    const s = getComputedStyle(document.documentElement);
    return {
      theme: document.documentElement.dataset.theme,
      canvas: s.getPropertyValue('--canvas').trim(),
      surface: s.getPropertyValue('--surface').trim(),
      texte: s.getPropertyValue('--text').trim(),
    };
  };
  const clair = lire();
  localStorage.setItem('estio.theme', 'dark');
  document.documentElement.dataset.theme = 'dark';
  const sombre = lire();
  localStorage.setItem('estio.theme', 'light');
  document.documentElement.dataset.theme = 'light';
  return { clair, sombre };
})()
```

Attendu :
`clair: { theme: "light", canvas: "#f7f6f4", surface: "#ffffff", texte: "#1c1917" }`
`sombre: { theme: "dark", canvas: "#121110", surface: "#1a1917", texte: "#f5f2ef" }`

Vérifier ensuite `read_console_messages` : **aucune erreur d'hydratation**
(chercher `Hydration` et `did not match`).

- [ ] **Étape 6 : vérifier l'absence de clignotement**

Poser `localStorage.setItem('estio.theme','dark')`, puis naviguer à nouveau vers
`http://localhost:3000/app/projects` et prendre une capture immédiatement.
Attendu : la page arrive **déjà sombre**, sans passage par un fond clair.

- [ ] **Étape 7 : commit**

```bash
git add src/lib/theme.ts src/components/providers/ThemeScript.tsx src/app/layout.tsx
git commit -m "feat(design): préférence de thème et de densité, posée avant peinture

Script inline synchrone dans <head> : un composant client s'exécuterait après
l'hydratation et la page clignoterait en clair avant de basculer."
```

---

## Task 5 — maintenir la vitrine en sombre

**Fichiers :**
- Modifier : `src/app/(marketing)/layout.tsx`

**Interfaces :**
- Consomme : le sélecteur `[data-theme="dark"]` (tâche 1) et la classe `.grain`
  (tâche 3).

- [ ] **Étape 1 : envelopper la vitrine**

Remplacer intégralement `src/app/(marketing)/layout.tsx` par :

```tsx
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MarketingChrome } from "@/components/layout/MarketingChrome";

/**
 * La vitrine reste nocturne pendant que l'outil passe en clair.
 *
 * C'est possible parce que le thème sombre est défini sur un sélecteur
 * d'attribut nu — `[data-theme="dark"]` et non `:root[data-theme="dark"]` :
 * il s'applique donc à n'importe quel conteneur, pendant que <html> reste
 * clair. Le grain de film, retiré de l'outil, redevient ici ce qu'il était :
 * ce qui empêche le noir d'être plat.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="grain min-h-screen bg-canvas text-text">
      <SmoothScroll>
        <MarketingChrome>{children}</MarketingChrome>
      </SmoothScroll>
    </div>
  );
}
```

- [ ] **Étape 2 : vérifier la compilation**

```bash
npx tsc --noEmit && npm run lint
```

Attendu : aucune erreur.

- [ ] **Étape 3 : vérifier que les deux univers coexistent**

Naviguer vers `http://localhost:3000/`, puis avec `javascript_tool` :

```js
(() => {
  const vitrine = document.querySelector('[data-theme="dark"]');
  const s = getComputedStyle(vitrine);
  return {
    themeHtml: document.documentElement.dataset.theme,
    fondVitrine: s.backgroundColor,
    texteVitrine: s.color,
    grain: getComputedStyle(vitrine, '::after').backgroundImage.slice(0, 20),
  };
})()
```

Attendu : `themeHtml: "light"`, `fondVitrine: "rgb(18, 17, 16)"`,
`texteVitrine: "rgb(245, 242, 239)"`, et `grain` commençant par `url("data:image`.

Prendre une capture de la page d'accueil : elle doit rester **exactement aussi
sombre qu'avant**. Puis naviguer vers `/app/projects` : l'outil doit être clair.

- [ ] **Étape 4 : parcourir les écrans et relever les régressions**

Ouvrir successivement, en thème clair, et prendre une capture de chacun :

1. `/app/projects`
2. `/app/p/<id>` (Pipeline)
3. `/app/p/<id>?view=tableau`
4. `/app/p/<id>?view=carte`
5. `/app/p/<id>/bien/<idBien>`

Consigner dans le message de commit tout élément devenu illisible. **Ne pas les
corriger ici** : les composants sont migrés en R2 et R3. Le seul défaut qui
justifie une correction immédiate est un texte parfaitement invisible (contraste
nul), auquel cas ajuster l'alias concerné dans `globals.css`.

- [ ] **Étape 5 : commit**

```bash
git add "src/app/(marketing)/layout.tsx"
git commit -m "feat(design): la vitrine reste sombre, l'outil passe en clair"
```

---

## Vérification finale de R1

- [ ] `npx tsc --noEmit` — aucune erreur
- [ ] `npm run lint` — aucune erreur
- [ ] `npm run build` — succès
- [ ] `grep -rnE "focal-in|focal-stagger" src` — aucune sortie
- [ ] `grep -rn "ink-9\|bone-0\|ember-0" src/design/tokens.css` — aucune sortie
- [ ] La page d'accueil est sombre, `/app/**` est clair
- [ ] `localStorage.estio.theme = "dark"` rend l'outil sombre sans clignotement
- [ ] Aucune erreur d'hydratation dans la console
- [ ] Pousser sur `main` et demander la validation Vercel avant de cocher R1
