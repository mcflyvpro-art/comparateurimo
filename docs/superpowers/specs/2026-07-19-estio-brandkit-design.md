# Spec — Identité de marque & design system « Estio »

> Date : 2026-07-19 · Statut : validé en brainstorm, prêt pour plan d'implémentation.
> Remplace la marque provisoire « Arpent » (conflit potentiel Arpent Capital).

## 1. Objectif

Doter le projet d'une identité de marque complète et d'un socle de design tokens réutilisable, avant tout développement d'interface. Le style visuel s'appuie sur les principes `/apple-design` (profondeur, matériaux translucides, mouvement spring interruptible, typographie optique) posés sur une **couche chaude** propre à Estio.

**Hors périmètre de cette tranche** : la landing (sera codée séparément avec `/apple-design`), toute logique métier (moteur de calcul, import, score réel), tout composant React fonctionnel. On livre l'**identité + les tokens + des maquettes statiques**.

## 2. Nom

- **Estio** — domaine `estio.immo` (libre, ~15 $/an).
- Sens : dérivé d'« estimation », cœur du produit. Son fluide type Twilio/Vantio, crédible et mémorable.
- Le TLD `.immo` fait partie de la lecture (`estio.immo` se lit d'un bloc) et signale le secteur.
- ⚠ Dispo ≠ marque déposée. **Avant tout dépôt/usage commercial : vérif INPI classes 36 (immo/finance) & 42 (logiciel).** Non bloquant pour le développement.

## 3. Ton de marque

« Premium accessible » — chaleureux, lucide, rassurant. Jamais Bloomberg Terminal, jamais blanc clinique. L'app aide à décider (« ton score, pas le nôtre ») → la marque respire la clarté et la confiance, pas l'autorité froide.

## 4. Palette

Deux couches : **primitives** (couleurs nommées) et **sémantiques** (rôles).

### Primitives

| Nom | Hex | Usage |
|-----|-----|-------|
| Craie | `#FBF7F0` | Fond principal (crème chaud, jamais blanc pur) |
| Sable | `#F3EDE3` | Fond secondaire / surfaces alternées |
| Sable bord | `#EDE4D6` | Bordures fines sur fond clair |
| Encre | `#2B2320` | Texte principal |
| Encre douce | `#6B615A` | Texte secondaire |
| Encre estompée | `#8A7D6E` | Légendes, labels |
| Argile | `#C86B4A` | Couleur de marque (terre cuite) |
| Argile foncée | `#B45C3D` | Hover / états pressés de la marque |
| Ambre | `#E0A06A` | Accent secondaire, score moyen |
| Sauge | `#7FA98C` / bg `#E7F0E9` / texte `#3B7A57` | Score élevé, positif |
| Bleu poudré | `#9DB4C4` / bg `#E6EDF1` | Info neutre |
| Rose poudré | `#D8A7A0` / bg `#F0D9D4` | Score faible, attention douce |

**Règle scoring** : Sauge = fort, Ambre = moyen, Rose poudré = faible. **Jamais de rouge/vert saturés « feu de circulation ».**

### Sémantiques (rôles → dark-mode-ready)

| Token | Valeur (clair) |
|-------|----------------|
| `--bg` | Craie |
| `--bg-elevated` | `#FFFFFF` |
| `--bg-alt` | Sable |
| `--text` | Encre |
| `--text-muted` | Encre douce |
| `--text-faint` | Encre estompée |
| `--brand` | Argile |
| `--brand-hover` | Argile foncée |
| `--accent` | Ambre |
| `--score-high` | Sauge |
| `--score-mid` | Ambre |
| `--score-low` | Rose poudré |
| `--border` | Sable bord |
| `--shadow` | `rgba(70,50,30,.10)` |

Le dark mode n'est **pas** implémenté au MVP, mais la séparation primitives/sémantiques permet de l'ajouter plus tard en ne redéfinissant que les sémantiques.

## 5. Typographie

- **General Sans** (grotesque humaniste ronde, gratuite via Fontshare) — titres, gros chiffres, wordmark. Poids affirmé (600–650), tracking négatif sur les grandes tailles (`-0.02em` à `-0.035em`).
- **system-ui** — corps de texte et UI dense (perf, lisibilité, pas de FOUT sur le contenu).
- Leading serré sur les titres (`1.05`), aéré sur le corps (`1.5`).
- Respect de la taille de police utilisateur : espacements en `rem`/`em`.

## 6. Forme & profondeur

- **Rayons** : `--radius-sm 12px`, `md 16px`, `lg 20px`, `xl 24px`, `pill 9999px`. Coins généreux.
- **Bordures fines > ombres lourdes** ; profondeur douce via matériaux.
- **Matériaux translucides** (`backdrop-filter: blur()`) pour le chrome (nav, sheets, cartes surélevées), contenu qui défile dessous. Jamais deux surfaces translucides claires empilées.
- **Ombres** : `--shadow-sm` (chips), `--shadow-md` `0 8px 26px var(--shadow)` (cartes). Plus la surface est grande, plus le blur/l'ombre sont marqués.

## 7. Mouvement (apple-design)

- **Springs interruptibles** (lib `motion`), jamais de `@keyframes` pour le gestuel.
- `--spring-default` : `bounce 0`, `duration 0.35` (critically damped, défaut UI).
- `--spring-momentum` : `bounce 0.2`, `duration 0.4` (réservé aux interactions à élan : flick, drag release).
- Feedback sur pointer-down, continu pendant l'interaction.
- **Reduced-motion** : cross-fade au lieu de slide/spring ; `prefers-reduced-transparency` → surfaces plus opaques ; `prefers-contrast` → bordures nettes.

## 8. Livrables (fichiers)

| # | Fichier | Action | Contenu |
|---|---------|--------|---------|
| 1 | `docs/brand/estio-brandkit.md` | créer | Charte lisible : nom/sens, ton, palette, typo, forme, mouvement, règles scoring, do/don't |
| 2 | `src/design/tokens.css` | créer | Variables CSS : primitives + sémantiques + rayons + ombres + springs |
| 3 | `src/design/tokens.ts` | créer | Mêmes valeurs en TS + presets springs Motion (bounce/duration) |
| 4 | `src/app/globals.css` | remplacer | Importe `tokens.css`, branche les tokens dans `@theme` Tailwind 4, fond Craie + General Sans |
| 5 | `public/estio-logo.svg` | créer | Wordmark placeholder `estio.` (remplaçable) |
| 6 | `docs/brand/mockups/*.html` | créer | 4 maquettes statiques : carte de bien, comparateur, formulaire d'ajout, panneau scénarios |
| 7 | `package.json` | modifier | Ajout `motion` + General Sans (Fontshare CSS ou `@fontsource`) |
| 8 | `PROGRESS.md` | modifier | Nouvelle entrée de session |

### Ce qui n'est PAS fait dans cette tranche

- La landing page (déclenchée séparément avec `/apple-design`).
- Tout composant React fonctionnel, toute logique métier (`calc/`, `market/`, `extract/`, `scoring/`…).
- Le dark mode (préparé par les tokens, pas activé).
- Le vrai logo (fourni ultérieurement par l'utilisateur ; placeholder en attendant).

## 9. Critères d'acceptation

1. `docs/brand/estio-brandkit.md` décrit l'intégralité de l'identité et sert de source de vérité marque.
2. `src/design/tokens.css` et `tokens.ts` exposent des valeurs cohérentes (mêmes hex des deux côtés).
3. `globals.css` consomme les tokens ; `npm run build` passe sans erreur.
4. Une page de démo minimale ou une maquette rend correctement fond Craie, texte Encre, marque Argile, un score en pastel — visuellement conforme au board validé.
5. Les 4 maquettes HTML s'ouvrent seules dans un navigateur et illustrent le style.
6. `CLAUDE.md` (section Identité de marque) reste cohérent : le nom « Arpent » y est mis à jour en « Estio » ou annoté.

## 10. Risques & notes

- **INPI non vérifié** — dépôt de marque hors périmètre dev, mais à faire avant lancement commercial.
- **General Sans en self-host vs CDN Fontshare** — trancher au plan (self-host = perf + offline, recommandé). Ne charger que les poids utilisés.
- **Cohérence CLAUDE.md** — la charte projet mentionne « Arpent » à plusieurs endroits ; prévoir une mise à jour ou une note de transition.
