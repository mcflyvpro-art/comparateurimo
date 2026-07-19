# Estio — Brandkit & Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser l'identité de marque Estio et un socle de design tokens réutilisable (couleurs, typo, rayons, ombres, springs), sans logique métier ni landing.

**Architecture:** Deux couches de tokens (primitives → sémantiques) exposées en CSS (`tokens.css`) et en TS (`tokens.ts`), branchées dans Tailwind 4 via `@theme` dans `globals.css`. Style visuel dérivé de `/apple-design` (matériaux, profondeur, springs) + couche chaude. Identité documentée dans `docs/brand/`, illustrée par 4 maquettes HTML statiques.

**Tech Stack:** Next.js 16, Tailwind 4, TypeScript, `motion` (springs), General Sans (Fontshare CDN), system-ui.

**Note vérification :** ce lot ne comporte pas de tests unitaires (tokens statiques + maquettes). La vérification de chaque tâche = `npm run build` sans erreur et/ou ouverture visuelle du rendu. Source de vérité design : `docs/superpowers/specs/2026-07-19-estio-brandkit-design.md`.

---

### Task 1: Dépendance `motion` + police General Sans

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Installer motion**

Run: `npm install motion`
Expected: `motion` ajouté à `dependencies`, install sans erreur.

- [ ] **Step 2: Remplacer les polices Geist par General Sans (Fontshare) dans `layout.tsx`**

Remplacer l'intégralité de `src/app/layout.tsx` par :

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Estio — comparateur immobilier d'investissement",
  description:
    "Compare tes biens immobiliers côte à côte, du point de vue de l'investissement. Chaque adresse déverrouille les données de marché, et le score reflète tes priorités.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Vérifier le build**

Run: `npm run build`
Expected: build réussi, aucune référence restante à `next/font/google`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/app/layout.tsx
git commit -m "chore(brand): motion + police General Sans, drop Geist"
```

---

### Task 2: Tokens CSS

**Files:**
- Create: `src/design/tokens.css`

- [ ] **Step 1: Créer `src/design/tokens.css`**

```css
/* Estio — design tokens (CSS).
   Source de vérité : docs/brand/estio-brandkit.md
   Deux couches : primitives (couleurs nommées) → sémantiques (rôles).
   Le dark mode se fera plus tard en ne redéfinissant QUE les sémantiques. */

:root {
  /* ---- Primitives ---- */
  --craie: #fbf7f0;
  --sable: #f3ede3;
  --sable-bord: #ede4d6;
  --encre: #2b2320;
  --encre-douce: #6b615a;
  --encre-estompee: #8a7d6e;
  --argile: #c86b4a;
  --argile-foncee: #b45c3d;
  --ambre: #e0a06a;
  --sauge: #7fa98c;
  --sauge-bg: #e7f0e9;
  --sauge-texte: #3b7a57;
  --bleu-poudre: #9db4c4;
  --bleu-poudre-bg: #e6edf1;
  --rose-poudre: #d8a7a0;
  --rose-poudre-bg: #f0d9d4;
  --blanc: #ffffff;

  /* ---- Sémantiques (rôles) ---- */
  --bg: var(--craie);
  --bg-elevated: var(--blanc);
  --bg-alt: var(--sable);
  --text: var(--encre);
  --text-muted: var(--encre-douce);
  --text-faint: var(--encre-estompee);
  --brand: var(--argile);
  --brand-hover: var(--argile-foncee);
  --accent: var(--ambre);
  --score-high: var(--sauge);
  --score-high-bg: var(--sauge-bg);
  --score-high-texte: var(--sauge-texte);
  --score-mid: var(--ambre);
  --score-low: var(--rose-poudre);
  --score-low-bg: var(--rose-poudre-bg);
  --border: var(--sable-bord);

  /* ---- Ombres (profondeur douce) ---- */
  --shadow-rgb: 70 50 30;
  --shadow-sm: 0 1px 3px rgb(var(--shadow-rgb) / 0.08);
  --shadow-md: 0 8px 26px rgb(var(--shadow-rgb) / 0.1);

  /* ---- Rayons ---- */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-pill: 9999px;

  /* ---- Mouvement (réf CSS ; springs JS dans tokens.ts) ---- */
  --dur-fast: 0.2s;
  --dur-default: 0.35s;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/design/tokens.css
git commit -m "feat(design): tokens CSS (primitives + sémantiques)"
```

---

### Task 3: Tokens TS (miroir + springs Motion)

**Files:**
- Create: `src/design/tokens.ts`

- [ ] **Step 1: Créer `src/design/tokens.ts`**

Les hex DOIVENT être identiques à `tokens.css`.

```ts
// Estio — design tokens (TS). Miroir de tokens.css.
// Source de vérité : docs/brand/estio-brandkit.md

export const color = {
  craie: "#fbf7f0",
  sable: "#f3ede3",
  sableBord: "#ede4d6",
  encre: "#2b2320",
  encreDouce: "#6b615a",
  encreEstompee: "#8a7d6e",
  argile: "#c86b4a",
  argileFoncee: "#b45c3d",
  ambre: "#e0a06a",
  sauge: "#7fa98c",
  saugeBg: "#e7f0e9",
  saugeTexte: "#3b7a57",
  bleuPoudre: "#9db4c4",
  bleuPoudreBg: "#e6edf1",
  rosePoudre: "#d8a7a0",
  rosePoudreBg: "#f0d9d4",
  blanc: "#ffffff",
} as const;

export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 9999 } as const;

// Presets springs Motion (apple-design) : bounce + duration.
// default = critically damped (aucun dépassement) pour l'UI courante.
// momentum = léger rebond, réservé aux interactions à élan (flick, drag release).
export const spring = {
  default: { type: "spring", bounce: 0, duration: 0.35 },
  momentum: { type: "spring", bounce: 0.2, duration: 0.4 },
} as const;

export type ColorToken = keyof typeof color;
```

- [ ] **Step 2: Vérifier la compilation TS**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add src/design/tokens.ts
git commit -m "feat(design): tokens TS + presets springs Motion"
```

---

### Task 4: Brancher les tokens dans Tailwind via `globals.css`

**Files:**
- Modify: `src/app/globals.css` (remplacement complet)

- [ ] **Step 1: Remplacer `src/app/globals.css`**

```css
@import "tailwindcss";
@import "../design/tokens.css";

/* Expose les tokens sémantiques comme utilitaires Tailwind 4 (bg-brand, text-muted, rounded-lg, etc.) */
@theme inline {
  --color-bg: var(--bg);
  --color-bg-elevated: var(--bg-elevated);
  --color-bg-alt: var(--bg-alt);
  --color-text: var(--text);
  --color-muted: var(--text-muted);
  --color-faint: var(--text-faint);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-accent: var(--accent);
  --color-score-high: var(--score-high);
  --color-score-mid: var(--score-mid);
  --color-score-low: var(--score-low);
  --color-border: var(--border);

  /* valeurs littérales : éviter l'auto-référence --radius-sm: var(--radius-sm) */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;

  --font-sans: "General Sans", system-ui, -apple-system, sans-serif;
}

body {
  background: var(--bg);
  color: var(--text);
  /* Corps en system-ui pour la densité ; titres/chiffres en General Sans via utilitaires font-sans */
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

- [ ] **Step 2: Vérifier le build**

Run: `npm run build`
Expected: build réussi, pas d'erreur d'import CSS.

- [ ] **Step 3: Vérification visuelle rapide**

Run: `npm run dev` puis ouvrir `http://localhost:3000`
Expected: le fond de la landing existante reste crème (elle utilise des hex en dur, non régressée), aucune erreur console.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(design): branche les tokens dans Tailwind @theme"
```

---

### Task 5: Logo placeholder

**Files:**
- Create: `public/estio-logo.svg`

- [ ] **Step 1: Créer `public/estio-logo.svg`** (wordmark placeholder, remplaçable par le vrai logo)

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="48" viewBox="0 0 160 48" role="img" aria-label="estio">
  <text x="0" y="36" font-family="'General Sans', system-ui, sans-serif" font-size="40" font-weight="650" letter-spacing="-1.2" fill="#2b2320">estio</text>
  <circle cx="150" cy="36" r="5" fill="#c86b4a"/>
</svg>
```

- [ ] **Step 2: Vérification visuelle**

Ouvrir `public/estio-logo.svg` dans un navigateur.
Expected: « estio » en encre + point argile. (Le rendu de la graisse dépend de la présence de General Sans ; fallback system-ui acceptable pour un placeholder.)

- [ ] **Step 3: Commit**

```bash
git add public/estio-logo.svg
git commit -m "feat(brand): logo placeholder estio (à remplacer)"
```

---

### Task 6: Charte de marque

**Files:**
- Create: `docs/brand/estio-brandkit.md`

- [ ] **Step 1: Créer `docs/brand/estio-brandkit.md`**

Reprendre la spec en document de marque autoportant :

```markdown
# Estio — Charte de marque

> Source de vérité identité visuelle. Tokens techniques : `src/design/tokens.css` + `tokens.ts`.

## Nom
**Estio** — de « estimation », cœur du produit. Domaine `estio.immo`.
⚠ Vérif INPI classes 36 & 42 avant tout dépôt de marque.

## Ton
Premium accessible : chaleureux, lucide, rassurant. Jamais Bloomberg Terminal, jamais blanc clinique.
« C'est ton score, pas le nôtre » → clarté et confiance.

## Palette
| Nom | Hex | Rôle |
|-----|-----|------|
| Craie | #fbf7f0 | Fond principal |
| Sable | #f3ede3 | Fond secondaire |
| Sable bord | #ede4d6 | Bordures fines |
| Encre | #2b2320 | Texte principal |
| Encre douce | #6b615a | Texte secondaire |
| Encre estompée | #8a7d6e | Légendes |
| Argile | #c86b4a | Marque |
| Argile foncée | #b45c3d | Hover marque |
| Ambre | #e0a06a | Accent / score moyen |
| Sauge | #7fa98c | Score élevé |
| Bleu poudré | #9db4c4 | Info neutre |
| Rose poudré | #d8a7a0 | Score faible |

Scoring : Sauge = fort, Ambre = moyen, Rose poudré = faible. **Jamais rouge/vert saturés.**

## Typographie
- **General Sans** (Fontshare, gratuite) : titres, gros chiffres, wordmark. Poids 600–650, tracking négatif (-0.02 à -0.035em) sur grandes tailles.
- **system-ui** : corps et UI dense.
- Leading serré titres (1.05), aéré corps (1.5).

## Forme & profondeur
- Rayons : 12 / 16 / 20 / 24 px, pill.
- Bordures fines > ombres lourdes.
- Matériaux translucides (`backdrop-filter: blur()`) pour le chrome ; jamais deux surfaces translucides claires empilées.
- Ombres : sm (chips), md `0 8px 26px rgb(70 50 30 / .10)` (cartes).

## Mouvement (apple-design)
- Springs interruptibles (`motion`), jamais de @keyframes gestuels.
- default : bounce 0, duration 0.35 (UI courante).
- momentum : bounce 0.2, duration 0.4 (flick, drag release).
- Feedback sur pointer-down, continu. Respect reduced-motion / reduced-transparency / contrast.

## Do / Don't
- ✅ Fond crème chaud, coins ronds, pastels pour le score, profondeur douce.
- ❌ Blanc pur clinique, rouge/vert feu de circulation, ombres dures, animations non interruptibles.
```

- [ ] **Step 2: Commit**

```bash
git add docs/brand/estio-brandkit.md
git commit -m "docs(brand): charte de marque Estio"
```

---

### Task 7: Maquettes statiques

**Files:**
- Create: `docs/brand/mockups/_mockup.css`
- Create: `docs/brand/mockups/carte-bien.html`
- Create: `docs/brand/mockups/comparateur.html`
- Create: `docs/brand/mockups/formulaire-ajout.html`
- Create: `docs/brand/mockups/panneau-scenarios.html`

Objectif : illustrer le style validé. Chaque HTML est autoportant, charge General Sans via Fontshare et `_mockup.css` (qui recopie les tokens). Référence visuelle : le board validé (`.superpowers/brainstorm/**/estio-brand-board.html`).

- [ ] **Step 1: Créer `docs/brand/mockups/_mockup.css`**

```css
:root{
  --craie:#fbf7f0;--sable:#f3ede3;--sable-bord:#ede4d6;--encre:#2b2320;
  --encre-douce:#6b615a;--encre-estompee:#8a7d6e;--argile:#c86b4a;--ambre:#e0a06a;
  --sauge:#5c9e72;--sauge-bg:#e7f0e9;--sauge-texte:#3b7a57;--rose-bg:#f0d9d4;
}
*{box-sizing:border-box}
body{margin:0;background:var(--craie);color:var(--encre);
  font-family:system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;padding:40px}
h1,.num{font-family:"General Sans",system-ui,sans-serif;letter-spacing:-.03em}
.wordmark{font-family:"General Sans",system-ui;font-weight:650;font-size:28px;letter-spacing:-.03em}
.wordmark .dot{color:var(--argile)}
.card{background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.85);
  border-radius:20px;padding:20px;box-shadow:0 8px 26px rgb(70 50 30 / .10)}
.surface{background:linear-gradient(160deg,#f7f3ec,#efe7da);border-radius:24px;padding:22px}
.price{font-family:"General Sans",system-ui;font-weight:650;font-size:24px;letter-spacing:-.03em}
.score{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;
  font-weight:700;color:#fff;background:linear-gradient(150deg,#8fbf9e,#5c9e72);box-shadow:0 4px 12px rgb(60 120 80 / .3)}
.bar{height:6px;background:rgb(180 160 140 / .2);border-radius:6px;overflow:hidden;margin:15px 0}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--ambre),var(--argile))}
.chip{font-size:11px;background:rgba(255,255,255,.75);padding:4px 10px;border-radius:20px}
.chip.sauge{color:var(--sauge-texte)}.chip.argile{color:#9b6a4a}
.label{font-size:11px;letter-spacing:.08em;color:var(--encre-estompee);text-transform:uppercase;margin:0 0 10px}
.btn{background:var(--argile);color:#fff;border:none;border-radius:9999px;padding:12px 22px;font-weight:600;font-size:15px}
.field{display:block;width:100%;padding:12px 14px;border:1px solid var(--sable-bord);border-radius:12px;
  background:#fff;font-size:15px;color:var(--encre);margin-top:6px}
.font-load{position:absolute;left:-9999px}
```

- [ ] **Step 2: Créer `docs/brand/mockups/carte-bien.html`**

```html
<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Estio — carte de bien</title>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
<link href="_mockup.css" rel="stylesheet"></head>
<body>
<div class="wordmark">estio<span class="dot">.</span></div>
<p class="label" style="margin-top:24px">Carte de bien</p>
<div class="surface" style="max-width:360px">
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:12px;color:var(--encre-estompee)">3 pièces · Lyon 7e</div>
        <div class="price">245 000<span style="font-size:14px;color:var(--encre-estompee)"> €</span></div>
      </div>
      <div class="score">82</div>
    </div>
    <div class="bar"><i style="width:72%"></i></div>
    <div style="display:flex;gap:6px">
      <span class="chip argile">Rendement 5,2 %</span>
      <span class="chip sauge">Zone tendue</span>
    </div>
  </div>
</div>
</body></html>
```

- [ ] **Step 3: Créer `docs/brand/mockups/comparateur.html`** (deux biens côte à côte + verdict)

```html
<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Estio — comparateur</title>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
<link href="_mockup.css" rel="stylesheet"></head>
<body>
<div class="wordmark">estio<span class="dot">.</span></div>
<p class="label" style="margin-top:24px">Comparateur — deux biens</p>
<div style="display:flex;gap:16px;flex-wrap:wrap">
  <div class="surface" style="width:300px">
    <div class="card">
      <div style="display:flex;justify-content:space-between"><div><div style="font-size:12px;color:var(--encre-estompee)">Lyon 7e</div><div class="price">245 000 €</div></div><div class="score">82</div></div>
      <div class="bar"><i style="width:82%"></i></div>
      <div style="display:flex;gap:6px"><span class="chip argile">5,2 %</span><span class="chip sauge">Tendue</span></div>
    </div>
  </div>
  <div class="surface" style="width:300px">
    <div class="card">
      <div style="display:flex;justify-content:space-between"><div><div style="font-size:12px;color:var(--encre-estompee)">Villeurbanne</div><div class="price">198 000 €</div></div><div class="score" style="background:linear-gradient(150deg,#e7b98a,#e0a06a)">67</div></div>
      <div class="bar"><i style="width:67%"></i></div>
      <div style="display:flex;gap:6px"><span class="chip argile">4,6 %</span><span class="chip sauge">Tendue</span></div>
    </div>
  </div>
</div>
<div class="card" style="max-width:616px;margin-top:16px;background:#fff">
  <b>Verdict</b> — Lyon 7e l'emporte sur le rendement (+0,6 pt) et la tension locative. Villeurbanne reste devant sur le prix d'entrée.
</div>
</body></html>
```

- [ ] **Step 4: Créer `docs/brand/mockups/formulaire-ajout.html`** (formulaire court N1)

```html
<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Estio — ajouter un bien</title>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
<link href="_mockup.css" rel="stylesheet"></head>
<body>
<div class="wordmark">estio<span class="dot">.</span></div>
<p class="label" style="margin-top:24px">Ajouter un bien</p>
<div class="card" style="max-width:420px;background:#fff">
  <label style="font-size:13px;color:var(--encre-douce)">Adresse <span style="color:var(--argile)">— déverrouille les données de marché</span>
    <input class="field" placeholder="12 rue Garibaldi, Lyon 7e"></label>
  <div style="display:flex;gap:12px;margin-top:14px">
    <label style="flex:1;font-size:13px;color:var(--encre-douce)">Prix<input class="field" placeholder="245 000 €"></label>
    <label style="flex:1;font-size:13px;color:var(--encre-douce)">Surface<input class="field" placeholder="62 m²"></label>
  </div>
  <div style="display:flex;gap:12px;margin-top:14px">
    <label style="flex:1;font-size:13px;color:var(--encre-douce)">DPE<input class="field" placeholder="D"></label>
    <label style="flex:1;font-size:13px;color:var(--encre-douce)">Pièces<input class="field" placeholder="3"></label>
  </div>
  <button class="btn" style="margin-top:20px">Analyser le bien</button>
</div>
</body></html>
```

- [ ] **Step 5: Créer `docs/brand/mockups/panneau-scenarios.html`** (curseurs N3)

```html
<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Estio — scénarios</title>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" rel="stylesheet">
<link href="_mockup.css" rel="stylesheet"></head>
<body>
<div class="wordmark">estio<span class="dot">.</span></div>
<p class="label" style="margin-top:24px">Panneau scénarios</p>
<div class="card" style="max-width:380px;background:#fff">
  <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--encre-douce)"><span>Apport</span><b style="color:var(--encre)">40 000 €</b></div>
  <div class="bar"><i style="width:35%"></i></div>
  <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--encre-douce);margin-top:8px"><span>Durée d'emprunt</span><b style="color:var(--encre)">20 ans</b></div>
  <div class="bar"><i style="width:66%"></i></div>
  <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--encre-douce);margin-top:8px"><span>Stratégie</span><b style="color:var(--encre)">LMNP</b></div>
  <div style="display:flex;gap:6px;margin-top:14px">
    <span class="chip sauge" style="background:var(--sauge-bg)">Cash-flow +120 €/mois</span>
    <span class="chip argile" style="background:var(--rose-bg)">TRI 6,1 %</span>
  </div>
</div>
</body></html>
```

- [ ] **Step 6: Vérification visuelle**

Ouvrir les 4 fichiers HTML dans un navigateur.
Expected: fond crème, cartes en verre translucide, score en pastel, wordmark `estio.` avec point argile. Conforme au board validé.

- [ ] **Step 7: Commit**

```bash
git add docs/brand/mockups/
git commit -m "docs(brand): 4 maquettes statiques (carte, comparateur, formulaire, scénarios)"
```

---

### Task 8: Cohérence documentation (Arpent → Estio)

**Files:**
- Modify: `CLAUDE.md` (section « Identité de marque »)
- Modify: `PROGRESS.md`

- [ ] **Step 1: Mettre à jour la section « Identité de marque » de `CLAUDE.md`**

Remplacer la puce sur le nom Arpent par :

```markdown
- Nom **« Estio »** (`estio.immo`) — retenu en session 3, remplace « Arpent » (conflit potentiel Arpent Capital). Vérif INPI classes 36/42 non faite : ne pas engager juridiquement/financièrement le nom sans cette vérification. Charte complète : `docs/brand/estio-brandkit.md`.
```

- [ ] **Step 2: Ajouter une entrée de session en tête de `PROGRESS.md`**

Insérer sous « ## Sessions » :

```markdown
### Session 3 — 2026-07-19 — Identité de marque & design system Estio
**Étape : 🔨 impl (design system)**

- Nom retenu : **Estio** (`estio.immo`), remplace Arpent.
- Direction visuelle : `/apple-design` + couche chaude.
- Livré : charte (`docs/brand/estio-brandkit.md`), tokens (`src/design/tokens.css` + `tokens.ts`), branchement Tailwind (`globals.css`), logo placeholder, 4 maquettes, police General Sans + `motion`.
- Spec : `docs/superpowers/specs/2026-07-19-estio-brandkit-design.md`. Plan : `docs/superpowers/plans/2026-07-19-estio-brandkit.md`.

**Prochaine session**
- Landing page Estio avec `/apple-design`.

---
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md PROGRESS.md
git commit -m "docs: bascule Arpent -> Estio + journal session 3"
```

---

### Task 9: Vérification finale

- [ ] **Step 1: Build complet**

Run: `npm run build`
Expected: succès, aucune erreur ni warning bloquant.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: aucune erreur.

- [ ] **Step 3: Contrôle de cohérence des tokens**

Vérifier à l'œil que chaque hex de `src/design/tokens.ts` correspond à son équivalent dans `src/design/tokens.css` (craie, argile, ambre, sauge, etc.).
Expected: valeurs identiques des deux côtés.

- [ ] **Step 4: Commit final (si changements de lint)**

```bash
git add -A
git commit -m "chore(brand): vérification build + lint OK" || echo "rien à committer"
```

---

## Critères d'acceptation (rappel spec §9)

1. `docs/brand/estio-brandkit.md` = source de vérité marque. ✔ Task 6
2. `tokens.css` et `tokens.ts` cohérents. ✔ Tasks 2, 3, 9
3. `globals.css` consomme les tokens, build vert. ✔ Tasks 4, 9
4. Rendu conforme au board (fond Craie, Encre, Argile, score pastel). ✔ Tasks 4, 7
5. 4 maquettes ouvrables seules. ✔ Task 7
6. `CLAUDE.md` cohérent (Arpent → Estio). ✔ Task 8
