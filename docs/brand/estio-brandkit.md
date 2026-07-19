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
| Encre estompée | #75695d | Légendes (contraste AA sur Craie) |
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
